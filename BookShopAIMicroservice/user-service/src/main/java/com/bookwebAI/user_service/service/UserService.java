package com.bookwebAI.user_service.service;

import com.bookwebAI.user_service.dto.*;
import com.bookwebAI.user_service.entity.User;
import com.bookwebAI.user_service.entity.VerificationToken;
import com.bookwebAI.user_service.mapper.UserMapper;
import com.bookwebAI.user_service.repository.UserRepository;
import com.bookwebAI.user_service.repository.VerificationTokenRepository;
import com.bookwebAI.user_service.security.JwtUtil;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.*;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repo;
    private final VerificationTokenRepository tokenRepo;
    private final JavaMailSender mailSender;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final RestTemplate restTemplate = new RestTemplate();

    private final UserMapper userMapper;

    @Value("${google.client.id}")
    private String clientId;

    @Value("${google.client.secret}")
    private String clientSecret;

    @Value("${google.redirect.uri}")
    private String redirectUri;

    /*--------------------------------------------------
     * Helper gửi email
     *--------------------------------------------------*/
    private void sendMail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email");
        }
    }

    /*--------------------------------------------------
     * Đăng ký (local)
     *--------------------------------------------------*/
    public ApiResponse<String> register(UserRegisterDto dto) {
        if (repo.existsByUsername(dto.getUsername()))
            return ApiResponse.<String>builder().message("Tên đăng nhập đã tồn tại").build();
        if (repo.existsByEmail(dto.getEmail()))
            return ApiResponse.<String>builder().message("Email đã tồn tại").build();

        User user = User.builder()
                .username(dto.getUsername())
                .password(encoder.encode(dto.getPassword()))
                .email(dto.getEmail())
                .firstname(dto.getFirstname())
                .lastname(dto.getLastname())
                .phone(dto.getPhone())
                .active(false)
                .role("USER")
                .provider("LOCAL")
                .build();
        repo.save(user);

        VerificationToken token = VerificationToken.create(user.getEmail());
        tokenRepo.save(token);

        sendMail(user.getEmail(), "Xác nhận đăng ký BookShop",
                "<h3>Xin chào " + user.getFirstname() + "!</h3>" +
                        "<p>Mã OTP của bạn là: <b>" + token.getOtp() + "</b></p>" +
                        "<p>Mã có hiệu lực trong 5 phút.</p>");

        return ApiResponse.<String>builder()
                .message("Đăng ký thành công, vui lòng kiểm tra email để xác thực.")
                .build();
    }

    /*--------------------------------------------------
     * Xác thực OTP
     *--------------------------------------------------*/
    @Transactional
    public ApiResponse<String> verifyOtp(String email, String otp) {
        VerificationToken token = tokenRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã OTP"));
        if (token.isExpired()) return ApiResponse.<String>builder().message("OTP đã hết hạn").build();
        if (!token.getOtp().equals(otp)) return ApiResponse.<String>builder().message("Sai mã OTP").build();

        User user = repo.findByEmail(email).orElseThrow();
        user.setActive(true);
        repo.save(user);
        tokenRepo.deleteByEmail(email);

        return ApiResponse.<String>builder().message("Xác thực thành công").build();
    }

    /*--------------------------------------------------
     * Đăng nhập thường (JWT)
     *--------------------------------------------------*/
    public ApiResponse<Map<String, Object>> login(UserLoginDto dto) {
        User user = repo.findByUsername(dto.getUsername()).orElse(null);
        if (user == null || !encoder.matches(dto.getPassword(), user.getPassword()))
            return ApiResponse.<Map<String, Object>>builder().message("Sai tên đăng nhập hoặc mật khẩu").build();
        if (!user.isActive())
            return ApiResponse.<Map<String, Object>>builder().message("Tài khoản chưa được kích hoạt").build();

        String jwtToken = jwtUtil.generateToken(user.getUid(), user.getEmail(), user.getRole());
        Map<String, Object> data = Map.of("token", jwtToken, "user", user);

        return ApiResponse.<Map<String, Object>>builder()
                .message("Đăng nhập thành công")
                .data(data)
                .build();
    }

    /*--------------------------------------------------
     * Đăng nhập với Google OAuth2
     *--------------------------------------------------*/
    public ApiResponse<Map<String, Object>> loginWithGoogle(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);
        ResponseEntity<Map> tokenResponse = restTemplate.exchange(
                "https://oauth2.googleapis.com/token",
                HttpMethod.POST,
                entity,
                Map.class
        );

        String accessToken = (String) tokenResponse.getBody().get("access_token");

        // Lấy thông tin user
        String userInfoUrl = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + accessToken;
        GoogleUserInfo googleUser = restTemplate.getForObject(userInfoUrl, GoogleUserInfo.class);

//        // Nếu user chưa tồn tại => tạo mới
//        User user = repo.findByEmail(googleUser.getEmail()).orElseGet(() -> {
//            User newUser = User.builder()
//                    .uid(UUID.randomUUID().toString())
//                    .email(googleUser.getEmail())
//                    .firstname(googleUser.getGiven_name())
//                    .lastname(googleUser.getFamily_name())
//                    .avatar(googleUser.getPicture())
//                    .role("USER")
//                    .active(true)
//                    .build();
//            return repo.save(newUser);
//        });

        System.out.println("👤 Google user info: " + googleUser);

        User user = repo.findByEmail(googleUser.getEmail()).orElse(null);
        if (user == null) {
            user = User.builder()
                    .email(googleUser.getEmail())
                    .firstname(googleUser.getGiven_name())
                    .lastname(googleUser.getFamily_name())
                    .avatar(googleUser.getPicture())
                    .role("USER")
                    .active(true)
                    .provider("GOOGLE")
                    .providerId(googleUser.getId())
                    .build();
        } else {
            user.setActive(true);
            if (!user.getProvider().contains("GOOGLE")) {
                user.setProvider(user.getProvider() + "+GOOGLE");
            }
            if (user.getProviderId() == null || user.getProviderId().isEmpty()) {
                user.setProviderId(googleUser.getId());
            }
            // Cập nhật ảnh và tên từ Google
            user.setAvatar(googleUser.getPicture());
        }
        repo.save(user);



        String jwtToken = jwtUtil.generateToken(user.getUid(), user.getEmail(), user.getRole());
        Map<String, Object> data = Map.of("token", jwtToken, "user", user);
        System.out.println(data);

        return ApiResponse.<Map<String, Object>>builder()
                .message("Đăng nhập Google thành công")
                .data(data)
                .build();
    }



    /*--------------------------------------------------
     * Các chức năng phụ
     *--------------------------------------------------*/
    public ApiResponse<String> resendOtp(String email) {
        tokenRepo.deleteByEmail(email);
        VerificationToken token = VerificationToken.create(email);
        tokenRepo.save(token);
        sendMail(email, "Mã OTP mới của bạn",
                "<p>Mã xác thực mới của bạn là: <b>" + token.getOtp() + "</b></p>");
        return ApiResponse.<String>builder().message("OTP mới đã được gửi lại").build();
    }

    public ApiResponse<String> sendOtp(String email){
        User user = repo.findByEmail(email).orElse(null);
        if (user == null) {
            return ApiResponse.<String>builder().message("Email không tồn tại").build();
        }
//        tokenRepo.deleteByEmail(email);
        VerificationToken token = VerificationToken.create(email);
        tokenRepo.save(token);
        sendMail(email, "Mã OTP thay đổi mật khẩu",
                "<p>Mã xác thực của bạn là: <b>" + token.getOtp() + "</b></p>" +
                        "<p>Mã có hiệu lực trong 5 phút.</p>");
        return ApiResponse.<String>builder().message("Đã gửi mã OTP đến email của bạn").build();
    }

    //hàm đặt lại mật khẩu
    @Transactional
    public ApiResponse<String> resetPassword(String email, String newpassword) {


        User user = repo.findByEmail(email).orElseThrow();
        user.setPassword(encoder.encode(newpassword));
        repo.save(user);


        return ApiResponse.<String>builder().message("Đặt lại mật khẩu thành công").build();
    }

    @Transactional
    public ApiResponse<String> changePassword(String username, ChangePasswordDto dto) {
        User user = repo.findByUsername(username).orElseThrow();
        if (!encoder.matches(dto.getOldPassword(), user.getPassword()))
            return ApiResponse.<String>builder().message("Mật khẩu cũ không đúng").build();
        user.setPassword(encoder.encode(dto.getNewPassword()));
        repo.save(user);
        return ApiResponse.<String>builder().message("Đổi mật khẩu thành công").build();
    }

    public ApiResponse<User> getProfile(String username) {
        return ApiResponse.<User>builder()
                .message("Thông tin người dùng")
                .data(repo.findByUsername(username).orElse(null))
                .build();
    }

    //hàm tìm user theo uid
    public User findByUid(String uid) {
        return repo.findByUid(uid).orElseThrow(() -> new RuntimeException("User not found"));
    }


    // Lấy danh sách khách hàng cho trang admin (có phân trang, search)
    public ApiResponse<Page<UserResponseDto>> getUsersForAdmin(
            int page,
            int size,
            String keyword
    ) {
        // đây là Pageable của Spring Data
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "uid"));
        // nếu có createdAt thì sửa "uid" thành "createdAt"

        Page<User> userPage;
        if (keyword != null && !keyword.isBlank()) {
            userPage = repo.searchUsersForAdmin(keyword.trim(), pageable);
        } else {
            userPage = repo.findByRole("USER", pageable);
        }

        Page<UserResponseDto> dtoPage = userPage.map(userMapper::toResponseDto);

        return ApiResponse.<Page<UserResponseDto>>builder()
                .message("Lấy danh sách người dùng thành công")
                .data(dtoPage)
                .build();
    }


    // Khóa tài khoản
    @Transactional
    public ApiResponse<Void> lockUser(String uid) {
        User user = repo.findByUid(uid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Không thể khóa tài khoản ADMIN");
        }

        user.setActive(false);
        repo.save(user);

        return ApiResponse.<Void>builder()
                .message("Khóa tài khoản thành công")
                .data(null)
                .build();
    }

    // Mở khóa tài khoản
    @Transactional
    public ApiResponse<Void> unlockUser(String uid) {
        User user = repo.findByUid(uid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(true);
        repo.save(user);

        return ApiResponse.<Void>builder()
                .message("Mở khóa tài khoản thành công")
                .data(null)
                .build();
    }


    public ApiResponse<List<UserResponseDto>> getAllUsersForAdmin() {
        List<User> users = repo.findAll(); // TẠM THỜI: lấy hết, không lọc

        List<UserResponseDto> dtos = users.stream()
                .map(userMapper::toResponseDto)
                .toList();

        return ApiResponse.<List<UserResponseDto>>builder()
                .message("Lấy danh sách tất cả người dùng thành công")
                .data(dtos)
                .build();
    }
}

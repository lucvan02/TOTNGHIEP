//package com.bookwebAI.user_service.service;
//
//import com.bookwebAI.user_service.dto.*;
//import com.bookwebAI.user_service.entity.*;
//import com.bookwebAI.user_service.mapper.UserMapper;
//import com.bookwebAI.user_service.repository.*;
//import com.bookwebAI.user_service.security.JwtUtil;
//import jakarta.transaction.Transactional;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//
//import java.util.UUID;
//
//@Service
//@RequiredArgsConstructor
//public class UserService {
//
//    private final UserRepository repo;
//    private final VerificationTokenRepository tokenRepo;
//    private final PasswordEncoder encoder;
//    private final EmailService email;
//    private final JwtUtil jwt;
//    private final UserMapper mapper;
//
//    /** Đăng ký tài khoản và gửi mail xác thực */
//    public ApiResponse<UserResponseDto> register(UserRegisterDto dto) {
//        if (repo.existsByUsername(dto.getUsername()) || repo.existsByEmail(dto.getEmail()))
//            throw new RuntimeException("Username or email already exists");
//
//        User user = mapper.toEntity(dto);
//        user.setUid(UUID.randomUUID());
//        user.setPassword(encoder.encode(dto.getPassword()));
//        user.setProvider("LOCAL");
//        user.setRole("USER");
//        user.setActive(false); // chờ xác thực email
//        repo.save(user);
//
//        // tạo token xác thực
//        VerificationToken token = VerificationToken.create(user.getEmail());
//        tokenRepo.save(token);
//
//        String verifyLink = "http://localhost:3000/verify?token=" + token.getToken();
//        email.send(user.getEmail(), "Verify your account",
//                "Xin chào " + user.getFirstname() + ",\n\nHãy xác thực tài khoản của bạn tại liên kết:\n" + verifyLink);
//
//        return ApiResponse.<UserResponseDto>builder()
//                .message("User registered successfully. Please check email to verify your account.")
//                .data(mapper.toResponse(user))
//                .build();
//    }
//
//    /** Xác minh email (verify link từ FE) */
//    @Transactional
//    public ApiResponse<String> verifyEmail(String tokenValue) {
//        VerificationToken token = tokenRepo.findByToken(tokenValue)
//                .orElseThrow(() -> new RuntimeException("Invalid verification token"));
//        if (token.isExpired()) {
//            throw new RuntimeException("Verification token expired");
//        }
//
//        User user = repo.findByEmail(token.getEmail()).orElseThrow();
//        user.setActive(true);
//        repo.save(user);
//        tokenRepo.deleteByEmail(user.getEmail());
//
//        return ApiResponse.<String>builder()
//                .message("Account verified successfully")
//                .data("OK")
//                .build();
//    }
//
//    /** Đăng nhập */
//    public ApiResponse<String> login(LoginRequest req) {
//        User user = repo.findByUsername(req.getUsername())
//                .orElseThrow(() -> new RuntimeException("User not found"));
//        if (!user.isActive())
//            throw new RuntimeException("Account not active, please verify email");
//        if (!encoder.matches(req.getPassword(), user.getPassword()))
//            throw new RuntimeException("Wrong password");
//
//        String token = jwt.generate(user.getUsername());
//        return ApiResponse.<String>builder()
//                .message("Login success")
//                .data(token)
//                .build();
//    }
//
//    /** Gửi mail reset mật khẩu */
//    public ApiResponse<String> sendResetPassword(String emailAddr) {
//        User user = repo.findByEmail(emailAddr)
//                .orElseThrow(() -> new RuntimeException("Email not found"));
//        tokenRepo.deleteByEmail(user.getEmail());
//
//        VerificationToken token = VerificationToken.create(user.getEmail());
//        tokenRepo.save(token);
//
//        email.send(user.getEmail(), "Reset password",
//                "Mã đặt lại mật khẩu của bạn là: " + token.getToken());
//
//        return ApiResponse.<String>builder()
//                .message("Reset token sent to email")
//                .data("SENT")
//                .build();
//    }
//
//    /** Đặt lại mật khẩu */
//    @Transactional
//    public ApiResponse<String> resetPassword(String tokenValue, String newPass) {
//        VerificationToken token = tokenRepo.findByToken(tokenValue)
//                .orElseThrow(() -> new RuntimeException("Invalid reset token"));
//        if (token.isExpired()) throw new RuntimeException("Token expired");
//
//        User user = repo.findByEmail(token.getEmail()).orElseThrow();
//        user.setPassword(encoder.encode(newPass));
//        repo.save(user);
//        tokenRepo.deleteByEmail(user.getEmail());
//
//        return ApiResponse.<String>builder()
//                .message("Password reset successfully")
//                .data("OK")
//                .build();
//    }
//
//    /** Xem thông tin cá nhân */
//    public ApiResponse<UserResponseDto> getProfile(String username) {
//        return ApiResponse.<UserResponseDto>builder()
//                .message("Profile retrieved successfully")
//                .data(repo.findByUsername(username).map(mapper::toResponse).orElseThrow())
//                .build();
//    }
//
//    /** Cập nhật thông tin */
//    public ApiResponse<UserResponseDto> updateProfile(String username, UserUpdateDto dto) {
//        User user = repo.findByUsername(username).orElseThrow();
//        mapper.updateFromDto(dto, user);
//        repo.save(user);
//        return ApiResponse.<UserResponseDto>builder()
//                .message("Profile updated successfully")
//                .data(mapper.toResponse(user))
//                .build();
//    }
//
//    /** Đổi mật khẩu */
//    public ApiResponse<String> changePassword(String username, String oldPass, String newPass) {
//        User user = repo.findByUsername(username).orElseThrow();
//        if (!encoder.matches(oldPass, user.getPassword()))
//            throw new RuntimeException("Old password incorrect");
//        user.setPassword(encoder.encode(newPass));
//        repo.save(user);
//
//        return ApiResponse.<String>builder()
//                .message("Password changed successfully")
//                .data("OK")
//                .build();
//    }
//}



package com.bookwebAI.user_service.service;

import com.bookwebAI.user_service.dto.*;
import com.bookwebAI.user_service.entity.*;
import com.bookwebAI.user_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repo;
    private final VerificationTokenRepository tokenRepo;
    private final JavaMailSender mailSender;
    private final PasswordEncoder encoder;

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

    public ApiResponse<String> register(UserRegisterDto dto) {
        if (repo.existsByUsername(dto.getUsername()))
            return ApiResponse.<String>builder().message("Username already exists").build();
        if (repo.existsByEmail(dto.getEmail()))
            return ApiResponse.<String>builder().message("Email already exists").build();

        User user = User.builder()
                .username(dto.getUsername())
                .password(encoder.encode(dto.getPassword()))
                .email(dto.getEmail())
                .firstname(dto.getFirstname())
                .lastname(dto.getLastname())
                .phone(dto.getPhone())
                .active(false)
                .role("USER")
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
                .data("OK")
                .build();
    }

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

    public ApiResponse<String> login(UserLoginDto dto) {
        User user = repo.findByUsername(dto.getUsername()).orElse(null);
        if (user == null || !encoder.matches(dto.getPassword(), user.getPassword()))
            return ApiResponse.<String>builder().message("Sai tên đăng nhập hoặc mật khẩu").build();
        if (!user.isActive())
            return ApiResponse.<String>builder().message("Tài khoản chưa được kích hoạt").build();
        return ApiResponse.<String>builder().message("Đăng nhập thành công").data(user.getEmail()).build();
    }

    public ApiResponse<String> resendOtp(String email) {
        tokenRepo.deleteByEmail(email);
        VerificationToken token = VerificationToken.create(email);
        tokenRepo.save(token);
        sendMail(email, "Mã OTP mới của bạn",
                "<p>Mã xác thực mới của bạn là: <b>" + token.getOtp() + "</b></p>");
        return ApiResponse.<String>builder().message("OTP mới đã được gửi lại").build();
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
}

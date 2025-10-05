//package com.bookwebAI.user_service.service;
//
//import lombok.RequiredArgsConstructor;
//import org.springframework.mail.SimpleMailMessage;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.stereotype.Service;
//
//@Service
//@RequiredArgsConstructor
//public class EmailService {
//    private final JavaMailSender mailSender;
//
//    public void send(String to, String subject, String body) {
//        try {
//            SimpleMailMessage message = new SimpleMailMessage();
//            message.setTo(to);
//            message.setSubject(subject);
//            message.setText(body);
//            mailSender.send(message);
//        } catch (Exception e) {
//            throw new RuntimeException("Email send error: " + e.getMessage());
//        }
//    }
//}



//package com.bookwebAI.user_service.service;
//
//import lombok.RequiredArgsConstructor;
//import org.springframework.mail.SimpleMailMessage;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.stereotype.Service;
//
//@Service
//@RequiredArgsConstructor
//public class EmailService {
//    private final JavaMailSender mailSender;
//
//    public void send(String to, String subject, String body) {
//        SimpleMailMessage msg = new SimpleMailMessage();
//        msg.setTo(to);
//        msg.setSubject(subject);
//        msg.setText(body);
//        mailSender.send(msg);
//    }
//}





package com.bookwebAI.user_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void send(String to, String subject, String htmlBody) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(htmlBody);
        mailSender.send(msg);
    }

    public String buildVerifyEmailBody(String name, String otp) {
        return "Xin chào " + name + ",\n\n"
                + "Cảm ơn bạn đã đăng ký tài khoản tại BookShop.\n"
                + "Mã xác thực của bạn là: " + otp + "\n"
                + "Mã có hiệu lực trong 5 phút.\n\n"
                + "Trân trọng";
    }
}

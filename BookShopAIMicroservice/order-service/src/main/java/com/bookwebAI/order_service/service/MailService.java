package com.bookwebAI.order_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender mailSender;

    public void sendOrderCancelled(String to, String fullName, String orderId, String reason) {
        String subject = "[BookWeb] Đơn hàng " + orderId + " đã bị hủy";
        String body = """
        Chào %s,

        Rất tiếc đơn hàng %s của bạn đã bị hủy với lý do:
        - %s

        Nếu cần hỗ trợ thêm, vui lòng phản hồi email này.
        Cảm ơn bạn đã sử dụng BookWeb!
        """.formatted(fullName, orderId, reason == null ? "Không nêu rõ" : reason);

        var msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(body);
        mailSender.send(msg);
    }
}

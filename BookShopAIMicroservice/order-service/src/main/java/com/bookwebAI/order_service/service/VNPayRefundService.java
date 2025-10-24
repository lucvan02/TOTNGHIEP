package com.bookwebAI.order_service.service;

import com.bookwebAI.order_service.entity.Order;
import com.bookwebAI.order_service.util.VNPayUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.InetAddress;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VNPayRefundService {

    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.hashSecret}")
    private String hashSecret;

    @Value("${vnpay.apiUrl}")
    private String apiUrl;

    private String nowYYYYMMDDHHMMSS() {
        return new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
    }

    private String randomDigits(int len) {
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        Random rnd = new Random();
        for (int i = 0; i < len; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        return sb.toString();
    }

    /** Refund FULL theo chuẩn VNPay (transactionType=02) */
    public boolean refundFull(Order o, String reason) {
        try {
            String vnp_RequestId = randomDigits(8);
            String vnp_Version = "2.1.0";
            String vnp_Command = "refund";
            String vnp_TmnCode = tmnCode;
            String vnp_TransactionType = "02"; // full
            String vnp_TxnRef = (o.getVnpTxnRef() != null && !o.getVnpTxnRef().isBlank()) ? o.getVnpTxnRef() : o.getId();
            String vnp_Amount = String.valueOf((long) (o.getTotal() == null ? 0 : o.getTotal()) * 100L);
            String vnp_OrderInfo = (reason == null || reason.isBlank()) ? ("Refund order " + o.getId()) : reason;
            String vnp_TransactionNo = (o.getVnpTransactionNo() == null) ? "" : o.getVnpTransactionNo();
            String vnp_TransactionDate = (o.getVnpPayDate() != null && !o.getVnpPayDate().isBlank())
                    ? o.getVnpPayDate()
                    : nowYYYYMMDDHHMMSS(); // fallback

            String vnp_CreateBy = "system";
            String vnp_CreateDate = nowYYYYMMDDHHMMSS();
            String vnp_IpAddr = InetAddress.getLocalHost().getHostAddress();

            String hashData = String.join("|",
                    vnp_RequestId, vnp_Version, vnp_Command, vnp_TmnCode,
                    vnp_TransactionType, vnp_TxnRef, vnp_Amount,
                    vnp_TransactionNo, vnp_TransactionDate,
                    vnp_CreateBy, vnp_CreateDate, vnp_IpAddr, vnp_OrderInfo
            );
            String vnp_SecureHash = VNPayUtil.hmacSHA512(hashSecret.trim(), hashData);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("vnp_RequestId", vnp_RequestId);
            body.put("vnp_Version", vnp_Version);
            body.put("vnp_Command", vnp_Command);
            body.put("vnp_TmnCode", vnp_TmnCode);
            body.put("vnp_TransactionType", vnp_TransactionType);
            body.put("vnp_TxnRef", vnp_TxnRef);
            body.put("vnp_Amount", vnp_Amount);
            if (vnp_TransactionNo != null && !vnp_TransactionNo.isBlank())
                body.put("vnp_TransactionNo", vnp_TransactionNo);
            body.put("vnp_TransactionDate", vnp_TransactionDate);
            body.put("vnp_CreateBy", vnp_CreateBy);
            body.put("vnp_CreateDate", vnp_CreateDate);
            body.put("vnp_IpAddr", vnp_IpAddr);
            body.put("vnp_OrderInfo", vnp_OrderInfo);
            body.put("vnp_SecureHash", vnp_SecureHash);

            RestTemplate rt = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);

            var resp = rt.postForEntity(apiUrl, req, Map.class);
            System.out.println("[VNPay][REFUND][REQ] " + body);
            System.out.println("[VNPay][REFUND][RESP] " + resp.getBody());

            Object code = (resp.getBody() != null) ? ((Map<?, ?>) resp.getBody()).get("vnp_ResponseCode") : null;
            return "00".equals(String.valueOf(code));
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}

package com.bookwebAI.order_service.service;

import com.bookwebAI.order_service.util.VNPayUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayService {

    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.hashSecret}")
    private String hashSecret;

    @Value("${vnpay.url}")
    private String vnpUrl;

    @Value("${vnpay.returnUrl}")
    private String returnUrl;

    // Tạo URL thanh toán; dùng chính orderId làm vnp_TxnRef
    public String createPaymentUrl(String orderId, int amountVnd) {
        String vnpVersion = "2.1.0";
        String vnpCommand = "pay";
        String vnpTxnRef = orderId; // << quan trọng: dùng orderId để refund/đối soát dễ
        String vnpOrderInfo = "Thanh toan don hang:" + orderId; // tránh '#' để không lệch encode
        String vnpOrderType = "other";
        String vnpLocale = "vn";
        String vnpCurrCode = "VND";
        String vnpIpAddr = "127.0.0.1";

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat fmt = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = fmt.format(cld.getTime());
        cld.add(Calendar.MINUTE, 15);
        String vnpExpireDate = fmt.format(cld.getTime());

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", vnpVersion);
        params.put("vnp_Command", vnpCommand);
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_Amount", String.valueOf(amountVnd * 100));
        params.put("vnp_CurrCode", vnpCurrCode);
        params.put("vnp_TxnRef", vnpTxnRef);
        params.put("vnp_OrderInfo", vnpOrderInfo);
        params.put("vnp_OrderType", vnpOrderType);
        params.put("vnp_Locale", vnpLocale);
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", vnpIpAddr);
        params.put("vnp_CreateDate", vnpCreateDate);
        params.put("vnp_ExpireDate", vnpExpireDate);

        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        // Theo mẫu chính thức VNPay: hashData dùng GIÁ TRỊ ĐÃ URL-ENCODE
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (int i = 0; i < fieldNames.size(); i++) {
            String k = fieldNames.get(i);
            String v = params.get(k);
            if (v != null && !v.isEmpty()) {
                String encK = URLEncoder.encode(k, StandardCharsets.US_ASCII);
                String encV = URLEncoder.encode(v, StandardCharsets.US_ASCII);

                hashData.append(k).append('=').append(encV);
                if (i < fieldNames.size() - 1) hashData.append('&');

                query.append(encK).append('=').append(encV);
                if (i < fieldNames.size() - 1) query.append('&');
            }
        }

        String vnpSecureHash = VNPayUtil.hmacSHA512(hashSecret.trim(), hashData.toString());
        query.append("&vnp_SecureHash=").append(vnpSecureHash);

        System.out.println("[VNPay][REQ] hashData=" + hashData);
        System.out.println("[VNPay][REQ] secureHash=" + vnpSecureHash);

        return vnpUrl + "?" + query;
    }

    public String getSecret() { return hashSecret; }
}


//package com.bookwebAI.order_service.dto.response;
//
//
//import com.bookwebAI.order_service.entity.Order;
//import lombok.Data;
//
//
//@Data
//public class OrderResponse {
//    private String id;
//    private String status;
//
//
//    public static OrderResponse from(Order o) {
//        OrderResponse r = new OrderResponse();
//        r.setId(o.getId());
//        r.setStatus(String.valueOf(o.getStatus()));
//        return r;
//    }
//}
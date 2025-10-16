// controller/AdminStatsController.java
package com.bookwebAI.order_service.controller;

import com.bookwebAI.order_service.dto.response.ApiResponse;
import com.bookwebAI.order_service.dto.stats.*;
import com.bookwebAI.order_service.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {

    private final StatsService service;

    @GetMapping("/kpis")
    public ApiResponse<KpiResponse> kpis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return new ApiResponse<>("OK", service.kpis(from, to));
    }

    @GetMapping("/revenue/daily")
    public ApiResponse<List<TimeSeriesPoint>> revenueDaily(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return new ApiResponse<>("OK", service.revenueDaily(from, to));
    }

    @GetMapping("/orders/daily")
    public ApiResponse<List<TimeSeriesPoint>> ordersDaily(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return new ApiResponse<>("OK", service.ordersDaily(from, to));
    }

    @GetMapping("/orders/status")
    public ApiResponse<List<NameValue>> orderStatus(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return new ApiResponse<>("OK", service.orderStatus(from, to));
    }

    @GetMapping("/payments/methods")
    public ApiResponse<List<NameValue>> paymentMethods(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return new ApiResponse<>("OK", service.paymentMethods(from, to));
    }

    @GetMapping("/top-books")
    public ApiResponse<List<TopBook>> topBooks(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "10") int limit) {
        return new ApiResponse<>("OK", service.topBooks(from, to, limit));
    }
}

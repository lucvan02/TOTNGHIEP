package com.bookwebAI.order_service.controller;

import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.dto.analytics.DailyPointDTO;
import com.bookwebAI.order_service.dto.analytics.SummaryDTO;
import com.bookwebAI.order_service.dto.analytics.TopBookDTO;
import com.bookwebAI.order_service.service.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {
    private final AdminAnalyticsService svc;

    @GetMapping("/summary")
    public ApiResponse<SummaryDTO> summary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return new ApiResponse<>("OK", svc.summary(from, to));
    }

    @GetMapping("/daily")
    public ApiResponse<List<DailyPointDTO>> daily(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return new ApiResponse<>("OK", svc.daily(from, to));
    }

    @GetMapping("/top-books")
    public ApiResponse<List<TopBookDTO>> topBooks(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "10") int limit) {
        return new ApiResponse<>("OK", svc.topBooks(from, to, limit));
    }
}

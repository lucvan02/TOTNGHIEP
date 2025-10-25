package com.bookwebAI.order_service.service;

import com.bookwebAI.order_service.dto.analytics.DailyPointDTO;
import com.bookwebAI.order_service.dto.analytics.SummaryDTO;
import com.bookwebAI.order_service.dto.analytics.TopBookDTO;
import com.bookwebAI.order_service.entity.enums.OrderStatus;
import com.bookwebAI.order_service.repository.AnalyticsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service @RequiredArgsConstructor
public class AdminAnalyticsService {
    private final AnalyticsRepository repo;

    private LocalDateTime atStart(LocalDate d) { return d.atStartOfDay(); }
    private LocalDateTime atEnd(LocalDate d) { return d.plusDays(1).atStartOfDay().minusNanos(1); }

    public SummaryDTO summary(LocalDate from, LocalDate to) {
        LocalDateTime f = atStart(from);
        LocalDateTime t = atEnd(to);
        List<Object[]> rows = repo.aggregateByStatus(f, t);

        long orders = 0, paid = 0, completed = 0, cancelled = 0, pending = 0;
        int revenue = 0;
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (Object[] r : rows) {
            OrderStatus st = (OrderStatus) r[0];
            long cnt = ((Number) r[1]).longValue();
            int rev = ((Number) r[2]).intValue();
            orders += cnt;
            revenue += rev;
            byStatus.put(st.name(), cnt);
            if (st == OrderStatus.COMPLETED) completed += cnt;
            if (st == OrderStatus.CANCELLED) cancelled += cnt;
            if (st == OrderStatus.PENDING) pending += cnt;
        }
        // paid orders ~ số đơn paymentStatus true trong completed; tạm coi = completed
        paid = completed;
        int aov = (completed == 0) ? 0 : (revenue / (int) completed);
        return new SummaryDTO(orders, paid, completed, cancelled, pending, revenue, aov, byStatus);
    }

    public List<DailyPointDTO> daily(LocalDate from, LocalDate to) {
        LocalDateTime f = atStart(from);
        LocalDateTime t = atEnd(to);
        var byOrders = repo.ordersPerDay(f, t);
        var byRevenue = repo.revenuePerDay(f, t);

        Map<String, Long> mapOrders = new HashMap<>();
        for (Object[] r : byOrders) mapOrders.put(String.valueOf(r[0]), ((Number) r[1]).longValue());
        Map<String, Integer> mapRevenue = new HashMap<>();
        for (Object[] r : byRevenue) mapRevenue.put(String.valueOf(r[0]), ((Number) r[1]).intValue());

        List<DailyPointDTO> out = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            String key = d.toString();
            out.add(new DailyPointDTO(key, mapOrders.getOrDefault(key, 0L), mapRevenue.getOrDefault(key, 0)));
        }
        return out;
    }

    public List<TopBookDTO> topBooks(LocalDate from, LocalDate to, int limit) {
        LocalDateTime f = atStart(from);
        LocalDateTime t = atEnd(to);
        List<Object[]> rows = repo.topBooks(f, t);
        List<TopBookDTO> out = new ArrayList<>();
        for (int i = 0; i < rows.size() && i < limit; i++) {
            Object[] r = rows.get(i);
            out.add(new TopBookDTO(
                    (Long) r[0],
                    (String) r[1],
                    ((Number) r[2]).longValue(),
                    ((Number) r[3]).intValue()
            ));
        }
        return out;
    }
}

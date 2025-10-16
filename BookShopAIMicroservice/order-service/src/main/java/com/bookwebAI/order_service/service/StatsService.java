// service/StatsService.java
package com.bookwebAI.order_service.service;

import com.bookwebAI.order_service.client.BookClient;
import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.client.dto.BookDto;
import com.bookwebAI.order_service.dto.stats.*;
import com.bookwebAI.order_service.repository.StatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class StatsService {
    private final StatsRepository repo;
    private final BookClient bookClient;

    private LocalDateTime atStart(LocalDate date) { return date.atStartOfDay(); }
    private LocalDateTime atEnd(LocalDate date) { return date.atTime(23,59,59); }

    @Transactional(readOnly = true)
    public KpiResponse kpis(LocalDate from, LocalDate to) {
        Object row = repo.kpis(atStart(from), atEnd(to));
        // orders, paid_orders, completed_orders, cancelled_orders, buyers, items, revenue
        Object[] r = (Object[]) row;
        long orders = ((Number) r[0]).longValue();
        long paid = ((Number) r[1]).longValue();
        long completed = ((Number) r[2]).longValue();
        long cancelled = ((Number) r[3]).longValue();
        long buyers = ((Number) r[4]).longValue();
        long items = ((Number) r[5]).longValue();
        long revenue = ((Number) r[6]).longValue();

        double aov = completed > 0 ? (double) revenue / completed : 0d;
        double conversion = orders > 0 ? (double) paid / orders : 0d;

        return KpiResponse.builder()
                .orders(orders).paidOrders(paid).completedOrders(completed).cancelledOrders(cancelled)
                .buyers(buyers).items(items).revenue(revenue)
                .aov(aov).conversion(conversion)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TimeSeriesPoint> revenueDaily(LocalDate from, LocalDate to) {
        return repo.revenueDaily(atStart(from), atEnd(to)).stream()
                .map(a -> new TimeSeriesPoint((String)a[0], ((Number)a[1]).longValue()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TimeSeriesPoint> ordersDaily(LocalDate from, LocalDate to) {
        return repo.ordersDaily(atStart(from), atEnd(to)).stream()
                .map(a -> new TimeSeriesPoint((String)a[0], ((Number)a[1]).longValue()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NameValue> orderStatus(LocalDate from, LocalDate to) {
        return repo.orderStatusDistribution(atStart(from), atEnd(to)).stream()
                .map(a -> new NameValue(String.valueOf(a[0]), ((Number)a[1]).longValue()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NameValue> paymentMethods(LocalDate from, LocalDate to) {
        return repo.paymentMethodDistribution(atStart(from), atEnd(to)).stream()
                .map(a -> new NameValue(String.valueOf(a[0]), ((Number)a[1]).longValue()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TopBook> topBooks(LocalDate from, LocalDate to, int limit) {
        var raw = repo.topBooks(atStart(from), atEnd(to), limit);
        var ids = raw.stream().map(r -> ((Number) r[0]).longValue()).distinct().toList();

        Map<Long, BookDto> live = new HashMap<>();
        try {
            ApiResponse<List<BookDto>> resp = bookClient.bulk(ids);
            var data = Optional.ofNullable(resp.getData()).orElseGet(List::of);
            live = data.stream().collect(Collectors.toMap(BookDto::getId, x -> x));
        } catch (Exception ignore) {}

        Map<Long, BookDto> liveMap = live;
        return raw.stream().map(r -> {
            long bookId = ((Number) r[0]).longValue();
            long qty = ((Number) r[1]).longValue();
            long revenue = ((Number) r[2]).longValue();
            BookDto b = liveMap.get(bookId);
            return TopBook.builder()
                    .bookId(bookId)
                    .title(b != null ? b.getTitle() : ("Sách #" + bookId))
                    .image(b != null ? b.getImage() : null)
                    .qty(qty).revenue(revenue)
                    .build();
        }).toList();
    }
}

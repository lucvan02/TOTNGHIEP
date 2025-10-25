package com.bookwebAI.order_service.repository;

import com.bookwebAI.order_service.entity.enums.OrderStatus;
import com.bookwebAI.order_service.entity.OrderItem;
import com.bookwebAI.order_service.entity.Order;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticsRepository extends Repository<Order, String> {

    // Tổng theo trạng thái trong khoảng ngày
    @Query("select o.status, count(o), coalesce(sum(case when o.status = com.bookwebAI.order_service.entity.enums.OrderStatus.COMPLETED then o.total else 0 end),0) " +
            "from Order o where o.createdAt between :from and :to group by o.status")
    List<Object[]> aggregateByStatus(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // Số đơn theo ngày (mọi trạng thái)
    @Query("select function('date', o.createdAt) as d, count(o) " +
            "from Order o where o.createdAt between :from and :to group by function('date', o.createdAt) order by d asc")
    List<Object[]> ordersPerDay(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // Doanh thu theo ngày (chỉ COMPLETED)
    @Query("select function('date', o.createdAt) as d, coalesce(sum(o.total),0) " +
            "from Order o where o.createdAt between :from and :to and o.status = com.bookwebAI.order_service.entity.enums.OrderStatus.COMPLETED " +
            "group by function('date', o.createdAt) order by d asc")
    List<Object[]> revenuePerDay(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // Top sách bán chạy (COMPLETED)
    @Query("select i.bookId, max(i.bookTitle), sum(i.quantity), sum(i.total) " +
            "from OrderItem i join i.order o " +
            "where o.createdAt between :from and :to and o.status = com.bookwebAI.order_service.entity.enums.OrderStatus.COMPLETED " +
            "group by i.bookId order by sum(i.quantity) desc")
    List<Object[]> topBooks(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}

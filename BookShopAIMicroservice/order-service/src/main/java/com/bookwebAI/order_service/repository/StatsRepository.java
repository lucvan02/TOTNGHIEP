package com.bookwebAI.order_service.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StatsRepository extends JpaRepository<com.bookwebAI.order_service.entity.Order, String> {

    // KPI cơ bản
    @Query(value = """
        SELECT
          COUNT(*)                                                          AS orders,
          SUM(CASE WHEN o.payment_status = 1 THEN 1 ELSE 0 END)            AS paid_orders,
          SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END)          AS completed_orders,
          SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END)          AS cancelled_orders,
          COUNT(DISTINCT o.buyer_id)                                       AS buyers,
          ( SELECT IFNULL(SUM(oi.quantity), 0)
              FROM `order_items` oi
              JOIN `orders` o2 ON oi.order_id = o2.id
             WHERE o2.created_at BETWEEN :from AND :to
               AND o2.status = 'COMPLETED'
          )                                                                AS items,
          ( SELECT IFNULL(SUM(o3.total), 0)
              FROM `orders` o3
             WHERE o3.created_at BETWEEN :from AND :to
               AND o3.status = 'COMPLETED'
          )                                                                AS revenue
        FROM `orders` o
        WHERE o.created_at BETWEEN :from AND :to
        """, nativeQuery = true)
    Object kpis(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);


    // Doanh thu theo ngày (MySQL -> String)
    @Query(value = """
    SELECT DATE_FORMAT(o.created_at, '%Y-%m-%d') AS d,
           IFNULL(SUM(o.total), 0)               AS v
    FROM `orders` o
    WHERE o.created_at BETWEEN :from AND :to
      AND o.status = 'COMPLETED'
    GROUP BY d
    ORDER BY d
    """, nativeQuery = true)
    List<Object[]> revenueDaily(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // Số đơn theo ngày (MySQL -> String)
    @Query(value = """
    SELECT DATE_FORMAT(o.created_at, '%Y-%m-%d') AS d,
           COUNT(*)                              AS v
    FROM `orders` o
    WHERE o.created_at BETWEEN :from AND :to
    GROUP BY d
    ORDER BY d
    """, nativeQuery = true)
    List<Object[]> ordersDaily(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);



    // Phân bố trạng thái đơn
    @Query(value = """
        SELECT o.status AS s, COUNT(*) AS v
        FROM `orders` o
        WHERE o.created_at BETWEEN :from AND :to
        GROUP BY o.status
        """, nativeQuery = true)
    List<Object[]> orderStatusDistribution(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);


    // Phân bố phương thức thanh toán
    @Query(value = """
        SELECT IFNULL(o.payment_method, 'UNKNOWN') AS pm, COUNT(*) AS v
        FROM `orders` o
        WHERE o.created_at BETWEEN :from AND :to
        GROUP BY pm
        """, nativeQuery = true)
    List<Object[]> paymentMethodDistribution(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);


    // Top sách theo qty & revenue
    @Query(value = """
        SELECT oi.book_id,
               IFNULL(SUM(oi.quantity), 0) AS qty,
               IFNULL(SUM(oi.total), 0)    AS revenue
        FROM `order_items` oi
        JOIN `orders` o ON o.id = oi.order_id
        WHERE o.created_at BETWEEN :from AND :to
          AND o.status = 'COMPLETED'
        GROUP BY oi.book_id
        ORDER BY revenue DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> topBooks(@Param("from") LocalDateTime from,
                            @Param("to") LocalDateTime to,
                            @Param("limit") int limit);
}

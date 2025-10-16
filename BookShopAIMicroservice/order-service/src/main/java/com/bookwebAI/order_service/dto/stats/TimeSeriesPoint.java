// dto/stats/TimeSeriesPoint.java
package com.bookwebAI.order_service.dto.stats;

import lombok.*;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class TimeSeriesPoint {
    private String date; // yyyy-MM-dd
    private long value;
}
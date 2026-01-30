package com.example.pos.report.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DailyRevenueDTO {
    private LocalDate date;
    private BigDecimal total;
}

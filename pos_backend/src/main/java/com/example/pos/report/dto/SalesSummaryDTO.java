package com.example.pos.report.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SalesSummaryDTO {
    private Long totalSales;
    private BigDecimal totalRevenue;
    private BigDecimal totalItemsSold;
}

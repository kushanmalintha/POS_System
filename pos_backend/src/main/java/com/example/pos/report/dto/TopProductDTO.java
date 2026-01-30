package com.example.pos.report.dto;

import java.math.BigDecimal;

import lombok.*;

@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TopProductDTO {
    private Long productId;
    private String name;
    private BigDecimal quantity;
}

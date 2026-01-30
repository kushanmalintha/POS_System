package com.example.pos.report.dto;

import com.example.pos.product.UnitType;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LowStockDTO {

    private Long id;
    private String name;
    private BigDecimal stock;
    private UnitType unitType;
}

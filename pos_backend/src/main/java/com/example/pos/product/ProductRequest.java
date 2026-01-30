package com.example.pos.product;

import lombok.Data;
import java.math.BigDecimal;


@Data
public class ProductRequest {
    private String name;
    private BigDecimal price;
    private BigDecimal stock;
    private Long categoryId;
    private UnitType unitType;
}

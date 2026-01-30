package com.example.pos.sale;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class CreateSaleItemRequest {

    private Long productId;
    private BigDecimal quantity;
}

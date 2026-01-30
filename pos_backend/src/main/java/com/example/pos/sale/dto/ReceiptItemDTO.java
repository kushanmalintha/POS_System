package com.example.pos.sale.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ReceiptItemDTO {

    private String name;
    private BigDecimal qty;
    private BigDecimal unitPrice;
    private BigDecimal total;
}

package com.example.pos.sale.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ReceiptResponseDTO {

    private String invoiceNumber;
    private ShopDTO shop;
    private LocalDateTime dateTime;
    private String cashier;
    private List<ReceiptItemDTO> items;
    private BigDecimal totalAmount;
    private String footer;
}

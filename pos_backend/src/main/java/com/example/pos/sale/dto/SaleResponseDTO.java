package com.example.pos.sale.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SaleResponseDTO {

    private Long id;
    private LocalDateTime timestamp;
    private BigDecimal totalAmount;
    private String cashierUsername;
    private List<SaleItemResponseDTO> items;
    private String invoiceNumber;
}

package com.example.pos.sale.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShopDTO {

    private String name;
    private String address;
    private String phone;
}

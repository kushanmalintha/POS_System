package com.example.pos.sale;

import lombok.Data;
import java.util.List;

@Data
public class CreateSaleRequest {

    private List<CreateSaleItemRequest> items;
}

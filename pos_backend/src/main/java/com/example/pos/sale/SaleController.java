package com.example.pos.sale;

import com.example.pos.sale.dto.ReceiptResponseDTO;
import com.example.pos.sale.dto.SaleResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    @PostMapping
    public SaleResponseDTO createSale(@RequestBody CreateSaleRequest request,
                                      Authentication authentication) {
        return saleService.createSale(request, authentication.getName());
    }

    @GetMapping("/get-all")
    public List<SaleResponseDTO> getAllSales() {
        return saleService.getAllSales();
    }

    @GetMapping("/my-sales")
    public List<SaleResponseDTO> mySales(Authentication authentication) {
        return saleService.getSalesByCashier(authentication.getName());
    }

    @GetMapping("/{id}")
    public SaleResponseDTO getSale(@PathVariable Long id) {
        return saleService.getSaleById(id);
    }

    @GetMapping("/{id}/receipt")
    public ReceiptResponseDTO getReceipt(@PathVariable Long id) {
        return saleService.generateReceipt(id);
    }
}

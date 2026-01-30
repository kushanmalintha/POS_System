package com.example.pos.sale;

import com.example.pos.product.Product;
import com.example.pos.product.ProductRepository;
import com.example.pos.sale.dto.*;
import com.example.pos.user.User;
import com.example.pos.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // Shop info
    @Value("${shop.name}")
    private String shopName;

    @Value("${shop.address}")
    private String shopAddress;

    @Value("${shop.phone}")
    private String shopPhone;

    // ---------------- CREATE SALE ----------------

    public SaleResponseDTO createSale(CreateSaleRequest request, String cashierUsername) {

        User cashier = userRepository.findByUsername(cashierUsername)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Cashier not found"
                        ));

        BigDecimal total = BigDecimal.ZERO;
        List<SaleItem> saleItems = new ArrayList<>();

        for (CreateSaleItemRequest itemReq : request.getItems()) {

            if (itemReq.getQuantity() == null ||
                itemReq.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid quantity"
                );
            }

            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() ->
                            new ResponseStatusException(
                                    HttpStatus.BAD_REQUEST,
                                    "Product not found with ID: " + itemReq.getProductId()
                            ));

            // Stock check (works for UNIT & KG)
            if (product.getStock().compareTo(itemReq.getQuantity()) < 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock for " + product.getName()
                );
            }

            // Deduct stock
            product.setStock(
                    product.getStock().subtract(itemReq.getQuantity())
            );
            productRepository.save(product);

            // price × quantity (UNIT or KG)
            BigDecimal lineTotal =
                    product.getPrice().multiply(itemReq.getQuantity());

            total = total.add(lineTotal);

            saleItems.add(
                    SaleItem.builder()
                            .product(product)
                            .quantity(itemReq.getQuantity())
                            .priceAtSale(lineTotal)
                            .build()
            );
        }

        Sale sale = Sale.builder()
                .invoiceNumber(generateInvoiceNumber())
                .cashier(cashier)
                .timestamp(LocalDateTime.now())
                .totalAmount(total)
                .items(saleItems)
                .build();

        saleItems.forEach(item -> item.setSale(sale));

        Sale savedSale = saleRepository.save(sale);

        return mapToResponse(savedSale);
    }

    // ---------------- READ ----------------

    public List<SaleResponseDTO> getAllSales() {
        return saleRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<SaleResponseDTO> getSalesByCashier(String username) {
        return saleRepository.findAll().stream()
                .filter(s -> s.getCashier().getUsername().equals(username))
                .map(this::mapToResponse)
                .toList();
    }

    public SaleResponseDTO getSaleById(Long id) {
        return saleRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Sale not found"
                        ));
    }

    // ---------------- RECEIPT ----------------

    public ReceiptResponseDTO generateReceipt(Long saleId) {

        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Sale not found"
                        ));

        return ReceiptResponseDTO.builder()
                .invoiceNumber(sale.getInvoiceNumber())
                .dateTime(sale.getTimestamp())
                .cashier(sale.getCashier().getUsername())
                .items(
                        sale.getItems().stream().map(item ->
                                ReceiptItemDTO.builder()
                                        .name(item.getProduct().getName())
                                        .qty(item.getQuantity())
                                        .unitPrice(item.getProduct().getPrice())
                                        .total(item.getPriceAtSale())
                                        .build()
                        ).toList()
                )
                .totalAmount(sale.getTotalAmount())
                .shop(
                        ShopDTO.builder()
                                .name(shopName)
                                .address(shopAddress)
                                .phone(shopPhone)
                                .build()
                )
                .footer("Thank you for shopping!")
                .build();
    }

    // ---------------- HELPERS ----------------

    private String generateInvoiceNumber() {
        return "INV-" + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }

    private SaleResponseDTO mapToResponse(Sale sale) {

        return SaleResponseDTO.builder()
                .id(sale.getId())
                .timestamp(sale.getTimestamp())
                .totalAmount(sale.getTotalAmount())
                .cashierUsername(sale.getCashier().getUsername())
                .invoiceNumber(sale.getInvoiceNumber())
                .items(
                        sale.getItems().stream()
                                .map(item ->
                                        SaleItemResponseDTO.builder()
                                                .productId(item.getProduct().getId())
                                                .productName(item.getProduct().getName())
                                                .quantity(item.getQuantity())
                                                .unitPrice(item.getProduct().getPrice())
                                                .lineTotal(item.getPriceAtSale())
                                                .build()
                                ).toList()
                )
                .build();
    }
}

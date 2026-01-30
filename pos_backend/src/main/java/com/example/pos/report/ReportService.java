package com.example.pos.report;

import com.example.pos.product.ProductRepository;
import com.example.pos.report.dto.*;
import com.example.pos.sale.Sale;
import com.example.pos.sale.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    // 1. Sales summary (date range)
    public SalesSummaryDTO getSalesSummary(LocalDate from, LocalDate to) {

        List<Sale> sales = saleRepository.findAll().stream()
                .filter(s ->
                        !s.getTimestamp().toLocalDate().isBefore(from) &&
                        !s.getTimestamp().toLocalDate().isAfter(to))
                .toList();

        BigDecimal totalRevenue = sales.stream()
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalQuantitySold = sales.stream()
                .flatMap(s -> s.getItems().stream())
                .map(i -> i.getQuantity())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return SalesSummaryDTO.builder()
                .totalSales((long) sales.size())
                .totalRevenue(totalRevenue)
                .totalItemsSold(totalQuantitySold)
                .build();
    }

    // 2. Daily revenue
    public List<DailyRevenueDTO> getDailyRevenue() {

        Map<LocalDate, BigDecimal> dailyTotals = new HashMap<>();

        for (Sale sale : saleRepository.findAll()) {
            LocalDate date = sale.getTimestamp().toLocalDate();
            dailyTotals.put(
                    date,
                    dailyTotals.getOrDefault(date, BigDecimal.ZERO)
                            .add(sale.getTotalAmount())
            );
        }

        return dailyTotals.entrySet().stream()
                .map(e -> DailyRevenueDTO.builder()
                        .date(e.getKey())
                        .total(e.getValue())
                        .build())
                .sorted(Comparator.comparing(DailyRevenueDTO::getDate))
                .toList();
    }

    // 3. Top selling products (by quantity)
    public List<TopProductDTO> getTopProducts(int limit) {

        Map<Long, TopProductDTO> map = new HashMap<>();

        saleRepository.findAll().forEach(sale ->
                sale.getItems().forEach(item -> {
                    map.compute(item.getProduct().getId(), (k, v) -> {
                        if (v == null) {
                            return TopProductDTO.builder()
                                    .productId(k)
                                    .name(item.getProduct().getName())
                                    .quantity(item.getQuantity())
                                    .build();
                        }
                        v.setQuantity(
                                v.getQuantity().add(item.getQuantity())
                        );
                        return v;
                    });
                })
        );

        return map.values().stream()
                .sorted((a, b) ->
                        b.getQuantity().compareTo(a.getQuantity()))
                .limit(limit)
                .toList();
    }

    // 4. Low stock alerts
    public List<LowStockDTO> getLowStock(BigDecimal threshold) {

        return productRepository.findAll().stream()
                .filter(p -> p.getStock().compareTo(threshold) <= 0)
                .map(p -> LowStockDTO.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .stock(p.getStock())
                        .unitType(p.getUnitType())
                        .build())
                .collect(Collectors.toList());
    }
}

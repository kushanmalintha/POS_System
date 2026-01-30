package com.example.pos.report;

import com.example.pos.report.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    // 1. Sales summary
    @GetMapping("/sales-summary")
    public SalesSummaryDTO salesSummary(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to) {
        return reportService.getSalesSummary(from, to);
    }

    // 2. Daily revenue
    @GetMapping("/daily-revenue")
    public List<DailyRevenueDTO> dailyRevenue() {
        return reportService.getDailyRevenue();
    }

    // 3. Top products
    @GetMapping("/top-products")
    public List<TopProductDTO> topProducts(
            @RequestParam(defaultValue = "5") int limit) {
        return reportService.getTopProducts(limit);
    }

    // 4. Low stock
    @GetMapping("/low-stock")
    public List<LowStockDTO> lowStock(
            @RequestParam(defaultValue = "10") BigDecimal threshold) {
        return reportService.getLowStock(threshold);
    }
}

package com.example.pos.sale;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class InvoiceNumberGenerator {

    public static String generate(Long saleId) {
        String date = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        return "INV-" + date + "-" + String.format("%04d", saleId);
    }
}

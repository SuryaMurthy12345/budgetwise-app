package com.project.budget_tracker.controller;

import com.project.budget_tracker.model.Transaction;
import com.project.budget_tracker.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/transaction")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping("/add")
    public ResponseEntity<?> addTransaction(@Valid @RequestBody Transaction transaction) {
        return transactionService.addTransaction(transaction);
    }

    @GetMapping("/list")
    public ResponseEntity<?> getTransactions() {
        return transactionService.getTransactions();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id) {
        return transactionService.deleteTransaction(id);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTransaction(@PathVariable Long id, @Valid @RequestBody Transaction transaction) {
        return transactionService.updateTransaction(id, transaction);
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyTransactions(
            @RequestParam int year,
            @RequestParam int month) {
        return transactionService.getMonthlyTransactions(year, month);
    }

    @PostMapping("/set-starting-balance")
    public ResponseEntity<?> setStartingBalance(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam Double balance) {
        return transactionService.setStartingBalance(year, month, balance);
    }

    @PostMapping("/set-budgets")
    public ResponseEntity<?> setBudgets(@RequestParam int year, @RequestParam int month, @RequestBody Map<String, Double> budgets) {
        return transactionService.setBudgets(year, month, budgets);
    }

    @GetMapping("/spending-trends")
    public ResponseEntity<?> getSpendingTrends() {
        return transactionService.getSpendingTrends();
    }

    @GetMapping("/report/pdf")
    public ResponseEntity<byte[]> downloadMonthlyReport(
            @RequestParam int year,
            @RequestParam int month) {
        try {
            byte[] pdfBytes = transactionService.generateMonthlyReportPdf(year, month);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            String filename = String.format("BudgetWise_Report_%d-%02d.pdf", year, month);
            headers.setContentDispositionFormData(filename, filename);
            headers.setContentLength(pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            // Log the error for debugging on the server side
            System.err.println("Error generating PDF for user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
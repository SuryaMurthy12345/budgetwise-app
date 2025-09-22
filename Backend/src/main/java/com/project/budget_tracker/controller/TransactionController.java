package com.project.budget_tracker.controller;

import com.project.budget_tracker.model.Transaction;
import com.project.budget_tracker.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

}
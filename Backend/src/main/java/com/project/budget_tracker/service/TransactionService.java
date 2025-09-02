package com.project.budget_tracker.service;

import com.project.budget_tracker.model.Transaction;
import com.project.budget_tracker.model.User;
import com.project.budget_tracker.repository.TransactionRepo;
import com.project.budget_tracker.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {
    @Autowired
    private TransactionRepo transactionRepo;

    @Autowired
    private UserRepo userRepo;

    public ResponseEntity<?> addTransaction(Transaction transaction) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepo.findByEmail(email);

        transaction.setUser(user);

        Transaction saved = transactionRepo.save(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    public ResponseEntity<?> getTransactions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepo.findByEmail(email);

        List<Transaction> transactions = transactionRepo.findByUser(user);
        return ResponseEntity.ok(transactions);
    }

    public ResponseEntity<?> deleteTransaction(Long id) {
        transactionRepo.deleteById(id);
        return ResponseEntity.ok("Transaction deleted successfully");
    }

    public ResponseEntity<?> updateTransaction(Long id, Transaction updatedTransaction) {
        Transaction transaction = transactionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        transaction.setDescription(updatedTransaction.getDescription());
        transaction.setAmount(updatedTransaction.getAmount());
        transaction.setAccount(updatedTransaction.getAccount());
        transaction.setCategory(updatedTransaction.getCategory());
        transaction.setDate(updatedTransaction.getDate());

        Transaction saved = transactionRepo.save(transaction);
        return ResponseEntity.ok(saved);
    }
}

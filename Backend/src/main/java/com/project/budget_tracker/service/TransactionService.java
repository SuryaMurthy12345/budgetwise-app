package com.project.budget_tracker.service;

import com.project.budget_tracker.model.Transaction;
import com.project.budget_tracker.model.User;
import com.project.budget_tracker.repository.ProfileRepo;
import com.project.budget_tracker.repository.TransactionRepo;
import com.project.budget_tracker.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {
    @Autowired
    private TransactionRepo transactionRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ProfileRepo profileRepo;

    public ResponseEntity<?> addTransaction(Transaction transaction) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepo.findByEmail(email);

        // Get monthly fixed income
        Double monthlyIncome = profileRepo.findByUser(user).getIncome();

        // Extract month and year from transaction date
        LocalDate transactionDate = transaction.getDate();
        int month = transactionDate.getMonthValue();
        int year = transactionDate.getYear();

        // Fetch total income credits for the month (borrow, income, etc.)
        Double monthlyCredits = transactionRepo.getMonthlyIncomeCredits(user.getId(), month, year);
        if (monthlyCredits == null) {
            monthlyCredits = 0.0;
        }

        // Fetch total expenses for the month
        Double monthlyExpenses = transactionRepo.getMonthlyExpenses(user.getId(), month, year);
        if (monthlyExpenses == null) {
            monthlyExpenses = 0.0;
        }

        // Calculate remaining balance
        Double remainingBalance = monthlyIncome + monthlyCredits - monthlyExpenses;

        // Check if expense exceeds remaining balance
        if ("expense".equalsIgnoreCase(transaction.getAccount()) && transaction.getAmount() > remainingBalance) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Insufficient balance to add this expense. Remaining: " + remainingBalance);
        }

        // Save transaction
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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepo.findByEmail(email);

        Transaction transaction = transactionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        Double monthlyIncome = profileRepo.findByUser(user).getIncome();

        // Extract month and year from transaction date
        LocalDate transactionDate = transaction.getDate();
        int month = transactionDate.getMonthValue();
        int year = transactionDate.getYear();

        // Fetch total income credits for the month (borrow, income, etc.)
        Double monthlyCredits = transactionRepo.getMonthlyIncomeCredits(user.getId(), month, year);
        if (monthlyCredits == null) {
            monthlyCredits = 0.0;
        }

        // Fetch total expenses for the month
        Double monthlyExpenses = transactionRepo.getMonthlyExpenses(user.getId(), month, year);
        if (monthlyExpenses == null) {
            monthlyExpenses = 0.0;
        }

        // Calculate remaining balance
        Double remainingBalance = monthlyIncome + monthlyCredits - monthlyExpenses;

        // Check if expense exceeds remaining balance
        if ("expense".equalsIgnoreCase(updatedTransaction.getAccount()) && updatedTransaction.getAmount() > remainingBalance) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Insufficient balance to add this expense. Remaining: " + remainingBalance);
        }

        transaction.setDescription(updatedTransaction.getDescription());
        transaction.setAmount(updatedTransaction.getAmount());
        transaction.setAccount(updatedTransaction.getAccount());
        transaction.setCategory(updatedTransaction.getCategory());
        transaction.setDate(updatedTransaction.getDate());

        Transaction saved = transactionRepo.save(transaction);
        return ResponseEntity.ok(saved);
    }
}

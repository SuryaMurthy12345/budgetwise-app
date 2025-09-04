package com.project.budget_tracker.service;

import com.project.budget_tracker.model.MonthlyStats;
import com.project.budget_tracker.model.Profile;
import com.project.budget_tracker.model.Transaction;
import com.project.budget_tracker.model.User;
import com.project.budget_tracker.repository.MonthlyStatsRepo;
import com.project.budget_tracker.repository.ProfileRepo;
import com.project.budget_tracker.repository.TransactionRepo;
import com.project.budget_tracker.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepo transactionRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ProfileRepo profileRepo;

    @Autowired
    private MonthlyStatsRepo monthlyStatsRepo;


    /**
     * Helper method to find or create the monthly stats entry.
     */
    private MonthlyStats getOrCreateMonthlyStats(User user, int year, int month) {
        return monthlyStatsRepo.findByUserAndYearAndMonth(user, year, month)
                .orElseGet(() -> {
                    Profile profile = profileRepo.findByUser(user);
                    Double monthlyIncome = (profile != null ? profile.getIncome() : 0.0);
                    MonthlyStats newStats = new MonthlyStats();
                    newStats.setUser(user);
                    newStats.setMonth(month);
                    newStats.setYear(year);
                    newStats.setTotalCredits(0.0);
                    newStats.setTotalExpenses(0.0);
                    newStats.setRemainingBalance(monthlyIncome);
                    return monthlyStatsRepo.save(newStats);
                });
    }

    /**
     * Helper method to update the monthly stats table incrementally.
     */
    private void updateMonthlyStats(User user, int year, int month, String accountType, Double amount) {
        MonthlyStats stats = getOrCreateMonthlyStats(user, year, month);

        if ("expense".equalsIgnoreCase(accountType)) {
            stats.setTotalExpenses(stats.getTotalExpenses() + amount);
            stats.setRemainingBalance(stats.getRemainingBalance() - amount);
        } else {
            stats.setTotalCredits(stats.getTotalCredits() + amount);
            stats.setRemainingBalance(stats.getRemainingBalance() + amount);
        }

        monthlyStatsRepo.save(stats);
    }

    /**
     * Adds a new transaction for the authenticated user.
     * Validates if an expense can be afforded before saving.
     */
    @Transactional
    public ResponseEntity<?> addTransaction(Transaction transaction) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepo.findByEmail(email);

        LocalDate transactionDate = transaction.getDate();
        int month = transactionDate.getMonthValue();
        int year = transactionDate.getYear();

        MonthlyStats currentStats = getOrCreateMonthlyStats(user, year, month);

        if ("expense".equalsIgnoreCase(transaction.getAccount()) && transaction.getAmount() > currentStats.getRemainingBalance()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Insufficient balance to add this expense. Remaining: " + currentStats.getRemainingBalance());
        }

        transaction.setUser(user);
        Transaction saved = transactionRepo.save(transaction);

        updateMonthlyStats(user, year, month, saved.getAccount(), saved.getAmount());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Fetches all transactions for the authenticated user.
     */
    public ResponseEntity<?> getTransactions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepo.findByEmail(email);

        List<Transaction> transactions = transactionRepo.findByUser(user);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Deletes a transaction by its ID.
     */
    @Transactional
    public ResponseEntity<?> deleteTransaction(Long id) {
        Transaction transaction = transactionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        transactionRepo.deleteById(id);

        LocalDate transactionDate = transaction.getDate();
        int month = transactionDate.getMonthValue();
        int year = transactionDate.getYear();

        // Reverse the transaction's effect on monthly stats
        String accountType = transaction.getAccount();
        Double amount = transaction.getAmount();

        MonthlyStats stats = getOrCreateMonthlyStats(transaction.getUser(), year, month);

        if ("expense".equalsIgnoreCase(accountType)) {
            stats.setTotalExpenses(stats.getTotalExpenses() - amount);
            stats.setRemainingBalance(stats.getRemainingBalance() + amount);
        } else {
            stats.setTotalCredits(stats.getTotalCredits() - amount);
            stats.setRemainingBalance(stats.getRemainingBalance() - amount);
        }

        monthlyStatsRepo.save(stats);

        return ResponseEntity.ok("Transaction deleted successfully");
    }

    /**
     * Updates an existing transaction.
     */
    @Transactional
    public ResponseEntity<?> updateTransaction(Long id, Transaction updatedTransaction) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepo.findByEmail(email);

        Transaction transaction = transactionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        LocalDate oldDate = transaction.getDate();
        int oldMonth = oldDate.getMonthValue();
        int oldYear = oldDate.getYear();
        String oldAccountType = transaction.getAccount();
        Double oldAmount = transaction.getAmount();

        LocalDate newDate = updatedTransaction.getDate();
        int newMonth = newDate.getMonthValue();
        int newYear = newDate.getYear();

        // Check balance against the new transaction amount
        MonthlyStats currentStats = getOrCreateMonthlyStats(user, newYear, newMonth);
        Double remainingBalance = currentStats.getRemainingBalance();

        if (oldMonth == newMonth && oldYear == newYear && "expense".equalsIgnoreCase(oldAccountType)) {
            remainingBalance += oldAmount;
        }

        if ("expense".equalsIgnoreCase(updatedTransaction.getAccount()) && updatedTransaction.getAmount() > remainingBalance) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Insufficient balance to update this expense. Remaining: " + (remainingBalance));
        }

        // Apply reverse update for old transaction in its original month
        if (oldMonth == newMonth && oldYear == newYear) {
            if ("expense".equalsIgnoreCase(oldAccountType)) {
                currentStats.setTotalExpenses(currentStats.getTotalExpenses() - oldAmount);
                currentStats.setRemainingBalance(currentStats.getRemainingBalance() + oldAmount);
            } else {
                currentStats.setTotalCredits(currentStats.getTotalCredits() - oldAmount);
                currentStats.setRemainingBalance(currentStats.getRemainingBalance() - oldAmount);
            }
            monthlyStatsRepo.save(currentStats);
        } else {
            // If month has changed, reverse the old one and update the new one
            updateMonthlyStats(user, oldYear, oldMonth, oldAccountType, -oldAmount);
        }

        // Update the transaction details
        transaction.setDescription(updatedTransaction.getDescription());
        transaction.setAmount(updatedTransaction.getAmount());
        transaction.setAccount(updatedTransaction.getAccount());
        transaction.setCategory(updatedTransaction.getCategory());
        transaction.setDate(updatedTransaction.getDate());

        Transaction saved = transactionRepo.save(transaction);

        // Apply update for the new transaction in its new month
        updateMonthlyStats(user, newYear, newMonth, saved.getAccount(), saved.getAmount());

        return ResponseEntity.ok(saved);
    }

    /**
     * Provides a summary of transactions for a specific month, now with an instant lookup.
     */
    public ResponseEntity<?> getMonthlyTransactions(Long userId, int year, int month) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Fetch transactions for the list
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        List<Transaction> transactions = transactionRepo.findByUserAndDateRange(userId, startDate, endDate);

        // Fetch pre-calculated summary for instant totals
        Profile profile = profileRepo.findByUser(user);
        MonthlyStats stats = monthlyStatsRepo.findByUserAndYearAndMonth(user, year, month)
                .orElse(null);
        Map<String, Object> response = new HashMap<>();
        if(transactions.isEmpty()){
            response.put("remainingBalance", profile.getIncome());
        }
        else{
        response.put("remainingBalance", (stats != null) ? stats.getRemainingBalance() : 0.0);
        }
        response.put("transactions", transactions);
        response.put("totalCredits", (stats != null) ? stats.getTotalCredits() : 0.0);
        response.put("totalExpenses", (stats != null) ? stats.getTotalExpenses() : 0.0);

        Double monthlyIncome = (profile != null ? profile.getIncome() : 0.0);
        response.put("monthlyIncome", monthlyIncome);

        return ResponseEntity.ok(response);
    }
}

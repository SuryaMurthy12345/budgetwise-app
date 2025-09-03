package com.project.budget_tracker.service;

import com.project.budget_tracker.model.Profile;
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

    /**
     * Reusable private method to get the monthly summary (income, expenses, and remaining balance).
     *
     * @param user The user for whom to calculate the summary.
     * @param year The year of the summary.
     * @param month The month of the summary.
     * @return A map containing total credits, total expenses, monthly income, and remaining balance.
     */
    private Map<String, Double> getMonthlySummary(User user, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Transaction> transactions = transactionRepo.findByUserAndDateRange(user.getId(), startDate, endDate);

        double totalCredits = transactions.stream()
                .filter(t -> "INCOME".equalsIgnoreCase(t.getAccount()) || "BORROW".equalsIgnoreCase(t.getAccount()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        double totalExpenses = transactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getAccount()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        Profile profile = profileRepo.findByUser(user);
        Double monthlyIncome = (profile != null ? profile.getIncome() : 0.0);

        double remainingBalance = monthlyIncome + totalCredits - totalExpenses;

        Map<String, Double> summary = new HashMap<>();
        summary.put("monthlyIncome", monthlyIncome);
        summary.put("monthlyCredits", totalCredits);
        summary.put("monthlyExpenses", totalExpenses);
        summary.put("remainingBalance", remainingBalance);

        return summary;
    }

    /**
     * Adds a new transaction for the authenticated user.
     * Validates if an expense can be afforded before saving.
     *
     * @param transaction The transaction to be added.
     * @return A ResponseEntity with the saved transaction or an error message.
     */
    public ResponseEntity<?> addTransaction(Transaction transaction) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepo.findByEmail(email);

        LocalDate transactionDate = transaction.getDate();
        int month = transactionDate.getMonthValue();
        int year = transactionDate.getYear();

        // Get the monthly summary and remaining balance before adding the new transaction
        Map<String, Double> monthlySummary = getMonthlySummary(user, year, month);
        Double remainingBalance = monthlySummary.get("remainingBalance");

        // Check if the new expense exceeds the remaining balance
        if ("expense".equalsIgnoreCase(transaction.getAccount()) && transaction.getAmount() > remainingBalance) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Insufficient balance to add this expense. Remaining: " + remainingBalance);
        }

        transaction.setUser(user);
        Transaction saved = transactionRepo.save(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Fetches all transactions for the authenticated user.
     *
     * @return A ResponseEntity with a list of transactions.
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
     *
     * @param id The ID of the transaction to delete.
     * @return A ResponseEntity with a success message.
     */
    public ResponseEntity<?> deleteTransaction(Long id) {
        transactionRepo.deleteById(id);
        return ResponseEntity.ok("Transaction deleted successfully");
    }

    /**
     * Updates an existing transaction. Validates if an updated expense can be afforded.
     * The validation logic accounts for the old transaction's amount.
     *
     * @param id The ID of the transaction to update.
     * @param updatedTransaction The new transaction details.
     * @return A ResponseEntity with the updated transaction or an error message.
     */
    public ResponseEntity<?> updateTransaction(Long id, Transaction updatedTransaction) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepo.findByEmail(email);

        Transaction transaction = transactionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        LocalDate transactionDate = transaction.getDate();
        int month = transactionDate.getMonthValue();
        int year = transactionDate.getYear();

        // Get the monthly summary
        Map<String, Double> monthlySummary = getMonthlySummary(user, year, month);
        Double remainingBalance = monthlySummary.get("remainingBalance");
        Double oldAmount = transaction.getAmount();

        // Adjust remaining balance by subtracting the old amount if it was an expense
        if ("expense".equalsIgnoreCase(transaction.getAccount())) {
            remainingBalance += oldAmount;
        }

        // Check if the new expense exceeds the adjusted remaining balance
        if ("expense".equalsIgnoreCase(updatedTransaction.getAccount()) && updatedTransaction.getAmount() > remainingBalance) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Insufficient balance to update this expense. Remaining: " + (remainingBalance));
        }

        // Update the transaction details
        transaction.setDescription(updatedTransaction.getDescription());
        transaction.setAmount(updatedTransaction.getAmount());
        transaction.setAccount(updatedTransaction.getAccount());
        transaction.setCategory(updatedTransaction.getCategory());
        transaction.setDate(updatedTransaction.getDate());

        Transaction saved = transactionRepo.save(transaction);
        return ResponseEntity.ok(saved);
    }

    /**
     * Provides a summary of transactions for a specific month, including totals.
     *
     * @param userId The ID of the user.
     * @param year The year of the summary.
     * @param month The month of the summary.
     * @return A ResponseEntity with a map containing the transactions and financial summary.
     */
    public ResponseEntity<?> getMonthlyTransactions(Long userId, int year, int month) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        List<Transaction> transactions = transactionRepo.findByUserAndDateRange(userId, startDate, endDate);

        Map<String, Double> summary = getMonthlySummary(user, year, month);

        Map<String, Object> response = new HashMap<>();
        response.put("transactions", transactions);
        response.put("totalCredits", summary.get("monthlyCredits"));
        response.put("totalExpenses", summary.get("monthlyExpenses"));
        response.put("remainingBalance", summary.get("remainingBalance"));
        response.put("monthlyIncome", summary.get("monthlyIncome"));

        return ResponseEntity.ok(response);
    }
}
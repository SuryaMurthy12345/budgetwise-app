package com.project.budget_tracker.service;

import com.project.budget_tracker.model.MonthlyStats;
import com.project.budget_tracker.model.Transaction;
import com.project.budget_tracker.model.User;
import com.project.budget_tracker.repository.MonthlyStatsRepo;
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


import com.itextpdf.text.Document;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.BaseColor;
import java.io.ByteArrayOutputStream;
import java.util.stream.Stream;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepo transactionRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private MonthlyStatsRepo monthlyStatsRepo;

    // Helper to get the authenticated user securely from the token
    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepo.findByEmail(email);
    }

    /**
     * Helper method to find or create the monthly stats entry.
     */
    private MonthlyStats getOrCreateMonthlyStats(User user, int year, int month) {
        return monthlyStatsRepo.findByUserAndYearAndMonth(user, year, month)
                .orElseGet(() -> {
                    MonthlyStats newStats = new MonthlyStats();
                    newStats.setUser(user);
                    newStats.setMonth(month);
                    newStats.setYear(year);
                    newStats.setTotalCredits(0.0);
                    newStats.setTotalExpenses(0.0);
                    newStats.setStartingBalance(0.0);
                    newStats.setRemainingBalance(0.0);
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
        User user = getAuthenticatedUser();
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
        User user = getAuthenticatedUser();
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
        User user = getAuthenticatedUser();
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

    // New method to set the starting balance and recalculate stats
    @Transactional
    public ResponseEntity<?> setStartingBalance(int year, int month, Double balance) {
        User user = getAuthenticatedUser();
        MonthlyStats stats = getOrCreateMonthlyStats(user, year, month);

        stats.setStartingBalance(balance);
        stats.setTotalCredits(0.0);
        stats.setTotalExpenses(0.0);
        stats.setRemainingBalance(balance);

        List<Transaction> transactions = transactionRepo.findByUserAndDateRange(user.getId(),
                LocalDate.of(year, month, 1), LocalDate.of(year, month, YearMonth.of(year, month).lengthOfMonth()));

        for (Transaction txn : transactions) {
            if ("expense".equalsIgnoreCase(txn.getAccount())) {
                stats.setTotalExpenses(stats.getTotalExpenses() + txn.getAmount());
                stats.setRemainingBalance(stats.getRemainingBalance() - txn.getAmount());
            } else {
                stats.setTotalCredits(stats.getTotalCredits() + txn.getAmount());
                stats.setRemainingBalance(stats.getRemainingBalance() + txn.getAmount());
            }
        }
        monthlyStatsRepo.save(stats);
        return ResponseEntity.ok(stats);
    }

    /**
     * New method to set category-specific budgets with validation.
     */
    @Transactional
    public ResponseEntity<?> setBudgets(int year, int month, Map<String, Double> budgets) {
        User user = getAuthenticatedUser();
        MonthlyStats stats = getOrCreateMonthlyStats(user, year, month);

        // Calculate the total of all new budgets
        double totalBudget = budgets.values().stream().mapToDouble(Double::doubleValue).sum();

        // Validate against starting balance
        if (totalBudget > stats.getStartingBalance()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Total budgets cannot exceed the starting balance of the month.");
        }

        // Update each budget field from the map
        budgets.forEach((category, amount) -> {
            switch (category.toLowerCase().replace(" ", "").replace("&", "")) {
                case "fooddining":
                    stats.setBudgetFood(amount);
                    break;
                case "transportation":
                    stats.setBudgetTransportation(amount);
                    break;
                case "entertainment":
                    stats.setBudgetEntertainment(amount);
                    break;
                case "shopping":
                    stats.setBudgetShopping(amount);
                    break;
                case "utilities":
                    stats.setBudgetUtilities(amount);
                    break;
                default:
                    // Handle other categories or ignore
                    break;
            }
        });

        monthlyStatsRepo.save(stats);
        return ResponseEntity.ok(stats);
    }

    /**
     * Provides a summary of transactions and budgets for a specific month.
     */
    public ResponseEntity<?> getMonthlyTransactions(int year, int month) {
        User user = getAuthenticatedUser();
        // Fetch transactions for the list
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        List<Transaction> transactions = transactionRepo.findByUserAndDateRange(user.getId(), startDate, endDate);

        // Fetch pre-calculated summary for instant totals
        MonthlyStats stats = monthlyStatsRepo.findByUserAndYearAndMonth(user, year, month).orElse(null);

        Map<String, Object> response = new HashMap<>();
        if(stats != null){
            response.put("remainingBalance", stats.getRemainingBalance());
            response.put("totalCredits", stats.getTotalCredits());
            response.put("totalExpenses", stats.getTotalExpenses());
            response.put("startingBalance", stats.getStartingBalance());
            response.put("budgetFood", stats.getBudgetFood());
            response.put("budgetTransportation", stats.getBudgetTransportation());
            response.put("budgetEntertainment", stats.getBudgetEntertainment());
            response.put("budgetShopping", stats.getBudgetShopping());
            response.put("budgetUtilities", stats.getBudgetUtilities());
        }
        else{
            response.put("remainingBalance", 0.0);
            response.put("totalCredits", 0.0);
            response.put("totalExpenses", 0.0);
            response.put("startingBalance", 0.0);
            response.put("budgetFood", 0.0);
            response.put("budgetTransportation", 0.0);
            response.put("budgetEntertainment", 0.0);
            response.put("budgetShopping", 0.0);
            response.put("budgetUtilities", 0.0);
        }

        response.put("transactions", transactions);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets a summary of monthly expenses for a trend chart.
     */
    public ResponseEntity<?> getSpendingTrends() {
        User user = getAuthenticatedUser();
        LocalDate startOfYear = LocalDate.now().withDayOfYear(1);
        List<Map<String, Object>> monthlyExpenses = transactionRepo.findMonthlyExpensesByUser(user.getId(), startOfYear);
        return ResponseEntity.ok(monthlyExpenses);
    }

    public byte[] generateMonthlyReportPdf(int year, int month) {
        User user = getAuthenticatedUser();
        // Fetch all necessary data
        ResponseEntity<?> responseEntity = getMonthlyTransactions(year, month);
        if (responseEntity.getStatusCode() != HttpStatus.OK || !(responseEntity.getBody() instanceof Map)) {
            throw new RuntimeException("Failed to retrieve monthly data for PDF generation.");
        }
        Map<String, Object> data = (Map<String, Object>) responseEntity.getBody();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            // Define Fonts
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD, new BaseColor(63, 81, 181)); // Indigo-500 equivalent
            Font headingFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, new BaseColor(0, 0, 0));
            Font boldFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
            Font normalFont = new Font(Font.FontFamily.HELVETICA, 12, Font.NORMAL);
            Font expenseFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, new BaseColor(239, 68, 68)); // Red-500
            Font incomeFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, new BaseColor(34, 197, 94)); // Green-500

            // 1. Title
            Paragraph title = new Paragraph("BudgetWise Monthly Financial Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(String.format("For %d/%d (User: %s)", month, year, user.getEmail()), normalFont));
            document.add(new Paragraph("\n"));

            // 2. Summary Table
            document.add(new Paragraph("Monthly Summary", headingFont));
            document.add(new Paragraph("\n"));

            PdfPTable summaryTable = new PdfPTable(4);
            summaryTable.setWidthPercentage(100);
            summaryTable.setWidths(new float[]{1, 1, 1, 1});
            summaryTable.addCell(createSummaryCell("Starting Balance", summaryTable.getDefaultCell(), boldFont));
            summaryTable.addCell(createSummaryCell("Total Income", summaryTable.getDefaultCell(), boldFont));
            summaryTable.addCell(createSummaryCell("Total Expenses", summaryTable.getDefaultCell(), boldFont));
            summaryTable.addCell(createSummaryCell("Remaining Balance", summaryTable.getDefaultCell(), boldFont));

            summaryTable.addCell(String.format("₹%.2f", ((Number) data.getOrDefault("startingBalance", 0.0)).doubleValue()));
            summaryTable.addCell(String.format("₹%.2f", ((Number) data.getOrDefault("totalCredits", 0.0)).doubleValue()));
            summaryTable.addCell(String.format("₹%.2f", ((Number) data.getOrDefault("totalExpenses", 0.0)).doubleValue()));
            summaryTable.addCell(String.format("₹%.2f", ((Number) data.getOrDefault("remainingBalance", 0.0)).doubleValue()));
            document.add(summaryTable);

            document.add(new Paragraph("\n\n"));

            // 3. Budget Allocation
            document.add(new Paragraph("Budget Allocation & Usage", headingFont));
            document.add(new Paragraph("\n"));

            PdfPTable budgetTable = new PdfPTable(4);
            budgetTable.setWidthPercentage(100);
            budgetTable.setWidths(new float[]{2, 1, 1, 1});
            addBudgetTableHeader(budgetTable);

            // Assuming these are the categories used in MonthlyStats.java
            Map<String, String> budgetKeys = Map.of(
                    "Food & dining", "budgetFood",
                    "Transportation", "budgetTransportation",
                    "Entertainment", "budgetEntertainment",
                    "Shopping", "budgetShopping",
                    "Utilities", "budgetUtilities"
            );

            // Re-calculate actual expenses per category from transactions
            Map<String, Double> actualExpenses = ((List<Transaction>) data.getOrDefault("transactions", List.of()))
                    .stream()
                    .filter(t -> "expense".equalsIgnoreCase(t.getAccount()))
                    .collect(java.util.stream.Collectors.groupingBy(
                            Transaction::getCategory,
                            java.util.stream.Collectors.summingDouble(Transaction::getAmount)
                    ));

            for (Map.Entry<String, String> entry : budgetKeys.entrySet()) {
                String category = entry.getKey();
                String budgetKey = entry.getValue();
                double budget = ((Number) data.getOrDefault(budgetKey, 0.0)).doubleValue();
                double actual = actualExpenses.getOrDefault(category, 0.0);
                double remaining = budget - actual;

                budgetTable.addCell(category);
                budgetTable.addCell(String.format("₹%.2f", budget));
                budgetTable.addCell(String.format("₹%.2f", actual));
                budgetTable.addCell(String.format("₹%.2f", remaining));
            }
            document.add(budgetTable);

            document.add(new Paragraph("\n\n"));

            // 4. Detailed Transactions
            document.add(new Paragraph("Detailed Transactions", headingFont));
            document.add(new Paragraph("\n"));

            PdfPTable transactionTable = new PdfPTable(5);
            transactionTable.setWidthPercentage(100);
            transactionTable.setWidths(new float[]{1.5f, 3f, 1.5f, 2f, 2f});
            addTransactionTableHeader(transactionTable);

            for (Transaction txn : (List<Transaction>) data.getOrDefault("transactions", List.of())) {
                transactionTable.addCell(new Phrase(txn.getDate().toString(), normalFont));
                transactionTable.addCell(new Phrase(txn.getDescription(), normalFont));
                transactionTable.addCell(new Phrase(txn.getAccount(), normalFont));
                transactionTable.addCell(new Phrase(txn.getCategory(), normalFont));

                // Color code amount
                Font amountFont = "expense".equalsIgnoreCase(txn.getAccount()) ? expenseFont : incomeFont;
                PdfPCell amountCell = new PdfPCell(new Phrase(String.format("₹%.2f", txn.getAmount()), amountFont));
                amountCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                amountCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                transactionTable.addCell(amountCell);
            }
            document.add(transactionTable);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            System.err.println("PDF Generation Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error generating PDF report: " + e.getMessage());
        }
    }

    // Helper method for Summary Table
    private PdfPCell createSummaryCell(String text, PdfPCell defaultCell, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(new BaseColor(200, 200, 255)); // Light blue/gray background
        return cell;
    }

    // Helper method for Budget Table Header
    private void addBudgetTableHeader(PdfPTable table) {
        Stream.of("Category", "Budget Amount", "Actual Spent", "Remaining")
                .forEach(headerTitle -> {
                    PdfPCell header = new PdfPCell();
                    header.setBackgroundColor(BaseColor.LIGHT_GRAY);
                    header.setBorderWidth(1);
                    header.setPhrase(new Phrase(headerTitle, new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD)));
                    header.setHorizontalAlignment(Element.ALIGN_CENTER);
                    table.addCell(header);
                });
    }

    // Helper method for Transaction Table Header
    private void addTransactionTableHeader(PdfPTable table) {
        Stream.of("Date", "Description", "Type", "Category", "Amount")
                .forEach(headerTitle -> {
                    PdfPCell header = new PdfPCell();
                    header.setBackgroundColor(BaseColor.LIGHT_GRAY);
                    header.setBorderWidth(1);
                    header.setPhrase(new Phrase(headerTitle, new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD)));
                    header.setHorizontalAlignment(Element.ALIGN_CENTER);
                    table.addCell(header);
                });
    }


}
package com.project.budget_tracker.repository;

import com.project.budget_tracker.model.Transaction;
import com.project.budget_tracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface TransactionRepo extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.date BETWEEN :startDate AND :endDate")
    List<Transaction> findByUserAndDateRange(@Param("userId") Long userId,
                                             @Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate);

    @Query("SELECT YEAR(t.date) as year, MONTH(t.date) as month, SUM(t.amount) as totalExpense " +
            "FROM Transaction t " +
            "WHERE t.user.id = :userId AND t.account = 'expense' AND t.date >= :startDate " +
            "GROUP BY year, month " +
            "ORDER BY year, month")
    List<Map<String, Object>> findMonthlyExpensesByUser(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);
}
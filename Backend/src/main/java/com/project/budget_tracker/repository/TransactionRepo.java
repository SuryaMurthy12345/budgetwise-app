package com.project.budget_tracker.repository;

import com.project.budget_tracker.model.Transaction;
import com.project.budget_tracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepo extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND LOWER(t.account) = 'income' AND MONTH(t.date) = :month AND YEAR(t.date) = :year")
    Double getMonthlyIncomeCredits(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND LOWER(t.account) = 'expense' AND MONTH(t.date) = :month AND YEAR(t.date) = :year")
    Double getMonthlyExpenses(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);

}

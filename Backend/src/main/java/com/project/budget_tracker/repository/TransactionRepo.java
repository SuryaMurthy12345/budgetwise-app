package com.project.budget_tracker.repository;

import com.project.budget_tracker.model.Transaction;
import com.project.budget_tracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepo extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);
}

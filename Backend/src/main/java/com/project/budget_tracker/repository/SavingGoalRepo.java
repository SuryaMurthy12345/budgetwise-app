package com.project.budget_tracker.repository;

import com.project.budget_tracker.model.SavingGoal;
import com.project.budget_tracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavingGoalRepo extends JpaRepository<SavingGoal, Long> {
    List<SavingGoal> findByUser(User user);
}
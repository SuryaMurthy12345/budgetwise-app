package com.project.budget_tracker.repository;

import com.project.budget_tracker.model.MonthlyStats;
import com.project.budget_tracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MonthlyStatsRepo extends JpaRepository<MonthlyStats, Long> {

    Optional<MonthlyStats> findByUserAndYearAndMonth(User user, int year, int month);
}

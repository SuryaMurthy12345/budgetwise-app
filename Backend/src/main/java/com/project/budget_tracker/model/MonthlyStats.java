package com.project.budget_tracker.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "monthly_stats")
public class MonthlyStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int month;

    private int year;

    private Double totalCredits;
    private Double totalExpenses;
    private Double remainingBalance;

    // A crucial addition to associate monthly stats with a specific user
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

}

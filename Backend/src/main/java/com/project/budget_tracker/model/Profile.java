package com.project.budget_tracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="profiles")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotNull(message = "Income is required")
    @Min(value = 0, message = "Income must be zero or positive")
    private Double income;

    @NotNull(message = "Savings Goal is required")
    @Min(value = 0, message = "Savings Goal must be zero or positive")
    private Double savingsGoal;

    @NotNull(message = "Target Expense is required")
    @Min(value = 0, message = "Target Expense must be zero or positive")
    private Double targetExpense;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}

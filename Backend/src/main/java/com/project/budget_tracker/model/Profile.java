package com.project.budget_tracker.model;

import jakarta.persistence.*;
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

    private Double income;

    private Double savingsGoal;

    private Double targetExpense;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}

package com.project.budget_tracker.service;

import com.project.budget_tracker.model.SavingGoal;
import com.project.budget_tracker.model.User;
import com.project.budget_tracker.repository.SavingGoalRepo;
import com.project.budget_tracker.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class SavingGoalService {

    @Autowired
    private SavingGoalRepo savingGoalRepo;

    @Autowired
    private UserRepo userRepo;

    // Helper to get the authenticated user
    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepo.findByEmail(email);
    }

    // Get all saving goals for the authenticated user
    public ResponseEntity<List<SavingGoal>> getSavingGoals() {
        User user = getAuthenticatedUser();
        List<SavingGoal> goals = savingGoalRepo.findByUser(user);
        return ResponseEntity.ok(goals);
    }

    // Create a new saving goal
    @Transactional
    public ResponseEntity<?> createSavingGoal(SavingGoal savingGoal) {
        User user = getAuthenticatedUser();
        savingGoal.setUser(user);
        SavingGoal savedGoal = savingGoalRepo.save(savingGoal);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedGoal);
    }

    // Update a saving goal
    @Transactional
    public ResponseEntity<?> updateSavingGoal(Long id, SavingGoal updatedGoal) {
        SavingGoal existingGoal = savingGoalRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Saving goal not found"));

        if (!existingGoal.getUser().equals(getAuthenticatedUser())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You do not have permission to update this goal."));
        }

        existingGoal.setName(updatedGoal.getName());
        existingGoal.setTargetAmount(updatedGoal.getTargetAmount());
        existingGoal.setCurrentAmount(updatedGoal.getCurrentAmount());

        SavingGoal savedGoal = savingGoalRepo.save(existingGoal);
        return ResponseEntity.ok(savedGoal);
    }

    // Delete a saving goal
    @Transactional
    public ResponseEntity<?> deleteSavingGoal(Long id) {
        SavingGoal existingGoal = savingGoalRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Saving goal not found"));

        if (!existingGoal.getUser().equals(getAuthenticatedUser())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You do not have permission to delete this goal."));
        }

        savingGoalRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Saving goal deleted successfully"));
    }
}
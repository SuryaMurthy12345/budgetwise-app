package com.project.budget_tracker.controller;

import com.project.budget_tracker.model.SavingGoal;
import com.project.budget_tracker.service.SavingGoalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/saving-goals")
public class SavingGoalController {

    @Autowired
    private SavingGoalService savingGoalService;

    @GetMapping
    public ResponseEntity<?> getSavingGoals() {
        return savingGoalService.getSavingGoals();
    }

    @PostMapping
    public ResponseEntity<?> createSavingGoal(@Valid @RequestBody SavingGoal savingGoal) {
        return savingGoalService.createSavingGoal(savingGoal);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSavingGoal(@PathVariable Long id, @Valid @RequestBody SavingGoal savingGoal) {
        return savingGoalService.updateSavingGoal(id, savingGoal);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSavingGoal(@PathVariable Long id) {
        return savingGoalService.deleteSavingGoal(id);
    }
}
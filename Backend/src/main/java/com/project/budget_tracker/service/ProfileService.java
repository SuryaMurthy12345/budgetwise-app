package com.project.budget_tracker.service;

import com.project.budget_tracker.model.Profile;
import com.project.budget_tracker.model.User;
import com.project.budget_tracker.repository.ProfileRepo;
import com.project.budget_tracker.repository.UserRepo;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepo profileRepo;

    @Autowired
    private UserRepo userRepo;

    public  ResponseEntity<?> checkProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepo.findByEmail(email);
        Profile profile = profileRepo.findByUser(user);

        if(profile == null){
            return ResponseEntity.status(HttpStatus.OK).body(Map.of("Profile",false));
        }
        return ResponseEntity.ok(Map.of("Profile",true));
    }

    public ResponseEntity<?> addProfile(Profile profile) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepo.findByEmail(email);
        Profile existingProfile = profileRepo.findByUser(user);

        if (existingProfile != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Profile already exists. Use update instead.");
        }
        if (profile.getIncome() == null || profile.getSavingsGoal() == null || profile.getTargetExpense() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Income, Savings Goal, and Target Expense are required."));
        }
        if (profile.getSavingsGoal() + profile.getTargetExpense() > profile.getIncome()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Savings goal + target expense must be less than or equal to income."));
        }

        if (profile.getSavingsGoal() > profile.getIncome() || profile.getTargetExpense() > profile.getIncome()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Savings goal and target expense cannot exceed income individually."));
        }

        profile.setUser(user);
        Profile savedProfile = profileRepo.save(profile);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProfile);
    }

    public ResponseEntity<?> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepo.findByEmail(email);
        Profile profile = profileRepo.findByUser(user);

        return ResponseEntity.ok(profile);
    }
}

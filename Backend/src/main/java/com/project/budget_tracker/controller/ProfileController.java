package com.project.budget_tracker.controller;

import com.project.budget_tracker.model.Profile;
import com.project.budget_tracker.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/check-profile")
    public ResponseEntity<?> checkProfile(){
        return profileService.checkProfile();
    }

    @PostMapping("/add-profile")
    public ResponseEntity<?> addProfile(@RequestBody  Profile profile){
        return profileService.addProfile(profile);
    }

    @GetMapping("/get-profile")
    public ResponseEntity<?> getProfile(){
        return profileService.getProfile();
    }


}

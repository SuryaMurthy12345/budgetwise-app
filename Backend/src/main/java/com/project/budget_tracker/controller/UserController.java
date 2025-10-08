package com.project.budget_tracker.controller;

import com.project.budget_tracker.Dto.LoginRequest;
import com.project.budget_tracker.Dto.SignupRequest;
import com.project.budget_tracker.model.User;
import com.project.budget_tracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest user){
        return userService.signup(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest user){
        return userService.login(user);
    }

    @GetMapping("/hello")
    public String hello(){
        return "hello cloudflared";
    }

    @PostMapping("/signout")
    public ResponseEntity<?> signout(@RequestHeader ("Authorization") String authhHeader){
        return userService.signout(authhHeader);
    }
    // ... (add this new method inside the UserController class)
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(){
        return userService.getUserProfile();
    }

}

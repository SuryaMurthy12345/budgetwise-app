package com.project.budget_tracker.controller;

import com.project.budget_tracker.model.User;
import com.project.budget_tracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user){
        return userService.signup(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user){
        return userService.login(user);
    }

    @GetMapping("/user-details")
    public ResponseEntity<?> userDetails(){
        return userService.userDetails();
    }
}

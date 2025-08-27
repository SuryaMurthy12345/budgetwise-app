package com.project.budget_tracker.controller;

import com.project.budget_tracker.model.User;
import com.project.budget_tracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
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



    @GetMapping("/hello")
    public String hello(){
        return "hello cloudflared";
    }

    @PostMapping("/signout")
    public ResponseEntity<?> signout(@RequestHeader ("Authorization") String authhHeader){
        return userService.signout(authhHeader);
    }

}

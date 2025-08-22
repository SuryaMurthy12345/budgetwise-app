package com.project.budget_tracker.service;

import com.project.budget_tracker.jwt.JwtUtil;
import com.project.budget_tracker.model.User;
import com.project.budget_tracker.repository.UserRepo;
import com.project.budget_tracker.response.UserResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    public ResponseEntity<?> signup(User user) {
        User dbuser = userRepo.findByEmail(user.getEmail());
        if (dbuser != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User saveduser = userRepo.save(user);

        return ResponseEntity.status(HttpStatus.OK).body(saveduser);

    }


    public ResponseEntity<?> login(User user) {

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = jwtUtil.generateTokenFromEmail(authentication);

            System.out.println(authentication.getAuthorities());

            return ResponseEntity.status(HttpStatus.OK).body(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

    }

    public ResponseEntity<?> userDetails() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepo.findByEmail(auth.getName());
        UserResponse response = new UserResponse(user.getName(), user.getEmail(), user.getRole());

        return ResponseEntity.ok(response);
    }
}

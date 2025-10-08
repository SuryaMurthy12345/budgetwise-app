package com.project.budget_tracker.service;

import com.project.budget_tracker.Dto.LoginRequest;
import com.project.budget_tracker.Dto.SignupRequest;
import com.project.budget_tracker.jwt.JwtUtil;
import com.project.budget_tracker.model.User;
import com.project.budget_tracker.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

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
    @Autowired
    private TokenBlackList tokenBlackList;

    public ResponseEntity<?> signup(SignupRequest user) {
        User dbuser = userRepo.findByEmail(user.getEmail());
        if (dbuser != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("Error","User already exists"));
        }
        User newUser = new User();
        newUser.setName(user.getName());
        newUser.setEmail(user.getEmail());
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));
        newUser.setRole("ROLE_USER");

        User saveduser = userRepo.save(newUser);

        return ResponseEntity.status(HttpStatus.OK).body(saveduser);

    }


    public ResponseEntity<?> login(LoginRequest user) {

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = jwtUtil.generateTokenFromEmail(authentication);
            System.out.println(authentication.getName());
            System.out.println(authentication.getAuthorities());

            return ResponseEntity.status(HttpStatus.OK).body(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

    }


    public ResponseEntity<?> signout(String authhHeader) {
        if(authhHeader!=null && authhHeader.startsWith("Bearer ")){
//            request.getSession().invalidate();
            String token = authhHeader.substring(7);
            tokenBlackList.blacklistToken(token);
            return ResponseEntity.status(HttpStatus.OK).body("Logged Out Succefully, token added to blacklist");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No valid token provided");
    }
    // In suryamurthy12345/budgetwise-app/budgetwise-app-4fea87922b2c2e43aff6943676c323d8e4a86c1c/Backend/src/main/java/com/project/budget_tracker/service/UserService.java

    // ... (add this new method inside the UserService class)
    public ResponseEntity<?> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }
        String email = authentication.getName();
        User user = userRepo.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }
        // Create a map to safely return only the necessary user details
        Map<String, String> userProfile = Map.of(
                "name", user.getName(),
                "email", user.getEmail()
        );
        return ResponseEntity.ok(userProfile);
    }
    // In suryamurthy12345/budgetwise-app/budgetwise-app-4fea87922b2c2e43aff6943676c323d8e4a86c1c/Backend/src/main/java/com/project/budget_tracker/controller/UserController.java


}

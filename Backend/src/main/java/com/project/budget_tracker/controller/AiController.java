package com.project.budget_tracker.controller;

import com.project.budget_tracker.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    // Endpoint to chat with the financial AI advisor, accepting full context
    @PostMapping("/chat")
    public ResponseEntity<?> getAdvice(@RequestBody Map<String, Object> request) {
        String prompt = (String) request.get("prompt");
        // Correctly cast the 'context' object from the request body
        Map<String, Object> context = (Map<String, Object>) request.get("context");

        if (prompt == null || prompt.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Prompt is required."));
        }

        // Pass BOTH the prompt AND the context to the service method
        return aiService.getFinancialAdvice(prompt, context);
    }
}
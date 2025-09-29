package com.project.budget_tracker.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AiService {

    @Value("${ollama.api.url:http://localhost:11434/api/generate}")
    private String ollamaApiUrl;

    @Value("${ollama.model.name:mistral}") // Ensure this matches your pulled model!
    private String ollamaModelName;

    private final RestTemplate restTemplate = new RestTemplate();

    public ResponseEntity<?> getFinancialAdvice(String userPrompt, Map<String, Object> context) {

        // 1. Format the financial context into a clear text prompt for the LLM
        String contextText = formatFinancialContext(context);

        // 2. This System Prompt guides the LLM to act as a financial expert
        String systemPrompt = "You are a concise, helpful, and ethical personal financial advisor named BudgetWise AI. " +
                "The user's current monthly financial summary is provided below. Use this data ONLY to answer questions about their current balances, income, or budget status. " +
                "Do NOT use this data if the question is general financial advice. Keep your response under 100 words.\n\n" +
                "--- FINANCIAL CONTEXT START ---\n" +
                contextText +
                "--- FINANCIAL CONTEXT END ---\n\n" +
                "User Question: " + userPrompt;


        // 3. Construct the body for the Ollama API call
        Map<String, Object> requestBody = Map.of(
                "model", ollamaModelName,
                "prompt", systemPrompt,
                "stream", false,
                "options", Map.of("temperature", 0.7)
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(ollamaApiUrl, entity, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("response")) {
                String aiResponse = (String) response.getBody().get("response");
                return ResponseEntity.ok(Map.of("advice", aiResponse));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "AI Response format error."));
            }

        } catch (Exception e) {
            System.err.println("Ollama API Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", "Cannot connect to Ollama AI. Please ensure the Ollama server is running and the model '" + ollamaModelName + "' is pulled."));
        }
    }

    // Helper to format the map data into a readable string for the LLM
    private String formatFinancialContext(Map<String, Object> context) {
        if (context == null || context.isEmpty()) {
            return "No specific financial data available for this request.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Month: %s\n", context.getOrDefault("selectedMonth", "N/A")));
        sb.append(String.format("Starting Balance: ₹%.2f\n", ((Number) context.getOrDefault("startingBalance", 0.0)).doubleValue()));
        sb.append(String.format("Total Income (Credits): ₹%.2f\n", ((Number) context.getOrDefault("totalCredits", 0.0)).doubleValue()));
        sb.append(String.format("Total Expenses: ₹%.2f\n", ((Number) context.getOrDefault("totalExpenses", 0.0)).doubleValue()));
        sb.append(String.format("Remaining Balance: ₹%.2f\n", ((Number) context.getOrDefault("remainingBalance", 0.0)).doubleValue()));

        return sb.toString();
    }
}
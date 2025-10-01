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

    // These values are read from application.properties
    @Value("${ollama.api.url:http://localhost:11434/api/generate}")
    private String ollamaApiUrl;

    @Value("${ollama.model.name:gemma:2b}") // Default to gemma:2b as per application.properties
    private String ollamaModelName;

    private final RestTemplate restTemplate = new RestTemplate();

    public ResponseEntity<?> getFinancialAdvice(String userPrompt, Map<String, Object> context) {

        // 1. Format the financial context into a clear text prompt for the LLM
        String contextText = formatFinancialContext(context);

        // 2. This System Prompt guides the LLM to act as a financial expert (The core intelligence)
        // In suryamurthy12345/budgetwise-app/budgetwise-app-main/Backend/src/main/java/com/project/budget_tracker/service/AiService.java:


        // AiService.java - inside getFinancialAdvice method, replacing systemInstruction
        String systemPrompt = "You are a highly skilled and concise financial advisor named BudgetWise AI. Your primary role is to either provide direct text advice or output a single JSON object for budget allocation, with no other explanatory text, markdown, or formatting.\n\n" +
                "*** STRICT BUDGET ALLOCATION PROTOCOL (ONLY use if the user explicitly asks for a 'budget suggestion', 'allocation', or 'budget plan') ***\n" +
                "1.  **DETERMINE TARGET AMOUNT:** Identify the total amount to be allocated (e.g., '₹9000', or 'Starting Balance - Savings Goal'). All allocated amounts must be rounded to the nearest whole number (e.g., 1500.0).\n" +
                "2.  **ALLOCATE PRIMARY CATEGORIES:** Allocate budgets for Food, Transportation, Entertainment, and Shopping based on the user's historical 'Actual Spent' amounts (provided in context) to determine the ratios.\n" +
                "3.  **CALCULATE REMAINDER:** Sum the allocations for the first four categories (Food + Transportation + Entertainment + Shopping).\n" +
                "4.  **ASSIGN UTILITIES (THE CATCH-ALL):** Calculate the final category, Utilities, as the precise mathematical remainder: **(Target Amount) - (Sum of the first four categories) = budgetUtilities**.\n" +
                "5.  **FINAL CHECK:** The sum of all five allocated budgets MUST EXACTLY EQUAL the Budget Target Amount. Utilities MUST absorb any positive or negative remainder.\n" +
                "6.  **OUTPUT FORMAT:** Must be a single JSON object with keys: `budgetFood`, `budgetTransportation`, `budgetEntertainment`, `budgetShopping`, `budgetUtilities`.\n" +
                "    *Example:* `{\"budgetFood\": 2500.0, \"budgetTransportation\": 1500.0, \"budgetEntertainment\": 500.0, \"budgetShopping\": 1000.0, \"budgetUtilities\": 3500.0}`\n\n" +
                "*** GENERAL ADVICE PROTOCOL (For all other questions) ***\n" +
                "Analyze the user's data provided in the FINANCIAL CONTEXT. Answer all questions directly, concisely, and accurately. Provide calculations where requested (e.g., percentages, differences). Do NOT output JSON.\n\n"+
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
            // Ollama API call using RestTemplate (no SDK required)
            ResponseEntity<Map> response = restTemplate.postForEntity(ollamaApiUrl, entity, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("response")) {
                String aiResponse = (String) response.getBody().get("response");
                return ResponseEntity.ok(Map.of("advice", aiResponse));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "AI Response format error or Ollama server issue."));
            }

        } catch (Exception e) {
            System.err.println("Ollama API Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", "Cannot connect to Ollama AI. Please ensure the Ollama server is running and the model '" + ollamaModelName + "' is pulled."));
        }
    }

    // Helper to format the map data into a readable string for the LLM (Includes actual spending)
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

        sb.append("\n");
        sb.append("--- Current Budget Status ---\n");
        sb.append(String.format("Budget Food: ₹%.2f (Actual Spent: ₹%.2f)\n",
                ((Number) context.getOrDefault("budgetFood", 0.0)).doubleValue(),
                ((Number) context.getOrDefault("actualSpendingFood", 0.0)).doubleValue()));
        sb.append(String.format("Budget Transportation: ₹%.2f (Actual Spent: ₹%.2f)\n",
                ((Number) context.getOrDefault("budgetTransportation", 0.0)).doubleValue(),
                ((Number) context.getOrDefault("actualSpendingTransportation", 0.0)).doubleValue()));
        sb.append(String.format("Budget Entertainment: ₹%.2f (Actual Spent: ₹%.2f)\n",
                ((Number) context.getOrDefault("budgetEntertainment", 0.0)).doubleValue(),
                ((Number) context.getOrDefault("actualSpendingEntertainment", 0.0)).doubleValue()));
        sb.append(String.format("Budget Shopping: ₹%.2f (Actual Spent: ₹%.2f)\n",
                ((Number) context.getOrDefault("budgetShopping", 0.0)).doubleValue(),
                ((Number) context.getOrDefault("actualSpendingShopping", 0.0)).doubleValue()));
        sb.append(String.format("Budget Utilities: ₹%.2f (Actual Spent: ₹%.2f)\n",
                ((Number) context.getOrDefault("budgetUtilities", 0.0)).doubleValue(),
                ((Number) context.getOrDefault("actualSpendingUtilities", 0.0)).doubleValue()));

        return sb.toString();
    }
}
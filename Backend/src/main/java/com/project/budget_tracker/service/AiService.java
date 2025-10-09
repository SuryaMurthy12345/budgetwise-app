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

    @Value("${ollama.model.name:mistral:7b}") // Default to gemma:2b as per application.properties
    private String ollamaModelName;

    private final RestTemplate restTemplate = new RestTemplate();

    public ResponseEntity<?> getFinancialAdvice(String userPrompt, Map<String, Object> context) {

        // *** ADDED FOR DEBUGGING ***
        System.out.println(">>> USING OLLAMA MODEL: " + ollamaModelName + " <<<");

        // 1. Format the financial context into a clear text prompt for the LLM
        String contextText = formatFinancialContext(context);

        // 2. This System Prompt guides the LLM to act as a financial expert (The core intelligence)
        String systemPrompt = "You are BudgetWise AI. Your single and only purpose is to analyze the 'FINANCIAL CONTEXT' provided below. You MUST use this data to answer the user's question. Do not, under any circumstances, refuse to answer by saying you cannot access personal or real-time data. The context provided is the data you must use.\n\n" +
                "*** BUDGET ALLOCATION TASK (If the user asks for a 'budget', 'allocation', or 'plan') ***\n" +
                "Provide the budget as a formatted text list. DO NOT use JSON.\n" +
                "1.  **Identify the Target Amount** from the user's request.\n" +
                "2.  **Allocate Sensibly:** Distribute the amount across Food, Transportation, Entertainment, Shopping, and Utilities. Base this on the 'Actual Spent' figures if available.\n" +
                "3.  **Ensure Full Allocation:** The sum of all categories must equal the target amount.\n" +
                "4.  **OUTPUT FORMAT:** Start your response with '💡 Here is a suggested budget allocation:' and then list the categories.\n" +
                "    *Example Response:*\n" +
                "    💡 Here is a suggested budget allocation:\n" +
                "    - Food: ₹2500\n" +
                "    - Transportation: ₹1500\n" +
                "    - Utilities: ₹3500\n\n" +
                "*** GENERAL ADVICE TASK (For all other questions) ***\n" +
                "Analyze the user's data from the FINANCIAL CONTEXT to answer the question directly. If asked about 'current month transactions', you must use the 'Total Expenses' and 'Total Income' from the context to form your answer.\n\n" +
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

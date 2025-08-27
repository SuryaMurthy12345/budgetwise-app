package com.project.budget_tracker.service;

import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class TokenBlackList {

    private final Set<String> blackListedTokens = new HashSet<>();
    public void blacklistToken(String token){
        blackListedTokens.add(token);
    }

    public boolean isTokenBlackListed(String token){
        return blackListedTokens.contains(token);
    }
}

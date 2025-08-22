package com.project.budget_tracker.jwt;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${spring.jwt.secret}")
    private String jwtsecret;

    @Value("${spring.jwt.expiration-ms}")
    private long jwtExpiry;

    public String getJwtFromHeader(HttpServletRequest req){
        String bearerToken = req.getHeader("Authorization");
        if(bearerToken!=null && bearerToken.startsWith("Bearer ")){
            return bearerToken.substring(7);
        }
        return null;
    }

    public String generateTokenFromEmail(Authentication authentication){
        String email = authentication.getName();
        SecretKey key = Keys.hmacShaKeyFor(jwtsecret.getBytes());
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiry))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact(); //actually build
    }

    public String getEmailFromToken(String Token){
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(jwtsecret.getBytes()))
                .build()
                .parseClaimsJws(Token)
                .getBody()
                .getSubject();
    }

    public boolean validateJwtToken(String Token){
        try {
            Date expiration = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtsecret.getBytes()))
                    .build()
                    .parseClaimsJws(Token)
                    .getBody()
                    .getExpiration();
            return expiration.after(new Date());
        } catch (Exception e) {
            return false; // token invalid or expired
        }
    }


}



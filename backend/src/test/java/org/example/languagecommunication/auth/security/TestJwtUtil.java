package org.example.languagecommunication.auth.security;

public class TestJwtUtil {
    public static String generateValidJwt(String username) {
        String secret = "ZmFrZXNlY3JldGtleWZvcnRlc3RzZWN1cml0eW9ubHkzMmJ5dGVzIQ==";
        java.util.Date now = new java.util.Date();
        java.util.Date exp = new java.util.Date(now.getTime() + 3600000);
        return io.jsonwebtoken.Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(exp)
                .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                        java.util.Base64.getDecoder().decode(secret)))
                .compact();
    }
}
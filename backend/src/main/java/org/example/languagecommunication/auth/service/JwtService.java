package org.example.languagecommunication.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.example.languagecommunication.auth.model.RefreshTokenEntity;
import org.example.languagecommunication.auth.repository.RefreshTokenRepository;
import org.example.languagecommunication.common.utils.Hasher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${app.jwt.secret_key}")
    private String secretKey;

    @Value("${app.jwt.expiration-time}")
    private Integer accessExpirationTime;

    @Value("${app.jwt.refresh-expiration-time}")
    private Long refreshExpirationTime;

    private final RefreshTokenRepository tokenRepository;

    @Autowired
    public JwtService(RefreshTokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();

        return Jwts.builder()
                .claims()
                .add(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + accessExpirationTime))
                .and()
                .signWith(getKey())
                .compact();
    }

    public String generateRefreshToken(String username) {
        Map<String, Object> claims = new HashMap<>();

        String refreshToken = Jwts.builder()
                        .claims()
                        .add(claims)
                        .subject(username)
                        .issuedAt(new Date(System.currentTimeMillis()))
                        .expiration(new Date(System.currentTimeMillis() + refreshExpirationTime))
                        .and()
                        .signWith(getKey())
                        .compact();

        RefreshTokenEntity token = new RefreshTokenEntity(username, Hasher.hash(refreshToken), Instant.now().plusMillis(refreshExpirationTime));

        tokenRepository.save(token);

        return refreshToken;
    }

    private SecretKey getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String userName = extractUsername(token);
        return (userName.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}

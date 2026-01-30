package com.example.pos.auth;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        //System.out.println(username);
        String password = request.get("password");
        //System.out.println(password);
        String token = authService.login(username, password);
        //System.err.println(token);
        return Map.of("token", token);
    }
}

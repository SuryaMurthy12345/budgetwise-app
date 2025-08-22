package com.project.budget_tracker.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {

    public String name;
    public String email;
    public String role;
}

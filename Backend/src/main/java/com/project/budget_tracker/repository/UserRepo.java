package com.project.budget_tracker.repository;


import com.project.budget_tracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {

User findByEmail(String email);

}

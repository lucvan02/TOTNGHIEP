package com.bookwebAI.user_service.controller;

import com.bookwebAI.user_service.dto.*;
import com.bookwebAI.user_service.entity.User;
import com.bookwebAI.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

//    // GET /api/admin/users?page=0&size=20&keyword=abc
//    @GetMapping
//    // @PreAuthorize("hasRole('ADMIN')")  // nếu bạn đã cấu hình Spring Security
//    public ResponseEntity<ApiResponse<Page<UserResponseDto>>> listUsers(
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "20") int size,
//            @RequestParam(required = false) String keyword
//    ) {
//        return ResponseEntity.ok(userService.getUsersForAdmin(page, size, keyword));
//    }

    // PATCH /api/admin/users/{uid}/lock
    @PatchMapping("/{uid}/lock")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> lockUser(@PathVariable String uid) {
        return ResponseEntity.ok(userService.lockUser(uid));
    }

    // PATCH /api/admin/users/{uid}/unlock
    @PatchMapping("/{uid}/unlock")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> unlockUser(@PathVariable String uid) {
        return ResponseEntity.ok(userService.unlockUser(uid));
    }


    // GET /api/admin/users/all -> trả toàn bộ khách hàng
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsersForAdmin());
    }
}

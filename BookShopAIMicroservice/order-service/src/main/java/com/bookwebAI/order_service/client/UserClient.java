package com.bookwebAI.order_service.client;

import com.bookwebAI.order_service.client.dto.ApiResponse;
import com.bookwebAI.order_service.client.dto.UserContactDto;
import com.bookwebAI.order_service.client.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/api/users/{uid}")
    UserDto getUser(@PathVariable("uid") String uid);

//    @GetMapping("/api/users/{uid}/contact")
//    ApiResponse<UserContactDto> getContact(@PathVariable("uid") String uid);

    @GetMapping("/api/users/{uid}/contact")
    UserContactDto getContact(@PathVariable("uid") String uid);
}
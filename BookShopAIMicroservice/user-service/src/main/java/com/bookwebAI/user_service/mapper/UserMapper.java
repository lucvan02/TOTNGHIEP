package com.bookwebAI.user_service.mapper;

import com.bookwebAI.user_service.dto.*;
import com.bookwebAI.user_service.entity.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toEntity(UserRegisterDto dto);
    UserResponseDto toResponse(User user);
    void updateFromDto(UserUpdateDto dto, @MappingTarget User user);
}

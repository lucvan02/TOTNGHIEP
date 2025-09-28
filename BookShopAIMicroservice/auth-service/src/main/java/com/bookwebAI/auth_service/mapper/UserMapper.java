package com.bookwebAI.auth_service.mapper;
import org.mapstruct.Mapper;
import com.bookwebAI.auth_service.dto.UserDTO;
import com.bookwebAI.auth_service.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toDTO(User user);
}
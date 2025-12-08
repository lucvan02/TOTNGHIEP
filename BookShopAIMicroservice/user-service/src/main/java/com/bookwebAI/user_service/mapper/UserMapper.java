//package com.bookwebAI.user_service.mapper;
//
//import com.bookwebAI.user_service.dto.*;
//import com.bookwebAI.user_service.entity.User;
//import org.mapstruct.*;
//
//@Mapper(componentModel = "spring")
//public interface UserMapper {
//    User toEntity(UserRegisterDto dto);
//    UserResponseDto toResponse(User user);
//    void updateFromDto(UserUpdateDto dto, @MappingTarget User user);
//}



//
//// com.bookwebAI.user_service.mapper.UserMapper
//package com.bookwebAI.user_service.mapper;
//
//import com.bookwebAI.user_service.dto.UserResponseDto;
//import com.bookwebAI.user_service.entity.User;
//
//import java.util.UUID;
//
//public class UserMapper {
//
//    public static UserResponseDto toResponseDto(User u) {
//        if (u == null) return null;
//        return UserResponseDto.builder()
//                .uid(UUID.fromString(u.getUid()))
//                .username(u.getUsername())
//                .email(u.getEmail())
//                .firstname(u.getFirstname())
//                .lastname(u.getLastname())
//                .phone(u.getPhone())
//                .avatar(u.getAvatar())
//                .role(u.getRole())
//                .active(u.isActive())
//                .build();
//    }
//}






package com.bookwebAI.user_service.mapper;

import com.bookwebAI.user_service.dto.UserResponseDto;
import com.bookwebAI.user_service.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponseDto toResponseDto(User user);
}

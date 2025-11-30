package datn.services.chat_bot.model;

import lombok.Data;

@Data
public class ChatRequest {
    private String userId;
    private String message;
}

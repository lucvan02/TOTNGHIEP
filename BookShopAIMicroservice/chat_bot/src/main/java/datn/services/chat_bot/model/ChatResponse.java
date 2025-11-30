package datn.services.chat_bot.model;

import java.util.List;

import lombok.Data;

@Data
public class ChatResponse {
    private String message;
    private Boolean isShowProduct;
    private List<String> productUUIDS;
}

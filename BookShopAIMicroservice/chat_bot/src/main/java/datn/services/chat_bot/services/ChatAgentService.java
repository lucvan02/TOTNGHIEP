package datn.services.chat_bot.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import datn.services.chat_bot.model.ChatRequest;
import datn.services.chat_bot.model.ChatResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatAgentService {
    private final AIService aiService;
    private final QdrantChatHistoryService qdrantChatHistoryService;
    private final QdrantBusinessService qdrantBusinessService;
    private final QdrantProductService qdrantProductService;
    private final ObjectMapper objectMapper;

    public ChatResponse chat(ChatRequest chatRequest) throws JsonMappingException, JsonProcessingException {
        List<String> contexts = getContexts(chatRequest);
        qdrantChatHistoryService.saveDocument(chatRequest.getMessage(), chatRequest.getUserId(), "user");
        String response = aiService.chat(chatRequest.getMessage(), contexts);
        qdrantChatHistoryService.saveDocument(response, chatRequest.getUserId(), "model");
        return objectMapper.readValue(response, ChatResponse.class);
    }

    public List<String> getContexts(ChatRequest chatRequest) {
        String businessContext = qdrantBusinessService.getContext(chatRequest.getMessage());
        String productContext = qdrantProductService.getContext(chatRequest.getMessage());
        String chatHistoryContext = qdrantChatHistoryService.getContext(chatRequest.getMessage(),
                chatRequest.getUserId());

        System.out.println("\n\nBusiness Context: " + businessContext);
        System.out.println("Chat History Context: " + chatHistoryContext + "\n\n");

        return List.of(businessContext, productContext, chatHistoryContext);
    }
}

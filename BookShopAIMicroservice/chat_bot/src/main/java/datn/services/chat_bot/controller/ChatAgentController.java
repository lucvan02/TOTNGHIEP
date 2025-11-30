package datn.services.chat_bot.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;

import datn.services.chat_bot.model.ChatRequest;
import datn.services.chat_bot.model.ChatResponse;
import datn.services.chat_bot.services.ChatAgentService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/chat-agent")
@RequiredArgsConstructor
public class ChatAgentController {

    private final ChatAgentService chatAgentService;

    /**
     * Handle chat request and return chat response
     * 
     * @param request
     * @return
     * @throws JsonMappingException
     * @throws JsonProcessingException
     */
    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request)
            throws JsonMappingException, JsonProcessingException {
        return ResponseEntity.ok().body(chatAgentService.chat(request));
    }

}

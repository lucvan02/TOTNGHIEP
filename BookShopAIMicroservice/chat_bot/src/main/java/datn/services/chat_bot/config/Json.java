package datn.services.chat_bot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class Json {
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }

}

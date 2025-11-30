package datn.services.chat_bot.config;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.google.genai.Client;

import datn.services.chat_bot.adapter.GeminiEmbeddingModel;

@Configuration
public class AIConfig {

  @Value("${gemini.api.key}")
  private String apiKey;

  @Bean
  public EmbeddingModel embeddingModel(Client client) {
    return new GeminiEmbeddingModel(client, "text-embedding-004");
  }

  @Bean
  public Client chatClient() {
    return Client.builder().apiKey(apiKey).build();
  }
}

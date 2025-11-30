package datn.services.chat_bot.services;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.google.genai.Chat;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.ContentEmbedding;
import com.google.genai.types.EmbedContentConfig;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.Part;
import com.google.genai.types.Schema;
import com.google.genai.types.Type.Known;

@Service
public class AIService {

        private final Client genaiClient;
        private final String CHAT_MODEL_ID = "gemini-2.5-flash";
        private final String EMBEDDING_MODEL_ID = "text-embedding-004";

        public AIService(Client client) {
                this.genaiClient = client;
        }

        public List<ContentEmbedding> getEmbedding(String text) {
                Optional<List<ContentEmbedding>> embedding = genaiClient.models.embedContent(
                                EMBEDDING_MODEL_ID,
                                text,
                                EmbedContentConfig.builder().build()).embeddings();

                return embedding.orElseThrow(() -> new RuntimeException("EMbedding failed"));
        }

        public String chat(String message, List<String> contexts) {
                Chat chatSession = genaiClient.chats.create(CHAT_MODEL_ID, getChatConfig());
                List<Content> context = new LinkedList<>();
                context.add(getUserContent(message));
                for (String contextString : contexts) {
                        context.add(getContextContent(contextString));
                }
                return chatSession.sendMessage(context)
                                .text();
        }

        private Content getContextContent(String context) {
                return Content.builder()
                                .role("model")
                                .parts(Part.fromText(context))
                                .build();
        }

        private Content getUserContent(String message) {
                return Content.builder()
                                .role("user")
                                .parts(Part.fromText(message))
                                .build();
        }

        private GenerateContentConfig getChatConfig() {
                return GenerateContentConfig.builder()
                                .responseMimeType("application/json")
                                .responseSchema(getResponseSchema())
                                .build();
        }

        private Schema getResponseSchema() {
                return Schema.builder()
                                .properties(Map.of(
                                                "message", Schema.builder()
                                                                .type(Known.STRING)
                                                                .description("Nội dung tin nhắn phản hồi từ AI")
                                                                .build(),
                                                "isShowProduct", Schema.builder()
                                                                .type(Known.BOOLEAN)
                                                                .description("isShowProduct = true khi người dùng có hành động tìm kiếm sản phẩm. isShowProduct = false khi người dùng chỉ truy vấn thông tin sản phẩm")
                                                                .build(),
                                                "productUUIDS", Schema.builder()
                                                                .description("Mã sản phẩm (mỗi mã có định dạng uuid) nếu có hoặc [] nếu không có.")
                                                                .type(Known.ARRAY)
                                                                .items(Schema.builder()
                                                                                .type(Known.STRING)
                                                                                .build())
                                                                .build()))
                                .type(Known.OBJECT)
                                .build();
        }
}

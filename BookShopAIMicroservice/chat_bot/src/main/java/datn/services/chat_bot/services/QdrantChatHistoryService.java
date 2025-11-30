package datn.services.chat_bot.services;

import java.util.List;
import java.util.Map;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.TokenCountBatchingStrategy;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.filter.Filter.Expression;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.ai.vectorstore.qdrant.QdrantVectorStore;
import org.springframework.stereotype.Service;

import io.qdrant.client.QdrantClient;

@Service
public class QdrantChatHistoryService {

    private QdrantVectorStore vectorStore;
    private final String COLLECTION_NAME = "chat_history_embeddings";

    public QdrantChatHistoryService(QdrantClient qdrantClient, EmbeddingModel embeddingModel) {
        this.vectorStore = QdrantVectorStore.builder(qdrantClient, embeddingModel)
                .collectionName(COLLECTION_NAME)
                .initializeSchema(true)
                .batchingStrategy(new TokenCountBatchingStrategy())
                .build();

    }

    public void saveDocument(String text, String userId, String role) {
        vectorStore.add(
                List.of(new Document(text, Map.of(
                        "role", role,
                        "user_id", userId,
                        "timestamp", System.currentTimeMillis()))));
    }

    public String getContext(String text, String userId) {
        return getDocuments(text, userId).toString();
    }

    public List<Document> getDocuments(String text, String userId) {
        try {
            SearchRequest searchRequest = SearchRequest.builder()
                    .query(text)
                    .topK(5)
                    .filterExpression(getFilterExpression(userId))
                    .build();
            return vectorStore.similaritySearch(searchRequest);
        } catch (Exception e) {
            return List.of();
        }
    }

    private Expression getFilterExpression(String userId) {
        FilterExpressionBuilder b = new FilterExpressionBuilder();
        return b.eq("user_id", userId).build();
    }

}

package datn.services.chat_bot.services;

import java.util.List;
import java.util.Map;
import java.util.UUID;

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
public class QdrantProductService {
    private QdrantVectorStore vectorStore;
    private final String COLLECTION_NAME = "product_embeddings";

    public QdrantProductService(QdrantClient qdrantClient, EmbeddingModel embeddingModel) {
        this.vectorStore = QdrantVectorStore.builder(qdrantClient, embeddingModel)
                .collectionName(COLLECTION_NAME)
                .initializeSchema(true)
                .batchingStrategy(new TokenCountBatchingStrategy())
                .build();

    }

    public void saveDocument(String text, UUID productUUUID) {
        deleteDocument(productUUUID);
        vectorStore.add(
                List.of(new Document(text, Map.of(
                        "product_uuid", productUUUID.toString()))));
    }

    public void deleteDocument(UUID productUUID) {
        vectorStore.delete(getProductFilterExpression(productUUID));
    }

    private Expression getProductFilterExpression(UUID productUUID) {
        FilterExpressionBuilder b = new FilterExpressionBuilder();
        return b.eq("product_uuid", productUUID.toString()).build();
    }

    public void deleteDocument(String documentId) {
        vectorStore.delete(List.of(documentId));
    }

    public List<Document> getDocumentByProduct(UUID productUUID) {
        return vectorStore.similaritySearch(
                SearchRequest.builder().filterExpression(getProductFilterExpression(productUUID))
                        .build());
    }

    public List<Document> getDocuments(String text) {
        return vectorStore.similaritySearch(SearchRequest.builder().query(text).topK(5).build());
    }

    public String getContext(String text) {
        List<Document> documents = getDocuments(text);
        return documents.toString();
    }
}

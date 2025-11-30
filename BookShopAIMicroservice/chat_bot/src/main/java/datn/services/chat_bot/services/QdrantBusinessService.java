package datn.services.chat_bot.services;

import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.TokenCountBatchingStrategy;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.qdrant.QdrantVectorStore;
import org.springframework.stereotype.Service;

import io.qdrant.client.QdrantClient;

@Service
public class QdrantBusinessService {
    private QdrantVectorStore vectorStore;
    private final String COLLECTION_NAME = "business_embeddings";

    public QdrantBusinessService(QdrantClient qdrantClient, EmbeddingModel embeddingModel) {
        this.vectorStore = QdrantVectorStore.builder(qdrantClient, embeddingModel)
                .collectionName(COLLECTION_NAME)
                .initializeSchema(true)
                .batchingStrategy(new TokenCountBatchingStrategy())
                .build();

    }

    public void saveDocument(String text) {
        vectorStore.add(
                List.of(new Document(text)));
    }

    public List<Document> getDocuments() {
        List<Document> results = vectorStore.similaritySearch(SearchRequest.builder().build());
        return results;
    }

    public void deleteDocument(String id) {
        vectorStore.delete(List.of(id));
    }

    public List<Document> getDocuments(String text) {
        return vectorStore.similaritySearch(SearchRequest.builder().query(text).topK(5).build());
    }

    public String getContext(String text) {
        List<Document> documents = getDocuments(text);
        return documents.toString();
    }
}

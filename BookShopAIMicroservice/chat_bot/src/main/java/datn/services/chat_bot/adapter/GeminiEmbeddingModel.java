package datn.services.chat_bot.adapter;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.util.Assert;

import com.google.genai.Client;
import com.google.genai.types.ContentEmbedding;
import com.google.genai.types.EmbedContentConfig;

public class GeminiEmbeddingModel implements EmbeddingModel {
    private final Client genaiClient;
    private final String embeddingModelId;
    private final int dimensions;
    /**
     * Constructor để inject (tiêm) GenAI client và model ID.
     * @param genaiClient Client để gọi API Google GenAI.
     * @param embeddingModelId ID của model embedding (ví dụ: "models/embedding-001").
     */
    public GeminiEmbeddingModel(Client genaiClient, String embeddingModelId) {
        Assert.notNull(genaiClient, "GenaiClient không được null");
        Assert.notNull(embeddingModelId, "EmbeddingModelId không được null");
        
        this.genaiClient = genaiClient;
        this.embeddingModelId = embeddingModelId;
        
        // Tính toán số chiều một lần lúc khởi tạo
        this.dimensions = computeDimensions();
    }

    /**
     * Đây là phương thức bạn đã cung cấp, được chuyển thành private
     * để sử dụng nội bộ trong class này.
     */
    private List<ContentEmbedding> getEmbedding(String text) {
        // Thay thế `genaiClient.models` bằng cách gọi đúng trên client của bạn
        Optional<List<ContentEmbedding>> embedding = genaiClient.models.embedContent(
                this.embeddingModelId,
                text,
                EmbedContentConfig.builder().build()
        ).embeddings();

        return embedding.orElseThrow(() -> new RuntimeException("Embedding failed cho văn bản: " + text));
    }

    /**
     * Phương thức cốt lõi được yêu cầu bởi Spring AI.
     * Nó nhận một yêu cầu (request) chứa danh sách các văn bản
     * và trả về một phản hồi (response) chứa danh sách các embedding.
     */
    @Override
    public EmbeddingResponse call(EmbeddingRequest request) {
        List<String> texts = request.getInstructions();
        List<Embedding> springEmbeddings = new ArrayList<>();

        for (int i = 0; i < texts.size(); i++) {
            String text = texts.get(i);

            // 1. Gọi phương thức getEmbedding của bạn cho từng đoạn text
            List<ContentEmbedding> genaiEmbeddingList = this.getEmbedding(text);

            if (genaiEmbeddingList.isEmpty()) {
                throw new RuntimeException("Embedding thất bại (danh sách rỗng) cho: " + text);
            }

            // 2. Giả định rằng text ngắn chỉ trả về 1 embedding
            ContentEmbedding genaiEmbedding = genaiEmbeddingList.get(0);
            
            // 3. Lấy ra danh sách các giá trị Float
            List<Float> floatList = genaiEmbedding.values()
                    .orElseThrow(() -> new RuntimeException("Embedding trả về không có giá trị (values)"));

            float[] embedding = new float[floatList.size()];

            for (int j = 0; j < embedding.length; j++) {
                embedding[j] = floatList.get(j);
            }

            // 5. Tạo đối tượng Embedding của Spring AI với index
            springEmbeddings.add(new Embedding(embedding, i));
        }

        // 6. Trả về EmbeddingResponse chứa tất cả kết quả
        return new EmbeddingResponse(springEmbeddings);
    }

    /**
     * Phương thức bắt buộc phải implement (không phải default)
     * từ interface EmbeddingModel.
     */
    @Override
    public float[] embed(Document document) {
        Assert.notNull(document, "Document không được null");
        // Sử dụng lại phương thức default `embed(String text)`
        // Nó sẽ tự động gọi `call()`
        return this.embed(document.getText());
    }

    /**
     * Ghi đè (override) phương thức `dimensions()` để tăng hiệu suất.
     * Phương thức default sẽ gọi API mỗi lần, rất lãng phí.
     */
    @Override
    public int dimensions() {
        return this.dimensions;
    }
    
    /**
     * Phương thức private helper để tính số chiều (dimensions) một lần.
     * Được gọi trong constructor.
     */
    private int computeDimensions() {
        try {
            List<ContentEmbedding> testEmbedding = this.getEmbedding("Test");
            if (testEmbedding.isEmpty()) {
                throw new RuntimeException("Không thể tính dimensions: API không trả về embedding.");
            }
            return testEmbedding.get(0).values()
                    .orElseThrow(() -> new RuntimeException("Không thể tính dimensions: Embedding không có giá trị."))
                    .size();
        } catch (Exception e) {
            // Log lỗi và ném ra một ngoại lệ nghiêm trọng hơn
            // vì model không thể hoạt động nếu không biết số chiều
            throw new RuntimeException("Không thể khởi tạo GeminiEmbeddingModel: " + e.getMessage(), e);
        }
    }
}

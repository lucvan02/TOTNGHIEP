package datn.services.chat_bot.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.ai.document.Document;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import datn.services.chat_bot.services.QdrantProductService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/embedding/products")
@RequiredArgsConstructor
public class ProductEmbeddingController {

    private final QdrantProductService qdrantProductService;

    /**
     * Save product info document to Qdrant collection
     * 
     * @param text        Product information text to be saved as a document
     * @param productUUID
     * @return
     */
    @PostMapping("/{productUUID}")
    public ResponseEntity<Void> saveDocument(@RequestBody String text, @PathVariable UUID productUUID) {
        qdrantProductService.saveDocument(text, productUUID);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get product info document from Qdrant collection
     * 
     * @param productUUID
     * @return
     */
    @GetMapping("/{productUUID}")
    public ResponseEntity<List<Document>> getProductDocument(@PathVariable UUID productUUID) {
        return ResponseEntity.ok().body(qdrantProductService.getDocumentByProduct(productUUID));
    }

    /**
     * Delete product info document from Qdrant collection
     * 
     * @param productUUID
     * @return
     */
    @DeleteMapping("/{productUUID}")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID productUUID) {
        qdrantProductService.deleteDocument(productUUID);
        return ResponseEntity.noContent().build();
    }

}

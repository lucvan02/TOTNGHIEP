package datn.services.chat_bot.controller;

import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import datn.services.chat_bot.services.QdrantBusinessService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/embedding/business")
@RequiredArgsConstructor
public class BusinessEmbeddingController {

    private final QdrantBusinessService qdrantBusinessService;

    /**
     * Save business info document to Qdrant collection
     * 
     * @param text Business information text to be saved as a document
     * @return
     */
    @PostMapping
    public ResponseEntity<Void> saveDocument(@RequestBody String text) {
        qdrantBusinessService.saveDocument(text);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all business info documents from Qdrant collection
     * 
     * @return
     */
    @GetMapping
    public ResponseEntity<List<Document>> getDocuments() {
        return ResponseEntity.ok().body(qdrantBusinessService.getDocuments());
    }

    /**
     * Delete business info document from Qdrant collection
     * 
     * @param id
     * @return
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable String id) {
        qdrantBusinessService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

}

package com.resumebuilder.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumebuilder.dto.ContextHandshake;
import com.resumebuilder.dto.GenerateDraftRequest;
import com.resumebuilder.dto.PredictAtsRequest;
import com.resumebuilder.model.AtsResult;
import com.resumebuilder.model.ResumeData;
import com.resumebuilder.service.GeminiService;
import com.resumebuilder.service.PdfExportService;
import jakarta.validation.Valid;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ResumeController {

    private final GeminiService geminiService;
    private final PdfExportService pdfExportService;
    private final ObjectMapper objectMapper;

    public ResumeController(GeminiService geminiService,
                            PdfExportService pdfExportService,
                            ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.pdfExportService = pdfExportService;
        this.objectMapper = objectMapper;
    }

    /**
     * Phase 2B: Upload an existing PDF resume.
     * Parses it via Spring AI ETL pipeline and returns structured ResumeData.
     */
    @PostMapping(value = "/parse-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> parsePdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam("context") String contextJson) throws Exception {

        ContextHandshake context = objectMapper.readValue(contextJson, ContextHandshake.class);
        try {
            ResumeData result = geminiService.parsePdf(file, context);
            return ResponseEntity.ok(result);
        } catch (NonTransientAiException e) {
            return aiError(e);
        }
    }

    @PostMapping("/generate-draft")
    public ResponseEntity<?> generateDraft(
            @RequestBody @Valid GenerateDraftRequest request) {

        try {
            ResumeData result = geminiService.generateDraft(request);
            return ResponseEntity.ok(result);
        } catch (NonTransientAiException e) {
            return aiError(e);
        }
    }

    @PostMapping("/predict-ats")
    public ResponseEntity<?> predictAts(
            @RequestBody @Valid PredictAtsRequest request) {

        try {
            AtsResult result = geminiService.predictAts(request);
            return ResponseEntity.ok(result);
        } catch (NonTransientAiException e) {
            return aiError(e);
        }
    }

    private ResponseEntity<Map<String, String>> aiError(NonTransientAiException e) {
        String msg = e.getMessage() != null && e.getMessage().contains("429")
                ? "Gemini API quota exceeded. Please wait a moment or check your API key billing at aistudio.google.com."
                : "Gemini API error: " + e.getMessage();
        HttpStatus status = e.getMessage() != null && e.getMessage().contains("429")
                ? HttpStatus.TOO_MANY_REQUESTS : HttpStatus.BAD_GATEWAY;
        return ResponseEntity.status(status).body(Map.of("error", msg));
    }

    /**
     * Phase 5: Export the approved resume as a downloadable PDF.
     */
    @PostMapping("/export-pdf")
    public ResponseEntity<byte[]> exportPdf(@RequestBody ResumeData resumeData) throws Exception {
        byte[] pdf = pdfExportService.export(resumeData);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"resume.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}

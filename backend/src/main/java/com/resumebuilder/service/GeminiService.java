package com.resumebuilder.service;

import com.resumebuilder.dto.ContextHandshake;
import com.resumebuilder.dto.GenerateDraftRequest;
import com.resumebuilder.dto.PredictAtsRequest;
import com.resumebuilder.model.AtsResult;
import com.resumebuilder.model.ResumeData;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.pdf.config.PdfDocumentReaderConfig;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GeminiService {

    private static final String RESUME_WRITER_SYSTEM = """
            You are a professional resume writer.
            Generate a complete, structured resume from the user's raw notes.
            Target role: {target_role}
            Experience level: {exp_level}
            Return strictly valid JSON matching the ResumeData schema. No extra text.
            """;

    private static final String ATS_SYSTEM = """
            You are a Senior Technical Recruiter and ATS (Applicant Tracking System) Expert.
            Your goal is to evaluate a RESUME against a specific JOB DESCRIPTION (JD).

            CONTEXT:
            - User Role: {target_role}
            - Experience Level: {exp_level}

            EVALUATION CRITERIA:
            1. Keyword Match: Identify critical skills in the JD missing from the resume.
            2. Formatting: Check for ATS-unfriendly elements (tables, headers, complex graphics).
            3. Impact: Evaluate if bullet points use Action Verbs and Quantifiable Results.
            4. Relevance: How well does the experience align with the {target_role}?

            Strictly avoid conversational filler. Only return the JSON object.
            """;

    private static final String PDF_PARSER_SYSTEM = """
            You are a professional resume parser.
            Extract all structured resume data from the provided text.
            Target role: {target_role}, Experience level: {exp_level}.
            Return strictly valid JSON matching the ResumeData schema. No extra text.
            """;

    private final ChatClient chatClient;

    public GeminiService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    public ResumeData generateDraft(GenerateDraftRequest request) {
        return chatClient.prompt()
                .system(s -> s.text(RESUME_WRITER_SYSTEM)
                        .param("target_role", request.context().targetRole())
                        .param("exp_level", request.context().experienceLevel()))
                .user(request.rawNotes())
                .call()
                .entity(ResumeData.class);
    }

    public AtsResult predictAts(PredictAtsRequest request) {
        return chatClient.prompt()
                .system(s -> s.text(ATS_SYSTEM)
                        .param("target_role", request.context().targetRole())
                        .param("exp_level", request.context().experienceLevel()))
                .user(u -> u.text("RESUME:\n{resume}\n\nJOB DESCRIPTION:\n{jd}")
                        .param("resume", toPlainText(request.resumeData()))
                        .param("jd", request.jobDescription()))
                .call()
                .entity(AtsResult.class);
    }

    public ResumeData parsePdf(MultipartFile file, ContextHandshake context) throws IOException {
        // ETL: Extract → Transform → Load into Gemini context
        PagePdfDocumentReader reader = new PagePdfDocumentReader(
                new ByteArrayResource(file.getBytes()),
                PdfDocumentReaderConfig.defaultConfig()
        );

        List<Document> pages = reader.read();
        List<Document> chunks = new TokenTextSplitter().apply(pages);

        String pdfText = chunks.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n"));

        return chatClient.prompt()
                .system(s -> s.text(PDF_PARSER_SYSTEM)
                        .param("target_role", context.targetRole())
                        .param("exp_level", context.experienceLevel()))
                .user("Parse this resume:\n" + pdfText)
                .call()
                .entity(ResumeData.class);
    }

    private String toPlainText(ResumeData r) {
        StringBuilder sb = new StringBuilder();
        sb.append(r.name()).append("\n");
        if (r.summary() != null) sb.append(r.summary()).append("\n\n");
        if (r.workExperience() != null) {
            r.workExperience().forEach(w -> {
                sb.append(w.role()).append(" @ ").append(w.company())
                  .append(" (").append(w.duration()).append(")\n");
                if (w.bullets() != null) w.bullets().forEach(b -> sb.append("- ").append(b).append("\n"));
            });
        }
        if (r.skills() != null) sb.append("Skills: ").append(String.join(", ", r.skills()));
        return sb.toString();
    }
}

package com.resumebuilder.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import com.resumebuilder.model.ResumeData;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;

@Service
public class PdfExportService {

    private static final Color ACCENT   = new Color(30, 64, 175);
    private static final Color DARK     = new Color(17, 24, 39);
    private static final Color MUTED    = new Color(107, 114, 128);
    private static final Color RULE     = new Color(209, 213, 219);

    public byte[] export(ResumeData data) throws DocumentException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 45f, 45f, 55f, 55f);
        PdfWriter.getInstance(doc, out);
        doc.open();

        Font nameFont    = FontFactory.getFont(FontFactory.HELVETICA_BOLD,  22, DARK);
        Font contactFont = FontFactory.getFont(FontFactory.HELVETICA,        9, MUTED);
        Font headingFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD,  10, ACCENT);
        Font bodyFont    = FontFactory.getFont(FontFactory.HELVETICA,        9, DARK);
        Font boldBody    = FontFactory.getFont(FontFactory.HELVETICA_BOLD,   9, DARK);

        // ── Name ──────────────────────────────────────────────────────────
        doc.add(new Paragraph(safe(data.name()), nameFont));
        doc.add(new Paragraph(
                join(" · ", safe(data.email()), safe(data.phone()), safe(data.linkedin())),
                contactFont));
        addRule(doc);

        // ── Summary ───────────────────────────────────────────────────────
        if (notEmpty(data.summary())) {
            addSection(doc, "PROFESSIONAL SUMMARY", headingFont);
            doc.add(new Paragraph(data.summary(), bodyFont));
            doc.add(Chunk.NEWLINE);
        }

        // ── Work Experience ───────────────────────────────────────────────
        if (data.workExperience() != null && !data.workExperience().isEmpty()) {
            addSection(doc, "WORK EXPERIENCE", headingFont);
            for (ResumeData.WorkExperience w : data.workExperience()) {
                Paragraph header = new Paragraph();
                header.add(new Chunk(safe(w.role()) + "  —  " + safe(w.company()), boldBody));
                header.add(new Chunk("    " + safe(w.duration()), contactFont));
                doc.add(header);
                if (w.bullets() != null) {
                    for (String b : w.bullets()) {
                        doc.add(new Paragraph("    • " + b, bodyFont));
                    }
                }
                doc.add(Chunk.NEWLINE);
            }
        }

        // ── Education ─────────────────────────────────────────────────────
        if (data.education() != null && !data.education().isEmpty()) {
            addSection(doc, "EDUCATION", headingFont);
            for (ResumeData.Education e : data.education()) {
                Paragraph p = new Paragraph();
                p.add(new Chunk(safe(e.degree()) + "  —  " + safe(e.institution()), boldBody));
                p.add(new Chunk("    " + safe(e.year()), contactFont));
                doc.add(p);
            }
            doc.add(Chunk.NEWLINE);
        }

        // ── Skills ────────────────────────────────────────────────────────
        if (data.skills() != null && !data.skills().isEmpty()) {
            addSection(doc, "SKILLS", headingFont);
            doc.add(new Paragraph(String.join("  ·  ", data.skills()), bodyFont));
            doc.add(Chunk.NEWLINE);
        }

        // ── Certifications ────────────────────────────────────────────────
        if (data.certifications() != null && !data.certifications().isEmpty()) {
            addSection(doc, "CERTIFICATIONS", headingFont);
            data.certifications().forEach(c -> {
                try { doc.add(new Paragraph("• " + c, bodyFont)); }
                catch (DocumentException ignored) {}
            });
        }

        doc.close();
        return out.toByteArray();
    }

    private void addSection(Document doc, String title, Font font) throws DocumentException {
        doc.add(new Paragraph(title, font));
        addRule(doc);
    }

    private void addRule(Document doc) throws DocumentException {
        doc.add(new LineSeparator(0.5f, 100f, RULE, Element.ALIGN_LEFT, -2f));
        doc.add(Chunk.NEWLINE);
    }

    private String safe(String s) { return s != null ? s : ""; }
    private boolean notEmpty(String s) { return s != null && !s.isBlank(); }

    private String join(String sep, String... parts) {
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (p != null && !p.isBlank()) {
                if (!sb.isEmpty()) sb.append(sep);
                sb.append(p);
            }
        }
        return sb.toString();
    }
}

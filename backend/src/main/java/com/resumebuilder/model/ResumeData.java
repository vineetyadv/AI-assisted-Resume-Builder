package com.resumebuilder.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record ResumeData(
        String name,
        String email,
        String phone,
        String linkedin,
        String summary,
        @JsonProperty("work_experience") List<WorkExperience> workExperience,
        List<Education> education,
        List<String> skills,
        List<String> certifications
) {

    public record WorkExperience(
            String company,
            String role,
            String duration,
            List<String> bullets
    ) {}

    public record Education(
            String institution,
            String degree,
            String year,
            String gpa
    ) {}
}

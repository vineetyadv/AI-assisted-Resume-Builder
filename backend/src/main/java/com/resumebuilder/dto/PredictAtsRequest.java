package com.resumebuilder.dto;

import com.resumebuilder.model.ResumeData;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PredictAtsRequest(
        @NotNull @Valid ContextHandshake context,
        @NotNull ResumeData resumeData,
        @NotBlank String jobDescription
) {}

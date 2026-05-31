package com.resumebuilder.dto;

import jakarta.validation.constraints.NotBlank;

public record ContextHandshake(
        @NotBlank String targetRole,
        @NotBlank String experienceLevel
) {}

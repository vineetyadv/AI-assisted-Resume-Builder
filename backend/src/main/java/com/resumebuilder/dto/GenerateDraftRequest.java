package com.resumebuilder.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GenerateDraftRequest(
        @NotNull @Valid ContextHandshake context,
        @NotBlank String rawNotes
) {}

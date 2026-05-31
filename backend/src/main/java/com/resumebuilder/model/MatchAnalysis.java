package com.resumebuilder.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record MatchAnalysis(
        @JsonProperty("found_keywords") List<String> foundKeywords,
        @JsonProperty("missing_keywords") List<String> missingKeywords,
        @JsonProperty("critical_gaps") List<String> criticalGaps
) {}

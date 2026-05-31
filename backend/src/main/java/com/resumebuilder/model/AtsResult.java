package com.resumebuilder.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AtsResult(
        @JsonProperty("ats_score") int atsScore,
        @JsonProperty("match_analysis") MatchAnalysis matchAnalysis,
        @JsonProperty("formatting_feedback") String formattingFeedback,
        @JsonProperty("improvement_suggestions") List<ImprovementSuggestion> improvementSuggestions,
        @JsonProperty("is_ready_for_application") boolean isReadyForApplication
) {}

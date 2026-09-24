package com.fredrikbjorkeroth.career.assignment;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record CreateAssignmentRequest(
		@NotBlank String link,
		List<String> technologies,
		@Min(1) @Max(5) Integer skillMatch,
		@Min(1) @Max(5) Integer interest,
		AssignmentStatus status) {
}

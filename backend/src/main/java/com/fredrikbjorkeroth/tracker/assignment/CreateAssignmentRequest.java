package com.fredrikbjorkeroth.tracker.assignment;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.hibernate.validator.constraints.URL;

public record CreateAssignmentRequest(
		@NotBlank @URL(regexp = "^https?://.+") String link,
		List<String> technologies,
		@Min(1) @Max(5) Integer skillMatch,
		@Min(1) @Max(5) Integer interest,
		AssignmentStatus status,
		String notes) {
}

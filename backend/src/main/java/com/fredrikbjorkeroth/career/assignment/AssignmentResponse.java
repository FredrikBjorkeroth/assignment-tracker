package com.fredrikbjorkeroth.career.assignment;

import java.time.LocalDate;
import java.util.List;

public record AssignmentResponse(
		Long id,
		String link,
		List<String> technologies,
		Integer skillMatch,
		Integer interest,
		AssignmentStatus status,
		String notes,
		LocalDate createdAt) {

	static AssignmentResponse from(Assignment assignment) {
		return new AssignmentResponse(
				assignment.getId(),
				assignment.getLink(),
				assignment.getTechnologies(),
				assignment.getSkillMatch(),
				assignment.getInterest(),
				assignment.getStatus(),
				assignment.getNotes(),
				assignment.getCreatedAt());
	}
}

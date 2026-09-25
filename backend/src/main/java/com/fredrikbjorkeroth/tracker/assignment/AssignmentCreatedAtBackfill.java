package com.fredrikbjorkeroth.tracker.assignment;

import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Sets createdAt for assignments persisted before that field existed. Runs on every startup but
 * is a no-op once all rows have a value.
 */
@Component
public class AssignmentCreatedAtBackfill implements ApplicationRunner {

	private final AssignmentRepository assignmentRepository;

	public AssignmentCreatedAtBackfill(AssignmentRepository assignmentRepository) {
		this.assignmentRepository = assignmentRepository;
	}

	@Override
	public void run(ApplicationArguments args) {
		List<Assignment> missingCreatedAt = assignmentRepository.findAll().stream()
				.filter(assignment -> assignment.getCreatedAt() == null)
				.toList();
		if (missingCreatedAt.isEmpty()) {
			return;
		}
		LocalDate today = LocalDate.now();
		missingCreatedAt.forEach(assignment -> assignment.setCreatedAt(today));
		assignmentRepository.saveAll(missingCreatedAt);
	}

}

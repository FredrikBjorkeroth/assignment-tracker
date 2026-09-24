package com.fredrikbjorkeroth.career.assignment;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

	private final AssignmentRepository assignmentRepository;

	public AssignmentController(AssignmentRepository assignmentRepository) {
		this.assignmentRepository = assignmentRepository;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public AssignmentResponse create(@Valid @RequestBody CreateAssignmentRequest request) {
		Assignment assignment = new Assignment(
				request.link(), request.technologies(), request.skillMatch(), request.interest());
		return AssignmentResponse.from(assignmentRepository.save(assignment));
	}

	@GetMapping
	public List<AssignmentResponse> list() {
		return assignmentRepository.findAll().stream().map(AssignmentResponse::from).toList();
	}

	@PatchMapping("/{id}")
	public AssignmentResponse update(
			@PathVariable Long id, @Valid @RequestBody CreateAssignmentRequest request) {
		Assignment assignment = assignmentRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
		assignment.setLink(request.link());
		assignment.setTechnologies(request.technologies());
		assignment.setSkillMatch(request.skillMatch());
		assignment.setInterest(request.interest());
		return AssignmentResponse.from(assignmentRepository.save(assignment));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Long id) {
		if (!assignmentRepository.existsById(id)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND);
		}
		assignmentRepository.deleteById(id);
	}

}

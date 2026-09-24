package com.fredrikbjorkeroth.career.assignment;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Assignment {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@Column(nullable = false)
	private String link;

	@ElementCollection
	@CollectionTable(name = "assignment_technologies", joinColumns = @JoinColumn(name = "assignment_id"))
	@Column(name = "technology")
	private List<String> technologies = new ArrayList<>();

	private Integer skillMatch;

	private Integer interest;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private AssignmentStatus status = AssignmentStatus.CONSIDERING;

	protected Assignment() {
	}

	public Assignment(String link, List<String> technologies, Integer skillMatch, Integer interest) {
		this(link, technologies, skillMatch, interest, AssignmentStatus.CONSIDERING);
	}

	public Assignment(
			String link,
			List<String> technologies,
			Integer skillMatch,
			Integer interest,
			AssignmentStatus status) {
		this.link = link;
		this.technologies = technologies != null ? new ArrayList<>(technologies) : new ArrayList<>();
		this.skillMatch = skillMatch;
		this.interest = interest;
		this.status = status != null ? status : AssignmentStatus.CONSIDERING;
	}

	public Long getId() {
		return id;
	}

	public String getLink() {
		return link;
	}

	public void setLink(String link) {
		this.link = link;
	}

	public List<String> getTechnologies() {
		return technologies;
	}

	public void setTechnologies(List<String> technologies) {
		this.technologies = technologies;
	}

	public Integer getSkillMatch() {
		return skillMatch;
	}

	public void setSkillMatch(Integer skillMatch) {
		this.skillMatch = skillMatch;
	}

	public Integer getInterest() {
		return interest;
	}

	public void setInterest(Integer interest) {
		this.interest = interest;
	}

	public AssignmentStatus getStatus() {
		return status;
	}

	public void setStatus(AssignmentStatus status) {
		this.status = status;
	}

}

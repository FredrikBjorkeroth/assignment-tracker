package com.fredrikbjorkeroth.tracker.assignment;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AssignmentControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void createsAnAssignmentAndReturnsItFromList() throws Exception {
		String requestBody = """
				{
					"link": "https://example.com/job-posting",
					"technologies": ["Java", "React"],
					"skillMatch": null,
					"interest": null
				}
				""";

		mockMvc.perform(post("/api/assignments")
				.contentType(MediaType.APPLICATION_JSON)
				.content(requestBody))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").exists())
				.andExpect(jsonPath("$.link").value("https://example.com/job-posting"))
				.andExpect(jsonPath("$.technologies", hasSize(2)))
				.andExpect(jsonPath("$.skillMatch").value(nullValue()));

		mockMvc.perform(get("/api/assignments"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].link").value("https://example.com/job-posting"));
	}

}

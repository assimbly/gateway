package org.assimbly.gateway.web.rest.gateway;

import org.assimbly.docconverter.DocConverter;
import org.assimbly.gateway.GatewayApp;
import org.assimbly.gateway.domain.Integration;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
import org.assimbly.gateway.domain.enumeration.GatewayType;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.IntegrationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** The import endpoints: what they accept, what they answer with and how they refuse. */
@SpringBootTest(classes = GatewayApp.class)
@Transactional
class ImportResourceIntTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private IntegrationRepository integrationRepository;

    @Autowired
    private FlowRepository flowRepository;

    private MockMvc mockMvc;

    private Long integrationId;

    @BeforeEach
    void setup() {
        Integration integration = new Integration();
        integration.setName("import-resource");
        integration.setType(GatewayType.FULL);
        integration.setStage(EnvironmentType.TEST);
        integrationId = integrationRepository.save(integration).getId();

        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void aDilFlowIsImported() throws Exception {
        mockMvc.perform(post("/api/import/flow").param("integrationId", integrationId.toString())
                .contentType(MediaType.APPLICATION_XML).content(fixture("empty-flow.xml")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("EmptyFlow"))
            .andExpect(jsonPath("$.type").value("esb"))
            .andExpect(jsonPath("$.replaced").value(false))
            .andExpect(jsonPath("$.flowId").isNumber());

        assertThat(flowRepository.findByName("EmptyFlow")).isPresent();
    }

    @Test
    void aDilFlowAsJsonIsImported() throws Exception {
        String json = DocConverter.xmlToJson(fixture("empty-flow.xml"));

        mockMvc.perform(post("/api/import/flow").param("integrationId", integrationId.toString())
                .contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("EmptyFlow"))
            .andExpect(jsonPath("$.type").value("esb"))
            .andExpect(jsonPath("$.flowId").isNumber());

        assertThat(flowRepository.findByName("EmptyFlow")).isPresent();
    }

    @Test
    void onConflictRenameKeepsTheExistingFlow() throws Exception {
        mockMvc.perform(post("/api/import/flow").param("integrationId", integrationId.toString())
            .contentType(MediaType.APPLICATION_XML).content(fixture("empty-flow.xml"))).andExpect(status().isOk());

        mockMvc.perform(post("/api/import/flow").param("integrationId", integrationId.toString()).param("onConflict", "rename")
                .contentType(MediaType.APPLICATION_XML).content(fixture("empty-flow.xml")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("EmptyFlow-2"))
            .andExpect(jsonPath("$.replaced").value(false));
    }

    @Test
    void aDilFileThatIsNotAFlowIsRefusedWithTheReason() throws Exception {
        mockMvc.perform(post("/api/import/flow").param("integrationId", integrationId.toString())
                .contentType(MediaType.APPLICATION_XML).content("<dil><integrations/><core/></dil>"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.detail").value(containsString("doesn't contain a Flow")));
    }

    @Test
    void camelXmlIsImportedAsARouteFlow() throws Exception {
        mockMvc.perform(post("/api/import/camel").param("integrationId", integrationId.toString()).param("name", "From the endpoint")
                .contentType(MediaType.APPLICATION_XML)
                .content("<route id=\"r\" xmlns=\"http://camel.apache.org/schema/spring\"><from uri=\"direct:x\"/><log message=\"x\"/></route>"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("From the endpoint"))
            .andExpect(jsonPath("$.type").value("route"))
            .andExpect(jsonPath("$.warnings").isEmpty());
    }

    @Test
    void camelXmlThatIsNotCamelIsRefusedWithTheReason() throws Exception {
        mockMvc.perform(post("/api/import/camel").contentType(MediaType.APPLICATION_XML).content("<other/>"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.detail").value(containsString("expected <route>, <routes> or <camelContext>")));
    }

    @Test
    void aScriptIsImportedAsAScriptFlow() throws Exception {
        mockMvc.perform(post("/api/import/script").param("integrationId", integrationId.toString()).param("language", "groovy")
                .param("name", "Hello").contentType(MediaType.TEXT_PLAIN).content("println 'hello'"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Hello"))
            .andExpect(jsonPath("$.type").value("script"));
    }

    @Test
    void aScriptInAnUnknownLanguageIsRefusedWithTheReason() throws Exception {
        mockMvc.perform(post("/api/import/script").param("language", "cobol").contentType(MediaType.TEXT_PLAIN).content("DISPLAY 'X'."))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.detail").value(containsString("Unknown script language 'cobol'")));
    }

    private String fixture(String name) throws Exception {
        try (InputStream in = getClass().getResourceAsStream("/dil/" + name)) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8).trim();
        }
    }
}

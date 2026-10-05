package org.assimbly.gateway.config.importing;

import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.service.api.ApiService;
import org.assimbly.gateway.service.dto.ApiDTO;
import org.assimbly.gateway.service.dto.ApiDeclaredResponseDTO;
import org.assimbly.gateway.service.dto.ApiOperationDTO;
import org.assimbly.gateway.service.dto.ApiParameterDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import java.util.ArrayList;
import java.util.List;

/**
 * Restores the APIs of a backup. It runs after the Flows are imported: each Operation is linked to the Flow imported
 * for its Handler Flow, which the backup names by its id in the export.
 */
@Service
@Transactional
public class ImportXMLApis {

    private final Logger log = LoggerFactory.getLogger(ImportXMLApis.class);

    private final ApiService apiService;
    private final FlowRepository flowRepository;

    public ImportXMLApis(ApiService apiService, FlowRepository flowRepository) {
        this.apiService = apiService;
        this.flowRepository = flowRepository;
    }

    public void setApisFromXML(Document doc, Long integrationId) throws XPathExpressionException {
        XPath xPath = XPathFactory.newInstance().newXPath();
        NodeList apis = (NodeList) xPath.evaluate("/dil/integrations/integration/apis/api", doc, XPathConstants.NODESET);

        for (int i = 0; i < apis.getLength(); i++) {
            Node api = apis.item(i);
            ApiDTO dto = new ApiDTO(null, xPath.evaluate("name", api), xPath.evaluate("basePath", api), emptyToNull(xPath.evaluate("versionLabel", api)),
                emptyToNull(xPath.evaluate("description", api)), integrationId, 0, null);

            List<ApiService.RestoredOperation> operations = new ArrayList<>();
            NodeList operationNodes = (NodeList) xPath.evaluate("operations/operation", api, XPathConstants.NODESET);
            for (int j = 0; j < operationNodes.getLength(); j++) {
                Node operation = operationNodes.item(j);
                String handlerFlowId = xPath.evaluate("handlerFlowId", operation);
                String flowName = xPath.evaluate("/dil/integrations/integration/flows/flow[id='" + handlerFlowId + "']/name", doc);
                Flow flow = flowRepository.findFirstByNameOrderByIdAsc(flowName).orElse(null);
                if (flow == null) {
                    log.warn("The API {} lost the Operation {} {}: its Handler Flow {} isn't in the import", dto.name(),
                        xPath.evaluate("method", operation), xPath.evaluate("path", operation), handlerFlowId);
                    continue;
                }
                operations.add(new ApiService.RestoredOperation(operation(xPath, operation), flow));
            }

            apiService.restoreApi(dto, operations);
            log.info("Imported API {}", dto.name());
        }
    }

    private static ApiOperationDTO operation(XPath xPath, Node operation) throws XPathExpressionException {
        List<ApiParameterDTO> parameters = new ArrayList<>();
        NodeList parameterNodes = (NodeList) xPath.evaluate("parameters/parameter", operation, XPathConstants.NODESET);
        for (int i = 0; i < parameterNodes.getLength(); i++) {
            Node parameter = parameterNodes.item(i);
            parameters.add(new ApiParameterDTO(xPath.evaluate("name", parameter), xPath.evaluate("in", parameter), emptyToNull(xPath.evaluate("type", parameter)),
                Boolean.parseBoolean(xPath.evaluate("required", parameter)), emptyToNull(xPath.evaluate("description", parameter))));
        }

        List<ApiDeclaredResponseDTO> responses = new ArrayList<>();
        NodeList responseNodes = (NodeList) xPath.evaluate("declaredResponses/declaredResponse", operation, XPathConstants.NODESET);
        for (int i = 0; i < responseNodes.getLength(); i++) {
            Node response = responseNodes.item(i);
            responses.add(new ApiDeclaredResponseDTO(xPath.evaluate("status", response), xPath.evaluate("description", response),
                emptyToNull(xPath.evaluate("mediaType", response)), emptyToNull(xPath.evaluate("schema", response))));
        }

        return new ApiOperationDTO(null, null, xPath.evaluate("method", operation), xPath.evaluate("path", operation), null,
            emptyToNull(xPath.evaluate("operationId", operation)), emptyToNull(xPath.evaluate("summary", operation)),
            emptyToNull(xPath.evaluate("description", operation)), emptyToNull(xPath.evaluate("requestMediaType", operation)),
            emptyToNull(xPath.evaluate("responseMediaType", operation)), emptyToNull(xPath.evaluate("requestSchema", operation)),
            parameters, responses, null, null, null);
    }

    private static String emptyToNull(String value) {
        return value == null || value.isEmpty() ? null : value;
    }
}

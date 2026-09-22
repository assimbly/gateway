package org.assimbly.gateway.service.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * One page of a flow's alert log, newest first.
 */
public class FlowAlertsPageDTO {

    private int total;

    private List<String> messages = new ArrayList<>();

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public List<String> getMessages() {
        return messages;
    }

    public void setMessages(List<String> messages) {
        this.messages = messages;
    }
}

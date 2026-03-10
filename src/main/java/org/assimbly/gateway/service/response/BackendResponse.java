package org.assimbly.gateway.service.response;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class BackendResponse {

    private Map<String, Object> jvm = new ConcurrentHashMap<>();
    private Map<String, Long> memory = new ConcurrentHashMap<>();
    private Map<String, Integer> threads = new ConcurrentHashMap<>();

    public Map<String, Long> getMemory() {
        return memory;
    }
    public void setMemory(Map<String, Long> memory) {
        this.memory = memory;
    }
    public void addMemory(String key, Long value) {
        this.memory.put(key, value);
    }

    public Map<String, Integer> getThreads() {
        return threads;
    }
    public void setThreads(Map<String, Integer> threads) {
        this.threads = threads;
    }
    public void addThread(String key, Integer value) {
        this.threads.put(key, value);
    }

    public Map<String, Object> getJvm() {
        return jvm;
    }
    public void setJvm(Map<String, Object> jvm) {
        this.jvm = jvm;
    }
    public void addJvm(String key, Object value) {
        this.jvm.put(key, value);
    }


}

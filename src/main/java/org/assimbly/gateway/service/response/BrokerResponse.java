package org.assimbly.gateway.service.response;

public class BrokerResponse {

    private long averageMessageSize;
    private int openConnections;
    private int maxConnections;
    private int tmpPercentUsage;
    private int storePercentUsage;
    private int memoryPercentUsage;
    private int totalNumberOfQueues;
    private int totalNumberOfTemporaryQueues;

    public BrokerResponse() {
    }

    public long getAverageMessageSize() {
        return averageMessageSize;
    }

    public void setAverageMessageSize(long averageMessageSize) {
        this.averageMessageSize = averageMessageSize;
    }

    public int getOpenConnections() {
        return openConnections;
    }

    public void setOpenConnections(int openConnections) {
        this.openConnections = openConnections;
    }

    public int getMaxConnections() {
        return maxConnections;
    }

    public void setMaxConnections(int maxConnections) {
        this.maxConnections = maxConnections;
    }

    public int getTmpPercentUsage() {
        return tmpPercentUsage;
    }

    public void setTmpPercentUsage(int tmpPercentUsage) {
        this.tmpPercentUsage = tmpPercentUsage;
    }

    public int getStorePercentUsage() {
        return storePercentUsage;
    }

    public void setStorePercentUsage(int storePercentUsage) {
        this.storePercentUsage = storePercentUsage;
    }

    public int getMemoryPercentUsage() {
        return memoryPercentUsage;
    }

    public void setMemoryPercentUsage(int memoryPercentUsage) {
        this.memoryPercentUsage = memoryPercentUsage;
    }

    public int getTotalNumberOfQueues() {
        return totalNumberOfQueues;
    }

    public void setTotalNumberOfQueues(int totalNumberOfQueues) {
        this.totalNumberOfQueues = totalNumberOfQueues;
    }

    public int getTotalNumberOfTemporaryQueues() {
        return totalNumberOfTemporaryQueues;
    }

    public void setTotalNumberOfTemporaryQueues(int totalNumberOfTemporaryQueues) {
        this.totalNumberOfTemporaryQueues = totalNumberOfTemporaryQueues;
    }
}

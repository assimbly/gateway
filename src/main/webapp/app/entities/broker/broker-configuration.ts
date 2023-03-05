export const artemisBrokerConfiguration = `<?xml version='1.0'?>
<!-- Example broker.xml -->

<configuration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="urn:activemq" xsi:schemaLocation="urn:activemq /schema/artemis-server.xsd">
   <core xmlns="urn:activemq:core">

       <name>assimbly-artemis-broker</name>

       <persistence-enabled>true</persistence-enabled>

       <cluster-user>admin</cluster-user>
       <cluster-password>admin</cluster-password>

       <!--<journal-type>NIO</journal-type>-->
       <paging-directory>data/paging</paging-directory>
       <bindings-directory>data/bindings</bindings-directory>
       <journal-directory>data/journal</journal-directory>
       <large-messages-directory>data/large-messages</large-messages-directory>
       <journal-datasync>true</journal-datasync>
       <journal-min-files>2</journal-min-files>
       <journal-pool-files>10</journal-pool-files>
       <journal-device-block-size>4096</journal-device-block-size>
       <journal-file-size>10M</journal-file-size>
       <journal-buffer-timeout>60000</journal-buffer-timeout>
       <journal-buffer-size>10000000</journal-buffer-size>
       <journal-max-io>2000</journal-max-io>
       <disk-scan-period>10000</disk-scan-period>
       <max-disk-usage>95</max-disk-usage>
       <critical-analyzer>true</critical-analyzer>
       <critical-analyzer-timeout>120000</critical-analyzer-timeout>
       <critical-analyzer-check-period>60000</critical-analyzer-check-period>
       <critical-analyzer-policy>HALT</critical-analyzer-policy>
       <page-sync-timeout>300000</page-sync-timeout>

       <acceptors>

           <!-- Acceptor for every supported protocol -->
           <acceptor name="artemis">tcp://0.0.0.0:61616?tcpSendBufferSize=1048576;tcpReceiveBufferSize=1048576;protocols=CORE,AMQP,STOMP,HORNETQ,MQTT,OPENWIRE;useEpoll=true;amqpCredits=1000;amqpLowCredits=300</acceptor>

           <!-- AMQP Acceptor.  Listens on default AMQP port for AMQP traffic.-->
           <acceptor name="amqp">tcp://0.0.0.0:5672?tcpSendBufferSize=1048576;tcpReceiveBufferSize=1048576;protocols=AMQP,CORE;useEpoll=true;amqpCredits=1000;amqpLowCredits=300</acceptor>

           <!-- STOMP Acceptor. -->
           <acceptor name="stomp">tcp://0.0.0.0:61613?tcpSendBufferSize=1048576;tcpReceiveBufferSize=1048576;protocols=STOMP;useEpoll=true</acceptor>

           <!-- HornetQ Compatibility Acceptor.  Enables HornetQ Core and STOMP for legacy HornetQ clients. -->
           <acceptor name="hornetq">tcp://0.0.0.0:5445?anycastPrefix=jms.queue.;multicastPrefix=jms.topic.;protocols=HORNETQ,STOMP;useEpoll=true</acceptor>

           <!-- MQTT Acceptor -->
           <acceptor name="mqtt">tcp://0.0.0.0:1883?tcpSendBufferSize=1048576;tcpReceiveBufferSize=1048576;protocols=MQTT;useEpoll=true</acceptor>

       </acceptors>

       <security-settings>
           <security-setting match="#">
               <permission type="createAddress" roles="user"/>
               <permission type="createDurableQueue" roles="user"/>
               <permission type="deleteDurableQueue" roles="user"/>
               <permission type="createNonDurableQueue" roles="user"/>
               <permission type="deleteNonDurableQueue" roles="user"/>
               <permission type="consume" roles="user"/>
               <permission type="send" roles="user"/>
           </security-setting>
       </security-settings>

       <address-settings>
           <address-setting match="*">
               <auto-create-addresses>true</auto-create-addresses>
               <auto-delete-addresses>true</auto-delete-addresses>
               <auto-delete-addresses-delay>300000</auto-delete-addresses-delay> <!-- delete auto created queues after 7 days: 604800000 -->
               <config-delete-addresses>OFF</config-delete-addresses>
               <management-browse-page-size>1000</management-browse-page-size>
               <management-message-attribute-size-limit>8192</management-message-attribute-size-limit>
           </address-setting>
           <!-- if you define auto-create on certain queues, management has to be auto-create -->
           <address-setting match="activemq.management#">
               <dead-letter-address>DLQ</dead-letter-address>
               <expiry-address>ExpiryQueue</expiry-address>
               <redelivery-delay>0</redelivery-delay>
               <!-- with -1 only the global-max-size is in use for limiting -->
               <max-size-bytes>-1</max-size-bytes>
               <message-counter-history-day-limit>10</message-counter-history-day-limit>
               <address-full-policy>PAGE</address-full-policy>
               <auto-create-queues>true</auto-create-queues>
               <auto-create-addresses>true</auto-create-addresses>
               <auto-create-jms-queues>true</auto-create-jms-queues>
               <auto-create-jms-topics>true</auto-create-jms-topics>
           </address-setting>
           <!--default for catch all-->
           <address-setting match="#">
               <dead-letter-address>DLQ</dead-letter-address>
               <expiry-address>ExpiryQueue</expiry-address>
               <redelivery-delay>0</redelivery-delay>
               <!-- with -1 only the global-max-size is in use for limiting -->
               <max-size-bytes>-1</max-size-bytes>
               <message-counter-history-day-limit>10</message-counter-history-day-limit>
               <address-full-policy>PAGE</address-full-policy>
               <auto-create-queues>true</auto-create-queues>
               <auto-create-addresses>true</auto-create-addresses>
               <auto-create-jms-queues>true</auto-create-jms-queues>
               <auto-create-jms-topics>true</auto-create-jms-topics>
           </address-setting>
       </address-settings>

       <addresses>
           <address name="DLQ">
               <anycast>
                   <queue name="DLQ" />
               </anycast>
           </address>
           <address name="ExpiryQueue">
               <anycast>
                   <queue name="ExpiryQueue" />
               </anycast>
           </address>
       </addresses>

   </core>
</configuration>`;

export const activemqBrokerConfiguration = `<beans
  xmlns="http://www.springframework.org/schema/beans"
  xmlns:amq="http://activemq.apache.org/schema/core"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
  http://activemq.apache.org/schema/core http://activemq.apache.org/schema/core/activemq-core.xsd">

    <!-- Allows us to use system properties as variables in this configuration file
    <bean class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
        <property name="locations">
            <value>file:$\{activemq.conf}/credentials.properties</value>
        </property>
    </bean>-->

    <!--
        The <broker> element is used to configure the ActiveMQ broker.
    -->
    <broker xmlns="http://activemq.apache.org/schema/core" brokerName="localhost" useJmx="true" dataDirectory="$\{activemq.data}">

        <!--
            For better performances use VM cursor and small memory limit.
            For more information, see:

            http://activemq.apache.org/message-cursors.html

            Also, if your producer is "hanging", it's probably due to producer flow control.
            For more information, see:
            http://activemq.apache.org/producer-flow-control.html
        -->

        <destinationPolicy>
            <policyMap>
              <policyEntries>
                <policyEntry topic=">" producerFlowControl="true">
                    <!-- The constantPendingMessageLimitStrategy is used to prevent
                         slow topic consumers to block producers and affect other consumers
                         by limiting the number of messages that are retained
                         For more information, see:

                         http://activemq.apache.org/slow-consumer-handling.html

                    -->
                  <pendingMessageLimitStrategy>
                    <constantPendingMessageLimitStrategy limit="1000"/>
                  </pendingMessageLimitStrategy>
                </policyEntry>
                <policyEntry queue=">" producerFlowControl="true" memoryLimit="1mb">
                  <!-- Use VM cursor for better latency
                       For more information, see:

                       http://activemq.apache.org/message-cursors.html

                  <pendingQueuePolicy>
                    <vmQueueCursor/>
                  </pendingQueuePolicy>
                  -->
                </policyEntry>
              </policyEntries>
            </policyMap>
        </destinationPolicy>


        <!--
            The managementContext is used to configure how ActiveMQ is exposed in
            JMX. By default, ActiveMQ uses the MBean server that is started by
            the JVM. For more information, see:

            http://activemq.apache.org/jmx.html
        -->
        <managementContext>
            <managementContext createConnector="false"/>
        </managementContext>

        <!--
            Configure message persistence for the broker. The default persistence
            mechanism is the KahaDB store (identified by the kahaDB tag).
            For more information, see:

            http://activemq.apache.org/persistence.html
        -->
        <persistenceAdapter>
            <kahaDB directory="$\{activemq.data}/kahadb"/>
        </persistenceAdapter>


          <!--
            The systemUsage controls the maximum amount of space the broker will
            use before slowing down producers. For more information, see:
            http://activemq.apache.org/producer-flow-control.html
            If using ActiveMQ embedded - the following limits could safely be used:

        <systemUsage>
            <systemUsage>
                <memoryUsage>
                    <memoryUsage limit="20 mb"/>
                </memoryUsage>
                <storeUsage>
                    <storeUsage limit="1 gb"/>
                </storeUsage>
                <tempUsage>
                    <tempUsage limit="100 mb"/>
                </tempUsage>
            </systemUsage>
        </systemUsage>
        -->
          <systemUsage>
            <systemUsage>
                <memoryUsage>
                    <memoryUsage limit="64 mb"/>
                </memoryUsage>
                <storeUsage>
                    <storeUsage limit="100 gb"/>
                </storeUsage>
                <tempUsage>
                    <tempUsage limit="50 gb"/>
                </tempUsage>
            </systemUsage>
        </systemUsage>

        <!--
            The transport connectors expose ActiveMQ over a given protocol to
            clients and other brokers. For more information, see:

            http://activemq.apache.org/configuring-transports.html
        -->
        <transportConnectors>
            <!-- DOS protection, limit concurrent connections to 1000 and frame size to 100MB -->
            <transportConnector name="openwire" uri="tcp://0.0.0.0:61616?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
        </transportConnectors>

        <!-- destroy the spring context on shutdown to stop jetty -->
        <shutdownHooks>
            <bean xmlns="http://www.springframework.org/schema/beans" class="org.apache.activemq.hooks.SpringContextHook" />
        </shutdownHooks>

    </broker>

    <!--
        Enable web consoles, REST and Ajax APIs and demos

        Take a look at $\{ACTIVEMQ_HOME}/conf/jetty.xml for more details

    <import resource="jetty.xml"/>
    -->

</beans>`;

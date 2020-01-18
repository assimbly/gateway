import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IBroker } from 'app/shared/model/broker.model';
import { BrokerService } from './broker.service';

import 'brace';
import 'brace/mode/xml';
import 'brace/theme/eclipse';
import { AceConfigInterface } from "ngx-ace-wrapper/dist";

@Component({
    selector: 'jhi-broker-update',
    templateUrl: './broker-update.component.html'
})
export class BrokerUpdateComponent implements OnInit {

    broker: IBroker;
    brokerConfiguration: String;
    artemisConfiguration: String;
    activemqConfiguration: String;
    brokerConfigurationFailed: String;
    isSaving: boolean;

    namePopoverMessage: string;
    autostartPopoverMessage: string;
    typePopoverMessage: string;
    configurationTypePopoverMessage: string;
    brokerConfigurationPopoverMessage: string;

public config: AceConfigInterface = {
        mode: 'xml',
        theme: 'eclipse'
      };

    constructor(protected brokerService: BrokerService, protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.isSaving = false;
        this.setPopoverMessages();
        this.setDefaultConfiguration();
        this.activatedRoute.data.subscribe(({ broker }) => {
            this.broker = broker;
            if (this.broker.id !== undefined){
                this.brokerService.getBrokerConfiguration(this.broker.id).subscribe(brokerConfiguration => {
                    if(this.broker.type==='artemis'){
                        this.artemisConfiguration = brokerConfiguration.body;
                        this.brokerConfiguration = brokerConfiguration.body;
                    }else{
                        this.activemqConfiguration = brokerConfiguration.body;
                        this.brokerConfiguration = brokerConfiguration.body;
                    }
                    
                });
            }else{
                this.broker.autoStart = true;
                this.broker.type = 'artemis';
                this.broker.configurationType = 'file';
                this.brokerConfiguration = this.artemisConfiguration;
            }
        });
    }

    setDefaultConfiguration(){
        //vkbeautify.xml(text [,indent_pattern]);

        /*
        this.artemisConfiguration = this.formatXml('<?xml version="1.0"?><!-- Example broker.xml --><configuration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="urn:activemq" xsi:schemaLocation="urn:activemq /schema/artemis-server.xsd"><core xmlns="urn:activemq:core"><persistence-enabled>false</persistence-enabled><cluster-user>myUsername2</cluster-user><cluster-password>myPassword2</cluster-password><acceptors><acceptor name="in-vm">vm://0</acceptor><acceptor name="tcp">tcp://127.0.0.1:61616</acceptor></acceptors><security-settings>' +
        '<security-setting match="#"><permission type="createAddress" roles="user"/><permission type="createDurableQueue" roles="user"/><permission type="deleteDurableQueue" roles="user"/><permission type="createNonDurableQueue" roles="user"/><permission type="deleteNonDurableQueue" roles="user"/><permission type="consume" roles="user"/> <permission type="send" roles="user"/></security-setting></security-settings></core></configuration>');
        */

        
        this.artemisConfiguration = this.formatXml('<?xml version="1.0"?><!-- Example broker.xml --><configuration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="urn:activemq" xsi:schemaLocation="urn:activemq /schema/artemis-server.xsd"><core xmlns="urn:activemq:core"><persistence-enabled>false</persistence-enabled><cluster-user>myUsername2</cluster-user><cluster-password>myPassword2</cluster-password><acceptors><acceptor name="in-vm">vm://0</acceptor><acceptor name="tcp">tcp://127.0.0.1:61616</acceptor></acceptors><security-settings>' +
        '<security-setting match="#"><permission type="createAddress" roles="user"/><permission type="createDurableQueue" roles="user"/><permission type="deleteDurableQueue" roles="user"/><permission type="createNonDurableQueue" roles="user"/><permission type="deleteNonDurableQueue" roles="user"/><permission type="consume" roles="user"/> <permission type="send" roles="user"/></security-setting></security-settings></core></configuration>');


        this.activemqConfiguration = this.formatXml(`<beans xmlns="http://www.springframework.org/schema/beans" xmlns:amq="http://activemq.apache.org/schema/core" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://activemq.apache.org/schema/core http://activemq.apache.org/schema/core/activemq-core.xsd"><!-- Allows us to use system properties as variables in this configuration file <bean class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer"><property name="locations"><value>file:$\{activemq.conf}/credentials.properties</value></property></bean>--><!-- The <broker> element is used to configure the ActiveMQ broker. --> 
                                                    <broker xmlns="http://activemq.apache.org/schema/core" brokerName="localhost" useJmx="true" dataDirectory="$\{activemq.data}"><!-- For better performances use VM cursor and small memory limit. For more information, see: http://activemq.apache.org/message-cursors.html Also, if your producer is "hanging", its probably due to producer flow control. For more information, see: http://activemq.apache.org/producer-flow-control.html --><destinationPolicy><policyMap><policyEntries><policyEntry topic=">" producerFlowControl="true"><!-- The constantPendingMessageLimitStrategy is used to prevent slow topic consumers to block producers and affect other consumers by limiting the number of messages that are retained For more information, see: http://activemq.apache.org/slow-consumer-handling.html --><pendingMessageLimitStrategy><constantPendingMessageLimitStrategy limit="1000"/></pendingMessageLimitStrategy></policyEntry><policyEntry queue=">" producerFlowControl="true" memoryLimit="1mb"><!-- Use VM cursor for better latency For more information, see: http://activemq.apache.org/message-cursors.html<pendingQueuePolicy><vmQueueCursor/></pendingQueuePolicy>-->
                                                    </policyEntry></policyEntries></policyMap></destinationPolicy><!-- The managementContext is used to configure how ActiveMQ is exposed in JMX. By default, ActiveMQ uses the MBean server that is started by the JVM. For more information, see: http://activemq.apache.org/jmx.html --><managementContext><managementContext createConnector="false"/></managementContext><!-- Configure message persistence for the broker. The default persistence mechanism is the KahaDB store (identified by the kahaDB tag). For more information, see: http://activemq.apache.org/persistence.html --><persistenceAdapter><kahaDB directory="$\{activemq.data}/kahadb"/></persistenceAdapter><!-- The systemUsage controls the maximum amount of space the broker will use before slowing down producers. For more information, see: http://activemq.apache.org/producer-flow-control.html If using ActiveMQ embedded - the following limits could safely be used:<systemUsage><systemUsage><memoryUsage><memoryUsage limit="20 mb"/></memoryUsage><storeUsage><storeUsage limit="1 gb"/></storeUsage><tempUsage><tempUsage limit="100 mb"/></tempUsage></systemUsage></systemUsage>--><systemUsage><systemUsage><memoryUsage><memoryUsage limit="64 mb"/></memoryUsage><storeUsage><storeUsage limit="100 gb"/></storeUsage><tempUsage><tempUsage limit="50 gb"/></tempUsage></systemUsage></systemUsage><!-- The transport connectors expose ActiveMQ over a given protocol to clients and other brokers. For more information, see: http://activemq.apache.org/configuring-transports.html --><transportConnectors><!-- DOS protection, limit concurrent connections to 1000 and frame size to 100MB --><transportConnector name="openwire" uri="tcp://0.0.0.0:61616?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/></transportConnectors><!-- destroy the spring context on shutdown to stop jetty --><shutdownHooks><bean xmlns="http://www.springframework.org/schema/beans" class="org.apache.activemq.hooks.SpringContextHook" /></shutdownHooks></broker>
                                                    <!-- Enable web consoles, REST and Ajax APIs and demos Take a look at $\{ACTIVEMQ_HOME}/conf/jetty.xml for more details<import resource="jetty.xml"/>--></beans>`);
    }

    
    formatXml(xml){
        var out = "";
        var tab = "    ";
        var indent = 0;
        var inClosingTag=false;
        var dent=function(no){
            out += "\n";
            for(var i=0; i < no; i++)
                out+=tab;
        }


        for (var i=0; i < xml.length; i++) {
            var c = xml.charAt(i);
            if(c=='<'){
                // handle </
                if(xml.charAt(i+1) == '/'){
                    inClosingTag = true;
                    dent(--indent);
                }
                out+=c;
            }else if(c=='>'){
                out+=c;
                // handle />
                if(xml.charAt(i-1) == '/'){
                    out+="\n";
                    //dent(--indent)
                }else{
                  if(!inClosingTag)
                    dent(++indent);
                  else{
                    out+="\n";
                    inClosingTag=false;
                  }
                }
            }else{
              out+=c;
            }
        }
        return out;
    }
    
    formatXml2(xml) { // tab = optional indent value, default is tab (\t)
        var formatted = '', indent= '';
        var tab = '\t';
        xml.split(/>\s*</).forEach(function(node) {
            if (node.match( /^\/\w/ )) indent = indent.substring(tab.length); // decrease indent by one 'tab'
            formatted += indent + '<' + node + '>\r\n';
            if (node.match( /^<?\w[^>]*[^\/]$/ )) indent += tab;              // increase indent
        });
        return formatted.substring(1, formatted.length-3);
    }
    
    previousState() {
        window.history.back();
    }

    save() {

        this.brokerConfigurationFailed = '';
        
        if (this.broker.configurationType === 'file' && this.broker.id !== undefined) {
            this.brokerService.setBrokerConfiguration(this.broker.id, this.brokerConfiguration).subscribe(response => {
                this.isSaving = true;
                this.subscribeToSaveResponse(this.brokerService.update(this.broker));
            },err => {
                this.isSaving = false;
                this.brokerConfigurationFailed = err.error;
            });
        }else if(this.broker.configurationType === 'file'){
            this.isSaving = true;
            this.subscribeToCreateResponse(this.brokerService.create(this.broker));
        }else{     
            this.isSaving = true;
            if (this.broker.id !== undefined) {
                this.subscribeToSaveResponse(this.brokerService.update(this.broker));
            } else {
                this.subscribeToSaveResponse(this.brokerService.create(this.broker));
            }
        }

    }
    
    onTypeChange(brokerType) {
        
        console.log('brokerType=' + brokerType);
        if(brokerType==='classic'){
            this.artemisConfiguration = this.brokerConfiguration;
            this.brokerConfiguration = this.activemqConfiguration; 
        }else{
            this.activemqConfiguration = this.brokerConfiguration;
            this.brokerConfiguration = this.artemisConfiguration;            
        }
        
    }
    

    setPopoverMessages() {
        this.namePopoverMessage = `Name of the broker. Usually the same as the gateway name.`;
        this.autostartPopoverMessage = `If true then the broker starts automatically when the gateway starts.`;
        this.typePopoverMessage = `The ActiveMQ broker to use. Either ActiveMQ Classic (5.x) or ActiveMQ Artemis. Artemis is default`;        
        this.configurationTypePopoverMessage = `The type of configuration. Embedded starts a broker as localhost (for quick testing), File is default.`;
        this.brokerConfigurationPopoverMessage = `The broker file (activemq.xml for Classic and broker.xml for Artemis). When the configuration is empty than a default file is created. Check the ActiveMQ documentation how to configure the brokers.`;
    }
    
    
    protected subscribeToSaveResponse(result: Observable<HttpResponse<IBroker>>) {
        result.subscribe((res: HttpResponse<IBroker>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        this.previousState();
    }

    protected onSaveError() {
        this.isSaving = false;
    }
    
    protected subscribeToCreateResponse(result: Observable<HttpResponse<IBroker>>) {
        result.subscribe((res: HttpResponse<IBroker>) => this.onCreateSuccess(res.body), (res: HttpErrorResponse) => this.onCreateError());
    }

    protected onCreateSuccess(createdBroker) {
        this.brokerService.setBrokerConfiguration(createdBroker.id, this.brokerConfiguration).subscribe(response => {
            this.isSaving = false;
            this.previousState();
        }
        ,
        (err) => {
            this.isSaving = false;
            this.brokerConfigurationFailed = err.error;
        });
     }

    protected onCreateError() {
        this.isSaving = false;
    }
    
    
}

import { Injectable } from '@angular/core'

// add a new component here

export const enum EndpointType {
    ACTIVEMQ = 'ACTIVEMQ',
    DIRECT = 'DIRECT',
    FILE = 'FILE',
    HTTP4 = 'HTTP4',
    KAFKA = 'KAFKA',
    REST = 'REST',
    SFTP = 'SFTP',
    SJMS = 'SJMS',
    SONICMQ = 'SONICMQ',
    SQL = 'SQL',
    STREAM = 'STREAM',
    VM = 'VM',
    WASTEBIN = 'WASTEBIN',
}

// add here the component documentation / links (basepaths are configured in the application.yml)

export const typesLinks = [
    {
        name: 'ACTIVEMQ',
        assimblyTypeLink: `/component-activemq`,
        camelTypeLink: `/components/camel-jms/src/main/docs/jms-component.adoc`,
        uriPlaceholder: 'destinationType:destinationName',
        uriPopoverMessage: `
        <b>Name</b>: destinationType<br/>
        <b>Description</b>: The kind of destination to use (queue or topic).<br/>
        <b>Default</b>: queue<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: Enumeration. Valid values: queue, topic<br/>
        <br/>
        <b>Name</b>: destinationName<br/>
        <b>Description</b>: Name of the queue or topic to use as destination.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Example</b>: queue:order or just order (without destinationType) / topic:order<br/>
    `
    },
    {
        name: 'DIRECT',
        assimblyTypeLink: `/component-direct`,
        camelTypeLink: `/camel-core/src/main/docs/direct-component.adoc`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>:  The name of the endpoint<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Example</b>: test<br/>
    `
    },
    {
        name: 'FILE',
        assimblyTypeLink: `/component-file`,
        camelTypeLink: `/camel-core/src/main/docs/file-component.adoc`,
        uriPlaceholder: 'directoryName',
        uriPopoverMessage: `
        <b>Name</b>: directoryName<br/>
        <b>Description</b>:  The starting directory.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: File <br/><br/>
        <b>Example</b>: /home/user/order or C:\\order<br/>
    `
    },
    {
        name: 'HTTP4',
        assimblyTypeLink: `/component-http4`,
        camelTypeLink: `/components/camel-http4/src/main/docs/http4-component.adoc`,
        uriPlaceholder: 'httpUri',
        uriPopoverMessage: `
        <b>Name</b>: httpUri<br/>
        <b>Description</b>: The url of the HTTP endpoint to call.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: URI <br/><br/>
        <b>Example</b>: http://servername:8080/orders<br/>
    `
    },
    {
        name: 'KAFKA',
        assimblyTypeLink: `/component-kafka`,
        camelTypeLink: `/components/camel-kafka/src/main/docs/kafka-component.adoc`,
        uriPlaceholder: 'topic',
        uriPopoverMessage: `
        <b>Name</b>: topic<br/>
        <b>Description</b>:  Name of the topic to use. On the from tab (a Kafka consumer) you can use comma to separate multiple topics.
            On the to and error tab (a Kafka producer) you can only send a message to a single topic.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Example</b>: test or test1,test2,test3<br/>
    `
    },
    {
        name: 'REST',
        assimblyTypeLink: `/component-rest`,
        camelTypeLink: `/camel-core/src/main/docs/rest-component.adoc`,
        uriPlaceholder: 'method:path:{uriTemplate}',
        uriPopoverMessage: `
        <b>Name</b>: method<br/>
        <b>Description</b>:  http method like get or post<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: Enumeration. Valid values: get, post, put, patch, delete, head, trace, connect, options<br/><br/>
        <b>Name</b>: path<br/>
        <b>Description</b>:  basepath or the REST url<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Name</b>: uriTemplate<br/>
        <b>Description</b>:  uri template with support for REST Syntax<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String (REST URI)<br/><br/>
        <b>Example</b>: get:test or post:test<br/>
        `
    },
    {
        name: 'SFTP',
        assimblyTypeLink: `/component-sftp`,
        camelTypeLink: `/components/camel-ftp/src/main/docs/sftp-component.adoc`,
        uriPlaceholder: 'host:port/directoryName',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: Hostname of the FTP server.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/>
        <br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: Port of the FTP server.<br/>
        <b>Required</b>: no <br/>
        <b>Default</b>: 22<br/>
        <b>Data Type</b>: int<br/>
        <br/>
        <b>Name</b>: directoryName<br/>
        <b>Description</b>: The starting directory.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
        <b>Example</b>: servername:22/dir1/subdir<br/>
    `
    },
    {
        name: 'SJMS',
        assimblyTypeLink: `/component-sjms`,
        camelTypeLink: `/components/camel-sjms/src/main/docs/sjms-component.adoc`,
        uriPlaceholder: 'destinationType:destinationName',
        uriPopoverMessage: `
        <b>Name</b>: destinationType<br/>
        <b>Description</b>: The kind of destination to use (queue or topic).<br/>
        <b>Default</b>: queue<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: Enumeration. Valid values: queue, topic<br/>
        <br/>
        <b>Name</b>: destinationName<br/>
        <b>Description</b>: The name of destination, a JMS queue or topic name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Example</b>: queue:order or just order (without destinationType) / topic:order<br/>
    `
    },
    {
        name: 'SONICMQ',
        assimblyTypeLink: `/component-sonicmq`,
        camelTypeLink: `/components/camel-sjms/src/main/docs/sjms-component.adoc`,
        uriPlaceholder: 'destinationType:destinationName',
        uriPopoverMessage: `
        <b>Name</b>: destinationType<br/>
        <b>Description</b>: The kind of destination to use (queue or topic).<br/>
        <b>Default</b>: queue<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: Enumeration. Valid values: queue, topic<br/>
        <br/>
        <b>Name</b>: destinationName<br/>
        <b>Description</b>: The name of destination, a JMS queue or topic name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Example</b>: queue:order or just order (without destinationType) / topic:order<br/>
    `
    },
    {
        name: 'SQL',
        assimblyTypeLink: `/component-sql`,
        camelTypeLink: `/components/camel-sql/src/main/docs/sql-component.adoc`,
        uriPlaceholder: 'query',
        uriPopoverMessage: `
        <b>Name</b>: query<br/>
        <b>Description</b>: Sets the SQL query to perform. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Example</b>: select id from order<br/>
    `
    },
    {
        name: 'STREAM',
        assimblyTypeLink: `/component-stream`,
        camelTypeLink: `/components/camel-stream/src/main/docs/stream-component.adoc`,
        uriPlaceholder: 'kind',
        uriPopoverMessage: `
        <b>Name</b>: kind<br/>
        <b>Description</b>: Kind of stream to use such as System.in or System.out.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Example</b>: <i>out</i> or <i>in</i> or <i>err</i><br/>
    `
    },
    {
        name: 'VM',
        assimblyTypeLink: `/component-vm`,
        camelTypeLink: `/components/camel-core/src/main/docs/vm-component.adoc`,
        uriPlaceholder: 'queueName',
        uriPopoverMessage: `
        <b>Name</b>: queueName<br/>
        <b>Description</b>: Internal queue between two flows<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Example</b>: test<br/>
    `
    },
    {
        name: 'WASTEBIN',
        assimblyTypeLink: `/component-wastebin`,
        camelTypeLink: `/camel-core/src/main/docs/mock-component.adoc`,
        uriPlaceholder: '',
        uriPopoverMessage: `
        <b>Description</b>: This set automatically the endpoint mock:wastebin<br/>
    `
    }
];

// add the component types for a specific endpoint
@Injectable()
export class Components {

    fromTypes = ['ACTIVEMQ', 'DIRECT', 'FILE', 'HTTP4', 'KAFKA', 'REST', 'SFTP', 'SJMS', 'SONICMQ', 'SQL', 'STREAM', 'VM'];
    toTypes = ['ACTIVEMQ', 'DIRECT', 'FILE', 'HTTP4', 'KAFKA', 'REST', 'SFTP', 'SJMS', 'SONICMQ', 'SQL', 'STREAM', 'VM', 'WASTEBIN'];
    errorTypes = ['ACTIVEMQ', 'FILE', 'HTTP4', 'KAFKA', 'REST', 'SFTP', 'SJMS', 'SONICMQ', 'SQL', 'STREAM'];
    wireTapTypes = ['ACTIVEMQ', 'FILE', 'HTTP4', 'KAFKA', 'REST', 'SFTP', 'SJMS', 'SONICMQ', 'SQL', 'STREAM'];

}

export const flowExamples = [
    {
        name: 'FILE',
        flowtypeFile: 'XML',
        fileExample: `
        <connectors>
        <connector>
         <id>example</id>
         <flows>
          <flow>
           <id>2</id>
              <name>example.filetofile</name>
              <from>
            <uri>file://C:/Test1</uri>
           </from>
           <to>
            <uri>file://C:/Test2</uri>
           </to>
          </flow>
          </flows>
        </connector>
       </connectors>
       `
    },
    {
        name: 'FILE',
        flowtypeFile: 'JSON',
        fileExample: `
        {
            "connectors": {
              "connector": {
                "id": "1",
                "flows": {
                  "flow": {
                    "id": "4",
                    "name": "fds",
                    "from": { "uri": "file://C:/Test1d" },
                    "to": { "uri": "file://C:/Test2e" }
                  }
                }
              }
            }
          }
       `
    },
    {
        name: 'FILE',
        flowtypeFile: 'YAML',
        fileExample: `
        {
        }
       `
    },
    {
        name: 'ACTIVEMQ',
        flowtypeFile: 'XML',
        fileExample: `
        <connectors>
        <connector>
         <id>example</id>
         <flows>
          <flow>
           <id>2</id>
              <name>example.filetofile</name>
              <from>
            <uri>file://C:/Test1</uri>
           </from>
           <to>
            <uri>file://C:/Test2</uri>
           </to>
          </flow>
          </flows>
        </connector>
       </connectors>
       `
    },
    {
        name: 'ACTIVEMQ',
        flowtypeFile: 'JSON',
        fileExample: ``
    },
    {
        name: 'ACTIVEMQ',
        flowtypeFile: 'YAML',
        fileExample: ``
    },
    {
        name: 'DIRECT',
        flowtypeFile: 'XML',
        fileExample: `
        <connectors>
        <connector>
         <id>example</id>
         <flows>
          <flow>
           <id>2</id>
              <name>example.filetofile</name>
              <from>
            <uri>file://C:/Test1</uri>
           </from>
           <to>
            <uri>file://C:/Test2</uri>
           </to>
          </flow>
        </connector>
       </connectors>
       `
    },
    {
        name: 'DIRECT',
        flowtypeFile: 'JSON',
        fileExample: ``
    },
    {
        name: 'DIRECT',
        flowtypeFile: 'YAML',
        fileExample: ``
    },
    {
        name: 'HTTP4',
        flowtypeFile: 'XML',
        fileExample: `
        <connectors>
        <connector>
         <id>example</id>
         <flows>
          <flow>
           <id>2</id>
              <name>example.filetofile</name>
              <from>
            <uri>file://C:/Test1</uri>
           </from>
           <to>
            <uri>file://C:/Test2</uri>
           </to>
          </flow>
        </connector>
       </connectors>
       `
    },
    {
        name: 'HTTP4',
        flowtypeFile: 'JSON',
        fileExample: ``
    },
    {
        name: 'HTTP4',
        flowtypeFile: 'YAML',
        fileExample: ``
    },
    {
        name: 'KAFKA',
        flowtypeFile: 'XML',
        fileExample: `
        <connectors>
        <connector>
         <id>example</id>
         <flows>
          <flow>
           <id>2</id>
              <name>example.filetofile</name>
              <from>
            <uri>file://C:/Test1</uri>
           </from>
           <to>
            <uri>file://C:/Test2</uri>
           </to>
          </flow>
        </connector>
       </connectors>
       `
    },
    {
        name: 'KAFKA',
        flowtypeFile: 'JSON',
        fileExample: ``
    },
    {
        name: 'KAFKA',
        flowtypeFile: 'YAML',
        fileExample: ``
    },
    {
        name: 'REST',
        flowtypeFile: 'XML',
        fileExample: `
        <connectors>
        <connector>
         <id>example</id>
         <flows>
          <flow>
           <id>2</id>
              <name>example.filetofile</name>
              <from>
            <uri>file://C:/Test1</uri>
           </from>
           <to>
            <uri>file://C:/Test2</uri>
           </to>
          </flow>
        </connector>
       </connectors>
       `
    },
    {
        name: 'REST',
        flowtypeFile: 'JSON',
        fileExample: ``
    },
    {
        name: 'REST',
        flowtypeFile: 'YAML',
        fileExample: ``
    },
    {
        name: 'SFTP',
        flowtypeFile: 'XML',
        fileExample: `
        <connectors>
        <connector>
         <id>example</id>
         <flows>
          <flow>
           <id>2</id>
              <name>example.filetofile</name>
              <from>
            <uri>file://C:/Test1</uri>
           </from>
           <to>
            <uri>file://C:/Test2</uri>
           </to>
          </flow>
        </connector>
       </connectors>
       `
    },
    {
        name: 'SFTP',
        flowtypeFile: 'JSON',
        fileExample: ``
    },
    {
        name: 'SFTP',
        flowtypeFile: 'YAML',
        fileExample: ``
    },
    {
        name: 'SJMS',
        flowtypeFile: 'XML',
        fileExample: `
        <connectors>
        <connector>
         <id>example</id>
         <flows>
          <flow>
           <id>2</id>
              <name>example.filetofile</name>
              <from>
            <uri>file://C:/Test1</uri>
           </from>
           <to>
            <uri>file://C:/Test2</uri>
           </to>
          </flow>
        </connector>
       </connectors>
       `
    },
    {
        name: 'SJMS',
        flowtypeFile: 'JSON',
        fileExample: ``
    },
    {
        name: 'SJMS',
        flowtypeFile: 'YAML',
        fileExample: ``
    },
    {
        name: 'SONICMQ',
        flowtypeFile: 'XML',
        fileExample: `
        <connectors>
        <connector>
         <id>example</id>
         <flows>
          <flow>
           <id>2</id>
              <name>example.filetofile</name>
              <from>
            <uri>file://C:/Test1</uri>
           </from>
           <to>
            <uri>file://C:/Test2</uri>
           </to>
          </flow>
        </connector>
       </connectors>
       `
    },
    {
        name: 'SONICMQ',
        flowtypeFile: 'JSON',
        fileExample: ``
    },
    {
        name: 'SONICMQ',
        flowtypeFile: 'YAML',
        fileExample: ``
    },
    {
        name: 'SQL',
        flowtypeFile: 'XML',
        fileExample: `
        <connectors>
        <connector>
         <id>example</id>
         <flows>
          <flow>
           <id>2</id>
              <name>example.filetofile</name>
              <from>
            <uri>file://C:/Test1</uri>
           </from>
           <to>
            <uri>file://C:/Test2</uri>
           </to>
          </flow>
        </connector>
       </connectors>
       `
    },
    {
        name: 'SQL',
        flowtypeFile: 'JSON',
        fileExample: ``
    },
    {
        name: 'SQL',
        flowtypeFile: 'YAML',
        fileExample: ``
    },
    {
        name: 'STREAM',
        flowtypeFile: 'XML',
        fileExample: `
        <connectors>
        <connector>
         <id>example</id>
         <flows>
          <flow>
           <id>2</id>
              <name>example.filetofile</name>
              <from>
            <uri>file://C:/Test1</uri>
           </from>
           <to>
            <uri>file://C:/Test2</uri>
           </to>
          </flow>
        </connector>
       </connectors>
       `
    },
    {
        name: 'STREAM',
        flowtypeFile: 'JSON',
        fileExample: ``
    },
    {
        name: 'STREAM',
        flowtypeFile: 'YAML',
        fileExample: ``
    },
    {
        name: 'VM',
        flowtypeFile: 'XML',
        fileExample: `
        <connectors>
        <connector>
         <id>example</id>
         <flows>
          <flow>
           <id>2</id>
              <name>example.filetofile</name>
              <from>
            <uri>file://C:/Test1</uri>
           </from>
           <to>
            <uri>file://C:/Test2</uri>
           </to>
          </flow>
        </connector>
       </connectors>
       `
    },
    {
        name: 'VM',
        flowtypeFile: 'JSON',
        fileExample: ``
    },
    {
        name: 'VM',
        flowtypeFile: 'YAML',
        fileExample: ``
    },
    {
        name: 'WASTEBIN',
        flowtypeFile: 'XML',
        fileExample: `
        <connectors>
        <connector>
         <id>example</id>
         <flows>
          <flow>
           <id>2</id>
              <name>example.filetofile</name>
              <from>
            <uri>file://C:/Test1</uri>
           </from>
           <to>
            <uri>file://C:/Test2</uri>
           </to>
          </flow>
        </connector>
       </connectors>
       `
    },
    {
        name: 'WASTEBIN',
        flowtypeFile: 'JSON',
        fileExample: ``
    },
    {
        name: 'WASTEBIN',
        flowtypeFile: 'YAML',
        fileExample: ``
    }
];

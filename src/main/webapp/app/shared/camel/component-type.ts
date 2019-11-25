import { Injectable } from '@angular/core';

// add a new component here
// 1) Add to the EndpointType list
// 2) Add to typelinks for live documentation
// 3) Add to differentEndpoint type (from/to/error)

export enum EndpointType {
    ACTIVEMQ = 'ACTIVEMQ',
    AS2 = 'AS2',
    DIRECT = 'DIRECT',
    ELASTICSEARCH = 'ELASTICSEARCH',
    FILE = 'FILE',
    FTP = 'FTP',
    FTPS = 'FTPS',
    HTTP = 'HTTP',
    HTTPS = 'HTTPS',    
    IMAP = 'IMAP',
    IMAPS = 'IMAPS',
    JETTY = 'JETTY',
    NETTY4 = 'NETTY4',
    KAFKA = 'KAFKA',
    RABBITMQ = 'RABBITMQ',
    REST = 'REST',
    SFTP = 'SFTP',
    SJMS = 'SJMS',
    SLACK = 'SLACK',
    SMTP = 'SMTP',
    SMTPS = 'SMTP3',
    SONICMQ = 'SONICMQ',
    SQL = 'SQL',
    STREAM = 'STREAM',
    TELEGRAM = 'TELEGRAM',
    VM = 'VM',
    WASTEBIN = 'WASTEBIN',
    WEBSOCKET = 'WEBSOCKET',
}

// add here the component documentation / links (basepaths are configured in the application.yml)

export const typesLinks = [
    {
        name: 'ACTIVEMQ',
        assimblyTypeLink: `/component-activemq`,
        camelTypeLink: `/activemq-component.html`,
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
        name: 'AS2',
        assimblyTypeLink: `/component-as2`,
        camelTypeLink: `/as2-component.html`,
        uriPlaceholder: 'apiName/methodName',
        uriPopoverMessage: `
        <b>Name</b>: as2<br/>
        <b>Description</b>:  The name of the endpoint<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: apiName<br/>
        <b>Description</b>:  The name of the api [client, server]<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: methodName<br/>
        <b>Description</b>:  The name of the api-call<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'DIRECT',
        assimblyTypeLink: `/component-direct`,
        camelTypeLink: `/direct-component.html`,
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
        name: 'ELASTICSEARCH',
        assimblyTypeLink: `/component-elasticsearch`,
        camelTypeLink: `/elasticsearch-rest-component.html`,
        uriPlaceholder: 'clusterName',
        uriPopoverMessage: `
        <b>Name</b>: Elasticsearch-rest<br/>
        <b>Description</b>:  The name of the endpoint<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: clusterName<br/>
        <b>Description</b>:  The name of the cluster<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'FILE',
        assimblyTypeLink: `/component-file`,
        camelTypeLink: `/file-component.html`,
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
        name: 'FTP',
        assimblyTypeLink: `/component-ftp`,
        camelTypeLink: `/ftp-component.html`,
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
        <b>Default</b>: 21<br/>
        <b>Data Type</b>: int<br/>
        <br/>
        <b>Name</b>: directoryName<br/>
        <b>Description</b>: The starting directory.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
        <b>Example</b>: servername:21/dir1/subdir<br/>
    `
    },
    {
        name: 'FTPS',
        assimblyTypeLink: `/component-ftps`,
        camelTypeLink: `/ftps-component.html`,
        uriPlaceholder: 'host:port/directoryName',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: Hostname of the FTPS server.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/>
        <br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: Port of the FTP server.<br/>
        <b>Required</b>: no <br/>
        <b>Default</b>: No default, but commonly runs on port 990 and sometimes on port 21<br/>
        <b>Data Type</b>: int<br/>
        <br/>
        <b>Name</b>: directoryName<br/>
        <b>Description</b>: The starting directory.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
        <b>Example</b>: servername:990/dir1/subdir<br/>
    `
    },
    {
        name: 'HTTP',
        assimblyTypeLink: `/component-http`,
        camelTypeLink: `/http-component.html`,
        uriPlaceholder: 'httpUri',
        uriPopoverMessage: `
        <b>Name</b>: httpUri<br/>
        <b>Description</b>: The url of the HTTP endpoint to call.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: URI <br/><br/>
        <b>Example</b>: servername:8080/orders (without http://)<br/>
    `
    },
    {
        name: 'HTTPS',
        assimblyTypeLink: `/component-http`,
        camelTypeLink: `/http-component.html`,
        uriPlaceholder: 'httpUri',
        uriPopoverMessage: `
        <b>Name</b>: httpUri<br/>
        <b>Description</b>: The url of the HTTPS endpoint to call.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: URI <br/><br/>
        <b>Example</b>: servername:443/orders  (without https://)<br/>
    `
    },
    {
        name: 'IMAP',
        assimblyTypeLink: `/component-imap`,
        camelTypeLink: `/mail-component.html`,
        uriPlaceholder: 'host[:port]',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>:  Mail server<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
		<b>Name</b>: port<br/>
        <b>Description</b>: Network port<br/>
        <b>Default</b>: 143<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: Integer <br/><br/>
        <b>Example</b>: localhost:143<br/>
    `
    },
    {
        name: 'IMAPS',
        assimblyTypeLink: `/component-imap`,
        camelTypeLink: `/mail-component.html`,
        uriPlaceholder: 'host[:port]',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>:  Mail server over SSL<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
		<b>Name</b>: port<br/>
        <b>Description</b>: Network port<br/>
        <b>Default</b>: 993<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: Integer <br/><br/>
        <b>Example</b>: localhost:993<br/>
    `
    },
    {
        name: 'JETTY',
        assimblyTypeLink: `/component-jetty`,
        camelTypeLink: `/jetty-component.html`,
        uriPlaceholder: 'httpUri',
        uriPopoverMessage: `
        <b>Name</b>: httpUri<br/>
        <b>Description</b>: The url of the HTTP(S) endpoint to call.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: URI <br/><br/>
        <b>Example</b>: http://servername:8080/orders<br/>
    `
    },
    {
        name: 'KAFKA',
        assimblyTypeLink: `/component-kafka`,
        camelTypeLink: `/kafka-component.html`,
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
        name: 'NETTY4',
        assimblyTypeLink: `/component-netty4`,
        camelTypeLink: `/netty-component.html`,
        uriPlaceholder: 'transport://hostname:port',
        uriPopoverMessage: `
        <b>Name</b>: transport<br/>
        <b>Description</b>: The network protocol to use (tcp or udp)<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: Enumeration. Valid values: tcp, udp<br/>
        <br/>
        <b>Name</b>: hostname<br/>
        <b>Description</b>: Name of the server.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: Network port<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: Integer <br/><br/>
        <b>Example</b>: tcp://localhost:9999<br/>
    `
    },
    {
        name: 'RABBITMQ',
        assimblyTypeLink: `/component-rabbitmq`,
        camelTypeLink: `/rabbitmq-component.html`,
        uriPlaceholder: 'hostname[:port]/exchangeName',
        uriPopoverMessage: `
        <b>Name</b>: rabbitmq<br/>
        <b>Description</b>:  The name of the endpoint<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: hostname<br/>
        <b>Description</b>:  The hostname of the running rabbitmq instance or cluster.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: port<br/>
        <b>Description</b>:  Port is optional and if not specified then defaults to the RabbitMQ client default (5672)<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: Integer <br/><br/>
        <b>Name</b>: exchangeName<br/>
        <b>Description</b>:  The exchange name determines which exchange produced messages will sent to.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'REST',
        assimblyTypeLink: `/component-rest`,
        camelTypeLink: `/rest-component.html`,
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
        camelTypeLink: `/sftp-component.html`,
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
        camelTypeLink: `/sjms-component.html`,
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
        name: 'SLACK',
        assimblyTypeLink: `/component-slack`,
        camelTypeLink: `/slack-component.html`,
        uriPlaceholder: '#channel',
        uriPopoverMessage: `
        <b>Name</b>: Slack<br/>
        <b>Description</b>:  The name of the instance of Slack<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: channel<br/>
        <b>Description</b>: Channel is like a “room” for discussions (ex. topic, discussion, team)<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: Integer <br/><br/>
        <b>Example</b>: ?<br/>
    `
    },
    {
        name: 'SMTP',
        assimblyTypeLink: `/component-smtp`,
        camelTypeLink: `/mail-component.html`,
        uriPlaceholder: 'host[:port]',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>:  Mail server<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
		<b>Name</b>: port<br/>
        <b>Description</b>: Network port<br/>
        <b>Default</b>: 25<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: Integer <br/><br/>
        <b>Example</b>: localhost:143<br/>
    `
    },
    {
        name: 'SMTPS',
        assimblyTypeLink: `/component-smtp`,
        camelTypeLink: `/mail-component.html`,
        uriPlaceholder: 'host[:port]',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>:  Mail server over SSL<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
		<b>Name</b>: port<br/>
        <b>Description</b>: Network port<br/>
        <b>Default</b>: 465<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: Integer <br/><br/>
        <b>Example</b>: localhost:993<br/>
    `
    },
    {
        name: 'SONICMQ',
        assimblyTypeLink: `/component-sonicmq`,
        camelTypeLink: `/sjms-component.html`,
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
        camelTypeLink: `/sql-component.html`,
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
        camelTypeLink: `/stream-component.html`,
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
        name: 'TELEGRAM',
        assimblyTypeLink: `/component-telegram`,
        camelTypeLink: `/telegram-component.html`,
        uriPlaceholder: 'type/authorizationToken',
        uriPopoverMessage: `
        <b>Name</b>: type<br/>
        <b>Description</b>: Type of endpoint (currently only bots is supported)<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: authorizationToken<br/>
        <b>Description</b>: The authorization token for using the bot<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: Token <br/><br/>
        <b>Example</b>: bots/123456789:AAE_dLq5C19xwGjw3yiC2NvEUrZcejK21-Q987654321:AAE_dLq5C19xwOmg5yiC2NvSrkT3wj5Q1-L<br/>
    `
    },
    {
        name: 'VM',
        assimblyTypeLink: `/component-vm`,
        camelTypeLink: `/vm-component.html`,
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
        camelTypeLink: `/mock-component.html`,
        uriPlaceholder: '',
        uriPopoverMessage: `
        <b>Description</b>: This set automatically the endpoint mock:wastebin<br/>
    `
    },
    {
        name: 'WEBSOCKET',
        assimblyTypeLink: `/component-websocket`,
        camelTypeLink: `/websocket-component.html`,
        uriPlaceholder: 'host:port/resourceUri',
        uriPopoverMessage: `
        <b>Name</b>: hostname<br/>
        <b>Description</b>: The hostname. The default value is 0.0.0.0. Setting this option on the component will use the component configured value as default.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: The port number. The default value is 9292. Setting this option on the component will use the component configured value as default.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: Integer<br/><br/>
        <b>Name</b>: resourceUri<br/>
        <b>Description</b>: Required Name of the websocket channel to use<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Name</b>: options<br/>
        <b>Description</b>: The Jetty Websocket component supports 14 options<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Example</b>: //hostname[:port][/resourceUri][?options]<br/>
    `
    }
];

// add the component types for a specific endpoint
@Injectable()
export class Components {

    fromTypes = ['ACTIVEMQ', 'AS2', 'DIRECT', 'ELASTICSEARCH', 'FILE', 'FTP', 'FTPS', 'HTTP', 'HTTPS', 'IMAP', 'IMAPS', 'JETTY', 'NETTY4', 'KAFKA', 'RABBITMQ', 'REST', 'SFTP', 'SJMS', 'SLACK',
                 'SMTPS', 'SMTP', 'SONICMQ', 'SQL', 'STREAM', 'TELEGRAM', 'VM', 'WEBSOCKET'];

    toTypes = ['ACTIVEMQ', 'AS2', 'DIRECT', 'ELASTICSEARCH', 'FILE', 'FTP', 'FTPS', 'HTTP', 'HTTPS', 'IMAP', 'IMAPS', 'JETTY', 'NETTY4', 'KAFKA', 'RABBITMQ', 'REST', 'SFTP', 'SJMS', 'SLACK',
               'SMTPS', 'SMTP', 'SMTPS', 'SONICMQ', 'SQL', 'STREAM', 'TELEGRAM', 'VM', 'WASTEBIN', 'WEBSOCKET'];

    errorTypes = ['ACTIVEMQ', 'AS2', 'ELASTICSEARCH', 'FILE', 'FTP', 'FTPS', 'HTTP', 'HTTPS', 'IMAP', 'IMAPS', 'JETTY', 'NETTY4', 'KAFKA', 'RABBITMQ', 'REST', 'SFTP', 'SJMS', 'SLACK', 'SMTP', 'SMTPS', 'SONICMQ', 'SQL', 'TELEGRAM', 'STREAM', 'WEBSOCKET'];

    wireTapTypes = ['ACTIVEMQ', 'ELASTICSEARCH', 'FILE', 'FTPS', 'FTP', 'HTTP', 'HTTPS', 'IMAP', 'IMAPS', 'NETTY4', 'KAFKA', 'RABBITMQ', 'REST', 'SFTP', 'SJMS', 'SONICMQ', 'SQL', 'STREAM', 'WEBSOCKET'];
}

export const flowExamples = [
    {
        name: 'ACTIVEMQ',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>example</id>
        <flows>
            <!-- this flow only work for a broker gateway -->
            <flow>
                <id>100</id>
                <name>example.filetoactivemq</name>
                <from>
                    <uri>file://C:/file1</uri>
                </from>
                <to>
                    <uri>activemq:queue:test</uri>
                </to>
                <error>
                    <uri>file://C:/file3</uri>
                </error>
            </flow>
        </flows>
    </connector>
</connectors>`
    },
    {
        name: 'ACTIVEMQ',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/file3"
          },
          "from": {
            "uri": "file://C:/file1"
          },
          "id": 101,
          "to": {
            "uri": "activemq:queue:test"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {}
    }
  }
}`
    },
    {
        name: 'ACTIVEMQ',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/file1"
        id: 102
        to:
          uri: "activemq:queue:test"
        type: "default"
        error:
          uri: "file://C:/file3"
    id: "live"
    services: {}`
    },
    {
        name: 'DIRECT',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>example</id>
        <flows>
            <!-- to check this example, it's best to try both flows -->
            <flow>
                <id>110</id>
                <name>example.filetodirect</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>direct:test</uri>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
            <flow>
                <id>111</id>
                <name>example.directtofile</name>
                <from>
                    <uri>direct:test</uri>
                </from>
                <to>
                    <uri>file://C:/to</uri>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
    </connector>
</connectors>`
    },
    {
        name: 'DIRECT',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 112,
          "to": {
            "uri": "direct:test"
          },
          "type": "default"
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "direct:test"
          },
          "id": 113,
          "to": {
            "uri": "file://C:/to"
          },
            "type": "default"
          }
      },
      "headers": {},
      "id": "live",
      "services": {}
    }
  }
}`
    },
    {
        name: 'DIRECT',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 114
        to:
          uri: "direct:test"
        type: "default"
        error:
          uri: "file://C:/error"
      flow:
        from:
          uri: "direct:test"
        id: 115
        to:
          uri: "file://C:/to"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services: {}`
    }, {
        name: 'FILE',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>live</id>
        <flows>
            <!-- example for windows, you need create the directories on your local machine -->
            <flow>
                <id>120</id>
                <name>example.filetofile</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>file://C:/to</uri>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
    </connector>
</connectors>`
    },
    {
        name: 'FILE',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 121,
          "to": {
            "uri": "file://C:/to"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {}
    }
  }
}`
    },
    {
        name: 'FILE',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 122
        to:
          uri: "file://C:/to"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services: {}`
    },
    {
        name: 'FTP',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>example</id>
        <flows>
            <!-- example from local directory to some FTP location -->
            <flow>
                <id>190</id>
                <name>example.filetoftp</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>ftp://username@server/directory</uri>
                    <options>
                        <password>secret</password>
                    </options>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
    </connector>
</connectors>`
    },
    {
        name: 'FTP',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 191,
          "to": {
            "options": {
              "password": "secret"
            },
            "uri": "ftp://username@server/directory"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {}
    }
  }
}`
    },
    {
        name: 'FTP',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 192
        to:
          options:
            password: "secret"
          uri: "ftp://username@server/directory"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services: {}`
    },
    {
        name: 'FTPS',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>example</id>
        <flows>
            <!-- example from local directory to some FTPS location -->
            <flow>
                <id>190</id>
                <name>example.filetoftps</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>ftps://username@server/directory</uri>
                    <options>
                        <password>secret</password>
                    </options>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
    </connector>
</connectors>`
    },
    {
        name: 'FTPS',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 191,
          "to": {
            "options": {
              "password": "secret"
            },
            "uri": "ftps://username@server/directory"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {}
    }
  }
}`
    },
    {
        name: 'FTPS',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 192
        to:
          options:
            password: "secret"
          uri: "ftps://username@server/directory"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services: {}`
    },
    {
        name: 'HTTP',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>example</id>
        <flows>
            <!-- Send file to local url -->
            <flow>
                <id>130</id>
                <name>example.filetohttp</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>http://localhost:8080/test</uri>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
    </connector>
</connectors>`
    },
    {
        name: 'HTTP',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 131,
          "to": {
            "uri": "http://localhost:8080/test"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {}
    }
  }
}`
    },
    {
        name: 'HTTP',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 132
        to:
          uri: "http://localhost:8080/test"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services: {}`
    },
    {
        name: 'IMAP',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>live</id>
        <flows>
            <!-- Send file to local mail server -->
            <flow>
                <id>140</id>
                <name>example.filetoimap</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>imap:localhost</uri>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
    </connector>
</connectors>`

    },
    {
        name: 'IMAP',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 141,
          "to": {
            "uri": "imap:localhost"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {}
    }
  }
}`
    },
    {
        name: 'IMAP',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 142
        to:
          uri: "imap:localhost"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services: {}`
    }
    ,
    {
        name: 'IMAPS',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>live</id>
        <flows>
            <!-- Send file to local mail server with SSL -->
            <flow>
                <id>150</id>
                <name>example.filetoimaps</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>imaps:localhost</uri>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
    </connector>
</connectors>`

    },
    {
        name: 'IMAPS',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 151,
          "to": {
            "uri": "imaps:localhost"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {}
    }
  }
}`
    },
    {
        name: 'IMAPS',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 152
        to:
          uri: "imaps:localhost"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services: {}`
    },
    {
        name: 'KAFKA',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>example</id>
        <flows>
            <!-- Send file to a local Kafka broker with a topich named: test -->
            <flow>
                <id>160</id>
                <name>example.filetokafka</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>kafka:test</uri>
                    <options>
                        <brokers>localhost:9092</brokers>
                    </options>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
    </connector>
</connectors>`
    },
    {
        name: 'KAFKA',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 161,
          "to": {
            "options": {
              "brokers": "localhost:9092"
            },
            "uri": "kafka:test"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {}
    }
  }
}`
    },
    {
        name: 'KAFKA',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 162
        to:
          options:
            brokers: "localhost:9092"
          uri: "kafka:test"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services: {}`
    },
    {
        name: 'NETTY4',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>example</id>
        <flows>
            <!-- Send file to local url -->
            <flow>
                <id>170</id>
                <name>example.filetohttp</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>netty4://localhost:8080/test</uri>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
    </connector>
</connectors>`

    },
    {
        name: 'NETTY4',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 171,
          "to": {
            "uri": "netty4://localhost:8080/test"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {}
    }
  }
}`
    },
    {
        name: 'NETTY4',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 172
        to:
          uri: "netty4://localhost:8080/test"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services: {}`
    },
    {
        name: 'REST',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>example</id>
        <flows>
            <!-- http get from basepaht test -->
            <flow>
                <id>180</id>
                <name>example.filetorest</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>tcp://localhost:9999</uri>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
    </connector>
</connectors>`
    },
    {
        name: 'REST',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 181,
          "to": {
            "uri": "tcp://localhost:9999"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {}
    }
  }
}`
    },
    {
        name: 'REST',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 182
        to:
          uri: "tcp://localhost:9999"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services: {}`
    },
    {
        name: 'SFTP',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>example</id>
        <flows>
            <!-- example from local directory to some SFTP location -->
            <flow>
                <id>190</id>
                <name>example.filetosftp</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>sftp://username@server/directory</uri>
                    <options>
                        <password>secret</password>
                    </options>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
    </connector>
</connectors>`
    },
    {
        name: 'SFTP',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 191,
          "to": {
            "options": {
              "password": "secret"
            },
            "uri": "sftp://username@server/directory"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {}
    }
  }
}`
    },
    {
        name: 'SFTP',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 192
        to:
          options:
            password: "secret"
          uri: "sftp://username@server/directory"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services: {}`
    },
    {
        name: 'SJMS',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>example</id>
        <flows>
            <!-- example from local directory to JMS queue -->
            <flow>
                <id>200</id>
                <name>example.filetosjms</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>sjms:queue:test</uri>
                    <service_id>2000</service_id>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
        <services>
            <service>
                <id>2000</id>
                <name>localbroker</name>
                <username>Administrator</username>
                <password>Administrator</password>
                <url>tcp://localhost:2506</url>
            </service>
        </services>
    </connector>
</connectors>`
    },
    {
        name: 'SJMS',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 200,
          "to": {
            "service_id": 2000,
            "uri": "sjms:queue:test"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {
        "service": {
          "id": 2000,
          "name": "localbroker",
          "password": "Administrator",
          "url": "tcp://localhost:2506",
          "username": "Administrator"
        }
      }
    }
  }
}`
    },
    {
        name: 'SJMS',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 200
        to:
          service_id: 2000
          uri: "sjms:queue:test"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services:
      service:
        password: "Administrator"
        name: "localbroker"
        id: 2000
        url: "tcp://localhost:2506"
        username: "Administrator"`
    },
    {
        name: 'SMTP',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>example</id>
        <flows>
            <!-- Send file to local url -->
            <flow>
                <id>210</id>
                <name>example.filetohttp</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>smtp:localhost</uri>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
    </connector>
</connectors>`

    },
    {
        name: 'SMTP',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 211,
          "to": {
            "uri": "smtp:localhost"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {}
    }
  }
}`
    },
    {
        name: 'SMTP',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 212
        to:
          uri: "smtp:localhost"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services: {}`
    }
    ,
    {
        name: 'SMTPS',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>example</id>
        <flows>
            <!-- Send file to local mail server -->
            <flow>
                <id>220</id>
                <name>example.filetosmtps</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>smtps:localhost</uri>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
    </connector>
</connectors>`

    },
    {
        name: 'SMTPS',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 221,
          "to": {
            "uri": "smtp:localhost"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {}
    }
  }
}`
    },
    {
        name: 'SMTPS',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 222
        to:
          uri: "smtp:localhost"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services: {}`
    },
    {
        name: 'SONICMQ',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>example</id>
        <flows>
            <!-- example from local directory to JMS queue -->
            <flow>
                <id>230</id>
                <name>example.filetosjms</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>sonicmq:queue:Sample.Q1</uri>
                    <service_id>2300</service_id>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
        <services>
            <service>
                <id>2300</id>
                <name>localbroker</name>
                <username>Administrator</username>
                <password>Administrator</password>
                <url>tcp://localhost:2506</url>
            </service>
        </services>
    </connector>
</connectors>`
    },
    {
        name: 'SONICMQ',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 230,
          "to": {
            "service_id": 2300,
            "uri": "sonicmq:Sample.Q1"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {
        "service": {
          "id": 2300,
          "name": "localbroker",
          "password": "Administrator",
          "url": "tcp://localhost:2506",
          "username": "Administrator"
        }
      }
    }
  }
}`
    },
    {
        name: 'SONICMQ',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 230
        to:
          service_id: 2300
          uri: "sonicmq:Sample.Q1"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services:
      service:
        password: "Administrator"
        name: "localbroker"
        id: 2300
        url: "tcp://localhost:2506"
        username: "Administrator"`
    },
    {
        name: 'SQL',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>example</id>
        <flows>
            <!-- example of an insert into a local MySQL database -->
            <flow>
                <id>240</id>
                <name>example.filetosftp</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                   <uri>sql:insert into history (MESSAGE,TYPE) values (:#message,:#type)</uri>
                    <options>
                        <dataSource>test.db</dataSource>
                    </options>
                    <service_id>2400</service_id>
                    <header_id>2401</header_id>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
        <services>
            <service>
                <id>2400</id>
                <name>test.db</name>
                <username>username</username>
                <password>example</password>
                <url>jdbc:mysql://localhost/dbname</url>
                <driver>com.mysql.jdbc.Driver</driver>
            </service>
        </services>
        <headers>
            <header>
                 <id>2401</id>
                <name>mapper</name>
                <message type="xpath">/root/message/text()</message>
                <date type="xpath">/root/type/text()</date>
            </header>
         </headers>
    </connector>
</connectors>`
    },
    {
        name: 'SQL',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 241,
          "to": {
            "options": {
              "dataSource": "test.db"
            },
            "service_id": 2402,
            "uri": ":#type)"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {
        "service": {
          "driver": "com.mysql.jdbc.Driver",
          "id": 2402,
          "name": "test.db",
          "password": "example",
          "url": "jdbc:mysql://localhost/dbname",
          "username": "username"
        }
      }
    }
  }
}`
    },
    {
        name: 'SQL',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 240
        to:
          service_id: 2400
          options:
            dataSource: "test.db"
          uri: ":#type)"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services:
      service:
        password: "example"
        driver: "com.mysql.jdbc.Driver"
        name: "test.db"
        id: 2400
        url: "jdbc:mysql://localhost/dbname"
        username: "username"`
    },
    {
        name: 'STREAM',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>example</id>
        <flows>
            <!-- check assimbly log viewer to see the output -->
            <flow>
                <id>250</id>
                <name>example.filetostream</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>stream:out</uri>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
    </connector>
</connectors>`
    },
    {
        name: 'STREAM',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 251,
          "to": {
            "uri": "stream:out"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {}
    }
  }`
    },
    {
        name: 'STREAM',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 252
        to:
          uri: "stream:out"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services: {}`
    },
    {
        name: 'TELEGRAM',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>example</id>
        <flows>
            <!-- check assimbly log viewer to see the output -->
            <flow>
                <id>260</id>
                <name>example.filetotelegram</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>telgram:bots//123456789:AAE_dLq5C19xwGjw3yiC2NvEUrZcejK21-Q987654321:AAE_dLq5C19xwOmg5yiC2NvSrkT3wj5Q1-L</uri>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
    </connector>
</connectors>`
    },
    {
        name: 'TELEGRAM',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 261,
          "to": {
            "uri": "telgram:bots//123456789:AAE_dLq5C19xwGjw3yiC2NvEUrZcejK21-Q987654321:AAE_dLq5C19xwOmg5yiC2NvSrkT3wj5Q1-L"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {}
    }
  }
}`
    },
    {
        name: 'TELEGRAM',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 262
        to:
          uri: "telgram:bots//123456789:AAE_dLq5C19xwGjw3yiC2NvEUrZcejK21-Q987654321:AAE_dLq5C19xwOmg5yiC2NvSrkT3wj5Q1-L"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services: {}`
    },
    {
        name: 'VM',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>example</id>
        <flows>
            <!-- to check this example, it's best to try both flows -->
            <flow>
                <id>270</id>
                <name>example.filetovm</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>vm:test</uri>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
            <flow>
                <id>271</id>
                <name>example.vmtofile</name>
                <from>
                    <uri>vm:test</uri>
                </from>
                <to>
                    <uri>file://C:/to</uri>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
    </connector>
</connectors>`
    },
    {
        name: 'VM',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 272,
          "to": {
            "uri": "vm:test"
          },
          "type": "default"
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "vm:test"
          },
          "id": 273,
          "to": {
            "uri": "file://C:/to"
          },
            "type": "default"
          }
      },
      "headers": {},
      "id": "live",
      "services": {}
    }
  }
}`
    },
    {
        name: 'VM',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 274
        to:
          uri: "vm:test"
        type: "default"
        error:
          uri: "file://C:/error"
      flow:
        from:
          uri: "vm:test"
        id: 275
        to:
          uri: "file://C:/to"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services: {}`
    },
    {
        name: 'WASTEBIN',
        flowtypeFile: 'XML',
        fileExample: `<connectors>
    <connector>
     <id>example</id>
        <flows>
            <!-- files send to wastebin -->
            <flow>
                <id>280</id>
                <name>example.filetowastebin</name>
                <from>
                    <uri>file://C:/from</uri>
                </from>
                <to>
                    <uri>wastebin</uri>
                </to>
                <error>
                    <uri>file://C:/error</uri>
                </error>
            </flow>
        </flows>
    </connector>
</connectors>`
    },
    {
        name: 'WASTEBIN',
        flowtypeFile: 'JSON',
        fileExample: `{
  "connectors": {
    "connector": {
      "flows": {
        "flow": {
          "error": {
            "uri": "file://C:/error"
          },
          "from": {
            "uri": "file://C:/from"
          },
          "id": 281,
          "to": {
            "uri": "mock:wastebin"
          },
          "type": "default"
        }
      },
      "headers": {},
      "id": "live",
      "services": {}
    }
  }
}`
    },
    {
        name: 'WASTEBIN',
        flowtypeFile: 'YAML',
        fileExample: `connectors:
  connector:
    headers: {}
    flows:
      flow:
        from:
          uri: "file://C:/from"
        id: 282
        to:
          uri: "mock:wastebin"
        type: "default"
        error:
          uri: "file://C:/error"
    id: "live"
    services: {}`
    }
];

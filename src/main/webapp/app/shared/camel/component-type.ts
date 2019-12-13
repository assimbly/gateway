import { Injectable } from '@angular/core';

// add a new component here
// 1) Add to the EndpointType list
// 2) Add to typelinks for live documentation
// 3) Add to differentEndpoint type (from/to/error)

export enum EndpointType {
    ACTIVEMQ = 'ACTIVEMQ',
    AS2 = 'AS2',
    AWSS3 = 'AWSS3',
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
        name: 'AWS-S3',
        assimblyTypeLink: `/component-amazons3`,
        camelTypeLink: `/aws-s3-component.html`,
        uriPlaceholder: 'bucketNameOrArn',
        uriPopoverMessage: `
        <b>Name</b>: bucketNameOrArn<br/>
        <b>Description</b>: Bucket name or ARN.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: MyBucket<br/>
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

    fromTypes = ['ACTIVEMQ', 'AS2','AWS-S3', 'DIRECT', 'ELASTICSEARCH', 'FILE', 'FTP', 'FTPS', 'HTTP', 'HTTPS', 'IMAP', 'IMAPS', 'JETTY', 'NETTY4', 'KAFKA', 'RABBITMQ', 'REST', 'SFTP', 'SJMS', 'SLACK',
                 'SMTPS', 'SMTP', 'SONICMQ', 'SQL', 'STREAM', 'TELEGRAM', 'VM', 'WEBSOCKET'];

    toTypes = ['ACTIVEMQ', 'AS2','AWS-S3', 'DIRECT', 'ELASTICSEARCH', 'FILE', 'FTP', 'FTPS', 'HTTP', 'HTTPS', 'IMAP', 'IMAPS', 'JETTY', 'NETTY4', 'KAFKA', 'RABBITMQ', 'REST', 'SFTP', 'SJMS', 'SLACK',
               'SMTPS', 'SMTP', 'SMTPS', 'SONICMQ', 'SQL', 'STREAM', 'TELEGRAM', 'VM', 'WASTEBIN', 'WEBSOCKET'];

    errorTypes = ['ACTIVEMQ', 'AS2','AWS-S3', 'ELASTICSEARCH', 'FILE', 'FTP', 'FTPS', 'HTTP', 'HTTPS', 'IMAP', 'IMAPS', 'JETTY', 'NETTY4', 'KAFKA', 'RABBITMQ', 'REST', 'SFTP', 'SJMS', 'SLACK', 'SMTP', 'SMTPS', 'SONICMQ', 'SQL', 'TELEGRAM', 'STREAM', 'WEBSOCKET'];

    wireTapTypes = [,'ACTIVEMQ','AWS-S3', 'ELASTICSEARCH', 'FILE', 'FTPS', 'FTP', 'HTTP', 'HTTPS', 'IMAP', 'IMAPS', 'NETTY4', 'KAFKA', 'RABBITMQ', 'REST', 'SFTP', 'SJMS', 'SONICMQ', 'SQL', 'STREAM', 'WEBSOCKET'];
}
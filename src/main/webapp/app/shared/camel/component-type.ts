import { Injectable } from '@angular/core';

// add a new component here
// 1) Add to the EndpointType list
// 2) Add to typelinks for live documentation
// 3) Add to differentEndpoint type (from/to/error)

export enum EndpointType {
    ACTIVEMQ = 'ACTIVEMQ',
    AHC = 'AHC',
    AHCWS = 'AHC-WS',
    AHCWSS = 'AHC-WSS',
    AMQP = 'AMQP',
    APNS = 'APNS',
    AS2 = 'AS2',
    ASTERISK = 'ASTERISK',
    ATMOS = 'ATMOS',
    ATMOSPHEREWEBSOCKET = 'ATMOSPHERE-WEBSOCKET',
    ATOM = 'ATOM',
    ATOMIXMAP = 'ATOMIX-MAP',
    ATOMIXMESSAGING = 'ATOMIX-MESSAGING',
    ATOMIXMULTIMAP = 'ATOMIX-MULTIMAP',
    ATOMIXQUEUE = 'ATOMIX-QUEUE',
    ATOMIXSET = 'ATOMIX-SET',
    ATOMIXVALUE = 'ATOMIX-VALUE',
    AVRO = 'AVRO',
    AWSCW = 'AWS-CW',
    AWSDDB = 'AWS-DDB',
    AWSDDBSTREAM = 'AWS-DDBSTREAM',
    AWSEC2 = 'AWS-EC2',
    AWSECS = 'AWS-ECS',
    AWSEKS = 'AWS-EKS',
    AWSKMS = 'AWS-KMS',
    AWSKINESIS = 'AWS-KINESIS',
    AWSKINESISFIREHOSE = 'AWS-KINESIS-FIREHOSE',
    AWSLAMBDA = 'AWS-LAMBDA',
    AWSMQ = 'AWS-MQ',
    AWSMSK = 'AWS-MSK',
    AWSS3 = 'AWS-S3',
    AWSSDB = 'AWS-SDB',
    AWSSES = 'AWS-SES',
    AWSSNS = 'AWS-SNS',
    AWSSQS = 'AWS-SQS',
    AWSSWF = 'AWS-SWF',
    AWSTRANSLATE = 'AWS-TRANSLATE',
    AZUREBLOB = 'AZURE-BLOB',
    AZUREQUEUE = 'AZURE-QUEUE',
    BEANVALIDATOR = 'BEAN-VALIDATOR',
    BEAN = 'BEAN',
    CLASS = 'CLASS',
    BEANSTALK = 'BEANSTALK',
    BONITA = 'BONITA',
    BOX = 'BOX',
    BRAINTREE = 'BRAINTREE',
    BROWSE = 'BROWSE',
    CAFFEINECACHE = 'CAFFEINE-CACHE',
    CAFFEINELOADCACHE = 'CAFFEINE-LOADCACHE',
    CQL = 'CQL',
    CHATSCRIPT = 'CHATSCRIPT',
    CHUNK = 'CHUNK',
    CMSMS = 'CM-SMS',
    CMIS = 'CMIS',
    COAP = 'COAP',
    COMETD = 'COMETD',
    CONSUL = 'CONSUL',
    CONTROLBUS = 'CONTROLBUS',
    CORDA = 'CORDA',
    COUCHBASE = 'COUCHBASE',
    COUCHDB = 'COUCHDB',
    CRON = 'CRON',
    CRYPTO = 'CRYPTO',
    CRYPTOSMS = 'CRYPTO-SMS',
    CXF = 'CXF',
    CXFRS = 'CXFRS',
    DATAFORMAT = 'DATAFORMAT',
    DATASET = 'DATASET',
    DATASETTEST = 'DATASET-TEST',
    DEBEZIUMMONGODB = 'DEBEZIUM-MONGODB',
    DEBEZIUMMYSQL = 'DEBEZIUM-MYSQL',
    DEBEZIUMPOSTGRESQL = 'DEBEZIUM-POSTGRESQL',
    DEBEZIUMSQLSERVER = 'DEBEZIUM-SQLSERVER',
    DIGITALOCEAN = 'DIGITALOCEAN',
    DIRECT = 'DIRECT',
    DIRECTVM = 'DIRECT-VM',
    DISRUPTOR = 'DISRUPTOR',
    DISRUPTORVM = 'DISRUPTOR-VM',
    DNS = 'DNS',
    DOCKER = 'DOCKER',
    DOZER = 'DOZER',
    DRILL = 'DRILL',
    DROPBOX = 'DROPBOX',
    EHCACHE = 'EHCACHE',
    ELASTICSEARCHREST = 'ELASTICSEARCH-REST',
    ELSQL = 'ELSQL',
    ELYTRON = 'ELYTRON',
    ETCD = 'ETCD',
    EVENTADMIN = 'EVENTADMIN',
    EXEC = 'EXEC',
    FACEBOOK = 'FACEBOOK',
    FHIR = 'FHIR',
    FILE = 'FILE',
    FILEWATCH = 'FILE-WATCH',
    FLATPACK = 'FLATPACK',
    FLINK = 'FLINK',
    FOP = 'FOP',
    FREEMARKER = 'FREEMARKER',
    FTP = 'FTP',
    FTPS = 'FTPS',
    GANGLIA = 'GANGLIA',
    GEOCODER = 'GEOCODER',
    GIT = 'GIT',
    GITHUB = 'GITHUB',
    GOOGLEBIGQUERY = 'GOOGLE-BIGQUERY',
    GOOGLEBIGQUERYSQL = 'GOOGLE-BIGQUERY-SQL',
    GOOGLECALENDAR = 'GOOGLE-CALENDAR',
    GOOGLECALENDARSTREAM = 'GOOGLE-CALENDAR-STREAM',
    GOOGLEDRIVE = 'GOOGLE-DRIVE',
    GOOGLEMAIL = 'GOOGLE-MAIL',
    GOOGLEMAILSTREAM = 'GOOGLE-MAIL-STREAM',
    GOOGLEPUBSUB = 'GOOGLE-PUBSUB',
    GOOGLESHEETS = 'GOOGLE-SHEETS',
    GOOGLESHEETSSTREAM = 'GOOGLE-SHEETS-STREAM',
    GORA = 'GORA',
    GRAPE = 'GRAPE',
    GRAPHQL = 'GRAPHQL',
    GRPC = 'GRPC',
    GUAVAEVENTBUS = 'GUAVA-EVENTBUS',
    HAZELCASTATOMICVALUE = 'HAZELCAST-ATOMICVALUE',
    HAZELCASTINSTANCE = 'HAZELCAST-INSTANCE',
    HAZELCASTLIST = 'HAZELCAST-LIST',
    HAZELCASTMAP = 'HAZELCAST-MAP',
    HAZELCASTMULTIMAP = 'HAZELCAST-MULTIMAP',
    HAZELCASTQUEUE = 'HAZELCAST-QUEUE',
    HAZELCASTREPLICATEDMAP = 'HAZELCAST-REPLICATEDMAP',
    HAZELCASTRINGBUFFER = 'HAZELCAST-RINGBUFFER',
    HAZELCASTSEDA = 'HAZELCAST-SEDA',
    HAZELCASTSET = 'HAZELCAST-SET',
    HAZELCASTTOPIC = 'HAZELCAST-TOPIC',
    HBASE = 'HBASE',
    HDFS = 'HDFS',
    HIPCHAT = 'HIPCHAT',
    HTTP = 'HTTP',
    HTTPS = 'HTTPS',
    IEC60870CLIENT = 'IEC60870-CLIENT',
    IEC60870SERVER = 'IEC60870-SERVER',
    IGNITECACHE = 'IGNITE-CACHE',
    IGNITECOMPUTE = 'IGNITE-COMPUTE',
    IGNITEEVENTS = 'IGNITE-EVENTS',
    IGNITEIDGEN = 'IGNITE-IDGEN',
    IGNITEMESSAGING = 'IGNITE-MESSAGING',
    IGNITEQUEUE = 'IGNITE-QUEUE',
    IGNITESET = 'IGNITE-SET',
    IMAP = 'IMAP',
    IMAPS = 'IMAPS',
    INFINISPAN = 'INFINISPAN',
    INFLUXDB = 'INFLUXDB',
    IOTA = 'IOTA',
    IPFS = 'IPFS',
    IRC = 'IRC',
    IRONMQ = 'IRONMQ',
    JBPM = 'JBPM',
    JCACHE = 'JCACHE',
    JCLOUDS = 'JCLOUDS',
    JCR = 'JCR',
    JDBC = 'JDBC',
    JETTY = 'JETTY',
    JGROEPS = 'JGROEPS',
    JGROEPSRAFT = 'JGROEPS-RAFT',
    JING = 'JING',
    JIRA = 'JIRA',
    JMS = 'JMS',
    JMX = 'JMX',
    JOLT = 'JOLT',
    JOOQ = 'JOOQ',
    JPA = 'JPA',
    JSLT = 'JSLT',
    JSONVALIDATOR = 'JSON-VALIDATOR',
    JT400 = 'JT400',
    KAFKA = 'KAFKA',
    KUBERNETESCONFIGMAPS = 'KUBERNETES-CONFIG-MAPS',
    KUBERNETESDEPLOYMENTS = 'KUBERNETES-DEPLOYMENTS',
    KUBERNETESHPA = 'KUBERNETES-HPA',
    KUBERNETESJOB = 'KUBERNETES-JOB',
    KUBERNETESNAMESPACES = 'KUBERNETES-NAMESPACES',
    KUBERNETESNODES = 'KUBERNETES-NODES',
    KUBERNETESPERSISTENTVOLUMES = 'KUBERNETES-PERSISTENT-VOLUMES',
    KUBERNETESPERSISTENTVOLUMESCLAIM = 'KUBERNETES-PERSISTENT-VOLUMES-CLAIM',
    KUBERNETESPODS = 'KUBERNETES-PODS',
    KUBERNETESREPLICATIONCONTROLLERS = 'KUBERNETES-REPLICATION-CONTROLLERS',
    KUBERNETESRESOURCESQUOTA = 'KUBERNETES-RESOURCES-QUOTA',
    KUBERNETESSECRETS = 'KUBERNETES-SECRETS',
    KUBERNETESSERVICEACCOUNTS = 'KUBERNETES-SERVICE-ACCOUNTS',
    KUBERNETESSERVICES = 'KUBERNETES-SERVICES',
    OPENSHIFTBUILDS = 'OPENSHIFT-BUILDS',
    OPENSHIFTBUILDCONFIGS = 'OPENSHIFT-BUILD-CONFIGS',
    KUDU = 'KUDU',
    LANGUAGE = 'LANGUAGE',
    LDAP = 'LDAP',
    LDIF = 'LDIF',
    LEVELDB = 'LEVELDB',
    LOG = 'LOG',
    LUCENE = 'LUCENE',
    LUMBERJACK = 'LUMBERJACK',
    MASTER = 'MASTER',
    MECTRICS = 'MECTRICS',
    MICROMETER = 'MICROMETER',
    MICROPROFILEMETRICS = 'MICROPROFILE-METRICS',
    MILOCLIENT = 'MILO-CLIENT',
    MILOSERVER = 'MILO-SERVER',
    MINA = 'MINA',
    MLLP = 'MLLP',
    MOCK = 'MOCK',
    MONGODB = 'MONGODB',
    MONGODBGRIDFS = 'MONGODB-GRIDFS',
    MSV = 'MSV',
    MUSTACHE = 'MUSTACHE',
    MVEL = 'MVEL',
    MYBATIS = 'MYBATIS',
    MYBATISBEAN = 'MYBATIS-BEAN',
    NAGIOS = 'NAGIOS',
    NATS = 'NATS',
    NETTY4 = 'NETTY4',
    NETTYHTTP = 'NETTY-HTTP',
    NITRITE = 'NITRITE',
    NSQ = 'NSQ',
    OLINGO2 = 'OLINGO2',
    OLINGO4 = 'OLINGO4',
    OPENSTACKCINDER = 'OPENSTACK-CINDER',
    OPENSTACKGLANCE = 'OPENSTACK-GLANCE',
    OPENSTACKKEYSTONE = 'OPENSTACK-KEYSTONE',
    OPENSTACKNEUTRON = 'OPENSTACK-NEUTRON',
    OPENSTACK = 'OPENSTACK-',
    OPENSTACKNOVA = 'OPENSTACK-NOVA',
    OPENSTACKSWIFT = 'OPENSTACK-SWIFT',
    OPTAPLANNER = 'OPTAPLANER',
    PAHTO = 'PAHTO',
    PAXLOGGING = 'PAXLOGGING',
    PDF = 'PDF',
    PGREPLICATIONSLOT = 'PG-REPLICATION-SLOT',
    PGEVENT = 'PGEVENT',
    PLATFORMHTTP = 'PLATFORM-HTTP',
    LPR = 'LPR',
    PUBNUB = 'PUBNUB',
    PULSAR = 'PULSAR',
    QUARTZ2 = 'QUARTZ2',
    QUICKFIX = 'QUICKFIX',
    RABBITMQ = 'RABBITMQ',
    REACTIVESTREAMS = 'REACTIVE-STREAMS',
    REF = 'REF',
    REST = 'REST',
    RESTAPI = 'REST-API',
    RESTOPENAPI = 'REST-OPENAPI',
    RESTSWAGGER = 'REST-SWAGGER',
    RSS = 'RSS',
    SAGA = 'SAGA',
    SALESFORCE = 'SALESFORCE',
    SAPNETWEAVER = 'SAP-NETWEAVER',
    SCHEDULER = 'SCHEDULER',
    SCHEMATRON = 'SCHEMATRON',
    SCP = 'SCP',
    SEDA = 'SEDA',
    SERVICE = 'SERVICE',
    SERVICENOW = 'SERVICENOW',
    SERVLET = 'SERVLET',
    SFTP = 'SFTP',
    SIP = 'SIP',
    SIPS = 'SIPS',
    SJMS = 'SJMS',
    SJMS2 = 'SJMS2',
    SLACK = 'SLACK',
    SMMP = 'SMMP',
    SMMPS = 'SMMPS',
    SNMP = 'SNMP',
    SMTP = 'SMTP',
    SMTPS3 = 'SMTPS3',
    SOLR = 'SOLR',
    SOLRS = 'SOLRS',
    SPARK = 'SPARK',
    SPARKREST = 'SPARK-REST',
    SPLUNK = 'SPLUNK',
    SPRINGBATCH = 'SPRING-BATCH',
    SPRINGINTEGRATION = 'SPRING-INTEGRATION',
    SPRINGLDAP = 'SPRING-LDAP',
    SPRINGREDIS = 'SPRING-REDIS',
    SPRINGWS = 'SPRING-WS',
    SPRINGEVENT = 'SPRING-EVENT',
    SQL = 'SQL',
    SQLSTORED = 'SQL-STORED',
    SSH = 'SSH',
    SONICMQ = 'SONICMQ',
    STAX = 'STAX',
    STOMP = 'STOMP',
    STREAM = 'STREAM',
    STUB = 'STUB',
    TELEGRAM = 'TELEGRAM',
    THRIFT = 'THRIFT',
    TIKA = 'TIKA',
    TIMER = 'TIMER',
    TWILIO = 'TWILIO',
    TWITTERDIRECTMESSAGE = 'TWITTER-DIRECTMESSAGE',
    TWITTERSEARCH = 'TWITTER-SEARCH',
    TWITTERTIMELINE = 'TWITTER-TIMELINE',
    UNDERTOW = 'UNDERTOW',
    VALIDATOR = 'VALIDATOR',
    VELOCITY = 'VELOCITY',
    VERTX = 'VERTX',
    VM = 'VM',
    WASTEBIN = 'WASTEBIN',
    WEATHER = 'WEATHER',
    WEB3J = 'WEB3J',
    WEBHOOK = 'WEBHOOK',
    WEBSOCKET = 'WEBSOCKET',
    WEBSOCKETJSR = 'WEBSOCKET-JSR',
    WORDPRESS = 'WORDPRESS',
    XCHANGE = 'XCHANGE',
    XJ = 'XJ',
    XMPP = 'XMPP',
    XQUERY = 'XQUERY',
    XSLT = 'XSLT',
    XSLTSAXON = 'XSLT-SAXON',
    YAMMER = 'YAMMER',
    ZENDESK = 'ZENDESK',
    ZOOKEEPER = 'ZOOKEEPER',
    ZOOKEEPERMASTER = 'ZOOKEEPER-MASTER'
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
        name: 'AHC',
        assimblyTypeLink: `/component-ahc`,
        camelTypeLink: `/ahc-component.html`,
        uriPlaceholder: 'http://hostname:port',
        uriPopoverMessage: `
        <b>Name</b>: hostname <br/>
        <b>Description</b>: The hostname <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
        <b>Name</b>: port <br/>
        <b>Description</b>: The port to use <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: http://hostname:port/path <br/>
    `
    },
    {
        name: 'AHC-WS',
        assimblyTypeLink: `/component-ahc-ws`,
        camelTypeLink: `/ahc-ws-component.html`,
        uriPlaceholder: ' http://hostname:port',
        uriPopoverMessage: `
        <b>Name</b>: hostname <br/>
        <b>Description</b>: The hostname <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
        <b>Name</b>: port <br/>
        <b>Description</b>: The port to use <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: http://hostname:port/path <br/>
    `
    },
    {
        name: 'AMQP',
        assimblyTypeLink: `/component-amqp`,
        camelTypeLink: `/amqp-component.html`,
        uriPlaceholder: 'destinationType:destinationName',
        uriPopoverMessage: `
        <b>Name</b>: destinationType <br/>
        <b>Description</b>: The kind of destination to use. The value can be one of: queue, topic, temp-queue, temp-topic. <br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: destinationName <br/>
        <b>Description</b>: Name of the queue or topic to use as destination. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: queue:foo <br/>
    `
    },
    {
        name: 'APNS',
        assimblyTypeLink: `/component-amqp`,
        camelTypeLink: `/amqp-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name <br/>
        <b>Description</b>: Name of the endpoint. <br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: foo <br/>
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
        name: 'ASTERISK',
        assimblyTypeLink: `/component-asterisk`,
        camelTypeLink: `/asterisk-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name <br/>
        <b>Description</b>: Name of component <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
        <b>Example</b>: foo <br/>
    `
    },
    {
        name: 'ATMOS',
        assimblyTypeLink: `/component-atmos`,
        camelTypeLink: `/atmos-component.html`,
        uriPlaceholder: 'name/operation',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: Atmos name. <br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: URI<br/>
        <b>Name</b>: operation<br/>
        <b>Description</b>: Operation to perform. The value can be one of: put, del, search, get, move. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: AtmosOperation<br/>
    `
    },
    {
        name: 'ATMOSPHERE-WEBSOCKET',
        assimblyTypeLink: `/component-atmosphere-websocket`,
        camelTypeLink: `/atmosphere-websocket-component.html`,
        uriPlaceholder: 'servicePath',
        uriPopoverMessage: `
        <b>Name</b>: servicePath<br/>
        <b>Description</b>: Name of websocket endpoint. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'BEAN',
        assimblyTypeLink: `/component-bean`,
        camelTypeLink: `/bean-component.html`,
        uriPlaceholder: 'beanName',
        uriPopoverMessage: `
        <b>Name</b>: beanName<br/>
        <b>Description</b>: Sets the name of the bean to invoke. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'BEAN-VALIDATOR',
        assimblyTypeLink: `/component-bean-validator`,
        camelTypeLink: `/bean-validator-component.html`,
        uriPlaceholder: 'label',
        uriPopoverMessage: `
        <b>Name</b>: label<br/>
        <b>Description</b>: Where label is an arbitrary text value describing the endpoint. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'BEANSTALK',
        assimblyTypeLink: `/component-beanstalk`,
        camelTypeLink: `/beanstalk-component.html`,
        uriPlaceholder: 'connectionSettings',
        uriPopoverMessage: `
        <b>Name</b>: connectionSettings<br/>
        <b>Description</b>: Connection settings host:port/tube. <br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'BONITA',
        assimblyTypeLink: `/component-bonita`,
        camelTypeLink: `/bonita-component.html`,
        uriPlaceholder: 'operation',
        uriPopoverMessage: `
        <b>Name</b>: operation<br/>
        <b>Description</b>: Operation to use. The value can be one of: startCase. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: BonitaOperation<br/>
    `
    },
    {
        name: 'BOX',
        assimblyTypeLink: `/component-box`,
        camelTypeLink: `/box-component.html`,
        uriPlaceholder: 'apiName/methodName',
        uriPopoverMessage: `
        <b>Name</b>: apiName<br/>
        <b>Description</b>: What kind of operation to perform. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: BoxApiName<br/>
        <b>Name</b>: methodName<br/>
        <b>Description</b>: What sub operation to use for the selected operation. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'BRAINTREE',
        assimblyTypeLink: `/component-braintree`,
        camelTypeLink: `/braintree-component.html`,
        uriPlaceholder: 'apiName/methodName',
        uriPopoverMessage: `
        <b>Name</b>: apiName<br/>
        <b>Description</b>: What kind of operation to perform. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: BraintreeApiName<br/>
        <b>Name</b>: methodName<br/>
        <b>Description</b>: What sub operation to use for the selected operation. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'BROWSE',
        assimblyTypeLink: `/component-browse`,
        camelTypeLink: `/browse-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: A name which can be any string to uniquely identify the endpoint. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'COAP',
        assimblyTypeLink: `/component-coap`,
        camelTypeLink: `/coap-component.html`,
        uriPlaceholder: 'uri',
        uriPopoverMessage: `
        <b>Name</b>: uri<br/>
        <b>Description</b>: The URI for the CoAP endpoint <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: URI<br/>
    `
    },
    {
        name: 'COUCHDB',
        assimblyTypeLink: `/component-couchdb`,
        camelTypeLink: `/couchdb-component.html`,
        uriPlaceholder: 'protocol:hostname:port/database',
        uriPopoverMessage: `
        <b>Name</b>: protocol<br/>
        <b>Description</b>: The protocol to use for communicating with the database. The value can be one of: http, https. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: hostname<br/>
        <b>Description</b>: Hostname of the running couchdb instance <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: Port number for the running couchdb instance <br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: int<br/>
        <b>Name</b>: database<br/>
        <b>Description</b>: Name of the database to use <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: http://localhost:5984/database <br/>
    `
    },
    {
        name: 'CRON',
        assimblyTypeLink: `/component-cron`,
        camelTypeLink: `/cron-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: The name of the cron trigger. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: foo <br/>
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
        name: 'DIRECT-VM',
        assimblyTypeLink: `/component-direct-vm`,
        camelTypeLink: `/direct-vm-component.html`,
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
        name: 'DOCKER',
        assimblyTypeLink: `/component-docker`,
        camelTypeLink: `/docker-component.html`,
        uriPlaceholder: 'operation',
        uriPopoverMessage: `
        <b>Name</b>: operation<br/>
        <b>Description</b>: Which operation to use (see docs).<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: DockerOperation <br/><br/>
    `
    },
    {
        name: 'DROPBOX',
        assimblyTypeLink: `/component-dropbox`,
        camelTypeLink: `/dropbox-component.html`,
        uriPlaceholder: 'operation',
        uriPopoverMessage: `
        <b>Name</b>: operation <br/>
        <b>Description</b>: The specific action (typically a CRUD action) to perform on Dropbox remote folder.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Example</b>: move <br/>
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
        name: 'GIT',
        assimblyTypeLink: `/component-git`,
        camelTypeLink: `/git-component.html`,
        uriPlaceholder: 'localPath',
        uriPopoverMessage: `
        <b>Name</b>: localPath<br/>
        <b>Description</b>: Local repository path.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/>
        <br/>
    `
    },
    {
        name: 'GEOCODER',
        assimblyTypeLink: `/component-geocoder`,
        camelTypeLink: `/geocoder-component.html`,
        uriPlaceholder: 'address:latlng',
        uriPopoverMessage: `
        <b>Name</b>: address-id<br/>
        <b>Description</b>: The geo address which should be prefixed with address.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/>
        <br/>
        <b>Name</b>: latlng <br/>
        <b>Description</b>: The geo latitude and longitude which should be prefixed with latlng.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: int<br/>
        <br/>
    `
    },
    {
        name: 'GOOGLE-BIG-QUERY',
        assimblyTypeLink: `/component-google-bigquery`,
        camelTypeLink: `/google-bigquery-component.html`,
        uriPlaceholder: 'project-id:datasetId',
        uriPopoverMessage: `
        <b>Name</b>: project-id<br/>
        <b>Description</b>: Google Cloud Project Id.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/>
        <br/>
        <b>Name</b>: datasetId <br/>
        <b>Description</b>: BigQuery Dataset Id.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: int<br/>
        <br/>
        <b>Example</b>: sample-project193402:example-project-193402_dataset<br/>
    `
    },
    {
        name: 'GOOGLE-CALENDAR',
        assimblyTypeLink: `/component-google-calendar`,
        camelTypeLink: `/google-calendar-component.html`,
        uriPlaceholder: 'apiName/methodName',
        uriPopoverMessage: `
        <b>Name</b>: apiName<br/>
        <b>Description</b>: What kind of operation to perform (see docs).<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: GoogleCalendarApiName <br/>
        <br/>
        <b>Name</b>: methodName <br/>
        <b>Description</b>: What sub operation to use for the selected operation.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
        <b>Example</b>: LIST/GET <br/>
    `
    },
    {
        name: 'GOOGLE-DRIVE',
        assimblyTypeLink: `/component-google-drive`,
        camelTypeLink: `/google-drive-component.html`,
        uriPlaceholder: 'apiName/methodName',
        uriPopoverMessage: `
        <b>Name</b>: apiName<br/>
        <b>Description</b>: What kind of operation to perform.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: GoogleDriveApiName <br/>
        <br/>
        <b>Name</b>: methodName <br/>
        <b>Description</b>: What sub operation to use for the selected operation.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
        <b>Example</b>: drive-about/get<br/>
    `
    },
    {
        name: 'GOOGLE-MAIL',
        assimblyTypeLink: `/component-google-mail`,
        camelTypeLink: `/google-mail-component.html`,
        uriPlaceholder: 'apiName/methodName',
        uriPopoverMessage: `
        <b>Name</b>: apiName<br/>
        <b>Description</b>: What kind of operation to perform.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: GoogleDriveApiName <br/>
        <br/>
        <b>Name</b>: methodName <br/>
        <b>Description</b>: What sub operation to use for the selected operation.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
        <b>Example</b>: messages/get<br/>
    `
    },
    {
        name: 'GOOGLE-SHEETS',
        assimblyTypeLink: `/component-google-sheets`,
        camelTypeLink: `/google-sheets-component.html`,
        uriPlaceholder: 'apiName/methodName',
        uriPopoverMessage: `
        <b>Name</b>: apiName<br/>
        <b>Description</b>: What kind of operation to perform (see docs).<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: GoogleSheetsApiName <br/>
        <br/>
        <b>Name</b>: methodName <br/>
        <b>Description</b>: What sub operation to use for the selected operation.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
        <b>Example</b>: DATA/GET <br/>
    `
    },
    {
        name: 'GRAPHQL',
        assimblyTypeLink: `/component-graphql`,
        camelTypeLink: `/graphql-component.html`,
        uriPlaceholder: 'httpUri',
        uriPopoverMessage: `
        <b>Name</b>: httpUri<br/>
        <b>Description</b>: The GraphQL server URI.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: URI <br/>
        <br/>
        <b>Example</b>: http://myapi/graphql<br/>
    `
    },
    {
        name: 'HBASE',
        assimblyTypeLink: `/component-hbase`,
        camelTypeLink: `/hbase-component.html`,
        uriPlaceholder: 'table',
        uriPopoverMessage: `
        <b>Name</b>: table<br/>
        <b>Description</b>: The table name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Example</b>: users<br/>
    `
    },
    {
        name: 'HDFS',
        assimblyTypeLink: `/component-hdfs`,
        camelTypeLink: `/hdfs-component.html`,
        uriPlaceholder: 'hostname:port/path',
        uriPopoverMessage: `
        <b>Name</b>: hostname<br/>
        <b>Description</b>: HDFS host to use<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: HDFS port to use<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: int <br/><br/>
        <b>Name</b>: path<br/>
        <b>Description</b>: HDFS host to use<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Example</b>: localhost:8020/user <br/>
    `
    },
    {
        name: 'HIPCHAT',
        assimblyTypeLink: `/component-hipchat`,
        camelTypeLink: `/hipchat-component.html`,
        uriPlaceholder: 'protocol:host:port',
        uriPopoverMessage: `
        <b>Name</b>: protocol<br/>
        <b>Description</b>: The protocol for the hipchat server, such as http.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: host<br/>
        <b>Description</b>: The host for the hipchat server, such as api.hipchat.com.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: The port for the hipchat server. Is by default 80.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: int <br/><br/>
        <b>Example</b>: http:example.com:80 <br/>
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
        name: 'IRONMQ',
        assimblyTypeLink: `/component-ironmq`,
        camelTypeLink: `/ironmq-component.html`,
        uriPlaceholder: 'queueName',
        uriPopoverMessage: `
        <b>Name</b>: queueName<br/>
        <b>Description</b>:  The name of the IronMQ queue.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Example</b>: foo<br/>
    `
    },
    {
        name: 'JOLT',
        assimblyTypeLink: `/component-jolt`,
        camelTypeLink: `/jolt-component.html`,
        uriPlaceholder: 'resourceUri',
        uriPopoverMessage: `
        <b>Name</b>: resourceUri<br/>
        <b>Description</b>: Path to the resource.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Example</b>: bean:myBean.myMethod <br/>
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
        name: 'LDAP',
        assimblyTypeLink: `/component-ldap`,
        camelTypeLink: `/ldap-component.html`,
        uriPlaceholder: 'ldap.example.com:port',
        uriPopoverMessage: `
        <b>Name</b>: host <br/>
        <b>Description</b>: The LDAP uri <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Example</b>: example.com:389 <br/>
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
        name: 'LANGUAGE',
        assimblyTypeLink: `/component-language`,
        camelTypeLink: `/language-component.html`,
        uriPlaceholder: 'language://languageName[:script]',
        uriPopoverMessage: `
        <b>Name</b>: languageName<br/>
        <b>Description</b>: Sets the name of the language to use. The value can be one of: bean, constant, exchangeProperty, file, groovy, header, javascript, jsonpath, mvel, ognl, 
        ref, simple, spel, sql, terser, tokenize, xpath, xquery, xtokenize<br/>
        <b>Required</b>: yes <br/>
        <b>ResourceUri</b>: String<br/>
        <b>Description</b>: Path to the source<br/>
        <b>Required</b>: yes <br/>
        <br/>
        <b>Example</b>: simple:" + script or simple:file:target/script/myscript.txt<br/>
    `
    },
    {
        name: 'LOG',
        assimblyTypeLink: `/component-log`,
        camelTypeLink: `/log-component.html`,
        uriPlaceholder: 'loggingCategory',
        uriPopoverMessage: `
        <b>Name</b>: loggingName<br/>
        <b>Description</b>: The name for the logging<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
        <b>Example</b>: foo<br/>
    `
    },
    {
        name: 'MOCK',
        assimblyTypeLink: `/component-mock`,
        camelTypeLink: `/mock-component.html`,
        uriPlaceholder: 'someName',
        uriPopoverMessage: `
        <b>Name</b>: mockName<br/>
        <b>Description</b>: Any name for the mock<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
        <b>Example</b>: foo<br/>
    `
    },
    {
        name: 'MONGODB',
        assimblyTypeLink: `/component-mongodb`,
        camelTypeLink: `/mongodb-component.html`,
        uriPlaceholder: 'connectionBean',
        uriPopoverMessage: `
        <b>Name</b>: connectionBean<br/>
        <b>Description</b>: Sets the connection bean reference used to lookup a client for connecting to a database. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'NSQ',
        assimblyTypeLink: `/component-nsq`,
        camelTypeLink: `/nsq-component.html`,
        uriPlaceholder: 'topic',
        uriPopoverMessage: `
        <b>Name</b>: topic<br/>
        <b>Description</b>: The NSQ topic. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'MUSTACHE',
        assimblyTypeLink: `/component-mustache`,
        camelTypeLink: `/mustache-component.html`,
        uriPlaceholder: 'resourceUri',
        uriPopoverMessage: `
        <b>Name</b>: resourceUri<br/>
        <b>Description</b>: Path to the resource.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
        <b>Example</b>: bean:myBean.myMethod<br/>
    `
    },
    {
        name: 'OLINGO2',
        assimblyTypeLink: `/component-olingo2`,
        camelTypeLink: `/olingo2-component.html`,
        uriPlaceholder: 'apiName/methodName',
        uriPopoverMessage: `
        <b>Name</b>: apiName<br/>
        <b>Description</b>:  What kind of operation to perform. The value can be one of: DEFAULT. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: Olingo2ApiName<br/>
        <b>Name</b>: methodName<br/>
        <b>Description</b>: What sub operation to use for the selected operation<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'OLINGO4',
        assimblyTypeLink: `/component-olingo4`,
        camelTypeLink: `/olingo4-component.html`,
        uriPlaceholder: 'apiName/methodName',
        uriPopoverMessage: `
        <b>Name</b>: apiName<br/>
        <b>Description</b>:  What kind of operation to perform. The value can be one of: DEFAULT. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: Olingo4ApiName<br/>
        <b>Name</b>: methodName<br/>
        <b>Description</b>: What sub operation to use for the selected operation<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'PDF',
        assimblyTypeLink: `/component-pdf`,
        camelTypeLink: `/pdf-component.html`,
        uriPlaceholder: 'operation',
        uriPopoverMessage: `
        <b>Name</b>: operation<br/>
        <b>Description</b>: Operation type. The value can be one of: create, append, extractText.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: PdfOperation<br/>
        <br/>
        <b>Example</b>: create<br/>
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
        name: 'SCHEDULER',
        assimblyTypeLink: `/component-scheduler`,
        camelTypeLink: `/scheduler-component.html`,
        uriPlaceholder: 'schedulerName',
        uriPopoverMessage: `
        <b>Name</b>: schedulerName<br/>
        <b>Description</b>: The name for the scheduler<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
        <b>Example</b>: foo<br/>
    `
    },
    {
        name: 'SEDA',
        assimblyTypeLink: `/component-seda`,
        camelTypeLink: `/seda-component.html`,
        uriPlaceholder: 'queueName',
        uriPopoverMessage: `
        <b>Name</b>: queueName<br/>
        <b>Description</b>: Internal (asynchhonous) queue between two flows<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Example</b>: test<br/>
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
        name: 'SPARK',
        assimblyTypeLink: `/component-spark`,
        camelTypeLink: `/spark-component.html`,
        uriPlaceholder: 'endpointType',
        uriPopoverMessage: `
        <b>Name</b>: endpointType<br/>
        <b>Description</b>: Type of the endpoint (rdd, dataframe, hive). The value can be one of: rdd, dataframe, hive.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: Enumeration. Valid values: queue, topic<br/><br/>
        <b>Example</b>: dataframe<br/>
    `
    },
    {
        name: 'SSH',
        assimblyTypeLink: `/component-ssh`,
        camelTypeLink: `/ssh-component.html`,
        uriPlaceholder: 'host:port',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: Sets the hostname of the remote SSH server. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: Sets the port number for the remote SSH server. <br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: int<br/><br/>
        <b>Example</b>: localhost:22 <br/>
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
        name: 'STUB',
        assimblyTypeLink: `/component-stub`,
        camelTypeLink: `/stub-component.html`,
        uriPlaceholder: 'someUri',
        uriPopoverMessage: `
        <b>Name</b>: uri<br/>
        <b>Description</b>: Any endpoint URI to stub out the endpoint. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Example</b>: smtp://somehost.foo.com?user=whatnot&something=else<br/>
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
        name: 'TIMER',
        assimblyTypeLink: `/component-timer`,
        camelTypeLink: `/timer-component.html`,
        uriPlaceholder: 'timerName',
        uriPopoverMessage: `
        <b>Name</b>: timerName<br/>
        <b>Description</b>: The name for the timer<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
        <b>Example</b>: foo<br/>
    `
    },
    {
        name: 'VALIDATOR',
        assimblyTypeLink: `/component-validator`,
        camelTypeLink: `/validator-component.html`,
        uriPlaceholder: 'resourceUri',
        uriPopoverMessage: `
        <b>Name</b>: resourceUri<br/>
        <b>Description</b>: URL to a local resource on the classpath, or a reference to lookup a bean in the Registry, or a full URL to a remote resource or resource on the file system which contains the XSD to validate against.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Example</b>: http://acme.com/cheese.xsd | file:../foo/bar.xsd <br/>
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
    },
    {
        name: 'WORDPRESS',
        assimblyTypeLink: `/component-wordpress`,
        camelTypeLink: `/wordpress-component.html`,
        uriPlaceholder: 'operation',
        uriPopoverMessage: `
        <b>Name</b>: operation<br/>
        <b>Description</b>: The endpoint operation. The value can be one of: post, user.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Name</b>: operationDetail<br/>
        <b>Description</b>: The second part of an endpoint operation. Needed only when endpoint semantic is not enough, like wordpress:post:delete. <br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'ZOOKEEPER',
        assimblyTypeLink: `/component-zookeeper`,
        camelTypeLink: `/zookeeper-component.html`,
        uriPlaceholder: 'serverUrls/path',
        uriPopoverMessage: `
        <b>Name</b>: serverUrls<br/>
        <b>Description</b>: The zookeeper server hosts (multiple servers can be separated by comma).<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Name</b>: path<br/>
        <b>Description</b>: The node in the ZooKeeper server (aka znode). <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    }
];

// add the component types for a specific endpoint
@Injectable()
export class Components {
    fromTypes = [
        'ACTIVEMQ',
        'AHC-WS',
        'AMQP',
        'APNS',
        'AS2',
        'AWS-S3',
        'ASTERISK',
        'ATMOS',
        'ATMOSPHERE-WEBSOCKET',
        'BEANSTALK',
        'BOX',
        'BRAINTREE',
        'BROWSE',
        'COAP',
        'COUCHDB',
        'DIRECT',
        'DIRECT-VM',
        'DROPBOX',
        'DOCKER',
        'FILE',
        'FTP',
        'FTPS',
        'GIT',
        'GOOGLE-CALENDAR',
        'GOOGLE-DRIVE',
        'GOOGLE-MAIL',
        'GOOGLE-SHEETS',
        'HBASE',
        'HDFS',
        'HIPCHAT',
        'IMAP',
        'IMAPS',
        'JETTY',
        'NETTY4',
        'LANGUAGE',
        'LOG',
        'MONGODB',
        'NSQ',
        'OLINGO2',
        'OLINGO4',
        'KAFKA',
        'RABBITMQ',
        'REST',
        'SCHEDULER',
        'SEDA',
        'SFTP',
        'SSH',
        'SJMS',
        'SLACK',
        'SMTPS',
        'SMTP',
        'SONICMQ',
        'SQL',
        'STUB',
        'STREAM',
        'TIMER',
        'TELEGRAM',
        'VM',
        'WEBSOCKET',
        'WORDPRESS',
        'ZOOKEEPER'
    ];

    toTypes = [
        'ACTIVEMQ',
        'AHC',
        'AHC-WS',
        'AMQP',
        'APNS',
        'AS2',
        'AWS-S3',
        'ASTERISK',
        'ATMOS',
        'ATMOSPHERE-WEBSOCKET',
        'BEAN',
        'BEAN-VALIDATOR',
        'BEANSTALK',
        'BONITA',
        'BOX',
        'BRAINTREE',
        'BROWSE',
        'COAP',
        'COUCHDB',
        'DIRECT',
        'DIRECT-VM',
        'DROPBOX',
        'DOCKER',
        'ELASTICSEARCH-REST',
        'FILE',
        'FTP',
        'FTPS',
        'GIT',
        'GEOCODER',
        'GOOGLE-BIG-QUERY',
        'GOOGLE-CALENDAR',
        'GOOGLE-DRIVE',
        'GOOGLE-MAIL',
        'GOOGLE-SHEETS',
        'GRAPHQL',
        'HBASE',
        'HDFS',
        'HIPCHAT',
        'HTTP',
        'HTTPS',
        'IMAP',
        'IMAPS',
        'IRONMQ',
        'JETTY',
        'JOLT',
        'LDAP',
        'MOCK',
        'NETTY4',
        'PDF',
        'LOG',
        'MONGODB',
        'MUSTACHE',
        'OLINGO2',
        'OLINGO4',
        'NSQ',
        'KAFKA',
        'RABBITMQ',
        'REST',
        'SCHEDULER',
        'SEDA',
        'SFTP',
        'SSH',
        'SJMS',
        'SLACK',
        'SMTPS',
        'SMTP',
        'SMTPS',
        'SONICMQ',
        'SPARK',
        'SQL',
        'STUB',
        'STREAM',
        'TELEGRAM',
        'TIMER',
        'VALIDATOR',
        'VM',
        'WASTEBIN',
        'WEBSOCKET',
        'WORDPRESS',
        'ZOOKEEPER'
    ];

    errorTypes = [
        'ACTIVEMQ',
        'AS2',
        'AWS-S3',
        'CRON',
        'ELASTICSEARCH-REST',
        'DIRECT',
        'DIRECT-VM',
        'SEDA',
        'FILE',
        'FTP',
        'FTPS',
        'HTTP',
        'HTTPS',
        'IMAP',
        'IMAPS',
        'IRONMQ',
        'JETTY',
        'NETTY4',
        'LOG',
        'KAFKA',
        'RABBITMQ',
        'REST',
        'SFTP',
        'SJMS',
        'SLACK',
        'SMTP',
        'SMTPS',
        'SONICMQ',
        'SQL',
        'TELEGRAM',
        'STREAM',
        'VM',
        'WEBSOCKET'
    ];

    wireTapTypes = [
        'ACTIVEMQ',
        'AWS-S3',
        'ELASTICSEARCH-REST',
        'FILE',
        'FTPS',
        'FTP',
        'HTTP',
        'HTTPS',
        'IMAP',
        'IMAPS',
        'NETTY4',
        'LOG',
        'KAFKA',
        'RABBITMQ',
        'REST',
        'SFTP',
        'SJMS',
        'SONICMQ',
        'SQL',
        'STREAM',
        'WEBSOCKET'
    ];
}

import { Injectable } from '@angular/core';

// add a new component here
// 1) Add to the ComponentType list
// 2) Add to typelinks for live documentation
// 3) Add to different Component type (from/to/error)

export enum ComponentType {
    ACTIVEMQ = 'ACTIVEMQ',
    AHC = 'AHC',
    AHCWS = 'AHC-WS',
    AHCWSS = 'AHC-WSS',
    AMAZONMQ = 'AMAZONMQ',
    AMQP = 'AMQP',
    AMQPS = 'AMQPS',
    APNS = 'APNS',
    ARANGODB = 'ARANGODB',
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
    ATLASMAP = 'ATLASMAP',
    AVRO = 'AVRO',
    AWS2ATHENA = 'AWS2-ATHENA',
    AWS2CW = 'AWS2-CW',
    AWS2DDB = 'AWS2-DDB',
    AWS2DDBSTREAM = 'AWS2-DDBSTREAM',
    AWS2EC2 = 'AWS2-EC2',
    AWS2ECS = 'AWS2-ECS',
    AWS2EKS = 'AWS2-EKS',
    AWS2EVENTBRIDGE = 'AWS2-EVENTBRIDGE',
    AWS2IAM = 'AWS2-IAM',
    AWS2KMS = 'AWS2-KMS',
    AWS2KINESIS = 'AWS2-KINESIS',
    AWS2KINESISFIREHOSE = 'AWS2-KINESIS-FIREHOSE',
    AWS2LAMBDA = 'AWS2-LAMBDA',
    AWS2MSK = 'AWS2-MSK',
    AWS2MQ = 'AWS2-MQ',
    AWS2S3 = 'AWS2-S3',
    AWS2SECRETSMANAGER = 'AWS2-SECRETS-MANAGER',
    AWS2STS = 'AWS2-STS',
    AWS2SNS = 'AWS2-SNS',
    AWS2SQS = 'AWS2-SQS',
    AWS2TRANSLATE = 'AWS2-TRANSLATE',
    AZURECOSMOSDB = 'AZURE-COSMOSDB',
    AZUREEVENTHUBS = 'AZURE-EVENTHUBS',
    AZURESTORAGEBLOB = 'AZURE-STORAGE-BLOB',
    AZURESTORAGEDATALAKE = 'AZURE-STORAGE-DATALAKE',
    AZURESTORAGEQUEUE = 'AZURE-STORAGE-QUEUE',
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
    CRYPTOCMS = 'CRYPTO-CMS',
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
    DJL = 'DJL',
    DNS = 'DNS',
    DOCKER = 'DOCKER',
    DOZER = 'DOZER',
    DRILL = 'DRILL',
    DROPBOX = 'DROPBOX',
    EHCACHE = 'EHCACHE',
    ELASTICSEARCHREST = 'ELASTICSEARCH-REST',
    ELSQL = 'ELSQL',
    ELYTRON = 'ELYTRON',
    ETCDKEYS = 'ETCD-KEYS',
    ETCDSTATS = 'ETCD-STATS',
    ETCDWATCH = 'ETCD-WATCH',
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
    GOOGLEFUNCTIONS = 'GOOGLE-FUNCTIONS',
    GOOGLEMAIL = 'GOOGLE-MAIL',
    GOOGLEMAILSTREAM = 'GOOGLE-MAIL-STREAM',
    GOOGLEPUBSUB = 'GOOGLE-PUBSUB',
    GOOGLESHEETS = 'GOOGLE-SHEETS',
    GOOGLESHEETSSTREAM = 'GOOGLE-SHEETS-STREAM',
    GOOGLESTORAGE = 'GOOGLE-STORAGE',
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
    HTTP = 'HTTP',
    HTTPS = 'HTTPS',
    HWCLOUDFUNCTIONGRAPH = 'HWCLOUD-FUNCTIONGRAPH',
    HWCLOUDIAM = 'HWCLOUD-IAM',
    HWCLOUDSMN = 'HWCLOUD-SMN',
    IBMMQ = 'IBMMQ',
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
    JGROUPS = 'JGROUPS',
    JGROUPSRAFT = 'JGROUPS-RAFT',
    JING = 'JING',
    JIRA = 'JIRA',
    JMS = 'JMS',
    JMX = 'JMX',
    JOLT = 'JOLT',
    JOOQ = 'JOOQ',
    JPA = 'JPA',
    JSLT = 'JSLT',
    JSONATA = 'JSONATA',
    JSONVALIDATOR = 'JSON-VALIDATOR',
    JT400 = 'JT400',
    KAFKA = 'KAFKA',
    KAMELET = 'KAMELET',
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
    MINIO = 'MINIO',
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
    OAIPMH = 'OAI-PMH',
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
    PAHO = 'PAHO',
    PAHOMQTT5 = 'PAHO-MQTT5',
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
    RESTLET = 'RESTLET',
    RESTAPI = 'REST-API',
    RESTEASY = 'RESTEASY',
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
    SMTPS = 'SMTPS',
    SOLR = 'SOLR',
    SOLRS = 'SOLRS',
    SPARK = 'SPARK',
    SPARKREST = 'SPARK-REST',
    SPLUNK = 'SPLUNK',
    SPLUNKHEC = 'SPLUNK-HEC',
    SPRINGBATCH = 'SPRING-BATCH',
    SPRINGJDBC = 'SPRING-JDBC',
    SPRINGINTEGRATION = 'SPRING-INTEGRATION',
    SPRINGLDAP = 'SPRING-LDAP',
    SPRINGREDIS = 'SPRING-REDIS',
    SPRINGRABBITMQ = 'SPRING-RABBITMQ',
    SPRINGWS = 'SPRING-WS',
    SPRINGEVENT = 'SPRING-EVENT',
    SQL = 'SQL',
    SQLSTORED = 'SQL-STORED',
    SSH = 'SSH',
    SONICMQ = 'SONICMQ',
    STAX = 'STAX',
    STICH = 'STICH',
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
    VERTXHTTP = 'VERTX-HTTP',
    VERTXKAFKA = 'VERTX-KAFKA',
    VERTXWEBSOCKET = 'VERTX-WEBSOCKET',
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
        name: 'AMAZONMQ',
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
        name: 'AMQPS',
        assimblyTypeLink: `/component-amqps`,
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
        name: 'AWS2-ATHENA',
        assimblyTypeLink: `/component-aws2-athena`,
        camelTypeLink: `/aws2-athena-component.html`,
        uriPlaceholder: 'label',
        uriPopoverMessage: `
        <b>Name</b>: label<br/>
        <b>Description</b>: Logical name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: MyLabel<br/>
    `
    },
    {
        name: 'AWS2-CW',
        assimblyTypeLink: `/component-aws2-cw`,
        camelTypeLink: `/aws2-cw-component.html`,
        uriPlaceholder: 'Namespace',
        uriPopoverMessage: `
        <b>Name</b>: Namespace<br/>
        <b>Description</b>: The metric namespace.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: Namespace<br/>
    `
    },
    {
        name: 'AWS2-DDB',
        assimblyTypeLink: `/component-aws2-ddb`,
        camelTypeLink: `/aws2-ddb-component.html`,
        uriPlaceholder: 'tableName',
        uriPopoverMessage: `
        <b>Name</b>: tableName<br/>
        <b>Description</b>: The name of the table currently worked with..<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: domainName<br/>
    `
    },
    {
        name: 'AWS2-DDBSTREAMS',
        assimblyTypeLink: `/component-aws2-ddbstream`,
        camelTypeLink: `/aws2-ddbstream-component.html`,
        uriPlaceholder: 'table-name[',
        uriPopoverMessage: `
        <b>Name</b>: table-name[<br/>
        <b>Description</b>: Name of the dynamodb table.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: label<br/>
    `
    },
    {
        name: 'AWS2-EC2',
        assimblyTypeLink: `/component-aws2-ec2`,
        camelTypeLink: `/aws2-ec2-component.html`,
        uriPlaceholder: 'label',
        uriPopoverMessage: `
        <b>Name</b>: label<br/>
        <b>Description</b>: Logical name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: label<br/>
    `
    },
    {
        name: 'AWS2-ECS',
        assimblyTypeLink: `/component-aws2-ecs`,
        camelTypeLink: `/aws2-ecs-component.html`,
        uriPlaceholder: 'label',
        uriPopoverMessage: `
        <b>Name</b>: label<br/>
        <b>Description</b>: Logical name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: label<br/>
    `
    },
    {
        name: 'AWS2-EKS',
        assimblyTypeLink: `/component-aws2-eks`,
        camelTypeLink: `/aws2-eks-component.html`,
        uriPlaceholder: 'label',
        uriPopoverMessage: `
        <b>Name</b>: label<br/>
        <b>Description</b>: Logical name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: label<br/>
    `
    },
    {
        name: 'AWS2-EVENTBRIDGE',
        assimblyTypeLink: `/component-aws2-eventbridge`,
        camelTypeLink: `/aws2-eventbridge-component.html`,
        uriPlaceholder: 'label',
        uriPopoverMessage: `
        <b>Name</b>: label<br/>
        <b>Description</b>: Logical name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: label<br/>
    `
    },
    {
        name: 'AWS2-IAM',
        assimblyTypeLink: `/component-aws2-iam`,
        camelTypeLink: `/aws2-iam-component.html`,
        uriPlaceholder: 'label',
        uriPopoverMessage: `
        <b>Name</b>: label<br/>
        <b>Description</b>: Logical name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: label<br/>
    `
    },
    {
        name: 'AWS2-KMS',
        assimblyTypeLink: `/component-aws2-kms`,
        camelTypeLink: `/aws2-kms-component.html`,
        uriPlaceholder: 'label',
        uriPopoverMessage: `
        <b>Name</b>: label<br/>
        <b>Description</b>: Logical name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: label<br/>
    `
    },
    {
        name: 'AWS2-KINESIS',
        assimblyTypeLink: `/component-aws2-kinesis`,
        camelTypeLink: `/aws2-kinesis-component.html`,
        uriPlaceholder: 'stream-name',
        uriPopoverMessage: `
        <b>Name</b>: stream-name<br/>
        <b>Description</b>: Name of the stream.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: streamName<br/>
    `
    },
    {
        name: 'AWS2-KINESIS-FIREHOSE',
        assimblyTypeLink: `/component-aws2-kinesis-firehose`,
        camelTypeLink: `/aws2-kinesis-firehose-component.html`,
        uriPlaceholder: 'delivery-stream-name',
        uriPopoverMessage: `
        <b>Name</b>: delivery-stream-name<br/>
        <b>Description</b>: Name of the stream.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: streamName<br/>
    `
    },
    {
        name: 'AWS2-LAMBDA',
        assimblyTypeLink: `/component-aws2-lambda`,
        camelTypeLink: `/aws2-lambda-component.html`,
        uriPlaceholder: 'functionName',
        uriPopoverMessage: `
        <b>Name</b>: functionName<br/>
        <b>Description</b>: Name of the Lambda function.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: functionX<br/>
    `
    },
    {
        name: 'AWS2-MSK',
        assimblyTypeLink: `/component-aws2-msk`,
        camelTypeLink: `/aws2-msk-component.html`,
        uriPlaceholder: 'label',
        uriPopoverMessage: `
        <b>Name</b>: label<br/>
        <b>Description</b>: Logical name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: label<br/>
		`
    },
    {
        name: 'AWS2-MQ',
        assimblyTypeLink: `/component-aws2-mq`,
        camelTypeLink: `/aws2-mq-component.html`,
        uriPlaceholder: 'label',
        uriPopoverMessage: `
        <b>Name</b>: label<br/>
        <b>Description</b>: Logical name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: label<br/>
		`
    },
    {
        name: 'AWS2-S3',
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
        name: 'AWS-SECRETS-MANAGER',
        assimblyTypeLink: `/component-aws-secrets-manager`,
        camelTypeLink: `/aws-secrets-manager-component.html`,
        uriPlaceholder: 'label',
        uriPopoverMessage: `
        <b>Name</b>: label<br/>
        <b>Description</b>: Logical name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: label<br/>
		`
    },
    {
        name: 'AWS2-STS',
        assimblyTypeLink: `/component-aws2-sts`,
        camelTypeLink: `/aws2-sts-component.html`,
        uriPlaceholder: 'label',
        uriPopoverMessage: `
        <b>Name</b>: label<br/>
        <b>Description</b>: Logical name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: label<br/>
    `
    },
    {
        name: 'AWS2-SNS',
        assimblyTypeLink: `/component-aws2-sns`,
        camelTypeLink: `/aws2-sns-component.html`,
        uriPlaceholder: 'topicNameOrArn',
        uriPopoverMessage: `
        <b>Name</b>: topicNameOrArn<br/>
        <b>Description</b>: Topic name or ARN.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: MyTopic<br/>
    `
    },
    {
        name: 'AWS2-SQS',
        assimblyTypeLink: `/component-aws2-sqs`,
        camelTypeLink: `/aws2-sqs-component.html`,
        uriPlaceholder: 'Topic name or ARN',
        uriPopoverMessage: `
        <b>Name</b>: Topic name or ARN<br/>
        <b>Description</b>: Queue name or ARN.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: MyQueue<br/>
    `
    },
    {
        name: 'AWS2-TRANSLATE',
        assimblyTypeLink: `/component-aws2-translate`,
        camelTypeLink: `/aws2-translate-component.html`,
        uriPlaceholder: 'label',
        uriPopoverMessage: `
        <b>Name</b>: label<br/>
        <b>Description</b>: Logical name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Example</b>: label<br/>
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
        name: 'ARANGODB',
        assimblyTypeLink: `/component-arangodb`,
        camelTypeLink: `/arangodb-component.html`,
        uriPlaceholder: 'database',
        uriPopoverMessage: `
        <b>Name</b>: database<br/>
        <b>Description</b>: Database name. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'ATMOSPHERE-WEBSOCKET',
        assimblyTypeLink: `/component-atmosphere-websocket`,
        camelTypeLink: `/atmosphere-websocket-component.html`,
        uriPlaceholder: 'feedUri',
        uriPopoverMessage: `
        <b>Name</b>: feedUri<br/>
        <b>Description</b>: The URI to the feed to poll. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'ATOM',
        assimblyTypeLink: `/component-atom`,
        camelTypeLink: `/atom-component.html`,
        uriPlaceholder: 'feedUri',
        uriPopoverMessage: `
        <b>Name</b>: servicePath<br/>
        <b>Description</b>: The URI to the feed to poll. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'ATOMIX-MAP',
        assimblyTypeLink: `/component-atomix-map`,
        camelTypeLink: `/atomix-map-component.html`,
        uriPlaceholder: 'resourceName',
        uriPopoverMessage: `
        <b>Name</b>: resourceName<br/>
        <b>Description</b>: The distributed resource name. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'ATOMIX-MESSAGING',
        assimblyTypeLink: `/component-atomix-messaging`,
        camelTypeLink: `/atomix-messaging-component.html`,
        uriPlaceholder: 'resourceName',
        uriPopoverMessage: `
        <b>Name</b>: resourceName<br/>
        <b>Description</b>: The distributed resource name. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'ATOMIX-MULTIMAP',
        assimblyTypeLink: `/component-atomix-multimap`,
        camelTypeLink: `/atomix-multimap-component.html`,
        uriPlaceholder: 'resourceName',
        uriPopoverMessage: `
        <b>Name</b>: resourceName<br/>
        <b>Description</b>: The distributed resource name. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'ATOMIX-QUEUE',
        assimblyTypeLink: `/component-atomix-queue`,
        camelTypeLink: `/atomix-queue-component.html`,
        uriPlaceholder: 'resourceName',
        uriPopoverMessage: `
        <b>Name</b>: resourceName<br/>
        <b>Description</b>: The distributed resource name. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'ATOMIX-SET',
        assimblyTypeLink: `/component-atomix-set`,
        camelTypeLink: `/atomix-set-component.html`,
        uriPlaceholder: 'resourceName',
        uriPopoverMessage: `
        <b>Name</b>: resourceName<br/>
        <b>Description</b>: The distributed resource name. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'ATOMIX-VALUE',
        assimblyTypeLink: `/component-atomix-value`,
        camelTypeLink: `/atomix-value-component.html`,
        uriPlaceholder: 'resourceName',
        uriPopoverMessage: `
        <b>Name</b>: resourceName<br/>
        <b>Description</b>: The distributed resource name. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'ATLASMAP',
        assimblyTypeLink: `/component-atlasmap`,
        camelTypeLink: `/atlasmap-component.html`,
        uriPlaceholder: 'mappingName',
        uriPopoverMessage: `
        <b>Name</b>: mappingName<br/>
        <b>Description</b>: The classpath-local URI of the AtlasMap mapping definition, either ADM archive file or mapping definition JSON file to process. Path to the resource. You can prefix with: classpath, file, http, ref, or bean. classpath, file and http loads the resource using these protocols (classpath is default). ref will lookup the resource in the registry. bean will call a method on a bean to be used as the resource. For bean you can specify the method name after dot, eg bean:myBean.myMethod. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'AVRO',
        assimblyTypeLink: `/component-avro`,
        camelTypeLink: `/atomix-avro.html`,
        uriPlaceholder: 'transport:host:port/messageName',
        uriPopoverMessage: `
        <b>Name</b>: transport<br/>
        <b>Description</b>: Transport to use, can be either http or netty. The value can be one of: http, netty. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: AvroTransport<br/>
        <b>Name</b>: host<br/>
        <b>Description</b>: Hostname to use. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: port <br/>
        <b>Description</b>: Port number to use. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: int<br/>
        <b>Name</b>: messageName<br/>
        <b>Description</b>: The name of the message to send.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'AZURE-COSMOSDB',
        assimblyTypeLink: `/azure-cosmosdb`,
        camelTypeLink: `/azure-cosmosdb-component.html`,
        uriPlaceholder: '[databaseName][/containerName]',
        uriPopoverMessage: `
        <b>Name</b>: databaseName<br/>
        <b>Description</b>: The name of the database<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
         <b>Name</b>: container<br/>
        <b>Description</b>: The name of the container.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'AZURE-EVENTHUBS',
        assimblyTypeLink: `/azure-eventhub`,
        camelTypeLink: `/azure-eventhubs-component.html`,
        uriPlaceholder: '[namespace/eventHubName]',
        uriPopoverMessage: `
        <b>Name</b>: namespace<br/>
        <b>Description</b>: EventHubs namespace created in Azure Portal<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
         <b>Name</b>: eventHubName<br/>
        <b>Description</b>: EventHubs name under a specific namcespace.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'AZURE-STORAGE-BLOB',
        assimblyTypeLink: `/azure-storage-blob`,
        camelTypeLink: `/azure-storage-blob-component.html`,
        uriPlaceholder: 'accountName[/containerName]',
        uriPopoverMessage: `
        <b>Name</b>: accountName<br/>
        <b>Description</b>: Windows Azure Storage account. Azure account name to be used for authentication with azure blob services<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
         <b>Name</b>: containerName<br/>
        <b>Description</b>: The blob container name <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'AZURE-STORAGE-DATALAKE',
        assimblyTypeLink: `/azure-storage-datalake`,
        camelTypeLink: `/azure-storage-datalake-component.html`,
        uriPlaceholder: 'accountName[/fileSystemName]',
        uriPopoverMessage: `
        <b>Name</b>: accountName<br/>
        <b>Description</b>: Windows Azure Storage account. Azure account name to be used for authentication with azure blob services<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
         <b>Name</b>: fileSystemName<br/>
        <b>Description</b>: Name of the filesystem to be used. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'AZURE-STORAGE-QUEUE',
        assimblyTypeLink: `/azure-storage-queue`,
        camelTypeLink: `/azure-storage-queue-component.html`,
        uriPlaceholder: 'accountName[/queueName]',
        uriPopoverMessage: `
        <b>Name</b>: storageAccount<br/>
        <b>Description</b>: Windows Azure Storage account. Azure account name to be used for authentication with azure blob services<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
         <b>Name</b>: queueName<br/>
        <b>Description</b>: The queue resource name<br/>
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
        name: 'CAFFEINE-CACHE',
        assimblyTypeLink: `/component-caffeine-cache`,
        camelTypeLink: `/caffeine-cache-component.html`,
        uriPlaceholder: 'cacheName',
        uriPopoverMessage: `
        <b>Name</b>: cacheName<br/>
        <b>Description</b>: The cache name. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'CAFFEINE-LOADCACHE',
        assimblyTypeLink: `/component-caffeine-loadcache`,
        camelTypeLink: `/caffeine-loadcache-component.html`,
        uriPlaceholder: 'cacheName',
        uriPopoverMessage: `
        <b>Name</b>: cacheName<br/>
        <b>Description</b>: The cache name. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'CQL',
        assimblyTypeLink: `/component-cql`,
        camelTypeLink: `/cql-component.html`,
        uriPlaceholder: 'beanRef:hosts:port/keyspace',
        uriPopoverMessage: `
        <b>Name</b>: beanRef<br/>
        <b>Description</b>: beanRef is defined using bean:id. <br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: hosts<br/>
        <b>Description</b>: Hostname(s) cassansdra server(s). Multiple hosts can be separated by comma. <br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: Port number of cassansdra server(s). <br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: int<br/>
        <b>Name</b>: keyspace<br/>
        <b>Description</b>: Keyspace to use. <br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'CHATSCRIPT',
        assimblyTypeLink: `/component-chatscript`,
        camelTypeLink: `/chatscript-component.html`,
        uriPlaceholder: 'host:port/botName',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: Hostname or IP of the server on which CS server is running. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: Port on which ChatScript is listening to. <br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: int<br/>
        <b>Name</b>: botName<br/>
        <b>Description</b>:  Name of the Bot in CS to converse with. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'CHUNK',
        assimblyTypeLink: `/component-chunk`,
        camelTypeLink: `/chunk-component.html`,
        uriPlaceholder: 'resourceUri',
        uriPopoverMessage: `
        <b>Name</b>: resourceUri<br/>
        <b>Description</b>: Path to the resource. You can prefix with: classpath, file, http, ref, or bean. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'CLASS',
        assimblyTypeLink: `/component-class`,
        camelTypeLink: `/class-component.html`,
        uriPlaceholder: 'beanName',
        uriPopoverMessage: `
        <b>Name</b>: beanName<br/>
        <b>Description</b>: Sets the name of the bean to invoke. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'CM-SMS',
        assimblyTypeLink: `/component-cm-sms`,
        camelTypeLink: `/cm-sms-component.html`,
        uriPlaceholder: 'host',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: SMS Provider HOST with scheme <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'CMIS',
        assimblyTypeLink: `/component-cmis`,
        camelTypeLink: `/cmis-component.html`,
        uriPlaceholder: 'cmsUrl',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: URL to the cmis repository. <br/>
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
        name: 'COMETD',
        assimblyTypeLink: `/component-cometd`,
        camelTypeLink: `/cometd-component.html`,
        uriPlaceholder: 'host:port/channelName',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: hostname <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: port <br/>
        <b>Description</b>: Host port number <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: int<br/>
        <b>Name</b>: channelname <br/>
        <b>Description</b>: The channelName represents a topic that can be subscribed to by the Camel endpoints. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'CONSUL',
        assimblyTypeLink: `/component-consul`,
        camelTypeLink: `/consul-component.html`,
        uriPlaceholder: 'apiEndpoint',
        uriPopoverMessage: `
        <b>Name</b>: apiEndpoint<br/>
        <b>Description</b>: The API endpoint <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'CORDA',
        assimblyTypeLink: `/component-corda`,
        camelTypeLink: `/corda-component.html`,
        uriPlaceholder: 'node',
        uriPopoverMessage: `
        <b>Name</b>: node<br/>
        <b>Description</b>: The url for the corda node <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'COUCHBASE',
        assimblyTypeLink: `/component-couchbase`,
        camelTypeLink: `/couchbase-component.html`,
        uriPlaceholder: 'protocol:hostname:port',
        uriPopoverMessage: `
        <b>Name</b>: protocol<br/>
        <b>Description</b>: The protocol to use <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: hostname<br/>
        <b>Description</b>: The hostname to use <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: The port number to use <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: int<br/>
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
        name: 'CRYPTO',
        assimblyTypeLink: `/component-crypto`,
        camelTypeLink: `/crypto-component.html`,
        uriPlaceholder: 'cryptoOperation:name',
        uriPopoverMessage: `
        <b>Name</b>: cryptoOperation<br/>
        <b>Description</b>:  Set the Crypto operation from that supplied after the crypto scheme in the endpoint uri e.g. crypto:sign sets sign as the operation. The value can be one of: sign, verify. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: CryptoOperation<br/>
        <b>Name</b>: name<br/>
        <b>Description</b>:  The logical name of this operation. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'CRYPTO-CMS',
        assimblyTypeLink: `/component-crypto-cms`,
        camelTypeLink: `/crypto-cms-component.html`,
        uriPlaceholder: 'cryptoOperation:name',
        uriPopoverMessage: `
        <b>Name</b>: cryptoOperation<br/>
        <b>Description</b>:  Set the Crypto operation from that supplied after the crypto scheme in the endpoint uri e.g. crypto:sign sets sign as the operation. The value can be one of: sign, verify. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: CryptoOperation<br/>
        <b>Name</b>: name<br/>
        <b>Description</b>: The name part in the URI can be chosen by the user to distinguish between different signer/verifier/encryptor/decryptor endpoints within the camel context. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'CXF',
        assimblyTypeLink: `/component-cxf`,
        camelTypeLink: `/cxf-component.html`,
        uriPlaceholder: 'beanId:address',
        uriPopoverMessage: `
        <b>Name</b>: beanId<br/>
        <b>Description</b>: To lookup an existing configured CxfEndpoint. Must used bean: as prefix. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: address<br/>
        <b>Description</b>: The service publish address. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'CXFRS',
        assimblyTypeLink: `/component-cxfrs`,
        camelTypeLink: `/cxfrs-component.html`,
        uriPlaceholder: 'beanId:address',
        uriPopoverMessage: `
        <b>Name</b>: beanId<br/>
        <b>Description</b>: To lookup an existing configured CxfEndpoint. Must used bean: as prefix. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: address<br/>
        <b>Description</b>: The service publish address. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
    `
    },
    {
        name: 'DATAFORMAT',
        assimblyTypeLink: `/component-dataformat`,
        camelTypeLink: `/dataformat-component.html`,
        uriPlaceholder: 'name:operation',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>:  Name of data format.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: operation<br/>
        <b>Description</b>:  Operation to use either marshal or unmarshal. The value can be one of: marshal, unmarshal.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'DATASET',
        assimblyTypeLink: `/component-dataset`,
        camelTypeLink: `/dataset-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: Name of DataSet to lookup in the registry<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: DataSet <br/><br/>
    `
    },
    {
        name: 'DATASET-TEST',
        assimblyTypeLink: `/component-dataset-test`,
        camelTypeLink: `/dataset-test-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: Name of DataSet to lookup in the registry<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: DataSet <br/><br/>
    `
    },
    {
        name: 'DEBEZIUM-MONGODB',
        assimblyTypeLink: `/component-debezium-mongodb`,
        camelTypeLink: `/debezium-mongodb-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: Unique name for the connector. Attempting to register again with the same name will fail.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'DEBEZIUM-MYSQL',
        assimblyTypeLink: `/component-debezium-mysql`,
        camelTypeLink: `/debezium-mysql-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: Unique name for the connector. Attempting to register again with the same name will fail.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'DEBEZIUM-POSTGRESQL',
        assimblyTypeLink: `/component-debezium-postgres`,
        camelTypeLink: `/debezium-postgres-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: Unique name for the connector. Attempting to register again with the same name will fail.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'DEBEZIUM-SQLSERVER',
        assimblyTypeLink: `/component-debezium-sqlserver`,
        camelTypeLink: `/debezium-sqlserver-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: Unique name for the connector. Attempting to register again with the same name will fail.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'DIGITALOCEAN',
        assimblyTypeLink: `/component-digitalocean`,
        camelTypeLink: `/digitalocean-component.html`,
        uriPlaceholder: 'operation',
        uriPopoverMessage: `
        <b>Name</b>: operation<br/>
        <b>Description</b>: The operation to perform to the given resource.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: DigitalOceanOperations <br/><br/>
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
        name: 'DISRUPTOR',
        assimblyTypeLink: `/component-disruptor`,
        camelTypeLink: `/disruptor-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: Name of queue.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'DJL',
        assimblyTypeLink: `/component-djl`,
        camelTypeLink: `/djl-component.html`,
        uriPlaceholder: 'application',
        uriPopoverMessage: `
        <b>Name</b>: application<br/>
        <b>Description</b>: Application name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'DNS',
        assimblyTypeLink: `/component-dns`,
        camelTypeLink: `/dns-component.html`,
        uriPlaceholder: 'dnsType',
        uriPopoverMessage: `
        <b>Name</b>: dnsType<br/>
        <b>Description</b>: The type of the lookup. The value can be one of: dig, ip, lookup, wikipedia.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: DnsType <br/><br/>
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
        name: 'DOZER',
        assimblyTypeLink: `/component-dozer`,
        camelTypeLink: `/dozer-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>:A human readable name of the mapping.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'DRILL',
        assimblyTypeLink: `/component-drill`,
        camelTypeLink: `/drill-component.html`,
        uriPlaceholder: 'host',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: Host name or IP address.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
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
        name: 'EHCACHE',
        assimblyTypeLink: `/component-ehcache`,
        camelTypeLink: `/ehcache-component.html`,
        uriPlaceholder: 'cacheName',
        uriPopoverMessage: `
        <b>Name</b>: cacheName <br/>
        <b>Description</b>: The cache name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
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
        name: 'ELSQL',
        assimblyTypeLink: `/component-elsql`,
        camelTypeLink: `/elsql-component.html`,
        uriPlaceholder: 'elsqlName:resourceUri',
        uriPopoverMessage: `
        <b>Name</b>: elsqlName <br/>
        <b>Description</b>: The name of the elsql to use (is NAMED in the elsql file).<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'ETCD-KEYS',
        assimblyTypeLink: `/component-etcd-keys`,
        camelTypeLink: `/etcd-keys-component.html`,
        uriPlaceholder: 'path',
        uriPopoverMessage: `
        <b>Name</b>: path <br/>
        <b>Description</b>: The path the endpoint refers to.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'ETCD-STATS',
        assimblyTypeLink: `/component-etcd-stats`,
        camelTypeLink: `/etcd-stats-component.html`,
        uriPlaceholder: 'path',
        uriPopoverMessage: `
        <b>Name</b>: path <br/>
        <b>Description</b>: The path the endpoint refers to.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'ETCD-WATCH',
        assimblyTypeLink: `/component-etcd-watch`,
        camelTypeLink: `/etcd-watch-component.html`,
        uriPlaceholder: 'path',
        uriPopoverMessage: `
        <b>Name</b>: path <br/>
        <b>Description</b>: The path the endpoint refers to.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'EXEC',
        assimblyTypeLink: `/component-exec`,
        camelTypeLink: `/exec-component.html`,
        uriPlaceholder: 'executable',
        uriPopoverMessage: `
        <b>Name</b>: executable <br/>
        <b>Description</b>: Sets the executable to be executed. The executable must not be empty or null.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'FACEBOOK',
        assimblyTypeLink: `/component-facebook`,
        camelTypeLink: `/facebook-component.html`,
        uriPlaceholder: 'methodName',
        uriPopoverMessage: `
        <b>Name</b>: methodName <br/>
        <b>Description</b>: What operation to perform.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'FHIR',
        assimblyTypeLink: `/component-fhir`,
        camelTypeLink: `/fhir-component.html`,
        uriPlaceholder: 'apiName/methodName',
        uriPopoverMessage: `
        <b>Name</b>: apiName <br/>
        <b>Description</b>: What kind of operation to perform. The value can be one of: capabilities, create, delete, history, load-page, meta, patch, read, search, transaction, update, validate.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: FhirApiName <br/><br/>
        <b>Name</b>: methodName <br/>
        <b>Description</b>: What sub operation to use for the selected operation.<br/>
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
        name: 'FILE-WATCH',
        assimblyTypeLink: `/component-filewatch`,
        camelTypeLink: `/filewatch-component.html`,
        uriPlaceholder: 'path',
        uriPopoverMessage: `
        <b>Name</b>: path<br/>
        <b>Description</b>: Path of directory to consume events from.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'FLATPACK',
        assimblyTypeLink: `/component-flatpack`,
        camelTypeLink: `/flatpack-component.html`,
        uriPlaceholder: 'type:resourceUri',
        uriPopoverMessage: `
        <b>Name</b>: type<br/>
        <b>Description</b>: Whether to use fixed or delimiter. The value can be one of: fixed, delim.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: FlatpackType <br/><br/>
        <b>Name</b>: resourceUri<br/>
        <b>Description</b>: URL for loading the flatpack mapping file from classpath or file system.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'FLINK',
        assimblyTypeLink: `/component-flink`,
        camelTypeLink: `/flink-component.html`,
        uriPlaceholder: 'endpointType',
        uriPopoverMessage: `
        <b>Name</b>: endpointType<br/>
        <b>Description</b>: Type of the endpoint (dataset, datastream). The value can be one of: dataset, datastream.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: EndpointType <br/><br/>
    `
    },
    {
        name: 'FOP',
        assimblyTypeLink: `/component-fop`,
        camelTypeLink: `/fop-component.html`,
        uriPlaceholder: 'outputType',
        uriPopoverMessage: `
        <b>Name</b>: outputType<br/>
        <b>Description</b>: The primary output format is PDF but other output formats are also supported. The value can be one of: pdf, ps, pcl, png, jpeg, svg, xml, mif, rtf, txt.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: FopOutputType <br/><br/>
    `
    },
    {
        name: 'FREEMARKER',
        assimblyTypeLink: `/component-freemarker`,
        camelTypeLink: `/freemarker-component.html`,
        uriPlaceholder: 'resourceUri',
        uriPopoverMessage: `
        <b>Name</b>: resourceUri<br/>
        <b>Description</b>: Path to the resource. You can prefix with: classpath, file, http, ref, or bean.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
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
        name: 'GANGLIA',
        assimblyTypeLink: `/component-ganglia`,
        camelTypeLink: `/ganglia-component.html`,
        uriPlaceholder: 'host:port',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: Host name for Ganglia server.<br/>
        <b>Required</b>: no <br/>
        <b>Default</b>: 239.2.11.71<br/>
        <b>Data Type</b>: String <br/>
        <b>Name</b>: port<br/>
        <b>Description</b>:  Port for Ganglia server.<br/>
        <b>Required</b>: no <br/>
        <b>Default</b>: 8649<br/>
        <b>Data Type</b>: int <br/>
        <br/>
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
        name: 'GITHUB',
        assimblyTypeLink: `/component-github`,
        camelTypeLink: `/github-component.html`,
        uriPlaceholder: 'type/branchName',
        uriPopoverMessage: `
        <b>Name</b>: type<br/>
        <b>Description</b>: What git operation to execute. The value can be one of: CLOSEPULLREQUEST, PULLREQUESTCOMMENT, COMMIT, PULLREQUEST, TAG, PULLREQUESTSTATE, PULLREQUESTFILES, GETCOMMITFILE, CREATEISSUE.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: GitHubType <br/>
        <b>Name</b>: branchName<br/>
        <b>Description</b>: Name of branch.<br/>
        <b>Required</b>: no <br/>
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
        name: 'GOOGLE-BIG-QUERY-SQL',
        assimblyTypeLink: `/component-google-bigquery-sql`,
        camelTypeLink: `/google-bigquery-sql-component.html`,
        uriPlaceholder: 'project-id:query',
        uriPopoverMessage: `
        <b>Name</b>: project-id<br/>
        <b>Description</b>: Google Cloud Project Id.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/>
        <br/>
        <b>Name</b>: query <br/>
        <b>Description</b>: BigQuery standard SQL query.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/>
        <br/>
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
        name: 'GOOGLE-CALENDAR-STREAM',
        assimblyTypeLink: `/component-google-calendar-stream`,
        camelTypeLink: `/google-calendar-stream-component.html`,
        uriPlaceholder: 'index',
        uriPopoverMessage: `
        <b>Name</b>: index<br/>
        <b>Description</b>: Specifies an index for the endpoint.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/>
        <br/>
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
        name: 'GOOGLE-FUNCTIONS',
        assimblyTypeLink: `/component-google-functions`,
        camelTypeLink: `/google-functions-component.html`,
        uriPlaceholder: 'functionName',
        uriPopoverMessage: `
        <b>Name</b>: functionName<br/>
        <b>Description</b>: The user-defined name of the function.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: string <br/>
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
        name: 'GOOGLE-MAIL-STREAM',
        assimblyTypeLink: `/component-google-mail-stream`,
        camelTypeLink: `/google-mail-stream-component.html`,
        uriPlaceholder: 'index',
        uriPopoverMessage: `
        <b>Name</b>: index<br/>
        <b>Description</b>: Specifies an index for the endpoint.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/>
        <br/>
    `
    },
    {
        name: 'GOOGLE-PUBSUB',
        assimblyTypeLink: `/component-google-pubsub`,
        camelTypeLink: `/google-pubsub-component.html`,
        uriPlaceholder: 'index',
        uriPopoverMessage: `
        <b>Name</b>: projectId<br/>
        <b>Description</b>:  Project Id.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/>
        <b>Name</b>: DestinationName <br/>
        <b>Description</b>: Destination Name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/>
        <br/>
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
        name: 'GOOGLE-SHEETS-STREAM',
        assimblyTypeLink: `/component-google-sheets-stream`,
        camelTypeLink: `/google-sheets-stream-component.html`,
        uriPlaceholder: 'apiName',
        uriPopoverMessage: `
        <b>Name</b>: index<br/>
        <b>Description</b>: Sets the apiName.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/>
        <br/>
    `
    },
    {
        name: 'GOOGLE-STORAGE',
        assimblyTypeLink: `/component-google-storage`,
        camelTypeLink: `/google-storage-component.html`,
        uriPlaceholder: 'bucketNameOrArn',
        uriPopoverMessage: `
        <b>Name</b>: bucketNameOrArn<br/>
        <b>Description</b>: What kind of operation to perform (see docs).<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: GoogleSheetsApiName <br/>
        <br/>
        <b>Example</b>: myCamelBucket <br/>
    `
    },
    {
        name: 'GORA',
        assimblyTypeLink: `/component-gora`,
        camelTypeLink: `/gora-component.html`,
        uriPlaceholder: 'apiName',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: Instance name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/>
        <br/>
    `
    },
    {
        name: 'GRAPE',
        assimblyTypeLink: `/component-grape`,
        camelTypeLink: `/grape-component.html`,
        uriPlaceholder: 'defaultCoordinates',
        uriPopoverMessage: `
        <b>Name</b>: defaultCoordinates<br/>
        <b>Description</b>: Maven coordinates to use as default to grab if the message body is empty.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/>
        <br/>
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
        name: 'GRPC',
        assimblyTypeLink: `/component-grpc`,
        camelTypeLink: `/grpc-component.html`,
        uriPlaceholder: 'host:port/service',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: The gRPC server host name. This is localhost or 0.0.0.0 when being a consumer or remote server host name when using producer.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: The gRPC local or remote server port.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: int <br/>
        <b>Name</b>: service<br/>
        <b>Description</b>: Fully qualified service name from the protocol buffer descriptor file (package dot service definition name).<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/>
        <br/>
    `
    },
    {
        name: 'GUAVA-EVENTBUS',
        assimblyTypeLink: `/component-guava-eventbus`,
        camelTypeLink: `/guava-eventbus-component.html`,
        uriPlaceholder: 'eventBusRef',
        uriPopoverMessage: `
        <b>Name</b>: eventBusRef<br/>
        <b>Description</b>: To lookup the Guava EventBus from the registry with the given name.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/>
        <br/>
    `
    },
    {
        name: 'HAZELCAST-ATOMICVALUE',
        assimblyTypeLink: `/component-hazelcast-atomicvalue`,
        camelTypeLink: `/hazelcast-atomicvalue-component.html`,
        uriPlaceholder: 'cacheName',
        uriPopoverMessage: `
        <b>Name</b>: cacheName<br/>
        <b>Description</b>: The name of the cache.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'HAZELCAST-INSTANCE',
        assimblyTypeLink: `/component-hazelcast-instance`,
        camelTypeLink: `/hazelcast-instance-component.html`,
        uriPlaceholder: 'cacheName',
        uriPopoverMessage: `
        <b>Name</b>: cacheName<br/>
        <b>Description</b>: The name of the cache.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'HAZELCAST-LIST',
        assimblyTypeLink: `/component-hazelcast-list`,
        camelTypeLink: `/hazelcast-list-component.html`,
        uriPlaceholder: 'cacheName',
        uriPopoverMessage: `
        <b>Name</b>: cacheName<br/>
        <b>Description</b>: The name of the cache.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'HAZELCAST-MAP',
        assimblyTypeLink: `/component-hazelcast-map`,
        camelTypeLink: `/hazelcast-map-component.html`,
        uriPlaceholder: 'cacheName',
        uriPopoverMessage: `
        <b>Name</b>: cacheName<br/>
        <b>Description</b>: The name of the cache.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'HAZELCAST-MULTIMAP',
        assimblyTypeLink: `/component-hazelcast-multimap`,
        camelTypeLink: `/hazelcast-multimap-component.html`,
        uriPlaceholder: 'cacheName',
        uriPopoverMessage: `
        <b>Name</b>: cacheName<br/>
        <b>Description</b>: The name of the cache.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'HAZELCAST-QUEUE',
        assimblyTypeLink: `/component-hazelcast-queue`,
        camelTypeLink: `/hazelcast-queue-component.html`,
        uriPlaceholder: 'cacheName',
        uriPopoverMessage: `
        <b>Name</b>: cacheName<br/>
        <b>Description</b>: The name of the cache.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'HAZELCAST-REPLICATEDMAP',
        assimblyTypeLink: `/component-hazelcast-replicatedmap`,
        camelTypeLink: `/hazelcast-replicatedmap-component.html`,
        uriPlaceholder: 'cacheName',
        uriPopoverMessage: `
        <b>Name</b>: cacheName<br/>
        <b>Description</b>: The name of the cache.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'HAZELCAST-RINGBUFFER',
        assimblyTypeLink: `/component-hazelcast-ringbuffer`,
        camelTypeLink: `/hazelcast-ringbuffer-component.html`,
        uriPlaceholder: 'cacheName',
        uriPopoverMessage: `
        <b>Name</b>: cacheName<br/>
        <b>Description</b>: The name of the cache.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'HAZELCAST-SEDA',
        assimblyTypeLink: `/component-hazelcast-seda`,
        camelTypeLink: `/hazelcast-seda-component.html`,
        uriPlaceholder: 'cacheName',
        uriPopoverMessage: `
        <b>Name</b>: cacheName<br/>
        <b>Description</b>: The name of the cache.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'HAZELCAST-SET',
        assimblyTypeLink: `/component-hazelcast-set`,
        camelTypeLink: `/hazelcast-set-component.html`,
        uriPlaceholder: 'cacheName',
        uriPopoverMessage: `
        <b>Name</b>: cacheName<br/>
        <b>Description</b>: The name of the cache.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'HAZELCAST-TOPIC',
        assimblyTypeLink: `/component-hazelcast-topic`,
        camelTypeLink: `/hazelcast-topic-component.html`,
        uriPlaceholder: 'cacheName',
        uriPopoverMessage: `
        <b>Name</b>: cacheName<br/>
        <b>Description</b>: The name of the cache.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
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
        name: 'HWCLOUD-FUNCTIONGRAPH',
        assimblyTypeLink: `/component-hwcloud-funcitonsgraph`,
        camelTypeLink: `/hwcloud-functionsgraph-component.html`,
        uriPlaceholder: 'operation',
        uriPopoverMessage: `
        <b>Name</b>: operation<br/>
        <b>Description</b>: Operation to be performed.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'HWCLOUD-IAM',
        assimblyTypeLink: `/component-hwcloud-iam`,
        camelTypeLink: `/hwcloud-iam-component.html`,
        uriPlaceholder: 'operation',
        uriPopoverMessage: `
        <b>Name</b>: operation<br/>
        <b>Description</b>: Operation to be performed.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'HWCLOUD-SMN',
        assimblyTypeLink: `/component-smn-client`,
        camelTypeLink: `/hwcloud-smn-component.html`,
        uriPlaceholder: 'service',
        uriPopoverMessage: `
        <b>Name</b>: service<br/>
        <b>Description</b>: Name of SMN service to invoke.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'IBMMQ',
        assimblyTypeLink: `/component-ibmmq`,
        camelTypeLink: `/jms-component.html`,
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
        name: 'IEC60870-CLIENT',
        assimblyTypeLink: `/component-iec60870-client`,
        camelTypeLink: `/iec60870-client-component.html`,
        uriPlaceholder: 'uriPath',
        uriPopoverMessage: `
        <b>Name</b>: uriPath<br/>
        <b>Description</b>: The object information address.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: ObjectAddress <br/><br/>
    `
    },
    {
        name: 'IEC60870-SERVER',
        assimblyTypeLink: `/component-iec60870-server`,
        camelTypeLink: `/iec60870-server-component.html`,
        uriPlaceholder: 'uriPath',
        uriPopoverMessage: `
        <b>Name</b>: uriPath<br/>
        <b>Description</b>: The object information address.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: ObjectAddress <br/><br/>
    `
    },
    {
        name: 'IGNITE-CACHE',
        assimblyTypeLink: `/component-ignite-cache`,
        camelTypeLink: `/ignite-cache-component.html`,
        uriPlaceholder: 'cacheName',
        uriPopoverMessage: `
        <b>Name</b>: cacheName<br/>
        <b>Description</b>: The cache name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'IGNITE-COMPUTE',
        assimblyTypeLink: `/component-ignite-compute`,
        camelTypeLink: `/ignite-compute-component.html`,
        uriPlaceholder: 'endpointId',
        uriPopoverMessage: `
        <b>Name</b>: endpointId<br/>
        <b>Description</b>: The endpoint ID (not used).<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'IGNITE-EVENTS',
        assimblyTypeLink: `/component-ignite-events`,
        camelTypeLink: `/ignite-events-component.html`,
        uriPlaceholder: 'endpointId',
        uriPopoverMessage: `
        <b>Name</b>: endpointId<br/>
        <b>Description</b>: The endpoint ID (not used).<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'IGNITE-IDGEN',
        assimblyTypeLink: `/component-ignite-idgen`,
        camelTypeLink: `/ignite-idgen-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: The sequence name.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'IGNITE-MESSAGING',
        assimblyTypeLink: `/component-ignite-messaging`,
        camelTypeLink: `/ignite-messaging-component.html`,
        uriPlaceholder: 'topic',
        uriPopoverMessage: `
        <b>Name</b>: topic<br/>
        <b>Description</b>: The topic name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'IGNITE-QUEUE',
        assimblyTypeLink: `/component-ignite-queue`,
        camelTypeLink: `/ignite-queue-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: The queue name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'IGNITE-SETS',
        assimblyTypeLink: `/component-ignite-sets`,
        camelTypeLink: `/ignite-sets-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: The set name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
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
        name: 'INFINISPAN',
        assimblyTypeLink: `/component-infinispan`,
        camelTypeLink: `/infinispan-component.html`,
        uriPlaceholder: 'cacheName',
        uriPopoverMessage: `
        <b>Name</b>: cacheName<br/>
        <b>Description</b>:  The name of the cache to use. Use current to use the existing cache name from the currently configured cached manager. Or use default for the default cache manager name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'INFLUXDB',
        assimblyTypeLink: `/component-influxdb`,
        camelTypeLink: `/influxdb-component.html`,
        uriPlaceholder: 'connectionBean',
        uriPopoverMessage: `
        <b>Name</b>: connectionBean<br/>
        <b>Description</b>: Connection to the influx database, of class InfluxDB.class.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'IOTA',
        assimblyTypeLink: `/component-iota`,
        camelTypeLink: `/iota-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: Component name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'IPFS',
        assimblyTypeLink: `/component-ipfs`,
        camelTypeLink: `/ipfs-component.html`,
        uriPlaceholder: 'ipfsCmd',
        uriPopoverMessage: `
        <b>Name</b>: ipfsCmd<br/>
        <b>Description</b>: The ipfs command. The value can be one of: add, cat, get, version.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'IRC',
        assimblyTypeLink: `/component-irc`,
        camelTypeLink: `/irc-component.html`,
        uriPlaceholder: 'hostname:port',
        uriPopoverMessage: `
        <b>Name</b>: hostname<br/>
        <b>Description</b>: Hostname for the IRC chat server.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: Port number for the IRC chat server. If no port is configured then a default port of either 6667, 6668 or 6669 is used.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: int <br/><br/>
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
        name: 'JBPM',
        assimblyTypeLink: `/component-jbpm`,
        camelTypeLink: `/jbpm-component.html`,
        uriPlaceholder: 'connectionURL',
        uriPopoverMessage: `
        <b>Name</b>: connectionURL<br/>
        <b>Description</b>: The URL to the jBPM server.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: URL <br/><br/>
        <b>Name</b>: eventListenerType<br/>
        <b>Description</b>: Sets the event listener type to attach to.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'JCACHE',
        assimblyTypeLink: `/component-jcache`,
        camelTypeLink: `/jcache-component.html`,
        uriPlaceholder: 'cacheName',
        uriPopoverMessage: `
        <b>Name</b>: cacheName<br/>
        <b>Description</b>: The name of the cache.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'JCLOUDS',
        assimblyTypeLink: `/component-jclouds`,
        camelTypeLink: `/jclouds-component.html`,
        uriPlaceholder: 'command:providerId',
        uriPopoverMessage: `
        <b>Name</b>: command<br/>
        <b>Description</b>: What command to execute such as blobstore or compute. The value can be one of: blobstore, compute.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: JcloudsCommand <br/><br/>
        <b>Name</b>: providerId<br/>
        <b>Description</b>: The name of the cloud provider that provides the target service (e.g. aws-s3 or aws_ec2).<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'JCR',
        assimblyTypeLink: `/component-jcr`,
        camelTypeLink: `/jcr-component.html`,
        uriPlaceholder: 'host/base',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: Name of the javax.jcr.Repository to lookup from the Camel registry to be used.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: base<br/>
        <b>Description</b>: Get the base node when accessing the repository.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'JDBC',
        assimblyTypeLink: `/component-jdbc`,
        camelTypeLink: `/jdbc-component.html`,
        uriPlaceholder: 'dataSourceName',
        uriPopoverMessage: `
        <b>Name</b>: dataSourceName<br/>
        <b>Description</b>: Name of DataSource to lookup in the Registry. If the name is dataSource or default, then Camel will attempt to lookup a default DataSource from the registry, meaning if there is a only one instance of DataSource found, then this DataSource will be used.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
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
        name: 'JGROUPS',
        assimblyTypeLink: `/component-jgroups`,
        camelTypeLink: `/jgroups-component.html`,
        uriPlaceholder: 'clusterName',
        uriPopoverMessage: `
        <b>Name</b>: clusterName<br/>
        <b>Description</b>: The name of the JGroups cluster the component should connect to.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'JGROUPSRAFT',
        assimblyTypeLink: `/component-jgroups-raft`,
        camelTypeLink: `/jgroups-raft-component.html`,
        uriPlaceholder: 'clusterName',
        uriPopoverMessage: `
        <b>Name</b>: clusterName<br/>
        <b>Description</b>: The name of the JGroupsraft cluster the component should connect to.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'JING',
        assimblyTypeLink: `/component-jing`,
        camelTypeLink: `/jing-component.html`,
        uriPlaceholder: 'resourceUri',
        uriPopoverMessage: `
        <b>Name</b>: resourceUri<br/>
        <b>Description</b>: URL to a local resource on the classpath or a full URL to a remote resource or resource on the file system which contains the schema to validate against.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'JIRA',
        assimblyTypeLink: `/component-jira`,
        camelTypeLink: `/jira-component.html`,
        uriPlaceholder: 'type',
        uriPopoverMessage: `
        <b>Name</b>: type<br/>
        <b>Description</b>: Operation to perform.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: JiraType <br/><br/>
    `
    },
    {
        name: 'JMS',
        assimblyTypeLink: `/component-jms`,
        camelTypeLink: `/jms-component.html`,
        uriPlaceholder: 'destinationType:destinationName',
        uriPopoverMessage: `
        <b>Name</b>: destinationType<br/>
        <b>Description</b>: The kind of destination to use. The value can be one of: queue, topic, temp-queue, temp-topic.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: destinationName<br/>
        <b>Description</b>: Name of the queue or topic to use as destination.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'JMX',
        assimblyTypeLink: `/component-jmx`,
        camelTypeLink: `/jmx-component.html`,
        uriPlaceholder: 'serverURL',
        uriPopoverMessage: `
        <b>Name</b>: serverURL<br/>
        <b>Description</b>: Server url comes from the remaining endpoint. Use platform to connect to local JVM.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/><br/>
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
        name: 'JOOQ',
        assimblyTypeLink: `/component-jooq`,
        camelTypeLink: `/jooq-component.html`,
        uriPlaceholder: 'entityType',
        uriPopoverMessage: `
        <b>Name</b>: entityType<br/>
        <b>Description</b>: JOOQ entity class.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: Class <br/><br/>
    `
    },
    {
        name: 'JPA',
        assimblyTypeLink: `/component-jpa`,
        camelTypeLink: `/jpa-component.html`,
        uriPlaceholder: 'entityType',
        uriPopoverMessage: `
        <b>Name</b>: entityType<br/>
        <b>Description</b>: Entity class name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'JSLT',
        assimblyTypeLink: `/component-jslt`,
        camelTypeLink: `/jslt-component.html`,
        uriPlaceholder: 'resourceUri',
        uriPopoverMessage: `
        <b>Name</b>: resourceUri<br/>
        <b>Description</b>: Path to the resource.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'JSONATA',
        assimblyTypeLink: `/component-jsonata`,
        camelTypeLink: `/jsonata-component.html`,
        uriPlaceholder: 'specName',
        uriPopoverMessage: `
        <b>Name</b>: specName<br/>
        <b>Description</b>: The classpath-local URI of the specification to invoke; or the complete URL of the remote specification.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'JSON-VALIDATOR',
        assimblyTypeLink: `/component-json-validator`,
        camelTypeLink: `/json-validator-component.html`,
        uriPlaceholder: 'resourceUri',
        uriPopoverMessage: `
        <b>Name</b>: resourceUri<br/>
        <b>Description</b>: Path to the resource.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'JT400',
        assimblyTypeLink: `/component-jt400`,
        camelTypeLink: `/jt400-component.html`,
        uriPlaceholder: 'userID:password/systemName/objectPath.type',
        uriPopoverMessage: `
        <b>Name</b>: userID<br/>
        <b>Description</b>: Returns the ID of the AS/400 user.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/>
        <b>Name</b>: password<br/>
        <b>Description</b>: Returns the password of the AS/400 user.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/>
        <b>Name</b>: systemName<br/>
        <b>Description</b>: Returns the name of the AS/400 system.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/>
        <b>Name</b>: objectPath<br/>
        <b>Description</b>: Returns the fully qualified integrated file system path name of the target object of this endpoint.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/>
        <b>Name</b>: type<br/>
        <b>Description</b>: Whether to work with data queues or remote program call. The value can be one of: DTAQ, PGM, SRVPGM.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: Jt400Type <br/><br/>
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
        name: 'KAMELET',
        assimblyTypeLink: `/component-kamelet`,
        camelTypeLink: `/kamelet-component.html`,
        uriPlaceholder: 'templateId/routeId',
        uriPopoverMessage: `
        <b>Name</b>: templeteId<br/>
        <b>Description</b>:  The Route Template ID.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/>
        <b>Name</b>: routeID<br/>
        <b>Description</b>:  The Route ID. Default value notice: The ID will be auto-generated if not provided.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Example</b>: setMyBody<br/>
    `
    },
    {
        name: 'KUBERNETES-CONFIG-MAPS',
        assimblyTypeLink: `/component-kubernetes-config-maps`,
        camelTypeLink: `/kubernetes-config-maps-component.html`,
        uriPlaceholder: 'masterUrl',
        uriPopoverMessage: `
        <b>Name</b>: masterUrl<br/>
        <b>Description</b>: Kubernetes Master url.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'KUBERNETES-DEPLOYMENTS',
        assimblyTypeLink: `/component-kubernetes-deployments`,
        camelTypeLink: `/kubernetes-deployments-component.html`,
        uriPlaceholder: 'masterUrl',
        uriPopoverMessage: `
        <b>Name</b>: masterUrl<br/>
        <b>Description</b>: Kubernetes Master url.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'KUBERNETES-HPA',
        assimblyTypeLink: `/component-kubernetes-hpa`,
        camelTypeLink: `/kubernetes-hpa-component.html`,
        uriPlaceholder: 'masterUrl',
        uriPopoverMessage: `
        <b>Name</b>: masterUrl<br/>
        <b>Description</b>: Kubernetes Master url.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'KUBERNETES-JOB',
        assimblyTypeLink: `/component-kubernetes-job`,
        camelTypeLink: `/kubernetes-job-component.html`,
        uriPlaceholder: 'masterUrl',
        uriPopoverMessage: `
        <b>Name</b>: masterUrl<br/>
        <b>Description</b>: Kubernetes Master url.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'KUBERNETES-NAMESPACES',
        assimblyTypeLink: `/component-kubernetes-namespaces`,
        camelTypeLink: `/kubernetes-namespaces-component.html`,
        uriPlaceholder: 'masterUrl',
        uriPopoverMessage: `
        <b>Name</b>: masterUrl<br/>
        <b>Description</b>: Kubernetes Master url.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'KUBERNETES-NODES',
        assimblyTypeLink: `/component-kubernetes-nodes`,
        camelTypeLink: `/kubernetes-nodes-component.html`,
        uriPlaceholder: 'masterUrl',
        uriPopoverMessage: `
        <b>Name</b>: masterUrl<br/>
        <b>Description</b>: Kubernetes Master url.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'KUBERNETES-PERSISTENT-VOLUMES',
        assimblyTypeLink: `/component-kubernetes-persistent-volumes`,
        camelTypeLink: `/kubernetes-persistent-volumes-component.html`,
        uriPlaceholder: 'masterUrl',
        uriPopoverMessage: `
        <b>Name</b>: masterUrl<br/>
        <b>Description</b>: Kubernetes Master url.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'KUBERNETES-PERSISTENT-VOLUMES-CLAIM',
        assimblyTypeLink: `/component-kubernetes-persistent-volumes-claim`,
        camelTypeLink: `/kubernetes-persistent-volumes-claim-component.html`,
        uriPlaceholder: 'masterUrl',
        uriPopoverMessage: `
        <b>Name</b>: masterUrl<br/>
        <b>Description</b>: Kubernetes Master url.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'KUBERNETES-PODS',
        assimblyTypeLink: `/component-kubernetes-pods`,
        camelTypeLink: `/kubernetes-pods-component.html`,
        uriPlaceholder: 'masterUrl',
        uriPopoverMessage: `
        <b>Name</b>: masterUrl<br/>
        <b>Description</b>: Kubernetes Master url.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'KUBERNETES-REPLICATION-CONTROLLERS',
        assimblyTypeLink: `/component-kubernetes-replication-controllers`,
        camelTypeLink: `/kubernetes-replication-controllers-component.html`,
        uriPlaceholder: 'masterUrl',
        uriPopoverMessage: `
        <b>Name</b>: masterUrl<br/>
        <b>Description</b>: Kubernetes Master url.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'KUBERNETES-RESOURCES-QUOTA',
        assimblyTypeLink: `/component-kubernetes-resources-quota`,
        camelTypeLink: `/kubernetes-resources-quota-component.html`,
        uriPlaceholder: 'masterUrl',
        uriPopoverMessage: `
        <b>Name</b>: masterUrl<br/>
        <b>Description</b>: Kubernetes Master url.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'KUBERNETES-SECRETS',
        assimblyTypeLink: `/component-kubernetes-secrets`,
        camelTypeLink: `/kubernetes-secrets-component.html`,
        uriPlaceholder: 'masterUrl',
        uriPopoverMessage: `
        <b>Name</b>: masterUrl<br/>
        <b>Description</b>: Kubernetes Master url.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'KUBERNETES-SERVICE-ACCOUNTS',
        assimblyTypeLink: `/component-kubernetes-service-accounts`,
        camelTypeLink: `/kubernetes-service-accounts-component.html`,
        uriPlaceholder: 'masterUrl',
        uriPopoverMessage: `
        <b>Name</b>: masterUrl<br/>
        <b>Description</b>: Kubernetes Master url.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'KUBERNETES-SERVICES',
        assimblyTypeLink: `/component-kubernetes-services`,
        camelTypeLink: `/kubernetes-services-component.html`,
        uriPlaceholder: 'masterUrl',
        uriPopoverMessage: `
        <b>Name</b>: masterUrl<br/>
        <b>Description</b>: Kubernetes Master url.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'KUDU',
        assimblyTypeLink: `/component-kudu`,
        camelTypeLink: `/kudu-component.html`,
        uriPlaceholder: 'host:port/tableName',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: Host of the server to connect to.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: Port of the server to connect to.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/>
        <b>Name</b>: tableName<br/>
        <b>Description</b>: Table to connect to.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'LANGUAGE',
        assimblyTypeLink: `/component-language`,
        camelTypeLink: `/language-component.html`,
        uriPlaceholder: 'languageName:resourceUri',
        uriPopoverMessage: `
        <b>Name</b>: languageName <br/>
        <b>Description</b>: Sets the name of the language to use <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/>
        <b>Name</b>: resourceUri <br/>
        <b>Description</b>: Path to the resource, or a reference to lookup a bean in the Registry to use as the resource <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
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
        name: 'LDIF',
        assimblyTypeLink: `/component-ldif`,
        camelTypeLink: `/ldif-component.html`,
        uriPlaceholder: 'ldapConnectionName',
        uriPopoverMessage: `
        <b>Name</b>: ldapConnectionName <br/>
        <b>Description</b>:The name of the LdapConnection bean to pull from the registry. Note that this must be of scope prototype to avoid it being shared among threads or using a connection that has timed out. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'LOG',
        assimblyTypeLink: `/component-log`,
        camelTypeLink: `/log-component.html`,
        uriPlaceholder: 'loggerName',
        uriPopoverMessage: `
        <b>Name</b>: loggerName <br/>
        <b>Description</b>: Name of the logging category to use. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'LUCENE',
        assimblyTypeLink: `/component-lucene`,
        camelTypeLink: `/lucene-component.html`,
        uriPlaceholder: 'host:operation',
        uriPopoverMessage: `
        <b>Name</b>: host <br/>
        <b>Description</b>: The URL to the lucene server <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: operation <br/>
        <b>Description</b>: Operation to do such as insert or query. The value can be one of: insert, query <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: LuceneOperation <br/><br/>
    `
    },
    {
        name: 'LUMBERJACK',
        assimblyTypeLink: `/component-lumberjack`,
        camelTypeLink: `/lumberjack-component.html`,
        uriPlaceholder: 'host:port',
        uriPopoverMessage: `
        <b>Name</b>: host <br/>
        <b>Description</b>: Network interface on which to listen for Lumberjack. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: port <br/>
        <b>Description</b>: Network port on which to listen for Lumberjack. <br/>
        <b>Default</b>: 5044 <br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: int <br/><br/>
    `
    },
    {
        name: 'MASTER',
        assimblyTypeLink: `/component-master`,
        camelTypeLink: `/master-component.html`,
        uriPlaceholder: 'namespace:delegateUri',
        uriPopoverMessage: `
        <b>Name</b>: namespace <br/>
        <b>Description</b>: The name of the cluster namespace to use. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: delegateUri <br/>
        <b>Description</b>: The endpoint uri to use in master/slave mode. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'METRICS',
        assimblyTypeLink: `/component-metrics`,
        camelTypeLink: `/metrics-component.html`,
        uriPlaceholder: 'metricsType:metricsName',
        uriPopoverMessage: `
        <b>Name</b>: metricsType <br/>
        <b>Description</b>: Type of metrics. The value can be one of: gauge, counter, histogram, meter, timer <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: MetricsType <br/><br/>
        <b>Name</b>: metricsName <br/>
        <b>Description</b>: Name of metrics. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'MICROMETER',
        assimblyTypeLink: `/component-micrometer`,
        camelTypeLink: `/micrometer-component.html`,
        uriPlaceholder: 'micrometer:metricsType:metricsName',
        uriPopoverMessage: `
        <b>Name</b>: metricsType<br/>
        <b>Description</b>: Type of metrics. The value can be one of: COUNTER, GAUGE, LONG_TASK_TIMER, TIMER, DISTRIBUTION_SUMMARY, OTHER. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: Type<br/>
        <b>Name</b>: metricsName<br/>
        <b>Description</b>: Name of metrics. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: tags<br/>
        <b>Description</b>: Tags of metrics. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: Iterable<br/>
        <br/>
    `
    },
    {
        name: 'MICROPROFILE-METRICS',
        assimblyTypeLink: `/component-microprofile-metrics`,
        camelTypeLink: `/microprofile-metrics-component.html`,
        uriPlaceholder: 'metricsType:metricsName',
        uriPopoverMessage: `
        <b>Name</b>: metricsType <br/>
        <b>Description</b>: Type of metrics. The value can be one of: gauge, counter, histogram, meter, timer <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: MetricsType <br/><br/>
        <b>Name</b>: metricsName <br/>
        <b>Description</b>: Name of metrics. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'MINA',
        assimblyTypeLink: `/component-mina`,
        camelTypeLink: `/mina-component.html`,
        uriPlaceholder: 'protocol:host:port',
        uriPopoverMessage: `
        <b>Name</b>: protocol<br/>
        <b>Description</b>: Protocol to use.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: host<br/>
        <b>Description</b>: Hostname to use. Use localhost or 0.0.0.0 for local server as consumer. For producer use the hostname or ip address of the remote server.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: Port number.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: int<br/>
        <br/>
    `
    },
    {
        name: 'MINIO',
        assimblyTypeLink: `/component-mino`,
        camelTypeLink: `/minio-component.html`,
        uriPlaceholder: 'bucketName',
        uriPopoverMessage: `
        <b>Name</b>: bucketName<br/>
        <b>Description</b>: Bucket name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'MLLP',
        assimblyTypeLink: `/component-mllp`,
        camelTypeLink: `/mllp-component.html`,
        uriPlaceholder: 'hostname:port',
        uriPopoverMessage: `
        <b>Name</b>: hostname<br/>
        <b>Description</b>: Hostname or IP for connection for the TCP connection. The default value is null, which means any local IP address.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: Port number for the TCP connection.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: int<br/>
        <br/>
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
        name: 'MONGODB-GRIDFS',
        assimblyTypeLink: `/component-mongodb-gridfs`,
        camelTypeLink: `/mongodb-gridfs-component.html`,
        uriPlaceholder: 'connectionBean',
        uriPopoverMessage: `
        <b>Name</b>: connectionBean<br/>
        <b>Description</b>: Name of com.mongodb.client.MongoClient to use. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'MSV',
        assimblyTypeLink: `/component-msv`,
        camelTypeLink: `/msv-component.html`,
        uriPlaceholder: 'resourceUri',
        uriPopoverMessage: `
        <b>Name</b>: resourceUri<br/>
        <b>Description</b>: URL to a local resource on the classpath, or a reference to lookup a bean in the Registry, or a full URL to a remote resource or resource on the file system which contains the XSD to validate against. <br/>
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
        name: 'MYBATIS',
        assimblyTypeLink: `/component-mybatis`,
        camelTypeLink: `/mybatis-component.html`,
        uriPlaceholder: 'statement',
        uriPopoverMessage: `
        <b>Name</b>: statement<br/>
        <b>Description</b>: The statement name in the MyBatis XML mapping file which maps to the query, insert, update or delete operation you wish to evaluate.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'MYBATIS-BEAN',
        assimblyTypeLink: `/component-mybatis-bean`,
        camelTypeLink: `/mybatis-bean-component.html`,
        uriPlaceholder: 'beanName:methodName',
        uriPopoverMessage: `
        <b>Name</b>: beanName<br/>
        <b>Description</b>: Name of the bean with the MyBatis annotations. This can either by a type alias or a FQN class name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: methodName<br/>
        <b>Description</b>: Name of the method on the bean that has the SQL query to be executed.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'NAGIOS',
        assimblyTypeLink: `/component-nagios`,
        camelTypeLink: `/nagios-component.html`,
        uriPlaceholder: 'host:port',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: This is the address of the Nagios host where checks should be send. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: The port number of the host. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: int<br/>
        <br/>
    `
    },
    {
        name: 'NATS',
        assimblyTypeLink: `/component-nagios`,
        camelTypeLink: `/nagios-component.html`,
        uriPlaceholder: 'topic',
        uriPopoverMessage: `
        <b>Name</b>: topic<br/>
        <b>Description</b>: The name of topic we want to use. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'NATS',
        assimblyTypeLink: `/component-nagios`,
        camelTypeLink: `/nagios-component.html`,
        uriPlaceholder: 'topic',
        uriPopoverMessage: `
        <b>Name</b>: topic<br/>
        <b>Description</b>: The name of topic we want to use. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
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
        name: 'NETTY-HTTP',
        assimblyTypeLink: `/component-nagios`,
        camelTypeLink: `/nagios-component.html`,
        uriPlaceholder: 'protocol:host:port/path',
        uriPopoverMessage: `
        <b>Name</b>: protocol<br/>
        <b>Description</b>: The protocol to use which is either http, https or proxy - a consumer only option. The value can be one of: http, https. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: host<br/>
        <b>Description</b>: The local hostname such as localhost, or 0.0.0.0 when being a consumer. The remote HTTP server hostname when using producer. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: The host port number. <br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: int<br/>
        <b>Name</b>: path <br/>
        <b>Description</b>: Resource path. <br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'NITRITE',
        assimblyTypeLink: `/component-nsq`,
        camelTypeLink: `/nsq-component.html`,
        uriPlaceholder: 'database',
        uriPopoverMessage: `
        <b>Name</b>: database<br/>
        <b>Description</b>: Path to database file. Will be created if not exists. <br/>
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
        name: 'OAIPMH',
        assimblyTypeLink: `/component-oai-pmh`,
        camelTypeLink: `/oaipmh-component.html`,
        uriPlaceholder: 'url',
        uriPopoverMessage: `
        <b>Name</b>: url<br/>
        <b>Description</b>:  What kind of operation to perform. The value can be one of: DEFAULT. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: Olingo2ApiName<br/>
        <br/>
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
        name: 'MILO-CLIENT',
        assimblyTypeLink: `/component-milo-client`,
        camelTypeLink: `/milo-client-component.html`,
        uriPlaceholder: 'endpointUri',
        uriPopoverMessage: `
        <b>Name</b>: endpointUri<br/>
        <b>Description</b>:  The OPC UA server endpoint. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'MILO-SERVER',
        assimblyTypeLink: `/component-milo-server`,
        camelTypeLink: `/milo-server-component.html`,
        uriPlaceholder: 'itemId',
        uriPopoverMessage: `
        <b>Name</b>: itemId<br/>
        <b>Description</b>: ID of the item. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'OPENSHIFT-BUILD-CONFIGS',
        assimblyTypeLink: `/component-openshift-build-configs`,
        camelTypeLink: `/openshift-build-configs-component.html`,
        uriPlaceholder: 'masterUrl',
        uriPopoverMessage: `
        <b>Name</b>: masterUrl<br/>
        <b>Description</b>: Kubernetes Master url. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'OPENSHIFT-BUILDS',
        assimblyTypeLink: `/component-openshift-builds`,
        camelTypeLink: `/openshift-builds-component.html`,
        uriPlaceholder: 'masterUrl',
        uriPopoverMessage: `
        <b>Name</b>: masterUrl<br/>
        <b>Description</b>: Kubernetes Master url. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'OPENSTACK-CINDER',
        assimblyTypeLink: `/component-openstack-cinder`,
        camelTypeLink: `/openstack-cinder-component.html`,
        uriPlaceholder: 'host',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: OpenStack host url. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'OPENSTACK-GLANCE',
        assimblyTypeLink: `/component-openstack-glance`,
        camelTypeLink: `/openstack-glance-component.html`,
        uriPlaceholder: 'host',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: OpenStack host url. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'OPENSTACK-KEYSTONE',
        assimblyTypeLink: `/component-openstack-keystone`,
        camelTypeLink: `/openstack-keystone-component.html`,
        uriPlaceholder: 'host',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: OpenStack host url. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'OPENSTACK-NEUTRON',
        assimblyTypeLink: `/component-openstack-neutron`,
        camelTypeLink: `/openstack-neutron-component.html`,
        uriPlaceholder: 'host',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: OpenStack host url. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'OPENSTACK-NOVA',
        assimblyTypeLink: `/component-openstack-nova`,
        camelTypeLink: `/openstack-nova-component.html`,
        uriPlaceholder: 'host',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: OpenStack host url. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'OPENSTACK-SWIFT',
        assimblyTypeLink: `/component-openstack-swift`,
        camelTypeLink: `/openstack-swift-component.html`,
        uriPlaceholder: 'host',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: OpenStack host url. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'OPTAPLANNER',
        assimblyTypeLink: `/component-optaplanner`,
        camelTypeLink: `/optaplanner-component.html`,
        uriPlaceholder: 'configFile',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: Specifies the location to the solver file. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'PAHO',
        assimblyTypeLink: `/component-paho`,
        camelTypeLink: `/paho-component.html`,
        uriPlaceholder: 'topic',
        uriPopoverMessage: `
        <b>Name</b>: topic<br/>
        <b>Description</b>: Name of the topic.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'PAHO-MQTT5',
        assimblyTypeLink: `/component-paho-mqtt5`,
        camelTypeLink: `/paho-mqtt5-component.html`,
        uriPlaceholder: 'topic',
        uriPopoverMessage: `
        <b>Name</b>: topic<br/>
        <b>Description</b>: Name of the topic.<br/>
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
        name: 'PLATFORM-HTTP',
        assimblyTypeLink: `/component-platform-http`,
        camelTypeLink: `/platform-http-component.html`,
        uriPlaceholder: 'path',
        uriPopoverMessage: `
        <b>Name</b>: path<br/>
        <b>Description</b>: The path under which this endpoint serves the HTTP requests.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'PGEVENT',
        assimblyTypeLink: `/component-pgevent`,
        camelTypeLink: `/pgevent-component.html`,
        uriPlaceholder: 'host:port/database/channel',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: To connect using hostname and port to the database.<br/>
        <b>Required</b>: no <br/>
        <b>Default</b>: localhost<br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: To connect using hostname and port to the database.<br/>
        <b>Required</b>: no <br/>
        <b>Default</b>: 5432<br/>
        <b>Data Type</b>: Integer<br/>
        <b>Name</b>: database<br/>
        <b>Description</b>: The database name.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: channel<br/>
        <b>Description</b>: The channel name.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/>
        <br/>
        <b>Example</b>: create<br/>
    `
    },
    {
        name: 'PG-REPLICATION-SLOT',
        assimblyTypeLink: `/component-replication-slot`,
        camelTypeLink: `/pg-replication-slot-component.html`,
        uriPlaceholder: 'host:port/database/slot:outputPlugin',
        uriPopoverMessage: `
        <b>Name</b>: slot<br/>
        <b>Description</b>: Replication Slot name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: host<br/>
        <b>Description</b>: Postgres host.<br/>
        <b>Required</b>: no <br/>
        <b>Default</b>: localhost<br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: Postgres port.<br/>
        <b>Required</b>: no <br/>
        <b>Default</b>: 5432<br/>
        <b>Data Type</b>: Integer<br/>
        <b>Name</b>: database<br/>
        <b>Description</b>: Postgres database name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: outputPlugin<br/>
        <b>Description</b>: Output plugin name.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'PUBNUB',
        assimblyTypeLink: `/component-pubnub`,
        camelTypeLink: `/pubnub-component.html`,
        uriPlaceholder: 'channel',
        uriPopoverMessage: `
        <b>Name</b>: channel<br/>
        <b>Description</b>: The channel used for subscribing/publishing events.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'PULSAR',
        assimblyTypeLink: `/component-pulsar`,
        camelTypeLink: `/pulsar-component.html`,
        uriPlaceholder: 'persistence://tenant/namespace/topic',
        uriPopoverMessage: `
        <b>Name</b>: persistence<br/>
        <b>Description</b>: Whether the topic is persistent or non-persistent. The value can be one of: persistent, non-persistent.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: tenant<br/>
        <b>Description</b>: The tenant.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: namespace<br/>
        <b>Description</b>: The namespace.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: topic<br/>
        <b>Description</b>: The topic.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'QUARTZ2',
        assimblyTypeLink: `/component-quartz`,
        camelTypeLink: `/quartz-component.html`,
        uriPlaceholder: 'groupName/triggerName',
        uriPopoverMessage: `
        <b>Name</b>: groupName<br/>
        <b>Description</b>: The quartz group name to use. The combination of group name and timer name should be unique.<br/>
        <b>Required</b>: no <br/>
        <b>Default</b>: Camel <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: triggerName<br/>
        <b>Description</b>: The quartz timer name to use. The combination of group name and timer name should be unique.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'QUICKFIX',
        assimblyTypeLink: `/component-quickfix`,
        camelTypeLink: `/quickfix-component.html`,
        uriPlaceholder: 'configurationName',
        uriPopoverMessage: `
        <b>Name</b>: configurationName<br/>
        <b>Description</b>: The configFile is the name of the QuickFIX/J configuration to use for the FIX engine (located as a resource found in your classpath).<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
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
        name: 'REACTIVE-STREAMS',
        assimblyTypeLink: `/component-reactive-streams`,
        camelTypeLink: `/reactive-streams-component.html`,
        uriPlaceholder: 'stream',
        uriPopoverMessage: `
        <b>Name</b>: stream<br/>
        <b>Description</b>: Name of the stream channel used by the endpoint to exchange messages.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'REF',
        assimblyTypeLink: `/component-ref`,
        camelTypeLink: `/ref-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: Name of endpoint to lookup in the registry.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/>
        <br/>
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
        name: 'REST-API',
        assimblyTypeLink: `/component-rest-api`,
        camelTypeLink: `/rest-api-component.html`,
        uriPlaceholder: 'path/contextIdPattern',
        uriPopoverMessage: `
        <b>Name</b>: path<br/>
        <b>Description</b>: The base path.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Name</b>: contextIdPattern<br/>
        <b>Description</b>: Optional CamelContext id pattern to only allow Rest APIs from rest services within CamelContext’s which name matches the pattern.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/><br/>
        `
    },
    {
        name: 'RESTEASY',
        assimblyTypeLink: `/component-resteasy`,
        camelTypeLink: `/resteasy-component.html`,
        uriPlaceholder: 'httpUri',
        uriPopoverMessage: `
        <b>Name</b>: httpUri<br/>
        <b>Description</b>: The url of the HTTP endpoint to call.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        `
    },
    {
        name: 'RESTLET',
        assimblyTypeLink: `/component-restlet`,
        camelTypeLink: `/restlet-component.html`,
        uriPlaceholder: 'protocol://hostname[:port][/resourcePattern]',
        uriPopoverMessage: `
        <b>Name</b>: protocol<br/>
        <b>Description</b>: The protocol to use which is http or https.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Name</b>: host<br/>
        <b>Description</b>: The hostname of the restlet service.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: The port number of the restlet service.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Name</b>: uriPattern<br/>
        <b>Description</b>: The resource pattern such as /customer/id.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/><br/>
        `
    },
    {
        name: 'REST-OPENAPI',
        assimblyTypeLink: `/component-rest-openapi`,
        camelTypeLink: `/rest-openapi-component.html`,
        uriPlaceholder: 'specificationUri#operationId',
        uriPopoverMessage: `
        <b>Name</b>: specificationUri<br/>
        <b>Description</b>: Path to the OpenApi specification file.<br/>
        <b>Required</b>: yes <br/>
        <b>Default</b>: openapi.json <br/>
        <b>Data Type</b>: URI<br/><br/>
        <b>Name</b>: operationId<br/>
        <b>Description</b>: ID of the operation from the OpenApi specification.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        `
    },
    {
        name: 'REST-SWAGGER',
        assimblyTypeLink: `/component-rest-swagger`,
        camelTypeLink: `/rest-swagger-component.html`,
        uriPlaceholder: 'specificationUri#operationId',
        uriPopoverMessage: `
        <b>Name</b>: specificationUri<br/>
        <b>Description</b>: Path to the Swagger specification file. The scheme, host base path are taken from this specification, but these can be overridden with properties on the component or endpoint level.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: URI<br/><br/>
        <b>Name</b>: operationId<br/>
        <b>Description</b>: ID of the operation from the Swagger specification.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        `
    },
    {
        name: 'RSS',
        assimblyTypeLink: `/component-rss`,
        camelTypeLink: `/rss-component.html`,
        uriPlaceholder: 'feedUri',
        uriPopoverMessage: `
        <b>Name</b>: feedUri<br/>
        <b>Description</b>: The URI to the feed to poll.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        `
    },
    {
        name: 'SAGA',
        assimblyTypeLink: `/component-saga`,
        camelTypeLink: `/saga-component.html`,
        uriPlaceholder: 'action',
        uriPopoverMessage: `
        <b>Name</b>: action<br/>
        <b>Description</b>: Action to execute (complete or compensate). The value can be one of: COMPLETE, COMPENSATE.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: SagaEndpointAction<br/><br/>
        `
    },
    {
        name: 'SALESFORCE',
        assimblyTypeLink: `/component-salesforce`,
        camelTypeLink: `/salesforce-component.html`,
        uriPlaceholder: 'operationName:topicName',
        uriPopoverMessage: `
        <b>Name</b>: operationName<br/>
        <b>Description</b>: The operation to use.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: OperationName<br/><br/>
        <b>Name</b>: topicName<br/>
        <b>Description</b>: The name of the topic/channel to use.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        `
    },
    {
        name: 'SAP-NETWEAVER',
        assimblyTypeLink: `/component-sap-netweaver`,
        camelTypeLink: `/sap-netweaver-component.html`,
        uriPlaceholder: 'url',
        uriPopoverMessage: `
        <b>Name</b>: url<br/>
        <b>Description</b>: Url to the SAP net-weaver gateway server.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
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
        name: 'SCHEMATRON',
        assimblyTypeLink: `/component-schematron`,
        camelTypeLink: `/schematron-component.html`,
        uriPlaceholder: 'path',
        uriPopoverMessage: `
        <b>Name</b>: path<br/>
        <b>Description</b>: The path to the schematron rules file. Can either be in class path or location in the file system.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'SCP',
        assimblyTypeLink: `/component-scp`,
        camelTypeLink: `/scp-component.html`,
        uriPlaceholder: 'host:port/directoryName',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: Hostname of the FTP server.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: Port of the FTP server.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: int<br/>
        <b>Name</b>: directoryName<br/>
        <b>Description</b>: The starting directory.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'SERVICE',
        assimblyTypeLink: `/component-service`,
        camelTypeLink: `/service-component.html`,
        uriPlaceholder: 'delegateUri',
        uriPopoverMessage: `
        <b>Name</b>: delegateUri<br/>
        <b>Description</b>: The endpoint uri to expose as service<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'SERVICENOW',
        assimblyTypeLink: `/component-servicenow`,
        camelTypeLink: `/servicenow-component.html`,
        uriPlaceholder: 'instanceName',
        uriPopoverMessage: `
        <b>Name</b>: instanceName<br/>
        <b>Description</b>:  The ServiceNow instance name<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'SERVLET',
        assimblyTypeLink: `/component-servlet`,
        camelTypeLink: `/servlet-component.html`,
        uriPlaceholder: 'contextPath',
        uriPopoverMessage: `
        <b>Name</b>: contextPath<br/>
        <b>Description</b>:  The context-path to use<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
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
        name: 'SJMS2',
        assimblyTypeLink: `/component-sjms2`,
        camelTypeLink: `/sjms2-component.html`,
        uriPlaceholder: 'destinationType:destinationName',
        uriPopoverMessage: `
        <b>Name</b>: destinationType<br/>
        <b>Description</b>: The kind of destination to use. The value can be one of: queue, topic.<br/>
        <b>Default</b>: queue<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/>
        <br/>
        <b>Name</b>: destinationName<br/>
        <b>Description</b>: DestinationName is a JMS queue or topic name. By default, the destinationName is interpreted as a queue name..<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'SIP',
        assimblyTypeLink: `/component-sip`,
        camelTypeLink: `/sip-component.html`,
        uriPlaceholder: 'uri',
        uriPopoverMessage: `
        <b>Name</b>: uri<br/>
        <b>Description</b>: URI of the SIP server to connect to (the username and password can be included such as: john:secretmyserver:9999)<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: URI <br/><br/>
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
        <b>Description</b>: Channel is like a room for discussions (ex. topic, discussion, team)<br/>
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
        name: 'SMPP',
        assimblyTypeLink: `/component-smpp`,
        camelTypeLink: `/smpp-component.html`,
        uriPlaceholder: 'host:port',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: Hostname for the SMSC server to use.<br/>
        <b>Required</b>: no <br/>
        <b>Default</b>: localhost <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: Port number for the SMSC server to use.<br/>
        <b>Required</b>: yes <br/>
        <b>Default</b>: 2775 <br/>
        <b>Data Type</b>: Integer <br/><br/>
    `
    },
    {
        name: 'SNMP',
        assimblyTypeLink: `/component-snmp`,
        camelTypeLink: `/snmp-component.html`,
        uriPlaceholder: 'host:port',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: Hostname of the SNMP enabled device.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: Port number of the SNMP enabled device.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: Integer <br/><br/>
    `
    },
    {
        name: 'SOLR',
        assimblyTypeLink: `/component-solr`,
        camelTypeLink: `/solr-component.html`,
        uriPlaceholder: 'url',
        uriPopoverMessage: `
        <b>Name</b>: url<br/>
        <b>Description</b>: Hostname and port for the solr server.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
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
        name: 'SOROUSH',
        assimblyTypeLink: `/component-soroush`,
        camelTypeLink: `/soroush-component.html`,
        uriPlaceholder: 'action',
        uriPopoverMessage: `
        <b>Name</b>: action<br/>
        <b>Description</b>: The action to do. The value can be one of: sendMessage, getMessage, uploadFile, downloadFile<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: SoroushAction <br/><br/>
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
        name: 'SPLUNK',
        assimblyTypeLink: `/component-splunk`,
        camelTypeLink: `/splunk-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: Name has no purpose<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'SPLUNK-HEC',
        assimblyTypeLink: `/component-splunk-hec`,
        camelTypeLink: `/splunk-hec-component.html`,
        uriPlaceholder: '[endpoint]/[token]',
        uriPopoverMessage: `
        <b>Name</b>: endpoint<br/>
        <b>Description</b>: Splunk Host URL<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Name</b>: token<br/>
        <b>Description</b>: Splunk authorization token<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'SPRING-BATCH',
        assimblyTypeLink: `/component-spring-batch`,
        camelTypeLink: `/spring-batch-component.html`,
        uriPlaceholder: 'jobName',
        uriPopoverMessage: `
        <b>Name</b>: jobName<br/>
        <b>Description</b>: The name of the Spring Batch job located in the registry.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'SPRING-JDBC',
        assimblyTypeLink: `/component-spring-jdbc`,
        camelTypeLink: `/spring-jdbc-component.html`,
        uriPlaceholder: 'dataSourceName',
        uriPopoverMessage: `
        <b>Name</b>: dataSourceName<br/>
        <b>Description</b>: Name of DataSource to lookup in the Registry. If the name is dataSource or default, then Camel will attempt to lookup a default DataSource from the registry, meaning if there is a only one instance of DataSource found, then this DataSource will be used.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'SPRING-EVENT',
        assimblyTypeLink: `/component-spring-event`,
        camelTypeLink: `/spring-event-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: Name of endpoint.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'SPRING-INTEGRATION',
        assimblyTypeLink: `/component-spring-integration`,
        camelTypeLink: `/spring-integration-component.html`,
        uriPlaceholder: 'defaultChannel',
        uriPopoverMessage: `
        <b>Name</b>: defaultChannel<br/>
        <b>Description</b>: The default channel name which is used by the Spring Integration Spring context. It will equal to the inputChannel name for the Spring Integration consumer and the outputChannel name for the Spring Integration provider.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'SPRING-LDAP',
        assimblyTypeLink: `/component-spring-ldap`,
        camelTypeLink: `/spring-ldap-component.html`,
        uriPlaceholder: 'templateName',
        uriPopoverMessage: `
        <b>Name</b>: templateName<br/>
        <b>Description</b>: Name of the Spring LDAP Template bean.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'SPRING-RABBITMQ',
        assimblyTypeLink: `/component-spring-rabbitmq`,
        camelTypeLink: `/spring-rabbitmq-component.html`,
        uriPlaceholder: 'exchangeName',
        uriPopoverMessage: `
        <b>Name</b>: exchangeName<br/>
        <b>Description</b>: he exchange name determines the exchange to which the produced messages will be sent to. In the case of consumers, the exchange name determines the exchange the queue will be bound to. Note: to use default exchange then do not use empty name, but use default instead.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'SPRING-REDIS',
        assimblyTypeLink: `/component-spring-redis`,
        camelTypeLink: `/spring-redis-component.html`,
        uriPlaceholder: 'host:port',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: The host where Redis server is running.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: Redis server port number.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: Integer<br/><br/>
    `
    },
    {
        name: 'SPRING-WS',
        assimblyTypeLink: `/component-spring-ws`,
        camelTypeLink: `/spring-ws-component.html`,
        uriPlaceholder: 'type:lookupKey:webServiceEndpointUri',
        uriPopoverMessage: `
        <b>Name</b>: type<br/>
        <b>Description</b>: Endpoint mapping type if endpoint mapping is used.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: EndpointMappingType<br/><br/>
        <b>Name</b>: lookupKey<br/>
        <b>Description</b>: Endpoint mapping key if endpoint mapping is used.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Name</b>: webServiceEndpointUri<br/>
        <b>Description</b>: The default Web Service endpoint uri to use for the producer.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Name</b>: expression<br/>
        <b>Description</b>: The XPath expression to use when option type=xpathresult. Then this option is required to be configured.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/><br/>
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
        name: 'SQL-STORED',
        assimblyTypeLink: `/component-sql-stored`,
        camelTypeLink: `/sql-stored-component.html`,
        uriPlaceholder: 'template',
        uriPopoverMessage: `
        <b>Name</b>: template<br/>
        <b>Description</b>: Sets the StoredProcedure template to perform. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
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
        name: 'STAX',
        assimblyTypeLink: `/component-stax`,
        camelTypeLink: `/stax-component.html`,
        uriPlaceholder: 'contentHandlerClass',
        uriPopoverMessage: `
        <b>Name</b>: contentHandlerClass<br/>
        <b>Description</b>: The FQN class name for the ContentHandler implementation to use.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'STICH',
        assimblyTypeLink: `/component-stich`,
        camelTypeLink: `/stich-component.html`,
        uriPlaceholder: '[tableName]',
        uriPopoverMessage: `
        <b>Name</b>: [tableName]<br/>
        <b>Description</b>:The name of the destination table the data is being pushed to. Table names must be unique in each destination schema, or loading issues will occur. Note: The number of characters in the table name should be within the destination’s allowed limits or data will rejected.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'STOMP',
        assimblyTypeLink: `/component-stomp`,
        camelTypeLink: `/stomp-component.html`,
        uriPlaceholder: 'destination',
        uriPopoverMessage: `
        <b>Name</b>: destination<br/>
        <b>Description</b>: Name of the queue.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'SQL-STORED',
        assimblyTypeLink: `/component-sql-stored`,
        camelTypeLink: `/sql-stored-component.html`,
        uriPlaceholder: 'template',
        uriPopoverMessage: `
        <b>Name</b>: template<br/>
        <b>Description</b>: Template is the stored procedure template, where you declare the name of the stored procedure and the IN, INOUT, and OUT arguments. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String <br/><br/>
        <b>Example</b>: STOREDSAMPLE(INTEGER 1,OUT INTEGER result2)<br/>
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
        name: 'THRIFT',
        assimblyTypeLink: `/component-thrift`,
        camelTypeLink: `/thrift-component.html`,
        uriPlaceholder: 'host:port/service',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: The Thrift server host name. This is localhost or 0.0.0.0 (if not defined) when being a consumer or remote server host name when using producer.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: The Thrift server port.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: Integer<br/>
        <b>Name</b>: service<br/>
        <b>Description</b>: Fully qualified service name from the thrift descriptor file (package dot service definition name).<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'TIKA',
        assimblyTypeLink: `/component-tika`,
        camelTypeLink: `/tika-component.html`,
        uriPlaceholder: 'operation',
        uriPopoverMessage: `
        <b>Name</b>: operation<br/>
        <b>Description</b>: Operation type. The value can be one of: parse, detect<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: TikaOperation<br/>
        <br/>
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
        name: 'TWILIO',
        assimblyTypeLink: `/component-twilio`,
        camelTypeLink: `/twilio-component.html`,
        uriPlaceholder: 'apiName/methodName',
        uriPopoverMessage: `
        <b>Name</b>: apiName<br/>
        <b>Description</b>: What kind of operation to perform.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: TwilioApiName<br/>
        <b>Name</b>: methodName<br/>
        <b>Description</b>: What sub operation to use for the selected operation. The value can be one of: create, delete, fetch, read, update.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
        <b>Example</b>: ACCOUNT/create<br/>
    `
    },
    {
        name: 'TWITTER-DIRECTMESSAGE',
        assimblyTypeLink: `/component-twitter-directmessage`,
        camelTypeLink: `/twitter-directmessage-component.html`,
        uriPlaceholder: 'user',
        uriPopoverMessage: `
        <b>Name</b>: user<br/>
        <b>Description</b>: The user name to send a direct message. This will be ignored for consumer.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'TWITTER-SEARCH',
        assimblyTypeLink: `/component-twitter-search`,
        camelTypeLink: `/twitter-search-component.html`,
        uriPlaceholder: 'keywords',
        uriPopoverMessage: `
        <b>Name</b>: keywords<br/>
        <b>Description</b>: The search query, use the keywords AND, OR, - and () to narrow the search results.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/>
        <br/>
    `
    },
    {
        name: 'TWITTER-TIMELINE',
        assimblyTypeLink: `/component-twitter-timeline`,
        camelTypeLink: `/twitter-timeline-component.html`,
        uriPlaceholder: 'timelineType',
        uriPopoverMessage: `
        <b>Name</b>: timelineType<br/>
        <b>Description</b>: The timeline type to produce/consume. The value can be one of: PUBLIC, HOME, USER, MENTIONS, RETWEETSOFME, UNKNOWN.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: TimelineType<br/>
        <br/>
    `
    },
    {
        name: 'UNDERTOW',
        assimblyTypeLink: `/component-undertow`,
        camelTypeLink: `/undertow-component.html`,
        uriPlaceholder: 'httpURI',
        uriPopoverMessage: `
        <b>Name</b>: httpURI<br/>
        <b>Description</b>: The url of the HTTP endpoint to use.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: URI<br/>
        <br/>
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
        name: 'VELOCITY',
        assimblyTypeLink: `/component-velocity`,
        camelTypeLink: `/velocity-component.html`,
        uriPlaceholder: 'resourceUri',
        uriPopoverMessage: `
        <b>Name</b>: resourceUri<br/>
        <b>Description</b>: Path to the resource. You can prefix with: classpath, file, http, ref, or bean. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'VERTX',
        assimblyTypeLink: `/component-vertx`,
        camelTypeLink: `/vertx-component.html`,
        uriPlaceholder: 'address',
        uriPopoverMessage: `
        <b>Name</b>: address<br/>
        <b>Description</b>: Sets the event bus address used to communicate. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'VERTX-HTTP',
        assimblyTypeLink: `/component-vertx-http`,
        camelTypeLink: `/vertx-http-component.html`,
        uriPlaceholder: 'hostname[:port][/resourceUri]',
        uriPopoverMessage: `
        <b>Name</b>: hostname<br/>
        <b>Description</b>: Sets the hostname of the url. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: The http port<br/>
        <b>Required</b>: not <br/>
        <b>Data Type</b>: Integer <br/><br/>
        <b>Name</b>: resourceUri<br/>
        <b>Description</b>: The url extension<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/><br/>
    `
    },
    {
        name: 'VERTX-KAFKA',
        assimblyTypeLink: `/component-vertx-kafka`,
        camelTypeLink: `/vertx-kafka-component.html`,
        uriPlaceholder: 'topic',
        uriPopoverMessage: `
        <b>Name</b>: topic<br/>
        <b>Description</b>: Name of the topic to use. On the consumer you can use comma to separate multiple topics. A producer can only send a message to a single topic.. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'VERTX-WEBSOCKET',
        assimblyTypeLink: `/component-vertx-websocket`,
        camelTypeLink: `/vertx-websocket-component.html`,
        uriPlaceholder: 'hostname[:port][/resourceUri]',
        uriPopoverMessage: `
        <b>Name</b>: hostname<br/>
        <b>Description</b>: Sets the hostname of the url. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: The http port<br/>
        <b>Required</b>: not <br/>
        <b>Data Type</b>: Integer <br/><br/>
        <b>Name</b>: resourceUri<br/>
        <b>Description</b>: The url extension<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String <br/><br/>
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
        name: 'WEATHER',
        assimblyTypeLink: `/component-weather`,
        camelTypeLink: `/weather-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: The name value is not used.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'WEB3J',
        assimblyTypeLink: `/component-web3j`,
        camelTypeLink: `/web3j-component.html`,
        uriPlaceholder: 'nodeAddress',
        uriPopoverMessage: `
        <b>Name</b>: nodeAddress<br/>
        <b>Description</b>: Sets the node address used to communicate.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'WEBHOOK',
        assimblyTypeLink: `/component-webhook`,
        camelTypeLink: `/webhook-component.html`,
        uriPlaceholder: 'endpointUri',
        uriPopoverMessage: `
        <b>Name</b>: endpointUri<br/>
        <b>Description</b>: The delegate uri. Must belong to a component that supports webhooks.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'WEKA',
        assimblyTypeLink: `/component-weka`,
        camelTypeLink: `/weka-component.html`,
        uriPlaceholder: 'command',
        uriPopoverMessage: `
        <b>Name</b>: command<br/>
        <b>Description</b>: The command to use. The value can be one of: filter, model, read, write, push, pop, version.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: Command<br/><br/>
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
        name: 'WORKDAY',
        assimblyTypeLink: `/component-workday`,
        camelTypeLink: `/workday-component.html`,
        uriPlaceholder: 'entity:path',
        uriPopoverMessage: `
        <b>Name</b>: entity<br/>
        <b>Description</b>: The entity to be requested or subscribed via API. The value can be one of: report<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: Entity<br/><br/>
        <b>Name</b>: path<br/>
        <b>Description</b>: The API path to access an entity structure.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'XCHANGE',
        assimblyTypeLink: `/component-xchange`,
        camelTypeLink: `/xchange-component.html`,
        uriPlaceholder: 'name',
        uriPopoverMessage: `
        <b>Name</b>: name<br/>
        <b>Description</b>: The exchange to connect to.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'XJ',
        assimblyTypeLink: `/component-xj`,
        camelTypeLink: `/xj-component.html`,
        uriPlaceholder: 'resourceUri',
        uriPopoverMessage: `
        <b>Name</b>: resourceUri<br/>
        <b>Description</b>: Path to the template.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'XMPP',
        assimblyTypeLink: `/component-xmpp`,
        camelTypeLink: `/xmpp-component.html`,
        uriPlaceholder: 'host:port/participant',
        uriPopoverMessage: `
        <b>Name</b>: host<br/>
        <b>Description</b>: Hostname for the chat server.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Name</b>: port<br/>
        <b>Description</b>: Port number for the chat server.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: Integer<br/><br/>
        <b>Name</b>: participant<br/>
        <b>Description</b>: JID (Jabber ID) of person to receive messages. room parameter has precedence over participant.<br/>
        <b>Required</b>: no <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'XQUERY',
        assimblyTypeLink: `/component-xquery`,
        camelTypeLink: `/xquery-component.html`,
        uriPlaceholder: 'resourceUri',
        uriPopoverMessage: `
        <b>Name</b>: resourceUri<br/>
        <b>Description</b>: The name of the template to load from classpath or file system.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'XSLT',
        assimblyTypeLink: `/component-xslt`,
        camelTypeLink: `/xslt-component.html`,
        uriPlaceholder: 'resourceUri',
        uriPopoverMessage: `
        <b>Name</b>: resourceUri<br/>
        <b>Description</b>: Path to the template.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'XSLT-SAXON',
        assimblyTypeLink: `/component-xslt-saxon`,
        camelTypeLink: `/xslt-saxon-component.html`,
        uriPlaceholder: 'resourceUri',
        uriPopoverMessage: `
        <b>Name</b>: resourceUri<br/>
        <b>Description</b>: Path to the template.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    },
    {
        name: 'YAMMER',
        assimblyTypeLink: `/component-yammer`,
        camelTypeLink: `/yammer-component.html`,
        uriPlaceholder: 'function',
        uriPopoverMessage: `
        <b>Name</b>: function<br/>
        <b>Description</b>: The function to use. The value can be one of: MESSAGES, MY_FEED, ALGO, FOLLOWING, SENT, PRIVATE, RECEIVED, USERS, CURRENT.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: YammerFunctionType<br/><br/>
    `
    },
    {
        name: 'ZENDESK',
        assimblyTypeLink: `/component-zendesk`,
        camelTypeLink: `/zendesk-component.html`,
        uriPlaceholder: 'methodName',
        uriPopoverMessage: `
        <b>Name</b>: methodName<br/>
        <b>Description</b>: What operation to use.<br/>
        <b>Required</b>: yes <br/>
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
    },
    {
        name: 'ZOOKEEPER-MASTER',
        assimblyTypeLink: `/component-zookeeper-master`,
        camelTypeLink: `/zookeeper-master-component.html`,
        uriPlaceholder: 'groupName:consumerEndpointUri',
        uriPopoverMessage: `
        <b>Name</b>: groupName<br/>
        <b>Description</b>: The name of the cluster group to use.<br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
        <b>Name</b>: consumerEndpointUri<br/>
        <b>Description</b>: The consumer endpoint to use in master/slave mode. <br/>
        <b>Required</b>: yes <br/>
        <b>Data Type</b>: String<br/><br/>
    `
    }
];

// add the component types for a specific endpoint
@Injectable({
    providedIn: 'root'
})
export class Components {
    fromTypes = [
        'ACTIVEMQ',
        'AHC-WS',
        'AMAZONMQ',
        'AMQP',
        'AMQPS',
        'APNS',
        'AS2',
        'AWS2DDBSTREAM',
        'AWS2KINESIS',
        'AWS2S3',
        'AWS2SQS',
        'ASTERISK',
        'ATMOS',
        'ATMOSPHERE-WEBSOCKET',
        'ATOM',
        'ATOMIX-MAP',
        'ATOMIX-MESSAGING',
        'ATOMIX-QUEUE',
        'ATOMIX-SET',
        'ATOMIX-VALUE',
        'AVRO',
        'AZURE-COSMOSDB',
        'AZURE-EVENTHUBS',
        'AZURE-STORAGE-BLOB',
        'AZURE-STORAGE-DATALAKE',
        'AZURE-STORAGE-QUEUE',
        'BEANSTALK',
        'BOX',
        'BRAINTREE',
        'BROWSE',
        'CQL',
        'CMIS',
        'COAP',
        'COMETD',
        'CONSUL',
        'CORDA',
        'COUCHBASE',
        'COUCHDB',
        'CXF',
        'CXFRS',
        'DATASET',
        'DEBEZIUM-MONGODB',
        'DEBEZIUM-MYSQL',
        'DEBEZIUM-POSTGRESQL',
        'DEBEZIUM-SQLSERVER',
        'DIRECT',
        'DIRECT-VM',
        'DISRUPTOR',
        'DROPBOX',
        'DOCKER',
        'EHCACHE',
        'ELSQL',
        'ETCDSTATS',
        'FACEBOOK',
        'FHIR',
        'FILE',
        'FILE-WATCH',
        'FLATPACK',
        'FTP',
        'FTPS',
        'GIT',
        'GITHUB',
        'GOOGLE-CALENDAR',
        'GOOGLE-DRIVE',
        'GOOGLE-MAIL',
        'GOOGLE-PUBSUB',
        'GOOGLE-SHEETS',
        'GOOGLE-STORGAGE',
        'GORA',
        'GRPC',
        'GUAVA-EVENTBUS',
        'HAZELCAST-INSTANCE',
        'HAZELCAST-LIST',
        'HAZELCAST-MAP',
        'HAZELCAST-MULTIMAP',
        'HAZELCAST-QUEUE',
        'HAZELCAST-REPLICATEDMAP',
        'HAZELCAST-SEDA',
        'HAZELCAST-SET',
        'HAZELCAST-TOPIC',
        'HBASE',
        'HDFS',
        'IBMMQ',
        'IEC60870-CLIENT',
        'IEC60870-SERVER',
        'IGNITE-CACHE',
        'IGNITE-EVENTS',
        'IGNITE-MESSAGING',
        'IMAP',
        'IMAPS',
        'INFINISPAN',
        'IRC',
        'JBPM',
        'JCACHE',
        'JCLOUDS',
        'JCR',
        'JETTY',
        'JGROUPS',
        'JGROUPSRAFT',
        'JIRA',
        'JMS',
        'JMX',
        'JOOQ',
        'JPA',
        'JT400',
        'KAFKA',
        'KAMELET',
        'KUBERNETES-DEPLOYMENTS',
        'KUBERNETES-HPA',
        'KUBERNETES-JOB',
        'KUBERNETES-NAMESPACES',
        'KUBERNETES-NODES',
        'KUBERNETES-PODS',
        'KUBERNETES-REPLICATION-CONTROLLERS',
        'KUBERNETES-SERVICES',
        'LUMBERJACK',
        'MASTER',
        'MILO-CLIENT',
        'MILO-SERVER',
        'MINA',
        'MINIO',
        'MLLP',
        'MONGODB',
        'MONGODB-GRIDFS',
        'MYBATIS',
        'NATS',
        'NITRITE',
        'NETTY4',
        'NETTY-HTTP',
        'NSQ',
        'OAI-PMH',
        'OLINGO2',
        'OLINGO4',
        'OPTAPLANNER',
        'PAHO',
        'PAHO-MQTT5',
        'PLATFORM-HTTP',
        'PGEVENT',
        'PG-REPLICATION-SLOT',
        'PUBNUB',
        'PULSAR',
        'QUARTZ2',
        'QUICKFIX',
        'RABBITMQ',
        'REACTIVE-STREAMS',
        'REF',
        'REST',
        'RESTLET',
        'REST-API',
        'RESTEASY',
        'RSS',
        'SCHEDULER',
        'SEDA',
        'SERVICE',
        'SERVLET',
        'SALESFORCE',
        'SFTP',
        'SSH',
        'SJMS',
        'SJMS2',
        'SIP',
        'SLACK',
        'SMPP',
        'SNMP',
        'SMTPS',
        'SMTP',
        'SONICMQ',
        'SOROUSH',
        'SPLUNK',
        'SPRING-EVENT',
        'SPRING-INTEGRATION',
        'SPRING-RABBITMQ',
        'SPRING-REDIS',
        'SPRING-WS',
        'SQL',
        'STOMP',
        'STUB',
        'STREAM',
        'TELEGRAM',
        'THRIFT',
        'TIMER',
        'TWILIO',
        'TWITTER-DIRECTMESSAGE',
        'TWITTER-SEARCH',
        'TWITTER-TIMELINE',
        'VERTX',
        'VERTX-KAFKA',
        'VERTX-WEBSOCKET',
        'VM',
        'WEATHER',
        'WEB3J',
        'WORDPRESS',
        'WEBSOCKET',
        'XMPP',
        'XQUERY',
        'XSLT',
        'YAMMER',
        'ZENDESK',
        'ZOOKEEPER',
        'ZOOKEEPER-MASTER'
    ];

    toTypes = [
        'ACTIVEMQ',
        'AHC',
        'AHC-WS',
        'AMAZONMQ',
        'AMQP',
        'AMQPS',
        'APNS',
        'ARANGODB',
        'AS2',
        'AWS2ATHENA',
        'AWS2CW',
        'AWS2DDB',
        'AWS2EC2',
        'AWS2ECS',
        'AWS2EKS',
        'AWS2EVENTBRIDGE',
        'AWS2IAM',
        'AWS2KMS',
        'AWS2KINESIS',
        'AWS2KINESISFIREHOSE',
        'AWS2LAMBDA',
        'AWS2MSK',
        'AWS2MQ',
        'AWS2S3',
        'AWS2STS',
        'AWS2SNS',
        'AWS2SQS',
        'AWS2TRANSLATE',
        'ASTERISK',
        'ATMOS',
        'ATMOSPHERE-WEBSOCKET',
        'ATOMIX-MAP',
        'ATOMIX-MESSAGING',
        'ATOMIX-MULTIMAP',
        'ATOMIX-QUEUE',
        'ATOMIX-SET',
        'ATOMIX-VALUE',
        'ATLASMAP',
        'AVRO',
        'AZURE-COSMOSDB',
        'AZURE-EVENTHUBS',
        'AZURE-STORAGE-BLOB',
        'AZURE-STORAGE-DATALAKE',
        'AZURE-STORAGE-QUEUE',
        'BEAN',
        'BEAN-VALIDATOR',
        'BEANSTALK',
        'BONITA',
        'BOX',
        'BRAINTREE',
        'BROWSE',
        'CAFFEINE-CACHE',
        'CAFFEINE-LOADCACHE',
        'CQL',
        'CHATSCRIPT',
        'CHUNK',
        'CLASS',
        'CM-SMS',
        'CMIS',
        'COAP',
        'COMETD',
        'CONSUL',
        'CORDA',
        'COUCHBASE',
        'COUCHDB',
        'CRYPTO',
        'CRYPTO-CMS',
        'CXF',
        'CXFRS',
        'DATAFORMAT',
        'DATASET',
        'DATASET-TEST',
        'DIGITALOCEAN',
        'DISRUPTOR',
        'DJL',
        'DNS',
        'DOZER',
        'DIRECT',
        'DIRECT-VM',
        'DROPBOX',
        'DOCKER',
        'EHCACHE',
        'ELASTICSEARCH-REST',
        'ELSQL',
        'ETCDKEYS',
        'ETCDSTATS',
        'ETCDWATCH',
        'EXEC',
        'FACEBOOK',
        'FHIR',
        'FILE',
        'FLATPACK',
        'FLINK',
        'FOP',
        'FREEMARKER',
        'FTP',
        'FTPS',
        'GANGLIA',
        'GEOCODER',
        'GIT',
        'GITHUB',
        'GOOGLE-BIG-QUERY',
        'GOOGLE-CALENDAR',
        'GOOGLE-CALENDAR-STREAM',
        'GOOGLE-DRIVE',
        'GOOGLE-FUNCTIONS',
        'GOOGLE-MAIL',
        'GOOGLE-MAIL-STREAM',
        'GOOGLE-PUBSUB',
        'GOOGLE-SHEETS',
        'GOOGLE-SHEETS-STREAM',
        'GOOGLE-STORGAGE',
        'GORA',
        'GRAPE',
        'GRAPHQL',
        'GRPC',
        'GUAVA-EVENTBUS',
        'HAZELCAST-ATOMICVALUE',
        'HAZELCAST-LIST',
        'HAZELCAST-MAP',
        'HAZELCAST-MULTIMAP',
        'HAZELCAST-QUEUE',
        'HAZELCAST-REPLICATEDMAP',
        'HAZELCAST-RINGBUFFER',
        'HAZELCAST-SEDA',
        'HAZELCAST-SET',
        'HAZELCAST-TOPIC',
        'HBASE',
        'HDFS',
        'HTTP',
        'HTTPS',
        'HWCLOUD-FUNCTIONGRAPH',
        'HWCLOUD-IAM',
        'HWCLOUD-SMN',
        'IBMMQ',
        'IEC60870-CLIENT',
        'IEC60870-SERVER',
        'IGNITE-CACHE',
        'IGNITE-COMPUTE',
        'IGNITE-IDGEN',
        'IGNITE-MESSAGING',
        'IGNITE-QUEUE',
        'IGNITE-SETS',
        'IMAP',
        'IMAPS',
        'INFINISPAN',
        'INFLUXDB',
        'IOTA',
        'IPFS',
        'IRC',
        'IRONMQ',
        'JBPM',
        'JCACHE',
        'JCLOUDS',
        'JCR',
        'JDBC',
        'JETTY',
        'JGROUPS',
        'JGROUPSRAFT',
        'JING',
        'JIRA',
        'JMS',
        'JOLT',
        'JOOQ',
        'JPA',
        'JSLT',
        'JSONATA',
        'JSON-VALIDATOR',
        'JT400',
        'KAFKA',
        'KAMELET',
        'KUBERNETES-CONFIG-MAPS',
        'KUBERNETES-DEPLOYMENTS',
        'KUBERNETES-HPA',
        'KUBERNETES-JOB',
        'KUBERNETES-NAMESPACES',
        'KUBERNETES-NODES',
        'KUBERNETES-PERSISTENT-VOLUMES',
        'KUBERNETES-PERSISTENT-VOLUMES-CLAIM',
        'KUBERNETES-PODS',
        'KUBERNETES-REPLICATION-CONTROLLERS',
        'KUBERNETES-RESOURCES-QUOTA',
        'KUBERNETES-SECRETS',
        'KUBERNETES-SERVICE-ACCOUNTS',
        'KUBERNETES-SERVICES',
        'KUDU',
        'LANGUAGE',
        'LDAP',
        'LDIF',
        'LOG',
        'LUCENE',
        'METRICS',
        'MICROMETER',
        'MICROPROFILE-METRICS',
        'MILO-CLIENT',
        'MILO-SERVER',
        'MINA',
        'MINIO',
        'MLLP',
        'MOCK',
        'MONGODB',
        'MONGODB-GRIDFS',
        'MSV',
        'MUSTACHE',
        'MVEL',
        'MYBATIS',
        'MYBATIS-BEAN',
        'NAGIOS',
        'NATS',
        'NETTY4',
        'NETTY-HTTP',
        'NITRITE',
        'OAI-PMH',
        'OLINGO2',
        'OLINGO4',
        'OPENSHIFT-BUILD-CONFIGS',
        'OPENSHIFT-BUILDS',
        'OPENSTACK-CINDER',
        'OPENSTACK-GLANCE',
        'OPENSTACK-KEYSTONE',
        'OPENSTACK-NEUTRON',
        'OPENSTACK-NOVA',
        'OPENSTACK-SWIFT',
        'OPTAPLANNER',
        'PAHO',
        'PAHO-MQTT5',
        'PDF',
        'PGEVENT',
        'PUBNUB',
        'PULSAR',
        'QUICKFIX',
        'NSQ',
        'RABBITMQ',
        'REACTIVE-STREAMS',
        'REF',
        'REST',
        'RESTLET',
        'REST-OPENAPI',
        'RESTEASY',
        'REST-SWAGGER',
        'SAGA',
        'SCHEDULER',
        'SCHEMATRON',
        'SCP',
        'SEDA',
        'SERVICENOW',
        'SALESFORCE',
        'SAP-NETWEAVER',
        'SFTP',
        'SSH',
        'SJMS',
        'SJMS2',
        'SIP',
        'SLACK',
        'SMPP',
        'SMTPS',
        'SMTP',
        'SNMP',
        'SOLR',
        'SONICMQ',
        'SOROUSH',
        'SPARK',
        'SPLUNK',
        'SPLUNK-HEC',
        'SPRING-BATCH',
        'SPRING-JDBC',
        'SPRING-EVENT',
        'SPRING-INTEGRATION',
        'SPRING-LDAP',
        'SPRING-RABBITMQ',
        'SPRING-REDIS',
        'SPRING-WS',
        'SQL',
        'SQL-STORED',
        'STAX',
        'STICH',
        'STOMP',
        'STUB',
        'STREAM',
        'TELEGRAM',
        'THRIFT',
        'TIKA',
        'TWILIO',
        'TWITTER-DIRECTMESSAGE',
        'TWITTER-SEARCH',
        'TWITTER-TIMELINE',
        'UNDERTOW',
        'TIMER',
        'VALIDATOR',
        'VELOCITY',
        'VERTX',
        'VERTX-HTTP',
        'VERTX-KAFKA',
        'VERTX-WEBSOCKET',
        'VM',
        'WASTEBIN',
        'WEATHER',
        'WEB3J',
        'WEBHOOK',
        'WEKA',
        'WORDPRESS',
        'WORKDAY',
        'WEBSOCKET',
        'XCHANGE',
        'XJ',
        'XMPP',
        'XQUERY',
        'XSLT',
        'XSLT-SAXON',
        'YAMMER',
        'ZENDESK',
        'ZOOKEEPER',
        'ZOOKEEPER-MASTER'
    ];

    errorTypes = [
        'ACTIVEMQ',
        'AMAZONMQ',
        'AMQP',
        'AMQPS',
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
        'IBMMQ',
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
        'SQL-STORED',
        'TELEGRAM',
        'STREAM',
        'VM',
        'WEBSOCKET'
    ];

    wireTapTypes = [
        'ACTIVEMQ',
        'AMAZONMQ',
        'AWS-S3',
        'ELASTICSEARCH-REST',
        'FILE',
        'FTPS',
        'FTP',
        'HTTP',
        'HTTPS',
        'IBMMQ',
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

    getCamelComponentType(componentType: any) {
        let camelComponentType: string;

        if (componentType === 'activemq') {
            camelComponentType = 'jms';
        } else if (componentType === 'amqps') {
            camelComponentType = 'amqp';
        } else if (componentType === 'amazonmq') {
            camelComponentType = 'jms';
        } else if (componentType === 'ibmmq') {
            camelComponentType = 'jms';
        } else if (componentType === 'sonicmq') {
            camelComponentType = 'sjms';
        } else if (componentType === 'wastebin') {
            camelComponentType = 'mock';
        } else {
            camelComponentType = componentType;
        }

        return camelComponentType;
    }
}

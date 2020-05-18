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
        <b>Description</b>: The name of the message to send. <br/>
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
        name: 'FILEWATCH',
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
        name: 'JGROEPS',
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
        name: 'JGROEPSRAFT',
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
        assimblyTypeLink: `/component-pdf`,
        camelTypeLink: `/pdf-component.html`,
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
        'ATOM',
        'ATOMIX-MAP',
        'ATOMIX-MESSAGING',
        'ATOMIX-QUEUE',
        'ATOMIX-SET',
        'ATOMIX-VALUE',
        'AVRO',
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
        'FILEWATCH',
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
        'HIPCHAT',
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
        'JGROEPS',
        'JGROEPSRAFT',
        'JIRA',
        'JMS',
        'JMX',
        'JOOQ',
        'JPA',
        'JT400',
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
        'MLLP',
        'MONGODB',
        'MONGODB-GRIDFS',
        'MYBATIS',
        'NATS',
        'NITRITE',
        'NETTY4',
        'NETTY-HTTP',
        'NSQ',
        'OLINGO2',
        'OLINGO4',
        'OPTAPLANNER',
        'PAHO',
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
        'ATOMIX-MAP',
        'ATOMIX-MESSAGING',
        'ATOMIX-MULTIMAP',
        'ATOMIX-QUEUE',
        'ATOMIX-SET',
        'ATOMIX-VALUE',
        'AVRO',
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
        'GOOGLE-MAIL',
        'GOOGLE-MAIL-STREAM',
        'GOOGLE-PUBSUB',
        'GOOGLE-SHEETS',
        'GOOGLE-SHEETS-STREAM',
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
        'HIPCHAT',
        'HTTP',
        'HTTPS',
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
        'JGROEPS',
        'JGROEPSRAFT',
        'JING',
        'JIRA',
        'JMS',
        'JOLT',
        'JOOQ',
        'JPA',
        'JSLT',
        'JSON-VALIDATOR',
        'JT400',
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
        'PDF',
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

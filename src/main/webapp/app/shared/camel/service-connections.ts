import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Services {
    driversList: Array<String> = [
        'com.mysql.jdbc.Driver',
        'oracle.jdbc.driver.OracleDriver',
        'org.postgresql.Driver',
        'com.microsoft.sqlserver.jdbc.SQLServerDriver'
    ];

    connectionsList: string[] = [
        'ActiveMQ Connection',
        'AmazonMQ Connection',
        'AMQP Connection',
        'AMQPS Connection',
        'IBMMQ Connection',
        'JDBC Connection',
        'MQ Connection',
        'SonicMQ Connection'
    ];

    keysList = [
        {
            name: 'JDBC Connection',
            serviceKeys: [
                {
                    serviceKeyName: 'url',
                    valueType: 'text',
                    placeholder: 'Example jdbc:mysql://localhost/dbname',
                    isRequired: true
                },
                {
                    serviceKeyName: 'username',
                    valueType: 'text',
                    placeholder: '',
                    isRequired: true
                },
                {
                    serviceKeyName: 'password ',
                    valueType: 'password',
                    placeholder: '',
                    isRequired: true
                },
                {
                    serviceKeyName: 'driver',
                    valueType: 'list',
                    placeholder: '',
                    isRequired: true
                }
            ]
        },
        {
            name: 'ActiveMQ Connection',
            serviceKeys: [
                {
                    serviceKeyName: 'url',
                    valueType: 'text',
                    placeholder: 'Example tcp://localhost:61616',
                    isRequired: true
                }
                /*,
            {
                serviceKeyName: 'username',
                valueType: 'text',
                placeholder: 'user',
                isRequired: false
            },
            {
                serviceKeyName: 'password',
                valueType: 'password',
                placeholder: '',
                isRequired: false
            }*/
            ]
        },
        {
            name: 'AmazonMQ Connection',
            serviceKeys: [
                {
                    serviceKeyName: 'url',
                    valueType: 'text',
                    placeholder: 'Example ssl://servername:61617',
                    isRequired: true
                },
                {
                    serviceKeyName: 'username',
                    valueType: 'text',
                    placeholder: 'user',
                    isRequired: true
                },
                {
                    serviceKeyName: 'password',
                    valueType: 'password',
                    placeholder: '',
                    isRequired: true
                }
            ]
        },
        {
            name: 'AMQP Connection',
            serviceKeys: [
                {
                    serviceKeyName: 'url',
                    valueType: 'text',
                    placeholder: 'amqp://localhost:5672',
                    isRequired: true
                },
                {
                    serviceKeyName: 'username',
                    valueType: 'text',
                    placeholder: 'user',
                    isRequired: false
                },
                {
                    serviceKeyName: 'password',
                    valueType: 'password',
                    placeholder: '',
                    isRequired: false
                }
            ]
        },
        {
            name: 'AMQPS Connection',
            serviceKeys: [
                {
                    serviceKeyName: 'url',
                    valueType: 'text',
                    placeholder: 'amqps://localhost:5672',
                    isRequired: true
                },
                {
                    serviceKeyName: 'username',
                    valueType: 'text',
                    placeholder: 'user',
                    isRequired: false
                },
                {
                    serviceKeyName: 'password',
                    valueType: 'password',
                    placeholder: '',
                    isRequired: false
                }
            ]
        },
        {
            name: 'IBMMQ Connection',
            serviceKeys: [
                {
                    serviceKeyName: 'url',
                    valueType: 'text',
                    placeholder: 'Example tcp://localhost:1416',
                    isRequired: true
                },
                {
                    serviceKeyName: 'channel',
                    valueType: 'text',
                    placeholder: 'Example MQ.CHANNEL',
                    isRequired: true
                },
                {
                    serviceKeyName: 'username',
                    valueType: 'text',
                    placeholder: 'Example Administrator',
                    isRequired: true
                },
                { serviceKeyName: 'password', valueType: 'password', placeholder: '', isRequired: true }
            ]
        },
        {
            name: 'MQ Connection',
            serviceKeys: [
                {
                    serviceKeyName: 'url',
                    valueType: 'text',
                    placeholder: 'tcp://localhost:61616',
                    isRequired: true
                },
                {
                    serviceKeyName: 'username',
                    valueType: 'text',
                    placeholder: 'user',
                    isRequired: true
                },
                {
                    serviceKeyName: 'password',
                    valueType: 'password',
                    placeholder: '',
                    isRequired: true
                },
                {
                    serviceKeyName: 'jmsprovider',
                    valueType: 'list',
                    placeholder: '',
                    isRequired: true
                }
            ]
        },
        {
            name: 'SonicMQ Connection',
            serviceKeys: [
                {
                    serviceKeyName: 'url',
                    valueType: 'text',
                    placeholder: 'Example tcp://localhost:2506',
                    isRequired: true
                },
                {
                    serviceKeyName: 'username',
                    valueType: 'text',
                    placeholder: 'Example Administrator',
                    isRequired: true
                },
                {
                    serviceKeyName: 'password',
                    valueType: 'password',
                    placeholder: '',
                    isRequired: true
                }
            ]
        }
    ];

    getServiceType(componentType: any) {
        if (componentType === 'ACTIVEMQ') {
            return 'ActiveMQ Connection';
        } else if (componentType === 'AMAZONMQ') {
            return 'AmazonMQ Connection';
        } else if (componentType === 'AMQP') {
            return 'AMQP Connection';
        } else if (componentType === 'AMQPS') {
            return 'AMQP Connection';
        } else if (componentType === 'IBMMQ') {
            return 'IBMMQ Connection';
        } else if (componentType === 'SONICMQ') {
            return 'SonicMQ Connection';
        } else if (componentType === 'SQL') {
            return 'JDBC Connection';
        } else if (componentType === 'SJMS') {
            return 'MQ Connection';
        } else {
            return '';
        }
    }

    hasService(componentType: any) {
        if (componentType === 'ACTIVEMQ') {
            return true;
        } else if (componentType === 'AMAZONMQ') {
            return true;
        } else if (componentType === 'AMQP') {
            return true;
        } else if (componentType === 'AMQPS') {
            return true;
        } else if (componentType === 'IBMMQ') {
            return true;
        } else if (componentType === 'SONICMQ') {
            return true;
        } else if (componentType === 'SQL') {
            return true;
        } else if (componentType === 'SJMS') {
            return true;
        } else {
            return false;
        }
    }
}

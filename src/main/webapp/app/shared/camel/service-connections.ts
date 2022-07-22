import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Services {
  driversList: Array<string> = [
    'com.mysql.jdbc.Driver',
    'oracle.jdbc.driver.OracleDriver',
    'org.postgresql.Driver',
    'com.microsoft.sqlserver.jdbc.SQLServerDriver',
  ];

  connectionsList: string[] = [
    'ActiveMQ',
    'AmazonMQ',
    'AMQP',
    'AMQPS',
    'IBMMQ',
    'JDBC',
    'MQ',
    'SonicMQ',
  ];

  keysList = [
    {
      name: 'JDBC',
      serviceKeys: [
        {
          serviceKeyName: 'url',
          valueType: 'text',
          placeholder: 'Example jdbc:mysql://localhost/dbname',
          isRequired: true,
        },
        {
          serviceKeyName: 'username',
          valueType: 'text',
          placeholder: '',
          isRequired: true,
        },
        {
          serviceKeyName: 'password ',
          valueType: 'password',
          placeholder: '',
          isRequired: true,
        },
        {
          serviceKeyName: 'driver',
          valueType: 'list',
          placeholder: '',
          isRequired: true,
        },
      ],
    },
    {
      name: 'ActiveMQ',
      serviceKeys: [
        {
          serviceKeyName: 'url',
          valueType: 'text',
          placeholder: 'Example tcp://localhost:61616',
          isRequired: true,
        },
        /* ,
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
      ],
    },
    {
      name: 'AmazonMQ',
      serviceKeys: [
        {
          serviceKeyName: 'url',
          valueType: 'text',
          placeholder: 'Example ssl://servername:61617',
          isRequired: true,
        },
        {
          serviceKeyName: 'username',
          valueType: 'text',
          placeholder: 'user',
          isRequired: true,
        },
        {
          serviceKeyName: 'password',
          valueType: 'password',
          placeholder: '',
          isRequired: true,
        },
      ],
    },
    {
      name: 'AMQP',
      serviceKeys: [
        {
          serviceKeyName: 'url',
          valueType: 'text',
          placeholder: 'amqp://localhost:5672',
          isRequired: true,
        },
        {
          serviceKeyName: 'username',
          valueType: 'text',
          placeholder: 'user',
          isRequired: false,
        },
        {
          serviceKeyName: 'password',
          valueType: 'password',
          placeholder: '',
          isRequired: false,
        },
      ],
    },
    {
      name: 'AMQPS',
      serviceKeys: [
        {
          serviceKeyName: 'url',
          valueType: 'text',
          placeholder: 'amqps://localhost:5672',
          isRequired: true,
        },
        {
          serviceKeyName: 'username',
          valueType: 'text',
          placeholder: 'user',
          isRequired: false,
        },
        {
          serviceKeyName: 'password',
          valueType: 'password',
          placeholder: '',
          isRequired: false,
        },
      ],
    },
    {
      name: 'IBMMQ',
      serviceKeys: [
        {
          serviceKeyName: 'url',
          valueType: 'text',
          placeholder: 'Example localhost(1416)',
          isRequired: true,
        },
        {
          serviceKeyName: 'queuemanager',
          valueType: 'text',
          placeholder: 'Example QUEUE.MGR',
          isRequired: true,
        },
        {
          serviceKeyName: 'channel',
          valueType: 'text',
          placeholder: 'Example MQ.CHANNEL',
          isRequired: true,
        },
      ],
    },
    {
      name: 'MQ',
      serviceKeys: [
        {
          serviceKeyName: 'url',
          valueType: 'text',
          placeholder: 'tcp://localhost:61616',
          isRequired: true,
        },
        {
          serviceKeyName: 'username',
          valueType: 'text',
          placeholder: 'user',
          isRequired: true,
        },
        {
          serviceKeyName: 'password',
          valueType: 'password',
          placeholder: '',
          isRequired: true,
        },
        {
          serviceKeyName: 'jmsprovider',
          valueType: 'list',
          placeholder: '',
          isRequired: true,
        },
      ],
    },
    {
      name: 'SonicMQ',
      serviceKeys: [
        {
          serviceKeyName: 'url',
          valueType: 'text',
          placeholder: 'Example tcp://localhost:2506',
          isRequired: true,
        },
        {
          serviceKeyName: 'username',
          valueType: 'text',
          placeholder: 'Example Administrator',
          isRequired: true,
        },
        {
          serviceKeyName: 'password',
          valueType: 'password',
          placeholder: '',
          isRequired: true,
        },
      ],
    },
  ];

  getServiceType(componentType: any) {
    if (componentType === 'activemq') {
      return 'ActiveMQ';
    } else if (componentType === 'amazonmq') {
      return 'AmazonMQ';
    } else if (componentType === 'amqp') {
      return 'AMQP';
    } else if (componentType === 'amqps') {
      return 'AMQP';
    } else if (componentType === 'ibmmq') {
      return 'IBMMQ';
    } else if (componentType === 'sonicmq') {
      return 'SonicMQ';
    } else if (componentType === 'sql') {
      return 'JDBC';
    } else if (componentType === 'sjms') {
      return 'MQ';
    } else {
      return '';
    }
  }

  hasService(componentType: any) {
    if (componentType === 'activemq') {
      return true;
    } else if (componentType === 'amazonmq') {
      return true;
    } else if (componentType === 'amqp') {
      return true;
    } else if (componentType === 'amqps') {
      return true;
    } else if (componentType === 'ibmmq') {
      return true;
    } else if (componentType === 'sonicmq') {
      return true;
    } else if (componentType === 'sql') {
      return true;
    } else if (componentType === 'sjms') {
      return true;
    } else {
      return false;
    }
  }
}

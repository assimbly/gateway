# Introduction

Assimbly is a messaging gateway. Basicly it sends data between two endpoints. The purpose of Assimbly is to connect these
endpoints with the help of a webgui. There you can configure these endpoints and manage the lifecycle of a flow.

On the background [Apache Camel](https://github.com/apache/camel) does the actual works. Assimbly only implements the point-to-point(s) intergration pattern of Camel.
So if data only needs to transfered it can connect any supported endpoint by the [Assimbly Connector](https://github.com/assimbly/connector) directly.

The original idea was to get messages from and to a messaging broker like ActiveMQ and Kafka. With help of ingesting tools (Elastic etc) or other integration software (ESB, Apache ServicesMix, Apache NiFi etc)
the message can be routed and processed. Another Assimbly node can also act as a gateway for the consuming application. 


## Design

The main goals are:

* Web based: Access from any browser
* Ease of use: Configure and manage flows with ease
* Separate-of-concerns: Seperate message gateway (interoperability functions) from message broker and message bus

## Contribute

I you like to contribute, please check the [contributing](https://github.com/assimbly/gateway/blob/master/CONTRIBUTING.md) page.

## Development

Assimbly gateway is Jhipster generated Spring Boot + Angular webapplication. Basicly when you
got [Spring STS](https://spring.io/tools/sts/all) as IDE and [Yarn](https://yarnpkg.com/lang/en/) installed
you can fork the project from Github and start to develop.

More details on [development](https://github.com/assimbly/gateway/wiki/Development) at the wiki.
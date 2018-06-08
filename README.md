# Introduction

Assimbly is a messaging gateway. Basicly it sends data between two endpoints (a flow). 
An endpoint can be anything like a database, directory or a broker.

The purpose of Assimbly is to connect these endpoints with the help of a webgui. There you can configure and manage the lifecycle of a flow.

On the background [Apache Camel](https://github.com/apache/camel) does the actual work. Assimbly only implements the point-to-point(s) intergration pattern of Camel.
So if data only needs to transfered it can connect any supported endpoint by the [Assimbly Connector](https://github.com/assimbly/connector) directly.

![alt text](https://github.com/assimbly/gateway/tree/master/src/main/webapp/content/images/assimbly_screenshot.jpg "Flows page")

## Design

The main goals are:

* Web based: Access flows from any browser
* Ease of use: Configure and manage flows with ease
* Separate-of-concerns: Seperate message gateway (interoperability) from message broker and message bus

## Documentation

You find documentation on the [wiki](https://github.com/assimbly/gateway/wiki).

## Contribute

If you like to contribute, please check the [contributing](https://github.com/assimbly/gateway/blob/master/CONTRIBUTING.md) page.
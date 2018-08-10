# Introduction

Assimbly is a messaging gateway. It has the folloingw characteristics:

1. it's a link between endpoints, allow them to share information and bypass certain protocols.
2. it's a point of accesss (a portal).
3. it moves messages with data

The purpose of Assimbly is to connect these endpoints with the help of a webgui. Connected endpoints are called a flow.
In the webgui you can configure and manage the lifecycle of a flow.

On the background [Apache Camel](https://github.com/apache/camel) does the actual work. Assimbly can connect
to any supported Camel component by the [Assimbly Connector](https://github.com/assimbly/connector).

![alt text](src/main/webapp/content/images/assimbly_screenshot.jpg?raw=true "Flows page")


## Design

The main design goals are:

* Web based: Access flows from any browser
* Ease of use: Configure and manage flows with ease
* Separate-of-concerns: Seperate message gateway (interoperability) from message bus (business logic)

More on the [rationale](https://github.com/assimbly/gateway/wiki/Rationale-&-Advantages)


## Documentation

You find documentation on the [wiki](https://github.com/assimbly/gateway/wiki) like:

* The [User guide](https://github.com/assimbly/gateway/wiki/user-guide)
* Supported [components](https://github.com/assimbly/gateway/wiki/components) 


## Download

Download it [here](https://github.com/assimbly/gateway/releases)
 
	
## Contribute

If you like to contribute, please check the [contributing](https://github.com/assimbly/gateway/blob/master/CONTRIBUTING.md) page.
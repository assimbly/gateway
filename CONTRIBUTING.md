## Contributing to Assimbly

Assimbly is a community project, any help is welcome!

- First if you would like a feature or run into a bug check the [issue list](https://github.com/assimbly/gateway/issues). Create a new issue
or add a comment to an existing one.
- Download the code & try it out and see what you think.

## Getting in touch

Either use the issue list or just send an email to me (Assimbly maintainer) at r.meester at caesar.nl.

## Improving the documentation

Luckily Assimbly is build on top notch projects like Apache Camel which are well documented. For Assimbly we liked to
document usage and give examples, this documentation can be found at the [wiki](https://github.com/assimbly/gateway/wiki).


## If you find a bug or problem

Please raise a new issue in our [issue tracker](https://github.com/assimbly/gateway/issues).

If you can please follow our issue guideline:

**1. User story**

As .. I can ... so I ..

**1.1	Acceptance tests**

Which checks needs to be done when user story is implemented

**1.2	Use case**

Pre-condition: (Before implementing/testing the issue, first this condition(s) needs to be met)
Happy flow: (What do you expect when everything goes well)
Alternative path: (What do you expect when something goes wrong)

**1.3	Screen information**

Page url or API url related to the issue.

## Working on the code

We recommend to work on the code from [github](https://github.com/apache/camel/).

    git clone https://github.com/assimbly/gateway.git
    cd gateway

Build the project (fast build).

    ./gradlew (linux) or gradlew (windows)

If you intend to work on the code and provide patches and other work you want to submit to the project, 
then you can fork the project on github and work on your own fork. 

The custom work you do should be done on branches you create, which can then be committed and pushed upstream, 
and then submitted to Assimbly Project as PRs (pull requests).

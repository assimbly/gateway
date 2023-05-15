# Scripts usages

Scripts in this bin directory can be executed
for Windows from _/bin/win_ or Mac/Linux from _/bin/mac_

---
## Run

Build and runs the project.

### Usage:

To build and run the project:

```run```

with options:

```run module environment kind```

* Module: valid values are 'full','integration', 'broker' or 'headless' (default is 'full' then both integration and broker are applied)
* Environment: valid values are 'dev' or 'prod' (default=dev)
* Kind: kind of dependencies: default or full. Last option adds dependencies from Assimbly custom-components to the build.

### Examples:

````
run full
run broker prod default
run integration full
run integration
````

---
## build

Builds the project.

### Usage:

To build the project:

```build```

with options:

```build module environment kind```

* Module: valid values are 'full','integration', 'broker' or 'headless' (default is 'full' then both integration and broker are applied)
* Environment: valid values are 'dev' or 'prod' (default=dev)
* Kind: kind of dependencies: default or full. Last option adds dependencies from Asismbly custom-components to build.

### Examples:

````
build full
build broker default
build integration full
build integration
````

---

##  cker

Build a local Docker image to Docker Desktop. (Docker Desktop needs to be installed).

### Usage:

To build the Docker image:

```buildDocker {module} {environment} {kind} {tag}```

* Module: valid values are 'integration', 'broker' or 'headless' (default is both integration and broker are applied)
* Environment: valid values are 'dev' or 'prod' (default=dev)
* Kind: kind of dependencies: default or full. Last option adds extra dependencies from Assimbly custom-components to build.
* Tag: A label for the release (default=latest). For example beta, latest or 3.8.0

### Examples:

````
buildDocker full dev default beta
buildDocker headless prod full 3.8.0
````

---

## releaseDockerToDockerHub

Releases the Docker image to Docker Hub.

### Usage:

To release the Docker image:

```releaseDockerToDockerHub {module} {environment} {kind} {tag}```

* Module: valid values are 'integration', 'broker' or 'headless' (default is both integration and broker are applied)
* Environment: valid values are 'dev' or 'prod' (default=dev)
* Kind: kind of dependencies: default or full. Last add extra dependencies from custom-components to build.
* Tag: A label for the release. For example beta, latest or 3.8.0

### Examples:

````
releaseDockerToDockerHub full dev default beta
releaseDockerToDockerHub headless prod full 3.8.0
````

Note: For authentication to Docker hub you need a credentialhelper on your computer:

https://github.com/docker/docker-credential-helpers
https://github.com/GoogleContainerTools/jib/blob/master/docs/faq.md#what-should-i-do-when-the-registry-responds-with-unauthorized

---

## lazygit

Add all files to the staging area, commit the files and push it to origin (GitHub). Shortcut for:

```
git add -A
git commit -m "<commit message"
git push
```

### Usage:

```lazygit "my message"```

---

## checkversions

Checks the Maven dependencies for the latest versions.

### Usage:

To print a report:

```checkversions```

---

## updateversion

Update the version number of the project and its submodules.

Note: This uses a gradle script ./script/version/version.gradle

### Usage:

To print a report:

```updateversion <versionnumber>```

example

```updateversion 1.1.0```

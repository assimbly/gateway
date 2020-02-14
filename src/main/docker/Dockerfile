# Use an official OpenJDK runtime as a parent image
FROM openjdk:8-jre
LABEL maintainer="Assimbly https://github.com/assimbly"
LABEL site="https://github.com/assimbly/gateway"

# Set the working directory
WORKDIR /opt/assimbly/

# Get jar file from Github
RUN apt-get update  && apt-get install -y jq
RUN export ASSIMBLY_LATEST_VERSION=$(curl -s https://api.github.com/repos/assimbly/gateway/releases/latest | jq -r '.tag_name');wget https://github.com/assimbly/gateway/releases/latest/download/gateway-${ASSIMBLY_LATEST_VERSION}.jar -O /opt/assimbly/gateway.jar

# Get jar file from local directory (as alternative to github)
# COPY ./gateway .

# Set volume (for database / activemq)
VOLUME /opt/assimbly  

# Make ports available outside this container
EXPOSE 8080 61616 18080

# Run gateway.jar when the container launches
ENTRYPOINT ["java", "-jar", "/opt/assimbly/gateway.jar"]

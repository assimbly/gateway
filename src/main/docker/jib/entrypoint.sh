#!/bin/bash

echo "The application will start in ${JHIPSTER_SLEEP}s..." && sleep ${JHIPSTER_SLEEP}

# usage: file_env VAR [DEFAULT]
#    ie: file_env 'XYZ_DB_PASSWORD' 'example'
# (will allow for "$XYZ_DB_PASSWORD_FILE" to fill in the value of
#  "$XYZ_DB_PASSWORD" from a file, especially for Docker's secrets feature)
file_env() {
    local var="$1"
    local fileVar="${var}_FILE"
    local def="${2:-}"
    if [[ ${!var:-} && ${!fileVar:-} ]]; then
        echo >&2 "error: both $var and $fileVar are set (but are exclusive)"
        exit 1
    fi
    local val="$def"
    if [[ ${!var:-} ]]; then
        val="${!var}"
    elif [[ ${!fileVar:-} ]]; then
        val="$(< "${!fileVar}")"
    fi

    if [[ -n $val ]]; then
        export "$var"="$val"
    fi

    unset "$fileVar"
}

file_env 'SPRING_DATASOURCE_URL'
file_env 'SPRING_DATASOURCE_USERNAME'
file_env 'SPRING_DATASOURCE_PASSWORD'
file_env 'SPRING_LIQUIBASE_URL'
file_env 'SPRING_LIQUIBASE_USER'
file_env 'SPRING_LIQUIBASE_PASSWORD'
file_env 'JHIPSTER_REGISTRY_PASSWORD'

#exec java ${JAVA_OPTS} -XX:+AlwaysPreTouch -Djava.security.egd=file:/dev/./urandom --add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/java.util=ALL-UNNAMED -XX:+ShowCodeDetailsInExceptionMessages -verbose:class -cp /app/resources/:/app/classes/:/app/libs/jakarta*:/app/libs/* "org.assimbly.gateway.GatewayApp"  "$@" --application.gateway.base-directory=/data/ --server.port=8088
#exec java ${JAVA_OPTS} -cp /app/resources/:/app/classes/:/app/libs/* "org.assimbly.gateway.GatewayApp"  "$@" --application.gateway.base-directory=/data/ --server.port=8088
#ls -la "/app/"
#ls -la "/"
#tail -f /dev/null
#exec java ${JAVA_OPTS} -cp /app/gateway-5.0.1-SNAPSHOT-plain.jar "org.assimbly.gateway.GatewayApp" --application.gateway.base-directory=/data/ --server.port=8088
exec java ${JAVA_OPTS} -cp "$(cat /app/jib-classpath-file)" "$@" --application.gateway.base-directory=/data/ --server.port=8088

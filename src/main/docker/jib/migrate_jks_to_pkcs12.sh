#!/bin/bash

security_dir="${1:-/data/.assimbly/security}"
password="${KEYSTORE_PWD:-supersecret}"

if ! command -v keytool >/dev/null 2>&1; then
    echo "keytool not found; skipping JKS to PKCS12 migration"
    exit 0
fi

if [ ! -d "$security_dir" ]; then
    exit 0
fi

src="$security_dir/truststore.jks"
dest="$security_dir/outbound-truststore.p12"
if [ -f "$src" ] && [ ! -f "$dest" ]; then
    echo "Migrating $src to $dest"
    keytool -importkeystore \
        -srckeystore "$src" \
        -destkeystore "$dest" \
        -srcstoretype JKS \
        -deststoretype PKCS12 \
        -srcstorepass "$password" \
        -deststorepass "$password" \
        -noprompt
fi

src="$security_dir/keystore.jks"
dest="$security_dir/server-identity.p12"
if [ -f "$src" ] && [ ! -f "$dest" ]; then
    echo "Migrating $src to $dest"
    keytool -importkeystore \
        -srckeystore "$src" \
        -destkeystore "$dest" \
        -srcstoretype JKS \
        -deststoretype PKCS12 \
        -srcstorepass "$password" \
        -deststorepass "$password" \
        -noprompt
fi

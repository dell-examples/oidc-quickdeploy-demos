FROM quay.io/keycloak/keycloak:latest as builder

# Enable health and metrics support
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

# Configure a database vendor
#ENV KC_DB=postgres


# Support TLS
WORKDIR /opt/keycloak
# for demonstration purposes only, please make sure to use proper certificates in production instead
# RUN keytool -genkeypair -storepass password -storetype PKCS12 -keyalg RSA -keysize 2048 -dname "CN=server" -alias server -ext "SAN:c=DNS:localhost,IP:127.0.0.1" -keystore conf/server.keystore

# Enterprise Certs
#ENV KC_HTTPS_TRUST_STORE_FILE=""
ENV KC_HTTPS_KEY_STORE_PASSWORD="P@ssw0rd"
ENV KC_HTTPS_KEY_STORE_TYPE="PKCS12"
COPY certs/ conf/

# Custom Provider 
ENV KC_FEATURES="scripts"
COPY providers/ providers

# Import Demo Realms
COPY realms/ data/import

RUN /opt/keycloak/bin/kc.sh build

#FROM quay.io/keycloak/keycloak:latest
#COPY --from=builder /opt/keycloak/ /opt/keycloak/

# change these values to point to a running postgres instance
#ENV KC_DB=postgres
#ENV KC_DB_URL=<DBURL>
#ENV KC_DB_USERNAME=<DBUSERNAME>
#ENV KC_DB_PASSWORD=<DBPASSWORD>
#ENV KC_HOSTNAME=localhost
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
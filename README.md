# OIDC QuickDeploy Demos
The objective of this repository is to serve as a reference guide for the expedited deployment and evaluation of Delegated Authentication using OpenID Connect configurations, specifically tailored for Dell iDRAC and Dell OpenManage Enterprise within the scope of _Proof of Concept and testing_ scenarios. 

- [Prerequisites](#prerequisites)
- [Deploying KeyCloak Instance](#deploying-keycloak-instance)
- [Configuring KeyCloak](#configuring-keycloak)
- [Configuring Dell iDRACs](#configuring-dell-idracs)
- [Configuring Dell OpenManage Enterprise](#configuring-dell-openmanage-enterprise)
- [Step-by-Step](/docs/STEPBYSTEP.md)
- [Disclaimer](#disclaimer)

## Prerequisites 
- Container Host with access to image registry. The examples use Docker with  quay.io/keycloak/keycloak:latest
- WebServer certificate with private key in PKCS12 format.
- Dell iDRAC or Dell OpenManage Enterprise with connectivity to KeyCloak Container.

Tested Versions:
- KeyCloak: 23.0.4
- Dell iDRAC9: 7.10.30.00 
- Dell OpenManage Enterprise: 4.1.0 (Build 237)

## Deploying KeyCloak Instance
Select a deployment method for [KeyCloak](https://www.keycloak.org/server/containers) within a Containerized environment. Two distict options are available. 
- [Option 1](#option-1-default-container-image) Utilizes the standard container image, augmented with command-line parameters and docker volume configurations. 
- [Option 2](#option-2-customized-container-image) will build/deploy the customized container image.

Both options will automatically import the pre-configured example Realms. These Realms are equipped with the necessary configurations to facilitate the dynamic registration of clients and issueance of claims in a format accepted by iDRAC or OME.

### Option 1: Default Container Image
1. **Position the WebServer Certificate**, in PKCS12 format, within the directory specified by `$basedir/build/certs`. The file should be named `server.keystore`.
2. **Initiate the creation and deployment of the container**. Modify the command argument `--https-key-store-password` to include the passphrase associated with the PKCS12 certificate. Additionally, adjust the `KEYCLOAK_ADMIN_PASSWORD` parameter to set the administrative password for accessing the KeyCloak Administration Console.
```
# set basedir as full path to oidc-quickdeploy-demos
$ export basedir=$PWD

$ docker run -d --name demo-keycloak -p 8443:8443 \
    -v $basedir/build/realms:/opt/keycloak/data/import \
    -v $basedir/build/certs:/opt/keycloak/conf \
    -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin \
    quay.io/keycloak/keycloak:latest start \
    --hostname-strict=false \
    --https-key-store-type="PKCS12" \
    --https-key-store-file="/opt/keycloak/conf/server.keystore" \
    --https-key-store-password="P@ssw0rd" \
    --import-realm
```

### Option 2: Customized Container Image
1. **Position the WebServer Certificate**, in PKCS12 format, within the directory specified by `$basedir/build/certs`. The file should be named `server.keystore`.
2. **Edit the Dockerfile**, within the directory `$basedir/build/Dockerfile`. Modify the `KC_HTTPS_KEY_STORE_PASSWORD` to include the passphrase associated with the PKCS12 certificate.
3. **Build the Container Image**. Execute the docker build command from within the `$basedir/build` directory. 
```
# Optionally package any providers into the $basedir/build/providers location. 
# NOTE: that this provider while functional is not used by the demo and is kept as a reference for implementing script provider for future reference. 
#$ cd $basedir/build; (cd ../src/script_provider/ && zip -r ../../build/providers/xidp.jar META-INF/ xidp_script_mapper.js)

$ docker build -t keycloak_demo:1.0 .
```
4. **Deploy the container** Modify the command argument to adjust the `KEYCLOAK_ADMIN_PASSWORD` parameter to set the administrative password for accessing the KeyCloak Administration Console.
```
$ docker run -d --name demo-keycloak -p 8443:8443 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin keycloak_demo:1.0 start --hostname-strict=false --import-realm
```

## Configuring KeyCloak
The deployed container image incorporates the sample Realms that come with pre-established user groups. You have the option to add users into these groups, aligning them with specific privleges that exist on iDRAC or OpenManage Enterprise. Default Admin and Readonly/Viewer examples are builtin. For comprehensive instructions on personalizing account priveleges see [working with claims](./docs/CLAIMS.md).

To Proceed:
1. **Access the KeyCloak Administration Portal.**
2. **Choose a Realm**, either demo-idrac or demo-ome. Then proceed to integrate users into one of the existing default groups, and configure the user credential. 
3. **Generate an Initial Access Token**, setting the count to reflect the total number of clients you intend to register with said token.

For detailed walkthrough, please consult the [Step-by-Step](./docs/STEPBYSTEP.md).

## Configuring Dell iDRACs
The following API can be leveraged to automate this task. For configuration via the GUI please reference the [Step-by-Step](./docs/STEPBYSTEP.md#configuring-keycloak-with-idrac)
```
$ curl -sk -X PATCH -u root:calvin -H "Content-Type: application/json" \
    https://ir750-a.sumers.local/redfish/v1/Managers/System.Embedded.1/Attributes \
    -d '{
        "Attributes": {
    "OpenIDConnectServer.9.RegistrationDetails": "bearer eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJiM2NlNjRlNC05ZWNjLTRiZjUtYTFmYS1mZTNjMmU1OGQ0ZDUifQ.eyJleHAiOjE3MTUyODY1OTcsImlhdCI6MTcxNTIwMDE5NywianRpIjoiNzMzODc5OTctODM0MC00MzIzLTg2MWUtNzVmYzI2YTI3ZTZiIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5zdW1lcnMuY29tOjg0NDMvcmVhbG1zL2RlbW8taWRyYWMiLCJhdWQiOiJodHRwczovL2tleWNsb2FrLnN1bWVycy5jb206ODQ0My9yZWFsbXMvZGVtby1pZHJhYyIsInR5cCI6IkluaXRpYWxBY2Nlc3NUb2tlbiJ9.QN7M7O-nAdX3XUp4PsL0YZhLGJMyM_tsvuvz1tT1qrQ",
    "OpenIDConnectServer.9.DiscoveryURL": "https://keycloak.sumers.com:8443/realms/demo-idrac/.well-known/openid-configuration",
    "OpenIDConnectServer.9.Name": "KeyCloak",
    "OpenIDConnectServer.9.Enabled": "1",
    "OpenIDConnectServer.9.HttpsCertificate": "-----BEGIN CERTIFICATE-----\nMIIF8DCCBNigAwIBAgITawAAAD5Id6BFZwL5RwABAAAAPjANBgkqhkiG9w0BAQsF\nADBGMRUwEwYKCZImiZPyLGQBGRYFbG9jYWwxFjAUBgoJkiaJk/IsZAEZFgZzdW1l\ncnMxFTATBgNVBAMTDHN1bWVycy1jYS0wMTAeFw0yNDAzMjExODQ1MjJaFw0yNjAx\nMTkwMTA3MjhaMAAwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDZnm1m\nMRcRxSHHhO9CNYYZg7lYB9JcvK/eVWF3QsjV/lClmx6Jqt9mFc3rk1XyCWzg/HWE\nuu4/ouWH46krgUTsNy3TwqCzrA1DKnjphgylU+bNDaoEDI/sG0hmQErj5oMcssn7\njj/VlTdcxfkLwDOm4NwvYMWpS0gKNHayB3a9R5zjYR8hQp1mQPZPyEUswQJu353s\njznQVxpToElcJkCNasp44MS0Jwp+hFGwTn82CpPjj7MhR+LdbJBGMXmJJO46x6qv\nLU30pG/2DpS7MtiFRTt1/uB8DRKit/8tQnSFHazOEpnvF2cxgixR29msNC/ESsSn\n+HfaA7yeeattKONrAgMBAAGjggMbMIIDFzA9BgkrBgEEAYI3FQcEMDAuBiYrBgEE\nAYI3FQiGgY56hKi7M4ORkRqHq99nhqDrO4EyhMj6ZpmGMAIBZAIBAzATBgNVHSUE\nDDAKBggrBgEFBQcDATAOBgNVHQ8BAf8EBAMCBaAwGwYJKwYBBAGCNxUKBA4wDDAK\nBggrBgEFBQcDATAdBgNVHQ4EFgQUAqT6N+b4Q5KtEU6qIGB70ysRhi8wGgYDVR0R\nAQH/BBAwDoIMKi5zdW1lcnMuY29tMB8GA1UdIwQYMBaAFEIaO/IRBnCT7Gp61dQf\ny8TyRRvvMIH3BgNVHR8Ege8wgewwgemggeaggeOGgbJsZGFwOi8vL0NOPXN1bWVy\ncy1jYS0wMSxDTj1DQS0wMSxDTj1DRFAsQ049UHVibGljJTIwS2V5JTIwU2Vydmlj\nZXMsQ049U2VydmljZXMsQ049Q29uZmlndXJhdGlvbixEQz1zdW1lcnMsREM9bG9j\nYWw/Y2VydGlmaWNhdGVSZXZvY2F0aW9uTGlzdD9iYXNlP29iamVjdENsYXNzPWNS\nTERpc3RyaWJ1dGlvblBvaW50hixodHRwOi8vcGtpLnN1bWVycy5sb2NhbC9wa2kv\nc3VtZXJzLWNhLTAxLmNybDCCATwGCCsGAQUFBwEBBIIBLjCCASowgawGCCsGAQUF\nBzAChoGfbGRhcDovLy9DTj1zdW1lcnMtY2EtMDEsQ049QUlBLENOPVB1YmxpYyUy\nMEtleSUyMFNlcnZpY2VzLENOPVNlcnZpY2VzLENOPUNvbmZpZ3VyYXRpb24sREM9\nc3VtZXJzLERDPWxvY2FsP2NBQ2VydGlmaWNhdGU/YmFzZT9vYmplY3RDbGFzcz1j\nZXJ0aWZpY2F0aW9uQXV0aG9yaXR5MCkGCCsGAQUFBzABhh1odHRwOi8vb2NzcC5z\ndW1lcnMubG9jYWwvb2NzcDBOBggrBgEFBQcwAoZCaHR0cDovL3BraS5zdW1lcnMu\nbG9jYWwvcGtpL0NBLTAxLnN1bWVycy5sb2NhbF9zdW1lcnMtY2EtMDEoMSkuY3J0\nMA0GCSqGSIb3DQEBCwUAA4IBAQCZiiE0sWqjx96iEUnFJUktz0MMec1akm82XvbH\nY5rxfHEt1z4KnIyEkaqcd10ihgY1lx+Pid/gm5eB61R3o5DMbVzCDBqNKL3R7c0T\nMjpalnDKuEp9l1F97NadAbUJLVFvjrapR9zvAKrPSh8qSlVPP+roM3dqGQsGi4vm\nDet+SmALx2Gjn3zaf+7Pe8+5iAJJ+S2vXgppVAURC+JcEyeT90u3a28Fcl/WpJCP\ns4siM2VHEdhXoFnMrWAKPrqOqDW1MLAiM3M0GXP2K0L2AdRswvDV7fzDiHWB1tAE\nzP8znuBwXg2/7f6XJBJ1tIgEVPDjtqUJa2c8oE6PQRUFfaFJ\n-----END CERTIFICATE-----\n"
	}
}'
```

## Configuring Dell OpenManage Enterprise
The following API can be leveraged to automate this task. For configuration via the GUI please reference the [Step-by-Step](./docs/STEPBYSTEP.md#configuring-keycloak-with-ome)
```
$ curl -sk -u 'admin:P@ssw0rd' -X POST -H "Content-Type: application/json" \
    https://openmanage-enterprise.sumers.local/api/AccountService/ExternalAccountProvider/OpenIDConnectProvider \
    -d '{
        "Name": "KeyCloak",
        "DiscoveryURI": "https://keycloak.sumers.com:8443/realms/demo-ome",
        "AuthType": "TOKEN",
        "Token": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIzMWVlNjlkNC0yNzRkLTQ3MTUtYTExYi1mMTBjMjgzOTIxZTAifQ.eyJleHAiOjE3MTU0NTUxMTYsImlhdCI6MTcxNTM2ODcxNiwianRpIjoiMWRlZmJlMDQtZWM4OC00MzYzLTgxMGItNWQwNTZiZTk4OGUwIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5zdW1lcnMuY29tOjg0NDMvcmVhbG1zL2RlbW8tb21lIiwiYXVkIjoiaHR0cHM6Ly9rZXljbG9hay5zdW1lcnMuY29tOjg0NDMvcmVhbG1zL2RlbW8tb21lIiwidHlwIjoiSW5pdGlhbEFjY2Vzc1Rva2VuIn0.-lz32ZxEXG6L83GmuloOt7nOd9rhPH_6JfaUpxgwCXY",
        "Enabled": true,
        "CertificateFile": "-----BEGIN CERTIFICATE-----\nMIIF8DCCBNigAwIBAgITawAAAD5Id6BFZwL5RwABAAAAPjANBgkqhkiG9w0BAQsF\nADBGMRUwEwYKCZImiZPyLGQBGRYFbG9jYWwxFjAUBgoJkiaJk/IsZAEZFgZzdW1l\ncnMxFTATBgNVBAMTDHN1bWVycy1jYS0wMTAeFw0yNDAzMjExODQ1MjJaFw0yNjAx\nMTkwMTA3MjhaMAAwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDZnm1m\nMRcRxSHHhO9CNYYZg7lYB9JcvK/eVWF3QsjV/lClmx6Jqt9mFc3rk1XyCWzg/HWE\nuu4/ouWH46krgUTsNy3TwqCzrA1DKnjphgylU+bNDaoEDI/sG0hmQErj5oMcssn7\njj/VlTdcxfkLwDOm4NwvYMWpS0gKNHayB3a9R5zjYR8hQp1mQPZPyEUswQJu353s\njznQVxpToElcJkCNasp44MS0Jwp+hFGwTn82CpPjj7MhR+LdbJBGMXmJJO46x6qv\nLU30pG/2DpS7MtiFRTt1/uB8DRKit/8tQnSFHazOEpnvF2cxgixR29msNC/ESsSn\n+HfaA7yeeattKONrAgMBAAGjggMbMIIDFzA9BgkrBgEEAYI3FQcEMDAuBiYrBgEE\nAYI3FQiGgY56hKi7M4ORkRqHq99nhqDrO4EyhMj6ZpmGMAIBZAIBAzATBgNVHSUE\nDDAKBggrBgEFBQcDATAOBgNVHQ8BAf8EBAMCBaAwGwYJKwYBBAGCNxUKBA4wDDAK\nBggrBgEFBQcDATAdBgNVHQ4EFgQUAqT6N+b4Q5KtEU6qIGB70ysRhi8wGgYDVR0R\nAQH/BBAwDoIMKi5zdW1lcnMuY29tMB8GA1UdIwQYMBaAFEIaO/IRBnCT7Gp61dQf\ny8TyRRvvMIH3BgNVHR8Ege8wgewwgemggeaggeOGgbJsZGFwOi8vL0NOPXN1bWVy\ncy1jYS0wMSxDTj1DQS0wMSxDTj1DRFAsQ049UHVibGljJTIwS2V5JTIwU2Vydmlj\nZXMsQ049U2VydmljZXMsQ049Q29uZmlndXJhdGlvbixEQz1zdW1lcnMsREM9bG9j\nYWw/Y2VydGlmaWNhdGVSZXZvY2F0aW9uTGlzdD9iYXNlP29iamVjdENsYXNzPWNS\nTERpc3RyaWJ1dGlvblBvaW50hixodHRwOi8vcGtpLnN1bWVycy5sb2NhbC9wa2kv\nc3VtZXJzLWNhLTAxLmNybDCCATwGCCsGAQUFBwEBBIIBLjCCASowgawGCCsGAQUF\nBzAChoGfbGRhcDovLy9DTj1zdW1lcnMtY2EtMDEsQ049QUlBLENOPVB1YmxpYyUy\nMEtleSUyMFNlcnZpY2VzLENOPVNlcnZpY2VzLENOPUNvbmZpZ3VyYXRpb24sREM9\nc3VtZXJzLERDPWxvY2FsP2NBQ2VydGlmaWNhdGU/YmFzZT9vYmplY3RDbGFzcz1j\nZXJ0aWZpY2F0aW9uQXV0aG9yaXR5MCkGCCsGAQUFBzABhh1odHRwOi8vb2NzcC5z\ndW1lcnMubG9jYWwvb2NzcDBOBggrBgEFBQcwAoZCaHR0cDovL3BraS5zdW1lcnMu\nbG9jYWwvcGtpL0NBLTAxLnN1bWVycy5sb2NhbF9zdW1lcnMtY2EtMDEoMSkuY3J0\nMA0GCSqGSIb3DQEBCwUAA4IBAQCZiiE0sWqjx96iEUnFJUktz0MMec1akm82XvbH\nY5rxfHEt1z4KnIyEkaqcd10ihgY1lx+Pid/gm5eB61R3o5DMbVzCDBqNKL3R7c0T\nMjpalnDKuEp9l1F97NadAbUJLVFvjrapR9zvAKrPSh8qSlVPP+roM3dqGQsGi4vm\nDet+SmALx2Gjn3zaf+7Pe8+5iAJJ+S2vXgppVAURC+JcEyeT90u3a28Fcl/WpJCP\ns4siM2VHEdhXoFnMrWAKPrqOqDW1MLAiM3M0GXP2K0L2AdRswvDV7fzDiHWB1tAE\nzP8znuBwXg2/7f6XJBJ1tIgEVPDjtqUJa2c8oE6PQRUFfaFJ\n-----END CERTIFICATE-----\n"
    }'

# Response
{"Id":11,"Name":"KeyCloak","JobId":14853,"JobStatus":"IN_PROGRESS"}

# Status can be checked from  /api/JobService/Jobs(<JobId>)
```

# Disclaimer
The software applications included in this package are considered "BETA". They are intended for testing use in non-production environments only.

No support is implied or offered. Dell Corporation assumes no responsibility for results or performance of "BETA" files. Dell does NOT warrant that the Software will meet your requirements, or that operation of the Software will be uninterrupted or error free. The Software is provided to you "AS IS" without warranty of any kind. DELL DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT. The entire risk as to the results and performance of the Software is assumed by you. No technical support provided with this Software.

IN NO EVENT SHALL DELL OR ITS SUPPLIERS BE LIABLE FOR ANY DIRECT OR INDIRECT DAMAGES WHATSOEVER (INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF BUSINESS PROFITS, BUSINESS INTERRUPTION, LOSS OF BUSINESS INFORMATION, OR OTHER PECUNIARY LOSS) ARISING OUT OF USE OR INABILITY TO USE THE SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. Some jurisdictions do not allow an exclusion or limitation of liability for consequential or incidental damages, so the above limitation may not apply to you.
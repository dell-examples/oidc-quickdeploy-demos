/**
 * Available variables: 
 * user - the current UserModel                     https://www.keycloak.org/docs-api/21.0.1/javadocs/org/keycloak/models/UserModel.html
 * realm - the RealmModel                           https://www.keycloak.org/docs-api/21.0.1/javadocs/org/keycloak/models/RealmModel.html
 * token - the current IDToken                      https://www.keycloak.org/docs-api/21.0.1/javadocs/org/keycloak/representations/IDToken.html
 * tokenResponse - the current AccessTOkenResponse  https://www.keycloak.org/docs-api/21.0.1/javadocs/org/keycloak/representations/AccessTokenResponse.html
 * userSession - the active userSessionModel        https://www.keycloak.org/docs-api/21.0.1/javadocs/org/keycloak/models/UserSessionModel.html
 * keycloakSession - the active keycloakSession     https://www.keycloak.org/docs-api/21.0.1/javadocs/org/keycloak/models/KeycloakSession.html
 */


var output = {};

var userSID = "c#";
userSID += userSession.getId(); //userSID = c#5c2640ef-0d53-4a49-b334-20a8f4955e5b

var privs = java.lang.reflect.Array.newInstance(java.lang.String.class, 0);


// getFirstAttribute("xidp"): string L,CD,CU,TA,SC,AR,VM,DC,CL
// getAttributes(): object {xidp=[L,CD,CU,TA,SC,AR,VM,DC,CL]}

if (user.getFirstAttribute("xidp")) {
    var xidpStr = user.getFirstAttribute("xidp").split(',');
    var pCount = xidpStr.length;

    // drop the index when using an string array
    privs = java.lang.reflect.Array.newInstance(java.lang.String.class, pCount);

    // copy the values
    for(var x=0;x<xidpStr.length;x++){
        privs[x]=xidpStr[x];
    }
}

output[userSID]=privs;

// add to the claim
exports = output;
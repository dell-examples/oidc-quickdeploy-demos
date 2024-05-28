# Step by Step
- [Walkthrough for iDRAC](#configuring-keycloak-with-idrac)
- [Walkthrough for OME](#configuring-keycloak-with-ome)

## Configuring KeyCloak with iDRAC
1. **Access KeyCloak Administration Console**, by logging in with the `KEYCLOAK_ADMIN` Credentials designated during the container's deployment. 
![](images/KeyCloak_Admin_Console.png)
2. **Navigate to the the "demo-idrac" realm** within the console. 
![](images/KeyCloak_First_Login_Realms.png)
3. **Proceed to add a user** to the Realm. 
![](images/KeyCloak_iDRAC_Add_User.png)
4. **Add the new user to one of the pre-established permission groups**. For additional details on tailoring permissions, refer to the [CLAIMs](./CLAIMS.md) documentation.
![](images/KeyCloak_iDRAC_Create_User.png)
5. **Assign credentials to the newly added user**
![](images/KeyCloak_iDRAC_User_Set_Credential.png)
6. **Generate an Initial Access Token for the purpose of client registration**. Ensure the 'Count' value corresponds to the total number of clients (iDRACs) inteded for registration. 
![](images/KeyCloak_iDRAC_Generate_IAT.png)
![](images/KeyCloak_iDRAC_IAT_copy.png)
7. **Register the KeyCloak instance as an OIDC Provider through the iDRAC Web UI**. This procedure can be streamlined via Redfish, as detailed [here](../README.md#configuring-dell-idracs).
![](images/iDRAC_Add_OIDC_Provider.png)
8. **Confirm the successful registration of the provider**, which will typically occur within a few minutes. 
![](images/iDRAC_Registered_Provider.png)
9. **The iDRAC login interface will subsequently present an option** to sign in using the 'Provider'.  
![](images/iDRAC_Login_with_Provider.png)
![](images/iDRAC_Login_Redirect.png)
![](images/iDRAC_Delegated_Session.png)

## Configuring KeyCloak with OME
1. **Access KeyCloak Administration Console**, by logging in with the `KEYCLOAK_ADMIN` Credentials designated during the container's deployment. 
![](images/KeyCloak_Admin_Console.png)
2. **Navigate to the the "demo-ome" realm** within the console. 
![](images/KeyCloak_First_Login_Realms.png)
3. **Proceed to add a user** to the Realm, joining one of the predefined permision groups. For additional details on tailoring permissions, refer to the [CLAIMs](./CLAIMS.md) documentation.
![](images/KeyCloak_OME_Create_User.png)
4. **Generate an Initial Access Token for the purpose of client registration** 
![](images/KeyCloak_OME_Generate_IAT.png)
5. **Register the KeyCloak instance as an OIDC Provider through the OME Web UI**. This procedure can be streamlined via Redfish, as detailed [here](../README.md#configuring-dell-openmanage-enterprise).
![](images/OME_Add_OIDC_Provider.png)
6. **Confirm the successful registration of the provider**
![](images/OME_Registered_Provider.png)
7. **The OME Login page will subsiquently present an option** to sign in with 'Provider'.
![](images/OME_Login_with_Provider.png)
![](images/OME_Login_Redirect.png)
![](images/OME_Delegated_Session.png)
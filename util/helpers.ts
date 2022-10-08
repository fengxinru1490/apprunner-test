import axios from "axios";
import qs from 'qs'

export async function GetAccessToken(MicrosoftTenantId) {
  const data = qs.stringify({
    grant_type: "client_credentials",
    client_id: process.env.MicrosoftAppId,
    scope: "https://graph.microsoft.com/.default",
    client_secret: process.env.MicrosoftAppPassword,
  });
  return new Promise(async (resolve) => {
    const config = {
      method: "post",
      url:
        "https://login.microsoftonline.com/" +
        MicrosoftTenantId +
        "/oauth2/v2.0/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };
    await axios(config)
      .then(function (response) {
        resolve(response.data.access_token);
      })
      .catch(function (error) {
        resolve(error);
      });
  });
}

export async function installAppInPersonalChatScope(MicrosoftTenantId, Userid) {
  return new Promise(async (resolve) => {
    let accessToken = await GetAccessToken(MicrosoftTenantId);
    const data = JSON.stringify({
      "teamsApp@odata.bind":
        "https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/" +
        process.env.AppCatalogTeamAppId,
    });
    const config = {
      method: "post",
      url:
        "https://graph.microsoft.com/v1.0/users/" +
        Userid +
        "/teamwork/installedApps",
      headers: {
        "Content-type": "application/json",
        Authorization: accessToken,
      },
      data: data,
    };
    // @ts-ignore
    await axios(config)
      .then(function (response) {
        resolve(response.status);
      })
      .catch(async function (error) {
        await triggerConversationUpdate(
          MicrosoftTenantId,
          Userid
        );
        resolve(error.response.status);
      });
  });
}

export async function triggerConversationUpdate(MicrosoftTenantId, Userid) {
  return new Promise(async (resolve) => {
    let accessToken = await GetAccessToken(MicrosoftTenantId);
    const config = {
      method: "get",
      url:
        "https://graph.microsoft.com/v1.0/users/" +
        Userid +
        "/teamwork/installedApps?$expand=teamsApp,teamsAppDefinition&$filter=teamsApp/externalId eq '" +
        process.env.MicrosoftAppId +
        "'",
      headers: {
        Authorization: accessToken,
      },
    };

    // @ts-ignore
    axios(config)
      .then(async function (response) {
        const Map_installedApps = response.data.value.map(
          (element) => element.teamsApp.externalId
        );
        if (Map_installedApps != null) {
          Map_installedApps.value.forEach(async (apps) => {
            let result = await installAppInPersonalChatScope(
              Userid,
              apps.id
            );
            resolve(result);
          });
        }
        resolve(null);
      })
      .catch(function (error) {
        resolve(error);
      });
  });
}

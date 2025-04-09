const isValidSSOAccessToken = async (token) => {
  const serverUrl = "https://keycloak.mogiio.com/";
  const realmName = "udaipurinsider";

  console.log("realName : ", realmName, " ===> serverUrl : ", serverUrl);

  const url = `${serverUrl}/realms/${realmName}/protocol/openid-connect/userinfo`;

  try {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: "",
    };
    const response = await axios.request(config);

    if (response.statusCode !== 200) {
      console.log("Successfully Received the data from ", url);
      return { status: true, data: response?.data };
    } else {
      return { status: false, message: "unable to validate keycloak" };
    }
  } catch (error) {
    console.log("errors while keycloak validation ", error);
    return { status: false, message: "unable to validate keycloak" };
  }
};

import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

const clientId = "05d81924b4084c82ae39ab726fcfedf2";
const redirectUri = makeRedirectUri({
  scheme: "ByMusic",
});

export default function SpotifyAuth() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: clientId,
      scopes: ["user-read-email", "playlist-modify-public"],
      // To follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: true,
      redirectUri: makeRedirectUri({
        scheme: "ByMusic",
      }),
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      getToken(code);
    }
  }, [response]);

  return (
    <Button
      disabled={!request}
      title={"Login with Spotify"}
      onPress={async () => {
        const { codeVerifier } = request;
        await AsyncStorage.setItem("code_verifier", codeVerifier);
        promptAsync();
      }}
    />
  );
}

const getToken = async (code) => {
  let codeVerifier = await AsyncStorage.getItem("code_verifier"); // Obtén el code_verifier si usas PKCE

  if (!codeVerifier) {
    console.error("No code_verifier found in AsyncStorage");
    return;
  }

  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  };

  try {
    const response = await fetch(discovery.tokenEndpoint, payload); // Hacer la petición POST
    const data = await response.json(); // Convertir la respuesta en JSON
    console.log(data);
    console.log(refresh_token);

    // Almacenar el token de acceso en AsyncStorage
    await AsyncStorage.setItem("access_token", data.access_token);
    await AsyncStorage.setItem("access_token", data.refresh_token);

    console.log("Access token saved successfully:", data.access_token);
  } catch (error) {
    console.error("Error fetching token:", error);
  }
};

const getRefreshToken = async () => {
  const refreshToken = AsyncStorage.getItem("refresh_token");

  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
    }),
  };
  const body = await fetch(discovery.tokenEndpoint, payload);
  const response = await body.json();

  localStorage.setItem("access_token", response.accessToken);
  if (response.refreshToken) {
    localStorage.setItem("refresh_token", response.refreshToken);
  }
};

export const getAccessToken = async () => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    if (token !== null) {
      console.log("Access token:", token);
      return token;
    } else {
      console.log("No access token found");
    }
  } catch (error) {
    console.error("Error retrieving access token:", error);
  }
};

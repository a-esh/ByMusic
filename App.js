import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Pressable } from "react-native";
import SpotifyAuth from "./SpotifyAuth";
import { getAccessToken } from "./SpotifyAuth";

export default function App() {
  return (
    <View style={styles.container}>
      <SpotifyAuth />
      <Pressable
        onPress={() => {
          console.log(getAccessToken());
        }}
      >
        <Text>Get Access Token</Text>
      </Pressable>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "center",
  },
});

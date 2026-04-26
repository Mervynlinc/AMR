import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    </AuthProvider>
  );
}

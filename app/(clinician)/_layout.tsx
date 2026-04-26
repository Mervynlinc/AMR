import { Tabs, useRouter } from "expo-router";
import { BarChart3, Brain, FileText, Home } from "lucide-react-native";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "../../context/AuthContext";

export default function ClinicianLayout() {
  const { role, isLoading } = useAuthContext();
  const router = useRouter();

  // --- Auth guard logic ---
  useEffect(() => {
    if (isLoading) return;
    if (role !== "clinician") {
      router.replace("/(auth)/login");
    }
  }, [role, isLoading, router]);

  if (isLoading || role !== "clinician") {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#047857" />
      </SafeAreaView>
    );
  }
  // ------------------------

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#047857",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color }) => <FileText size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="amr-data"
        options={{
          title: "AMR Data",
          tabBarIcon: ({ color }) => <BarChart3 size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="predictions"
        options={{
          title: "Predictions",
          tabBarIcon: ({ color }) => <Brain size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="report-view"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

import { Tabs } from "expo-router";
import { BarChart3, Brain, FileText, Home } from "lucide-react-native";

export default function ClinicianLayout() {
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

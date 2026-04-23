import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
    BarChart3,
    Brain,
    FileText,
    Home,
    List,
    PlusCircle,
    User,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface BottomNavProps extends BottomTabBarProps {
  role: "lab" | "clinician";
}

export const LAB_TABS = [
  {
    key: "home",
    label: "Home",
    name: "home",
    route: "/(lab)/home",
    Icon: Home,
  },
  {
    key: "new",
    label: "New",
    name: "new-sample",
    route: "/(lab)/new-sample",
    Icon: PlusCircle,
  },
  {
    key: "samples",
    label: "Samples",
    name: "samples",
    route: "/(lab)/samples",
    Icon: List,
  },
  {
    key: "stats",
    label: "Stats",
    name: "stats",
    route: "/(lab)/stats",
    Icon: BarChart3,
  },
  {
    key: "profile",
    label: "Profile",
    name: "profile",
    route: "/(lab)/profile",
    Icon: User,
  },
];

export const CLINICIAN_TABS = [
  {
    key: "home",
    label: "Home",
    name: "home",
    route: "/(clinician)/home",
    Icon: Home,
  },
  {
    key: "reports",
    label: "Reports",
    name: "reports",
    route: "/(clinician)/reports",
    Icon: FileText,
  },
  {
    key: "amr",
    label: "AMR Data",
    name: "amr-data",
    route: "/(clinician)/amr-data",
    Icon: BarChart3,
  },
  {
    key: "predictions",
    label: "Predictions",
    name: "predictions",
    route: "/(clinician)/predictions",
    Icon: Brain,
  },
];

const BottomNav: React.FC<BottomNavProps> = ({
  role,
  state,
  descriptors,
  navigation,
}) => {
  const tabs = role === "lab" ? LAB_TABS : CLINICIAN_TABS;

  return (
    <View style={styles.nav}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        // Find our custom tab definition based on the route name
        const tabDef = tabs.find((t) => t.name === route.name);
        if (!tabDef) return null; // Skip screens not in our tab definition

        const Icon = tabDef.Icon;
        const label = tabDef.label;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Icon size={20} color={isFocused ? "#047857" : "#9ca3af"} />
            <Text
              style={[
                styles.label,
                { color: isFocused ? "#047857" : "#9ca3af", marginTop: 4 },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
  },
});

export default BottomNav;

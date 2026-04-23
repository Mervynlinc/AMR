import { useRouter } from "expo-router";
import { HelpCircle, LogOut, Settings } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import ScreenHeader from "../../components/layout/ScreenHeader";
import { useAuthContext } from "../../context/AuthContext";

export default function LabProfile() {
  const router = useRouter();
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="Profile" onBack={() => router.back()} />
      <ScrollView className="flex-1 px-6 pt-6">
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Text className="text-3xl font-bold text-emerald-700">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "LP"}
            </Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">
            {user?.name || "Lab Personnel"}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {user?.id || "LAB-001"} |{" "}
            {user?.facility || "MUST Microbiology Lab"}
          </Text>
        </View>

        <View className="space-y-4">
          <TouchableOpacity className="flex-row items-center p-4 bg-white rounded-xl border border-gray-200">
            <Settings size={20} color="#4b5563" className="mr-3" />
            <Text className="text-base font-medium text-gray-900 flex-1">
              Account Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 bg-white rounded-xl border border-gray-200">
            <HelpCircle size={20} color="#4b5563" className="mr-3" />
            <Text className="text-base font-medium text-gray-900 flex-1">
              Help & Support
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-4 bg-red-50 rounded-xl border border-red-200 mt-4"
            onPress={handleLogout}
          >
            <LogOut size={20} color="#dc2626" className="mr-3" />
            <Text className="text-base font-bold text-red-700 flex-1">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
    </View>
  );
}

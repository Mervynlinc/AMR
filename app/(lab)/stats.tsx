import { useRouter } from "expo-router";
import { BarChart3 } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

import ScreenHeader from "../../components/layout/ScreenHeader";

export default function LabStats() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="Lab Statistics" onBack={() => router.back()} />
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <BarChart3 size={32} color="#047857" />
        </View>
        <Text className="text-lg font-bold text-gray-900 text-center mb-2">
          Statistics Module
        </Text>
        <Text className="text-sm text-gray-500 text-center leading-relaxed">
          Lab statistics and analytics are currently under development. They
          will be available in a future update.
        </Text>
      </View>
      
    </View>
  );
}

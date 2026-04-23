import { useRouter } from "expo-router";
import {
    Bug,
    ChevronRight,
    Microscope,
    ShieldCheck,
    Stethoscope,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "../context/AuthContext";
import { login as authLogin } from "../services/auth";

export default function Index() {
  const { role, isLoading, token, login } = useAuthContext();
  const router = useRouter();
  const [isClinicianLoggingIn, setIsClinicianLoggingIn] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (token && role) {
      if (role === "lab_tech") {
        router.replace("/(lab)/home");
      } else if (role === "clinician") {
        router.replace("/(clinician)/home");
      }
    }
  }, [isLoading, role, token, router]);

  const handleClinicianShortcut = async () => {
    setIsClinicianLoggingIn(true);
    try {
      const response = await authLogin("CLIN-001", "password");
      await login(response.token, response.role, response.user);
    } catch (err) {
      console.error(err);
    } finally {
      setIsClinicianLoggingIn(false);
    }
  };

  if (isLoading || isClinicianLoggingIn || (token && role)) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#047857" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-16 pb-8 flex-1">
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-emerald-700 rounded-[24px] flex items-center justify-center mb-5">
            <ShieldCheck size={40} color="#ffffff" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center">
            S. aureus AMR
          </Text>
          <Text className="text-sm text-gray-500 mt-2 text-center leading-relaxed">
            Staphylococcus aureus Surveillance Platform
          </Text>
          <Text className="text-xs text-gray-400 mt-1 text-center">
            Mbarara University of Science & Technology
          </Text>
        </View>

        <View className="space-y-4 mb-8">
          <TouchableOpacity
            className="w-full bg-emerald-700 rounded-2xl p-5 mb-4 shadow-sm"
            onPress={() => router.push("/(auth)/login")}
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <Microscope size={24} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-white">
                  Laboratory Personnel
                </Text>
                <Text className="text-xs text-emerald-100 mt-1">
                  Sign in to enter lab data
                </Text>
              </View>
              <ChevronRight size={20} color="#a7f3d0" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-sm"
            onPress={handleClinicianShortcut}
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
                <Stethoscope size={24} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900">
                  Clinician / Physician
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Continue to view reports & predictions
                </Text>
              </View>
              <ChevronRight size={20} color="#d1d5db" />
            </View>
          </TouchableOpacity>
        </View>

        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-auto mb-10">
          <View className="flex-row items-start">
            <Bug size={20} color="#2563eb" className="mt-0.5 mr-3" />
            <Text className="flex-1 text-xs text-blue-800 leading-relaxed">
              <Text className="font-bold">Focus Organism:</Text> This platform
              exclusively tracks{" "}
              <Text className="italic">Staphylococcus aureus</Text>{" "}
              antimicrobial resistance data and ML predictions.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

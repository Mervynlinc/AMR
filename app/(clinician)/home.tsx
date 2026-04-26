import { useRouter } from "expo-router";
import { FileText, Info, LogOut, ShieldAlert } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Badge from "../../components/ui/Badge";
import { useAuthContext } from "../../context/AuthContext";
import {
  getReports
} from "../../services/api";
import useAMRStore from "../../store/amr";

export default function ClinicianHome() {
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const { reports, setReports } = useAMRStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const reps = await getReports();
        setReports(reps);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, [setReports]);

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="bg-emerald-700 pt-12 pb-4 px-4 flex-row items-center justify-between pt-safe">
        <View>
          <Text className="text-white text-xl font-bold">
            Welcome, {user?.name}
          </Text>
          <Text className="text-emerald-100 text-sm">{user?.facility}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} className="p-2">
          <LogOut size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-4 bg-gray-50">
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex-row items-start mb-6">
          <Info size={20} color="#1E40AF" className="mt-0.5 mr-2" />
          <Text className="text-blue-800 flex-1 text-sm">
            Read-only Access: You are viewing verified lab data. For sample
            registration, contact your designated laboratory.
          </Text>
        </View>

        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center mb-2">
              <FileText size={20} color="#047857" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              {reports.length}
            </Text>
            <Text className="text-gray-500 text-xs mt-1">
              Available Reports
            </Text>
          </View>
          <View className="flex-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mb-2">
              <ShieldAlert size={20} color="#D97706" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">7</Text>
            <Text className="text-gray-500 text-xs mt-1">AMR Alerts</Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-4 mt-2">
          <Text className="text-lg font-bold text-gray-800">
            Recent Reports
          </Text>
          <TouchableOpacity onPress={() => router.push("/(clinician)/reports")}>
            <Text className="text-emerald-700 font-medium">See All</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#047857" className="mt-10" />
        ) : (
          reports.slice(0, 3).map((report) => (
            <TouchableOpacity
              key={report.id}
              onPress={() =>
                router.push(`/(clinician)/report-view?reportId=${report.id}`)
              }
              className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-bold text-gray-900 text-base">
                  {report.id}
                </Text>
                <Badge
                  label={report.isMRSA ? "MRSA" : "MSSA"}
                  variant={report.isMRSA ? "danger" : "warning"}
                />
              </View>
              <Text className="text-gray-600 mb-1">
                {report.specimenType} • {report.organism}
              </Text>
              <View className="flex-row justify-between items-center mt-2 border-t border-gray-50 pt-2">
                <Text className="text-gray-500 text-xs">
                  {report.patientDemographics}
                </Text>
                <Text className="text-gray-400 text-xs">{report.date}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

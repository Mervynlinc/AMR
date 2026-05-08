import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  FileText,
  ShieldAlert,
  TrendingUp,
  Circle,
} from "lucide-react-native";

import { getReports, getResistanceTrends } from '../../services/api';
import useAMRStore from '../../store/amr';
import Badge from '../../components/ui/Badge';
import Sparkline from '../../components/ui/Sparkline';
import { useAuthContext } from '../../context/AuthContext';

export default function ClinicianHome() {
  const router = useRouter();
  const { logout } = useAuthContext();
  const {
    reports,
    setReports,
    readReports,
    markReportRead,
    loadReadReports,
  } = useAMRStore();
  const [isLoading, setIsLoading] = useState(true);
  const [resistanceTrends, setResistanceTrends] = useState<{ name: string; currentRate: number; trend: number[]; color: string }[]>([]);

  const handleBackToLanding = async () => {
    await logout();
    router.replace("/");
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        await loadReadReports();
        const [reps, trends] = await Promise.all([
          getReports(),
          getResistanceTrends(),
        ]);
        setReports(reps);
        setResistanceTrends(trends);
        console.log("Home page - Resistance trends:", trends);
      } catch (e) {
        console.error("Home page error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, [setReports, loadReadReports]);

  const unreadReports = reports.filter((r) => !readReports.includes(r.id));

  return (
    <View className="flex-1">
      <View className="bg-white px-4 flex-row items-center justify-between py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleBackToLanding} className="p-2 mr-2">
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-xl font-bold">Home</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4 bg-gray-50">
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
            <Text className="text-2xl font-bold text-gray-900">
              {unreadReports.length}
            </Text>
            <Text className="text-gray-500 text-xs mt-1">
              {unreadReports.length === 1 ? "New Report" : "New Reports"}
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-800">
              Resistance Trends
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(clinician)/amr-data")}
            >
              <Text className="text-emerald-700 font-medium text-sm">
                View All
              </Text>
            </TouchableOpacity>
          </View>
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            {resistanceTrends.length > 0 ? (
              resistanceTrends.map((item) => (
                <View key={item.name} className="mb-4 last:mb-0">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-800 font-semibold text-sm">
                      {item.name}
                    </Text>
                    <View className="flex-row items-center">
                      <TrendingUp size={14} color={item.color} />
                      <Text
                        className={`text-sm font-bold ml-1 ${item.currentRate > 50 ? "text-red-600" : "text-amber-600"}`}
                      >
                        {item.currentRate}%
                      </Text>
                    </View>
                  </View>
                  <Sparkline
                    data={item.trend}
                    width={200}
                    height={40}
                    color={item.color}
                  />
                </View>
              ))
            ) : (
              <View className="py-4 items-center">
                <Text className="text-gray-500 text-sm">No resistance trend data available</Text>
              </View>
            )}
          </View>
        </View>

        {unreadReports.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-800">
                New Reports
              </Text>
              <View className="bg-red-500 rounded-full px-2 py-0.5">
                <Text className="text-white text-xs font-bold">{unreadReports.length}</Text>
              </View>
            </View>
            {unreadReports.slice(0, 3).map((report) => (
              <TouchableOpacity
                key={report.id}
                onPress={() => {
                  markReportRead(report.id);
                  router.push(`/(clinician)/report-view?reportId=${report.id}`);
                }}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>
                    {report.id}
                  </Text>
                  <Badge
                    label={report.isMRSA ? "MRSA" : "MSSA"}
                    variant={report.isMRSA ? "danger" : "warning"}
                  />
                </View>
                <Text className="text-gray-600 mb-1">
                  {report.patientDemographics.split(" ").slice(0, 2).join(" ")} • {report.patientDemographics.split(" ")[2]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View className="flex-row items-center justify-between mb-4">
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
          reports.slice(0, 5).map((report) => (
            <TouchableOpacity
              key={report.id}
              onPress={() => {
                markReportRead(report.id);
                router.push(`/(clinician)/report-view?reportId=${report.id}`);
              }}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>
                  {report.id}
                </Text>
                <Badge
                  label={report.isMRSA ? "MRSA" : "MSSA"}
                  variant={report.isMRSA ? "danger" : "warning"}
                />
              </View>
              <Text className="text-gray-600 mb-1">{report.patientDemographics.split(" ").slice(0, 2).join(" ")} • {report.patientDemographics.split(" ")[2]}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

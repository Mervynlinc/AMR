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
  Info,
  Bookmark,
  BookmarkCheck,
  Phone,
  Plus,
  Download,
  TrendingUp,
  Bell,
} from "lucide-react-native";

import { getSamples, createSample, saveAST, getReports, getReport, getPredictions } from '../../services/api';
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
    savedReports,
    toggleSavedReport,
    isReportSaved,
  } = useAMRStore();
  const [isLoading, setIsLoading] = useState(true);
  const [newReportsCount, setNewReportsCount] = useState(2);

  const handleBackToLanding = async () => {
    await logout();
    router.replace("/");
  };

  const resistanceTrends = [
    {
      name: "Oxacillin",
      currentRate: 35,
      trend: [28, 30, 32, 33, 34, 35],
      color: "#dc2626",
    },
    {
      name: "Ciprofloxacin",
      currentRate: 55,
      trend: [45, 48, 50, 52, 53, 55],
      color: "#dc2626",
    },
    {
      name: "Erythromycin",
      currentRate: 45,
      trend: [40, 42, 43, 44, 44, 45],
      color: "#f59e0b",
    },
  ];

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

  const savedReportsList = reports.filter((r) => savedReports.includes(r.id));

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
            <Text className="text-2xl font-bold text-gray-900">7</Text>
            <Text className="text-gray-500 text-xs mt-1">AMR Alerts</Text>
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
            {resistanceTrends.map((item) => (
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
            ))}
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-4 mt-2">
          <View className="flex-row items-center">
            <Text className="text-lg font-bold text-gray-800">
              Recent Reports
            </Text>
            {newReportsCount > 0 && (
              <View className="bg-red-500 rounded-full px-2 py-0.5 ml-2">
                <Text className="text-white text-xs font-bold">{newReportsCount} New</Text>
              </View>
            )}
          </View>
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
                <View className="flex-row items-center gap-2">
                  <Badge
                    label={report.isMRSA ? "MRSA" : "MSSA"}
                    variant={report.isMRSA ? "danger" : "warning"}
                  />
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleSavedReport(report.id);
                    }}
                  >
                    {isReportSaved(report.id) ? (
                      <BookmarkCheck size={20} color="#047857" />
                    ) : (
                      <Bookmark size={20} color="#9ca3af" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              <Text className="text-gray-600 mb-1">{report.specimenType}</Text>
              <View className="flex-row justify-between items-center mt-2 border-t border-gray-50 pt-2">
                <Text className="text-gray-500 text-xs">
                  {report.patientDemographics}
                </Text>
                <Text className="text-gray-400 text-xs">{report.date}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {savedReportsList.length > 0 && (
          <View className="mt-6 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-800">
                Saved Reports
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(clinician)/reports")}
              >
                <Text className="text-emerald-700 font-medium text-sm">
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            {savedReportsList.slice(0, 2).map((report) => (
              <TouchableOpacity
                key={report.id}
                onPress={() =>
                  router.push(`/(clinician)/report-view?reportId=${report.id}`)
                }
                className="bg-emerald-50 rounded-xl p-4 mb-3 shadow-sm border border-emerald-200"
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="font-bold text-gray-900 text-base">
                    {report.id}
                  </Text>
                  <BookmarkCheck size={20} color="#047857" />
                </View>
                <Text className="text-gray-600 mb-1">
                  {report.specimenType}
                </Text>
                <View className="flex-row justify-between items-center mt-2 border-t border-emerald-100 pt-2">
                  <Text className="text-gray-500 text-xs">
                    {report.patientDemographics}
                  </Text>
                  <Text className="text-gray-400 text-xs">{report.date}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

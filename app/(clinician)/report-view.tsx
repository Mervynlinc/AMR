import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Download, ChevronLeft, Bug } from "lucide-react-native";
import { getReport } from "../../services/api";
import { downloadReportPdf } from "../../services/pdf";
import { Report } from "../../types";
import useAMRStore from "../../store/amr";

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${month} ${day}, ${year} ${hours}:${minutes}`;
}

export default function ClinicianReportView() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;
      try {
        const data = await getReport(reportId);
        setReport(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
    useAMRStore.getState().markReportRead(reportId);
  }, [reportId]);

  const handleDownload = async () => {
    if (!report || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadReportPdf(report);
    } catch {
      Alert.alert("Error", "Failed to download report.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-gray-900">Lab Report</Text>
            <Text className="text-xs text-gray-500 mt-0.5">Loading...</Text>
          </View>
          <TouchableOpacity className="p-1">
            <Download size={22} color="#111827" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2BB5A0" />
        </View>
      </View>
    );
  }

  if (!report) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-gray-900">Lab Report</Text>
            <Text className="text-xs text-gray-500 mt-0.5">Error</Text>
          </View>
          <TouchableOpacity className="p-1">
            <Download size={22} color="#111827" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-base text-gray-500">Report not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-4 py-3 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-gray-900">Lab Report</Text>
          <Text className="text-xs text-gray-500 mt-0.5">{report.id} | FINAL</Text>
        </View>
        <TouchableOpacity onPress={handleDownload} disabled={isDownloading} className="p-1">
          {isDownloading ? (
            <ActivityIndicator size="small" color="#111827" />
          ) : (
            <Download size={22} color="#111827" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-[#1A2340] rounded-xl p-5 mb-4 relative">
          <Text className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            MUST Microbiology Laboratory
          </Text>
          <Text className="text-xl font-bold text-white mb-3">
            {report.organism} Susceptibility Report
          </Text>
          <View className="absolute top-5 right-5 bg-green-600 px-3 py-1 rounded-full">
            <Text className="text-xs font-semibold text-white">FINAL</Text>
          </View>
          <View className="flex-row justify-between mt-3">
            <View className="flex-1">
              <Text className="text-xs text-gray-400 mb-1">Report ID:</Text>
              <Text className="text-sm font-medium text-white">{report.id}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-400 mb-1">Date:</Text>
              <Text className="text-sm font-medium text-white">{formatDate(report.date)}</Text>
            </View>
          </View>
          <View className="flex-row justify-between mt-3">
            <View className="flex-1">
              <Text className="text-xs text-gray-400 mb-1">Specimen:</Text>
              <Text className="text-sm font-medium text-white">{report.specimenType}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-400 mb-1">Sex:</Text>
              <Text className="text-sm font-medium text-white">{report.patientSex === "M" ? "Male" : "Female"}</Text>
            </View>
          </View>
          <View className="flex-row justify-between mt-3">
            <View className="flex-1">
              <Text className="text-xs text-gray-400 mb-1">Age Group:</Text>
              <Text className="text-sm font-medium text-white">
                {report.patientDemographics.split(" ")[0]}
              </Text>
            </View>
            <View className="flex-1">
              {report.growthTimeHours && (
                <>
                  <Text className="text-xs text-gray-400 mb-1">Growth Time:</Text>
                  <Text className="text-sm font-medium text-white">{report.growthTimeHours} hours</Text>
                </>
              )}
            </View>
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            ORGANISM IDENTIFIED
          </Text>
          <View className="flex-row items-center mb-3">
            <View className="w-11 h-11 rounded-full bg-red-100 justify-center items-center mr-3">
              <Bug size={28} color="#E53935" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 mb-1">
                {report.organism}
              </Text>
              <Text className="text-sm text-gray-500">
                Gram-Positive Cocci | MALDI-TOF
              </Text>
            </View>
          </View>
          <View className="bg-[#FDECEA] px-3 py-1.5 rounded-lg self-start">
            <Text className="text-xs font-semibold text-pink-700">
              {report.isMRSA
                ? "Methicillin-Resistant (MRSA)"
                : "Methicillin-Susceptible (MSSA)"}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            ANTIMICROBIAL SUSCEPTIBILITY ({report.astResults.length}{" "}
            ANTIBIOTICS)
          </Text>
          <Text className="text-xs text-gray-400 mb-2">
            Disc Diffusion | CLSI Guidelines
          </Text>
          <View className="h-px bg-gray-200 mb-3" />

          {report.astResults.map((ast, idx) => {
            const bgColor = ast.result === "R" ? "#FDECEA" : "#FFFFFF";
            const badgeColor =
              ast.result === "R"
                ? "#E53935"
                : ast.result === "I"
                  ? "#FB8C00"
                  : "#43A047";

            return (
              <View
                key={idx}
                className="flex-row items-center justify-between py-3 px-2 rounded-lg mb-1"
                style={{ backgroundColor: bgColor }}
              >
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900">
                    {ast.antibiotic}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    ({ast.abbreviation})
                  </Text>
                </View>
                <View
                  className="w-7 h-7 rounded-full justify-center items-center"
                  style={{ backgroundColor: badgeColor }}
                >
                  <Text className="text-xs font-bold text-white">
                    {ast.result}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View className="bg-gray-100 rounded-xl p-4 mb-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            LOCAL {report.organism.toUpperCase()} RESISTANCE CONTEXT
          </Text>
          <Text className="text-sm text-gray-700 leading-5">
            {report.isMRSA
              ? "MRSA detected. Avoid beta-lactams. Consider Vancomycin or Linezolid based on susceptibility."
              : "MSSA detected. Beta-lactams such as Oxacillin remain effective. Confirm full susceptibility panel before prescribing."}
          </Text>
        </View>

        {report.remarks && (
          <View className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-200">
            <Text className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
              TECHNICIAN REMARKS
            </Text>
            <Text className="text-sm text-gray-800 leading-5">
              {report.remarks}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Download } from 'lucide-react-native';
import ScreenHeader from '../../components/layout/ScreenHeader';

import { getSamples, createSample, saveAST, getReports, getReport, getPredictions } from '../../services/api';
import { Report } from '../../types';
import Badge from '../../components/ui/Badge';
import ASTCard from '../../components/ui/ASTCard';

export default function ClinicianReportView() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  }, [reportId]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="Report Details" showBack onBack={() => router.back()} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#047857" />
        </View>
      </View>
    );
  }

  if (!report) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="Error" showBack onBack={() => router.back()} />
        <View className="flex-1 justify-center items-center">
          <Text>Report not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-emerald-700 pt-12 pb-4 px-4 flex-row items-center justify-between pt-safe">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Text className="text-white font-medium pl-1">Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1 text-center mr-4">{report.id}</Text>
        <TouchableOpacity className="p-1">
          <Download size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="bg-gray-900 rounded-xl p-5 mb-4 shadow-sm">
          <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Organism Identified</Text>
          <Text className="text-white text-xl font-bold italic mb-3">{report.organism}</Text>
          <View className="flex-row justify-between items-center border-t border-gray-700 pt-3">
            <Badge label={report.isMRSA ? "MRSA" : "MSSA"} variant={report.isMRSA ? "danger" : "warning"} />
            <Text className="text-gray-300 text-sm font-medium">{report.specimenType}</Text>
          </View>
        </View>

        <Text className="text-gray-800 font-bold text-lg mb-3 mt-2">Susceptibility Results</Text>
        {report.astResults.length > 0 ? (
          report.astResults.map((ast, idx) => (
            <ASTCard key={idx} entry={ast} />
          ))
        ) : (
          <Text className="text-gray-500 italic mb-4">No specific AST record mapping available for this mock.</Text>
        )}

        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4 mb-4">
          <Text className="text-blue-900 font-bold mb-1">Local Context</Text>
          <Text className="text-blue-800 text-sm leading-5">{report.localContext}</Text>
        </View>

        <View className="mt-4 border-t border-gray-200 pt-4 mb-8">
          <Text className="text-gray-500 text-xs font-medium uppercase tracking-wider">Authorised By</Text>
          <Text className="text-gray-900 font-bold mt-1 text-base">{report.authorisedBy}</Text>
          <Text className="text-gray-400 mt-1 text-xs">Report Date: {report.date}</Text>
        </View>
      </ScrollView>

      
    </View>
  );
}

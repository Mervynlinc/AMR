import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import ScreenHeader from '../../components/layout/ScreenHeader';

import useAMRStore from '../../store/amr';
import { getSamples, createSample, saveAST, getReports, getReport, getPredictions } from '../../services/api';
import Badge from '../../components/ui/Badge';

export default function ClinicianReports() {
  const router = useRouter();
  const { reports, setReports } = useAMRStore();
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'MRSA Only' | 'MSSA Only'>('All');

  useEffect(() => {
    const fetchReps = async () => {
      setIsLoading(true);
      const res = await getReports();
      setReports(res);
      setIsLoading(false);
    };
    fetchReps();
  }, [setReports]);

  const filtered = reports.filter(r => {
    const matchSearch = r.id.toLowerCase().includes(search.toLowerCase()) || 
                        r.patientDemographics.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;

    if (filter === 'MRSA Only') return r.isMRSA;
    if (filter === 'MSSA Only') return !r.isMRSA;
    return true;
  });

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="Lab Reports" />
      
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <View className="flex-row bg-gray-100 items-center px-4 py-2 rounded-xl border border-gray-200 mb-4">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search by ID or Demographics..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 py-1 text-gray-800"
          />
        </View>

        <View className="flex-row gap-3">
          {['All', 'MRSA Only', 'MSSA Only'].map(opt => (
            <TouchableOpacity
              key={opt}
              onPress={() => setFilter(opt as any)}
              className={`px-4 py-1.5 rounded-full border ${filter === opt ? 'bg-emerald-700 border-emerald-700' : 'bg-white border-gray-300'}`}
            >
              <Text className={filter === opt ? 'text-white font-medium' : 'text-gray-600'}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
         <View className="flex-1 justify-center items-center">
           <ActivityIndicator size="large" color="#047857" />
         </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4">
          {filtered.map(report => (
            <TouchableOpacity
              key={report.id}
              onPress={() => router.push(`/(clinician)/report-view?reportId=${report.id}`)}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-bold text-gray-900 text-lg">{report.id}</Text>
                <Text className="text-gray-400 text-xs">{report.date}</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Badge label={report.isMRSA ? "MRSA" : "MSSA"} variant={report.isMRSA ? "danger" : "warning"} />
              </View>
              <Text className="text-gray-600 mb-1 font-medium">{report.specimenType}</Text>
              <Text className="text-gray-500 text-sm border-t border-gray-50 pt-2 mt-2">
                {report.patientDemographics}
              </Text>
            </TouchableOpacity>
          ))}
          {filtered.length === 0 && (
            <Text className="text-center text-gray-500 mt-10">No reports found.</Text>
          )}
          <View className="h-6" />
        </ScrollView>
      )}

      
    </View>
  );
}

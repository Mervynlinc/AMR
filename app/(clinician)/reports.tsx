import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Calendar, User, FileText, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react-native';
import ScreenHeader from '../../components/layout/ScreenHeader';

import useAMRStore from '../../store/amr';
import { getSamples, createSample, saveAST, getReports, getReport, getPredictions } from '../../services/api';
import Badge from '../../components/ui/Badge';

export default function ClinicianReports() {
  const router = useRouter();
  const { reports, setReports, savedReports, toggleSavedReport, isReportSaved } = useAMRStore();
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
    <View className="flex-1 bg-gray-50 ">
      <ScreenHeader title="Lab Reports"/>

      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <View className="flex-row bg-gray-100 items-center px-4 py-2.5 rounded-xl border border-gray-200 mb-4">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search by ID or Demographics..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 py-1 text-gray-800"
          />
        </View>

        <View className="flex-row gap-2">
          {['All', 'MRSA Only', 'MSSA Only'].map(opt => (
            <TouchableOpacity
              key={opt}
              onPress={() => setFilter(opt as any)}
              className={`px-3 py-1.5 rounded-full border ${filter === opt ? 'bg-emerald-700 border-emerald-700' : 'bg-white border-gray-300'}`}
            >
              <Text className={filter === opt ? 'text-white font-medium text-xs' : 'text-gray-600 text-xs'}>
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
              className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100 overflow-hidden"
              activeOpacity={0.7}
            >
              <View className="px-4 py-3.5 border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <FileText size={18} color="#6b7280" />
                    <Text className="font-bold text-base ml-2 text-gray-900">
                      {report.id}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Badge label={report.isMRSA ? "MRSA" : "MSSA"} variant={report.isMRSA ? "danger" : "warning"} />
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
              </View>

              <View className="p-4">
                <View className="mb-3">
                  <Text className="text-gray-900 font-semibold text-base mb-1">{report.specimenType}</Text>
                </View>

                <View className="flex-row items-center mb-3">
                  <View className="flex-row items-center flex-1">
                    <User size={16} color="#6b7280" />
                    <Text className="text-gray-600 text-sm ml-2">{report.patientDemographics}</Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                  <View className="flex-row items-center">
                    <Calendar size={14} color="#9ca3af" />
                    <Text className="text-gray-400 text-xs ml-1.5">{report.date}</Text>
                  </View>
                  <ChevronRight size={18} color="#9ca3af" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {filtered.length === 0 && (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Text className="text-gray-500 text-sm">No reports found.</Text>
            </View>
          )}
          <View className="h-6" />
        </ScrollView>
      )}


    </View>
  );
}

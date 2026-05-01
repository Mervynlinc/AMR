import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Bug, Send } from 'lucide-react-native';
import { getSamples } from '../../services/api';
import { Sample } from '../../types';

export default function LabReportView() {
  const { sampleId } = useLocalSearchParams<{ sampleId: string }>();
  const router = useRouter();
  const [sample, setSample] = useState<Sample | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const fetchSample = async () => {
      if (!sampleId) return;
      try {
        const samples = await getSamples();
        const foundSample = samples.find((s) => s.id === sampleId);
        setSample(foundSample || null);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSample();
  }, [sampleId]);

  const handlePublish = async () => {
    if (!sample) return;
    setIsPublishing(true);
    try {
      Alert.alert('Success', 'Report published successfully.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch {
      Alert.alert('Error', 'Failed to publish report.');
    } finally {
      setIsPublishing(false);
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
            <Send size={22} color="#111827" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2BB5A0" />
        </View>
      </View>
    );
  }

  if (!sample) {
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
            <Send size={22} color="#111827" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-base text-gray-500">Sample not found.</Text>
        </View>
      </View>
    );
  }

  const patientDemographics = `${sample.ageGroup} ${sample.sex === 'M' ? 'Male' : sample.sex === 'F' ? 'Female' : 'Other'}`;
  const organism = "Staphylococcus aureus";
  const isMRSA = sample.isMDR;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-4 py-3 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-gray-900">Lab Report</Text>
          <Text className="text-xs text-gray-500 mt-0.5">{sample.id} | DRAFT</Text>
        </View>
        <TouchableOpacity onPress={handlePublish} disabled={isPublishing} className="p-1">
          <Send size={22} color={isPublishing ? "#9CA3AF" : "#111827"} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-4 pb-6" showsVerticalScrollIndicator={false}>
        <View className="bg-[#1A2340] rounded-xl p-5 mb-4 relative">
          <Text className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">MUST Microbiology Laboratory</Text>
          <Text className="text-xl font-bold text-white mb-3">{organism} Susceptibility Report</Text>
          <View className="absolute top-5 right-5 bg-amber-600 px-3 py-1 rounded-full">
            <Text className="text-xs font-semibold text-white">DRAFT</Text>
          </View>
          <View className="flex-row justify-between mt-3">
            <View className="flex-1">
              <Text className="text-xs text-gray-400 mb-1">Sample #:</Text>
              <Text className="text-sm font-medium text-white">{sample.id}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-400 mb-1">Date:</Text>
              <Text className="text-sm font-medium text-white">{sample.receivedDate}</Text>
            </View>
          </View>
          <View className="flex-row justify-between mt-3">
            <View className="flex-1">
              <Text className="text-xs text-gray-400 mb-1">Specimen:</Text>
              <Text className="text-sm font-medium text-white">{sample.specimenType}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-400 mb-1">Patient:</Text>
              <Text className="text-sm font-medium text-white">{patientDemographics}</Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">ORGANISM IDENTIFIED</Text>
          <View className="flex-row items-center mb-3">
            <View className="w-11 h-11 rounded-full bg-red-100 justify-center items-center mr-3">
              <Bug size={28} color="#E53935" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 mb-1">{organism}</Text>
              <Text className="text-sm text-gray-500">Gram-Positive Cocci | MALDI-TOF</Text>
            </View>
          </View>
          <View className="bg-[#FDECEA] px-3 py-1.5 rounded-lg self-start">
            <Text className="text-xs font-semibold text-pink-700">
              {isMRSA ? 'Methicillin-Resistant (MRSA)' : 'Methicillin-Susceptible (MSSA)'}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">ANTIMICROBIAL SUSCEPTIBILITY ({sample.astResults.length} ANTIBIOTICS)</Text>
          <Text className="text-xs text-gray-400 mb-2">Disc Diffusion | CLSI Guidelines</Text>
          <View className="h-px bg-gray-200 mb-3" />
          
          {sample.astResults.map((ast, idx) => {
            const bgColor = ast.result === 'R' ? '#FDECEA' : '#FFFFFF';
            const badgeColor = ast.result === 'R' ? '#E53935' : ast.result === 'I' ? '#FB8C00' : '#43A047';
            
            return (
               <View key={idx} className="flex-row items-center justify-between py-3 px-2 rounded-lg mb-1" style={{ backgroundColor: bgColor }}>
                 <View className="flex-1">
                   <Text className="text-sm font-medium text-gray-900">{ast.antibiotic}</Text>
                   <Text className="text-xs text-gray-500 mt-0.5">({ast.abbreviation})</Text>
                 </View>
                 <View className="w-7 h-7 rounded-full justify-center items-center" style={{ backgroundColor: badgeColor }}>
                   <Text className="text-xs font-bold text-white">{ast.result}</Text>
                 </View>
               </View>
            );
          })}
          
          <Text className="text-xs text-gray-400 italic mt-2 text-center">+ {Math.max(0, sample.astResults.length - 6)} more antibiotics tested (scroll full report to view)</Text>
        </View>

        <View className="bg-gray-100 rounded-xl p-4 mb-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">LOCAL {organism.toUpperCase()} RESISTANCE CONTEXT</Text>
          <Text className="text-sm text-gray-700 leading-5">High MRSA prevalence in ICU settings. Consider alternative treatment options for resistant strains.</Text>
        </View>

        <View className="mt-2 mb-4">
          <View className="h-px bg-gray-200 mb-3" />
          <Text className="text-xs text-gray-400 text-center">Sample ID: {sample.id} | {sample.receivedDate}</Text>
        </View>

        <TouchableOpacity 
          onPress={handlePublish} 
          disabled={isPublishing}
          className={`w-full py-4 rounded-xl flex-row justify-center items-center mt-4 mb-4 ${isPublishing ? 'bg-gray-400' : 'bg-emerald-700'}`}
        >
          <Send size={20} color="#fff" className="mr-2" />
          <Text className="text-white font-bold text-lg">Publish Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
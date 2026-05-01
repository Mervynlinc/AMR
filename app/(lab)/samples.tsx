import React, { useState } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import ScreenHeader from '../../components/layout/ScreenHeader';

import { useSamples } from '../../hooks/useSamples';
import SampleCard from '../../components/ui/SampleCard';

export default function LabSamples() {
  const router = useRouter();
  const { samples, isLoading } = useSamples();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');

  const filteredSamples = samples.filter(s => {
    const matchesSearch = s.id.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    
    if (filter === 'Pending') return s.status.includes('pending');
    if (filter === 'Completed') return s.status === 'complete';
    return true;
  });

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="All Samples" />
      
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <View className="flex-row bg-gray-100 items-center px-4 py-2 rounded-xl border border-gray-200 mb-4">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search by ID..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 py-1 text-gray-800"
          />
        </View>

        <View className="flex-row gap-3">
          {['All', 'Pending', 'Completed'].map(opt => (
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
          {filteredSamples.map(sample => (
            <SampleCard 
              key={sample.id}
              sample={sample}
              onPress={() => {
                if (sample.status === 'pending_isolate') {
                  router.push(`/(lab)/isolate?sampleId=${sample.id}`);
                } else if (sample.status === 'pending_ast') {
                  router.push(`/(lab)/ast?sampleId=${sample.id}`);
                } else if (sample.status === 'complete') {
                  router.push(`/(lab)/report-view?sampleId=${sample.id}`);
                }
              }}
            />
          ))}
          {filteredSamples.length === 0 && (
            <Text className="text-gray-500 text-center mt-10">No samples found.</Text>
          )}
          <View className="h-6" />
        </ScrollView>
      )}

      
    </View>
  );
}

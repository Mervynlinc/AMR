import React, { useState } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import ScreenHeader from '../../components/layout/ScreenHeader';

import { useSamples } from '../../hooks/useSamples';
import SampleCard from '../../components/ui/SampleCard';

export default function LabSamples() {
  const router = useRouter();
  const { samples, isLoading } = useSamples();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);

  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const filteredSamples = samples.filter(s => {
    const matchesSearch = (s.sample_code || s.id).toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'Pending') return s.status.includes('pending');
    if (filter === 'Completed') return s.status === 'complete';

    if (selectedDate) {
      const sampleDate = new Date(s.collection_date || s.received_date);
      if (formatDate(sampleDate) !== formatDate(selectedDate)) return false;
    }

    return true;
  });

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="All Samples" />
      
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <View className="flex-row bg-gray-100 items-center px-4 py-2 rounded-xl border border-gray-200 mb-3">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search by ID..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 py-1 text-gray-800"
          />
        </View>

        <View className="flex-row gap-3 mb-3">
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

        <TouchableOpacity
          onPress={() => setShowDateFilter(!showDateFilter)}
          className="flex-row items-center"
        >
          <Calendar size={16} color="#6b7280" />
          <Text className="text-sm text-gray-500 ml-2">
            {showDateFilter ? 'Hide date filter' : 'Filter by date'}
          </Text>
        </TouchableOpacity>

        {showDateFilter && (
          <View className="flex-row items-center gap-2 mt-3">
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-1 bg-gray-100 rounded-lg px-3 py-2 border border-gray-200"
            >
              <Text className="text-xs text-gray-400">Date</Text>
              <Text className="text-sm text-gray-800">{selectedDate ? formatDate(selectedDate) : 'Select date'}</Text>
            </TouchableOpacity>
            {selectedDate && (
              <TouchableOpacity
                onPress={() => setSelectedDate(null)}
                className="bg-red-100 rounded-lg px-3 py-2"
              >
                <Text className="text-xs font-semibold text-red-600">Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_e, d) => { setShowDatePicker(false); if (d) setSelectedDate(d); }}
          />
        )}
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
                  router.push(`/(lab)/isolate?sampleId=${sample.id}&sampleCode=${sample.sample_code}`);
                } else if (sample.status === 'pending_ast') {
                  router.push(`/(lab)/ast?sampleId=${sample.id}&sampleCode=${sample.sample_code}`);
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

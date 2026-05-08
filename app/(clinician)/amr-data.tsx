import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import ScreenHeader from '../../components/layout/ScreenHeader';

import ResistanceBar from '../../components/ui/ResistanceBar';
import { useRouter } from 'expo-router';
import { getResistanceAggregates, getResistanceYears } from "../../services/api";

const intensityOptions = [
  { label: 'All Resistance', value: 'all' },
  { label: 'High (>50%)', value: 'high' },
  { label: 'Medium (20-50%)', value: 'medium' },
  { label: 'Low (<20%)', value: 'low' },
];

export default function ClinicianAMRData() {
  const [years, setYears] = useState<string[]>([]);
  const [year, setYear] = useState('');
  const [intensity, setIntensity] = useState('all');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [amrData, setAmrData] = useState<{ name: string; rate: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getResistanceYears().then((yrs) => {
      const strYears = yrs.map(String).reverse();
      setYears(strYears);
      if (!year && strYears.length > 0) {
        setYear(strYears[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (!year) return;
    const fetchData = async () => {
      setIsLoading(true);
      const data = await getResistanceAggregates(year, intensity as any);
      setAmrData(data);
      setIsLoading(false);
    };
    fetchData();
  }, [year, intensity]);

  const Dropdown = ({ label, value, options, onSelect, dropdownKey }: any) => {
    const isOpen = openDropdown === dropdownKey;

    return (
      <View className="flex-1">
        <Text className="text-gray-500 text-xs font-medium uppercase mb-2">{label}</Text>
        <View className="relative">
          <TouchableOpacity
            onPress={() => setOpenDropdown(isOpen ? null : dropdownKey)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 flex-row items-center justify-between"
          >
            <Text className="text-gray-800 font-medium text-sm flex-1">{value}</Text>
            {isOpen ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
          </TouchableOpacity>

          {isOpen && (
            <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10 max-h-48 overflow-hidden">
              <ScrollView nestedScrollEnabled>
                {options.map((option: any) => (
                  <TouchableOpacity
                    key={option.value || option}
                    onPress={() => {
                      onSelect(option.value || option);
                      setOpenDropdown(null);
                    }}
                    className={`px-3 py-2.5 border-b border-gray-100 ${value === (option.value || option) ? 'bg-emerald-50' : ''}`}
                  >
                    <Text className={`text-sm ${value === (option.value || option) ? 'text-emerald-800 font-semibold' : 'text-gray-800'}`}>
                      {option.label || option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="AMR Data" />
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row gap-3">
          <Dropdown
            label="Year"
            value={year}
            options={years}
            onSelect={setYear}
            dropdownKey="year"
          />
          <Dropdown
            label="Resistance Intensity"
            value={intensityOptions.find(opt => opt.value === intensity)?.label || 'All Resistance'}
            options={intensityOptions}
            onSelect={setIntensity}
            dropdownKey="intensity"
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center py-8">
            <ActivityIndicator size="large" color="#047857" />
          </View>
        ) : amrData.length > 0 ? (
          amrData.map((ab) => (
            <View key={ab.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3">
              <Text className="text-gray-800 font-bold mb-1.5">{ab.name}</Text>
              <ResistanceBar rate={ab.rate} showLabel />
            </View>
          ))
        ) : (
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 items-center">
            <Text className="text-gray-500 text-sm">No data found for the selected filters.</Text>
          </View>
        )}
        <View className="h-8" />
      </ScrollView>


    </View>
  );
}

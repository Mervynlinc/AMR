import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import ScreenHeader from '../../components/layout/ScreenHeader';

import ResistanceBar from '../../components/ui/ResistanceBar';
import { useRouter } from 'expo-router';

const years = ['2021', '2022', '2023', '2024'];
const intensityOptions = [
  { label: 'All Resistance', value: 'all' },
  { label: 'High (>50%)', value: 'high' },
  { label: 'Medium (20-50%)', value: 'medium' },
  { label: 'Low (<20%)', value: 'low' },
];

export default function ClinicianAMRData() {
  const [year, setYear] = useState('2024');
  const [intensity, setIntensity] = useState('all');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();

  const amrData = [
    { name: "Oxacillin", rate: 35 },
    { name: "Cefoxitin", rate: 35 },
    { name: "Vancomycin", rate: 0 },
    { name: "Linezolid", rate: 0 },
    { name: "Daptomycin", rate: 1 },
    { name: "Teicoplanin", rate: 2 },
    { name: "Erythromycin", rate: 45 },
    { name: "Clindamycin", rate: 28 },
    { name: "Azithromycin", rate: 42 },
    { name: "Trimethoprim/Sulfamethoxazole", rate: 12 },
    { name: "Ciprofloxacin", rate: 55 },
    { name: "Levofloxacin", rate: 52 },
    { name: "Moxifloxacin", rate: 48 },
    { name: "Gentamicin", rate: 15 },
    { name: "Amikacin", rate: 5 },
    { name: "Tobramycin", rate: 18 },
    { name: "Tetracycline", rate: 30 },
    { name: "Doxycycline", rate: 20 },
    { name: "Minocycline", rate: 8 },
    { name: "Rifampin", rate: 3 },
    { name: "Fusidic Acid", rate: 22 },
    { name: "Mupirocin", rate: 10 },
    { name: "Chloramphenicol", rate: 4 },
    { name: "Fosfomycin", rate: 9 },
    { name: "Quinupristin/Dalfopristin", rate: 0 },
  ];

  const filteredData = amrData.filter(item => {
    if (intensity === 'high') return item.rate > 50;
    if (intensity === 'medium') return item.rate >= 20 && item.rate <= 50;
    if (intensity === 'low') return item.rate < 20;
    return true;
  });

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
        {filteredData.length > 0 ? (
          filteredData.sort((a, b) => b.rate - a.rate).map((ab) => (
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

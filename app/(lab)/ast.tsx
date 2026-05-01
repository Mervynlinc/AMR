import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenHeader from '../../components/layout/ScreenHeader';

import { getSamples, createSample, saveAST, getReports, getReport, getPredictions } from '../../services/api';
import useAMRStore from '../../store/amr';
import { ASTEntry, ASTResult } from '../../types';

const INITIAL_ANTIBIOTICS = [
  { name: 'Oxacillin', abbr: 'OX', class: 'Beta-lactam' },
  { name: 'Cefoxitin', abbr: 'FOX', class: 'Beta-lactam' },
  { name: 'Vancomycin', abbr: 'VA', class: 'Glycopeptide' },
  { name: 'Erythromycin', abbr: 'E', class: 'Macrolide' },
  { name: 'Clindamycin', abbr: 'DA', class: 'Lincosamide' },
  { name: 'Trimethoprim/Sulfamethoxazole', abbr: 'SXT', class: 'Folate pathway inhibitor' },
  { name: 'Ciprofloxacin', abbr: 'CIP', class: 'Fluoroquinolone' },
];

export default function LabAST() {
  const router = useRouter();
  const { sampleId } = useLocalSearchParams<{ sampleId: string }>();
  const { updateSample } = useAMRStore();
  
  const [method, setMethod] = useState('Disk Diffusion');
  const [results, setResults] = useState<Record<string, { result: ASTResult | null }>>(
    Object.fromEntries(INITIAL_ANTIBIOTICS.map(a => [a.name, { result: null }]))
  );

  const isMDR = useMemo(() => {
    const resistantClasses = new Set<string>();
    INITIAL_ANTIBIOTICS.forEach(ab => {
      if (results[ab.name].result === 'R') {
        resistantClasses.add(ab.class);
      }
    });
    return resistantClasses.size >= 3;
  }, [results]);

  const handleResultChange = (antibiotic: string, result: ASTResult) => {
    setResults(prev => ({
      ...prev,
      [antibiotic]: { result }
    }));
  };

  const handleComplete = async () => {
    if (!sampleId) return;

    const formattedResults: ASTEntry[] = INITIAL_ANTIBIOTICS.map(ab => ({
      antibiotic: ab.name,
      abbreviation: ab.abbr,
      result: results[ab.name].result,
    }));

    try {
      await saveAST(sampleId, formattedResults);
      updateSample(sampleId, { status: 'complete', astResults: formattedResults, isMDR });
      
      Alert.alert('Success', 'AST results saved successfully.', [
        { text: 'OK', onPress: () => router.replace('/(lab)/home') }
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save AST results.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <ScreenHeader 
        title="AST Results" 
        subtitle={sampleId as string} 
        showBack 
        onBack={() => router.back()} 
      />
      
      {isMDR && (
        <View className="bg-red-500 py-3 px-4 flex-row items-center justify-between">
          <Text className="text-white font-bold shrink-1">⚠️ MDR ALERT: Resistance to ≥ 3 classes detected.</Text>
        </View>
      )}

      <ScrollView className="flex-1 px-4 pt-4 bg-gray-50" contentContainerStyle={{ paddingBottom: 40}}>
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Test Method</Text>
          <TextInput
            value={method}
            onChangeText={setMethod}
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
          />
        </View>

        <Text className="text-gray-900 font-bold text-lg mb-2 mt-2">Antibiotics Panel</Text>
        
        {INITIAL_ANTIBIOTICS.map((ab) => (
          <View key={ab.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3">
            <View className="mb-3 border-b border-gray-100 pb-2">
              <Text className="font-bold text-gray-900 text-base">{ab.name}</Text>
              <Text className="text-gray-400 text-xs">{ab.abbr} • {ab.class}</Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity 
                onPress={() => handleResultChange(ab.name, 'S')}
                className={`flex-1 py-2 items-center rounded border ${results[ab.name].result === 'S' ? 'bg-green-100 border-green-500' : 'bg-gray-50 border-gray-200'}`}
              >
                <Text className={`font-bold ${results[ab.name].result === 'S' ? 'text-green-800' : 'text-gray-500'}`}>S</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleResultChange(ab.name, 'I')}
                className={`flex-1 py-2 items-center rounded border ${results[ab.name].result === 'I' ? 'bg-amber-100 border-amber-500' : 'bg-gray-50 border-gray-200'}`}
              >
                <Text className={`font-bold ${results[ab.name].result === 'I' ? 'text-amber-800' : 'text-gray-500'}`}>I</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleResultChange(ab.name, 'R')}
                className={`flex-1 py-2 items-center rounded border ${results[ab.name].result === 'R' ? 'bg-red-100 border-red-500' : 'bg-gray-50 border-gray-200'}`}
              >
                <Text className={`font-bold ${results[ab.name].result === 'R' ? 'text-red-800' : 'text-gray-500'}`}>R</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity 
          onPress={handleComplete} 
          className="w-full py-4 rounded-xl flex-row justify-center items-center mt-4 mb-4 bg-emerald-700"
        >
          <Text className="text-white font-bold text-lg">Save Results & Complete</Text>
        </TouchableOpacity>
      </ScrollView>

      
    </KeyboardAvoidingView>
  );
}

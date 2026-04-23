import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import ScreenHeader from '../../components/layout/ScreenHeader';

import { usePredictions } from '../../hooks/usePredictions';
import { ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { TrendingUp, Info } from 'lucide-react-native';

export default function ClinicianPredictions() {
  const { predictions, isLoading } = usePredictions();
  const [selectedAb, setSelectedAb] = useState<string>('Oxacillin');

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="ML Predictions" subtitle="Next 6 Months" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#047857" />
        </View>
        
      </View>
    );
  }

  const currentPred = predictions.find(p => p.antibiotic === selectedAb) || predictions[0];

  const chartData = {
    labels: [...(currentPred?.historicalData.map(d => d.year) || []), 'Next 6m'],
    datasets: [
      {
        data: [...(currentPred?.historicalData.map(d => d.rate) || []), currentPred?.predictedRate || 0],
        color: (opacity = 1) => `rgba(4, 120, 87, ${opacity})`,
        strokeWidth: 3
      }
    ],
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="ML Predictions" subtitle="Resistance Trends (Next 6 Months)" />

      <ScrollView className="flex-1">
        <View className="bg-emerald-900 px-4 py-6 mb-2">
          <View className="flex-row items-center mb-1">
            <TrendingUp size={20} color="#6EE7B7" className="mr-2" />
            <Text className="text-emerald-100 font-bold uppercase tracking-wider text-xs">Model Version 2.1.0</Text>
          </View>
          <Text className="text-white font-medium text-lg leading-6 mt-1">
            Predictive analysis of S. aureus resistance rates based on 4-year cumulative data.
          </Text>
          <View className="flex-row mt-4 gap-4">
            <View className="bg-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-700">
              <Text className="text-emerald-200 text-xs">Accuracy</Text>
              <Text className="text-white font-bold">92.4%</Text>
            </View>
            <View className="bg-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-700">
              <Text className="text-emerald-200 text-xs">AUC-ROC</Text>
              <Text className="text-white font-bold">0.89</Text>
            </View>
          </View>
        </View>

        <View className="px-4 py-4">
          <Text className="text-gray-700 font-bold mb-3 text-base">Select Antibiotic</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 flex-row gap-2">
            {predictions.map(p => (
              <TouchableOpacity
                key={p.antibiotic}
                onPress={() => setSelectedAb(p.antibiotic)}
                className={`mr-2 px-4 py-2 rounded-full border ${selectedAb === p.antibiotic ? 'bg-emerald-100 border-emerald-500' : 'bg-white border-gray-300'}`}
              >
                <Text className={selectedAb === p.antibiotic ? 'text-emerald-800 font-bold' : 'text-gray-600'}>
                  {p.antibiotic}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {currentPred && (
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
              <Text className="text-xl font-bold text-gray-900 mb-4">{currentPred.antibiotic} Trend</Text>
              
              <View className="items-center mr-4">
                <LineChart
                  data={chartData}
                  width={Dimensions.get('window').width - 64}
                  height={220}
                  yAxisSuffix="%"
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(4, 120, 87, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: { r: '4', strokeWidth: '2', stroke: '#047857' }
                  }}
                  bezier
                  style={{ marginVertical: 8, borderRadius: 16 }}
                />
              </View>

              <View className="flex-row mt-6 pt-4 border-t border-gray-100 gap-4">
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs mb-1 uppercase font-medium tracking-wider">Current Rate</Text>
                  <Text className="text-gray-900 text-2xl font-bold">{currentPred.currentRate}%</Text>
                </View>
                <View className="w-px bg-gray-200" />
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs mb-1 uppercase font-medium tracking-wider">Predicted Rate</Text>
                  <View className="flex-row items-end">
                    <Text className={`text-2xl font-bold ${currentPred.delta > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {currentPred.predictedRate}%
                    </Text>
                    <Text className={`ml-2 mb-1 font-bold ${currentPred.delta > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {currentPred.delta > 0 ? '↗' : '↘'} {Math.abs(currentPred.delta)}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View className="bg-gray-100 p-4 rounded-xl flex-row mb-6 mt-2">
            <Info size={20} color="#6B7280" className="mr-3 mt-0.5" />
            <Text className="text-gray-600 text-sm flex-1 leading-5">
              Disclaimer: Machine learning predictions are illustrative and should support, not replace, clinical judgement.
            </Text>
          </View>
        </View>
      </ScrollView>

      
    </View>
  );
}

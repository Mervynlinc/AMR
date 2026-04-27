import { Info, TrendingUp } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { usePredictions } from "../../hooks/usePredictions";

export default function ClinicianPredictions() {
  const [forecastYears, setForecastYears] = useState(5);
  const { predictions, isLoading } = usePredictions(forecastYears);
  const [selectedAb, setSelectedAb] = useState<string>("");

  if (!predictions.length) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#047857" />
        <Text className="mt-2 text-gray-500">Connecting to model...</Text>
      </View>
    );
  }

  const currentPred =
    predictions.find((p) => p.antibiotic === selectedAb) || predictions[0];

  const labels = currentPred.historicalData.map((d) => d.year.toString());
  const mainData = currentPred.historicalData.map((d) => d.rate);
  const upperData = currentPred.historicalData.map((d) => d.upper);
  const lowerData = currentPred.historicalData.map((d) => d.lower);

  const chartData = {
    labels,
    datasets: [
      {
        data: upperData,
        color: () => "rgba(156,163,175,0.3)",
        strokeWidth: 1,
      },
      {
        data: lowerData,
        color: () => "rgba(156,163,175,0.3)",
        strokeWidth: 1,
      },
      {
        data: mainData,
        color: () => "rgba(4,120,87,1)",
        strokeWidth: 3,
      },
    ],
  };
  const ANTIBIOTIC_NAMES: Record<string, string> = {
    AMK: "Amikacin",
    AMX: "Amoxicillin",
    AMC: "Amoxicillin/Clavulanic acid",
    AMP: "Ampicillin",
    AZM: "Azithromycin",
    CRO: "Ceftriaxone",
    CXM: "Cefuroxime",
    CIP: "Ciprofloxacin",
    OXA: "Oxacillin",
    CHL: "Chloramphenicol",
    CLI: "Clindamycin",
    GEN: "Gentamicin",
    ERY: "Erythromycin",
    TCY: "Tetracycline",
    SXT: "Trimethoprim/Sulfamethoxazole",
    VAN: "Vancomycin",
    PEN: "Penicillin",
    IPM: "Imipenem",
    CAZ: "Ceftazidime",
    CTX: "Cefotaxime",
    FOX: "Cefoxitin",
    LNZ: "Linezolid",
    PEF: "Pefloxacin",
    NOR: "Norfloxacin",
  };
  const fullname =
    ANTIBIOTIC_NAMES[currentPred.antibiotic] || currentPred.antibiotic;
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader
        title="ML Predictions"
        subtitle="Resistance Forecast Trends"
      />

      <View className="flex-1">
        <ScrollView
          className={`flex-1 ${isLoading ? "opacity-40" : "opacity-100"}`}
          scrollEnabled={!isLoading}
        >
          {/* HEADER */}
          <View className="bg-emerald-900 px-4 py-6 mb-2">
            <View className="flex-row items-center mb-1">
              <TrendingUp size={20} color="#6EE7B7" />
              <Text className="text-emerald-100 font-bold ml-2 text-xs">
                HYBRID MODEL V2.1
              </Text>
            </View>

            <Text className="text-white text-lg mt-2">
              {fullname} Resistance Forecast
            </Text>

            <View className="flex-row mt-4 gap-4">
              <View className="bg-emerald-800 px-3 py-2 rounded-lg">
                <Text className="text-emerald-200 text-xs">MAE</Text>
                <Text className="text-white font-bold">
                  {currentPred.mae?.toFixed(3) || "0.000"}
                </Text>
              </View>

              <View className="bg-emerald-800 px-3 py-2 rounded-lg">
                <Text className="text-emerald-200 text-xs">R²</Text>
                <Text className="text-white font-bold">
                  {currentPred.r2
                    ? `${(currentPred.r2 * 100).toFixed(1)}%`
                    : "0%"}
                </Text>
              </View>

              <View className="bg-emerald-800 px-3 py-2 rounded-lg">
                <Text className="text-emerald-200 text-xs">Forecast</Text>
                <Text className="text-white font-bold">
                  {forecastYears} yrs
                </Text>
              </View>
            </View>
          </View>

          <View className="px-4 py-4">
            <Text className="font-bold mb-3">Select Antibiotic</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {predictions.map((p) => (
                <TouchableOpacity
                  key={p.antibiotic}
                  onPress={() => setSelectedAb(p.antibiotic)}
                  className={`mr-2 px-4 py-2 rounded-full border ${
                    currentPred.antibiotic === p.antibiotic
                      ? "bg-emerald-100 border-emerald-500"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Text>{p.antibiotic}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="mt-4">
              <Text className="font-bold mb-2">Forecast Horizon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((y) => (
                  <TouchableOpacity
                    key={y}
                    onPress={() => setForecastYears(y)}
                    className={`mr-2 px-4 py-2 rounded-full border ${
                      forecastYears === y
                        ? "bg-emerald-100 border-emerald-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text>{y} yr</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="bg-white rounded-2xl p-4 mt-6 shadow-sm border border-gray-100">
              <Text className="text-lg font-bold mb-4">
                {currentPred.antibiotic} Trend
              </Text>

              <LineChart
                key={`chart-${currentPred.antibiotic}-${forecastYears}-${labels.length}`}
                data={chartData}
                width={Dimensions.get("window").width - 40}
                height={240}
                yAxisSuffix="%"
                // 🔥 Added rotation to ensure years don't overlap when showing 10 yrs
                verticalLabelRotation={25}
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 0,
                  color: () => "rgba(4,120,87,1)",
                  labelColor: () => "#6B7280",
                  propsForLabels: {
                    fontSize: 10,
                  },
                }}
                bezier
              />
            </View>

            <View className="flex-row mt-6 gap-4">
              <View className="flex-1">
                <Text className="text-gray-500 text-xs">Current</Text>
                <Text className="text-xl font-bold">
                  {currentPred.currentRate}%
                </Text>
              </View>

              <View className="flex-1">
                <Text className="text-gray-500 text-xs">Predicted</Text>
                <Text className="text-xl font-bold">
                  {currentPred.predictedRate}%
                </Text>
              </View>

              <View className="flex-1">
                <Text className="text-gray-500 text-xs">Trend</Text>
                <Text
                  className={`text-xl font-bold ${currentPred.delta > 0 ? "text-red-600" : "text-emerald-600"}`}
                >
                  {currentPred.delta > 0 ? "▲" : "▼"}{" "}
                  {Math.abs(currentPred.delta)}%
                </Text>
              </View>
            </View>

            <View className="bg-gray-100 p-4 rounded-xl flex-row mt-6">
              <Info size={18} color="#6B7280" />
              <Text className="text-gray-600 text-sm ml-2">
                Predictions support—not replace—clinical decisions.
              </Text>
            </View>
          </View>
        </ScrollView>

        {isLoading && (
          <View className="absolute inset-0 bg-black/5 flex items-center justify-center">
            <ActivityIndicator size="large" color="#047857" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

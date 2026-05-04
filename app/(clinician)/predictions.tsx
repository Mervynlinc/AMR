import NetInfo from "@react-native-community/netinfo";
import { Info, TrendingUp, WifiOff } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { usePredictions } from "../../hooks/usePredictions";

const SCREEN_W = Dimensions.get("window").width;
const CHART_W = SCREEN_W - 40;

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

// ── Colors ────────────────────────────────────────────────────
const DARK_BLUE = "rgba(30,58,138,1)"; // blue-900  — historical
const DARK_GREEN = "rgba(1,71,55,1)"; // emerald-950 — forecast
const CI_BAND = "rgba(156,163,175,0.35)"; // grey CI band

/** Keep at most maxVisible labels, blank the rest to avoid crowding */
function sparsedLabels(labels: string[], maxVisible = 8): string[] {
  if (labels.length <= maxVisible) return labels;
  const step = Math.ceil(labels.length / maxVisible);
  return labels.map((l, i) => (i % step === 0 ? l : ""));
}

const BASE_CHART_CONFIG = {
  backgroundColor: "#fff",
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: () => DARK_GREEN,
  labelColor: () => "#6B7280",
  propsForLabels: { fontSize: 10 },
  barPercentage: 0.6,
};

export default function ClinicianPredictions() {
  const [forecastYears, setForecastYears] = useState(5);
  const { predictions, isLoading } = usePredictions(forecastYears);
  const [selectedAb, setSelectedAb] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [chartTab, setChartTab] = useState<"line" | "bar">("line");

  // ── Connectivity monitor ──────────────────────────────────
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });
    return unsub;
  }, []);

  // ── Offline screen ────────────────────────────────────────
  if (isOnline === false) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader
          title="ML Predictions"
          subtitle="Resistance Forecast Trends"
        />
        <View className="flex-1 justify-center items-center px-8">
          <WifiOff size={52} color="#9CA3AF" />
          <Text className="text-xl font-bold text-gray-700 mt-4 text-center">
            No Internet Connection
          </Text>
          <Text className="text-gray-500 text-sm mt-2 text-center">
            Please connect to the internet and the forecast will load
            automatically.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Initial loading ───────────────────────────────────────
  if (!predictions.length) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader
          title="ML Predictions"
          subtitle="Resistance Forecast Trends"
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#047857" />
          <Text className="mt-3 text-gray-500">Connecting to model…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Current prediction ────────────────────────────────────
  const currentPred =
    predictions.find((p) => p.antibiotic === selectedAb) || predictions[0];
  const fullname =
    ANTIBIOTIC_NAMES[currentPred.antibiotic] || currentPred.antibiotic;
  const currentYear = new Date().getFullYear();

  // ── Build line chart datasets ─────────────────────────────
  const allPoints = currentPred.historicalData;
  const splitIdx = allPoints.findIndex((p) => !p.isHistorical);
  const hasForecast = splitIdx !== -1;

  const toSafe = (arr: (number | null)[]) => arr.map((v) => v ?? 0);

  // Historical series: values up to splitIdx, bridge at transition, then 0
  const histValues: (number | null)[] = allPoints.map((p, i) => {
    if (!hasForecast) return p.rate;
    if (i < splitIdx) return p.rate;
    if (i === splitIdx && splitIdx > 0) return allPoints[splitIdx - 1].rate;
    return null;
  });

  // Forecast series: null before bridge, then forecast values
  const fcstValues: (number | null)[] = allPoints.map((p, i) => {
    if (!hasForecast) return null;
    if (i < splitIdx - 1) return null;
    if (i === splitIdx - 1) return allPoints[splitIdx - 1].rate; // bridge
    return p.isHistorical ? null : p.rate;
  });

  // CI bands: forecast region only
  const upperValues: (number | null)[] = allPoints.map((p) =>
    !p.isHistorical ? p.upper : null,
  );
  const lowerValues: (number | null)[] = allPoints.map((p) =>
    !p.isHistorical ? p.lower : null,
  );

  const lineLabels = sparsedLabels(
    allPoints.map((d) => d.year),
    8,
  );

  const lineChartData = {
    labels: lineLabels,
    datasets: [
      // CI upper — grey, forecast region only
      {
        data: toSafe(upperValues),
        color: () => CI_BAND,
        strokeWidth: 1,
      },
      // CI lower — grey, forecast region only
      {
        data: toSafe(lowerValues),
        color: () => CI_BAND,
        strokeWidth: 1,
      },
      // Historical — dark blue
      {
        data: toSafe(histValues),
        color: (opacity = 1) => `rgba(30,58,138,${opacity})`,
        strokeWidth: 2,
      },
      // Forecast — dark green
      {
        data: toSafe(fcstValues),
        color: (opacity = 1) =>
          hasForecast ? `rgba(1,71,55,${opacity})` : "transparent",
        strokeWidth: 3,
      },
    ],
  };

  // ── Bar chart (forecast only) ─────────────────────────────
  const forecastPoints = currentPred.forecastData || [];
  const barLabels = sparsedLabels(
    forecastPoints.map((d) => d.year),
    6,
  );
  const barData = {
    labels: barLabels,
    datasets: [{ data: forecastPoints.map((d) => d.rate) }],
  };

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
          showsVerticalScrollIndicator={false}
        >
          {/* ── HEADER ───────────────────────────────────── */}
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
              {[
                { label: "MAE", value: currentPred.mae?.toFixed(3) || "0.000" },
                {
                  label: "R²",
                  value: currentPred.r2
                    ? `${(currentPred.r2 * 100).toFixed(1)}%`
                    : "0%",
                },
                { label: "Forecast", value: `${forecastYears} yrs` },
              ].map(({ label, value }) => (
                <View
                  key={label}
                  className="bg-emerald-800 px-3 py-2 rounded-lg"
                >
                  <Text className="text-emerald-200 text-xs">{label}</Text>
                  <Text className="text-white font-bold">{value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="px-4 py-4">
            {/* ── Antibiotic selector ──────────────────── */}
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

            {/* ── Forecast horizon ─────────────────────── */}
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

            {/* ── Chart tab switcher ───────────────────── */}
            <View
              style={{
                flexDirection: "row",
                marginTop: 24,
                marginBottom: 12,
                backgroundColor: "#F3F4F6",
                borderRadius: 12,
                padding: 4,
              }}
            >
              {(["line", "bar"] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setChartTab(tab)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 10,
                    alignItems: "center",
                    backgroundColor: chartTab === tab ? "#fff" : "transparent",
                    shadowColor: chartTab === tab ? "#000" : "transparent",
                    shadowOpacity: 0.06,
                    shadowRadius: 3,
                    elevation: chartTab === tab ? 2 : 0,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "600",
                      fontSize: 13,
                      color: chartTab === tab ? "#047857" : "#6B7280",
                    }}
                  >
                    {tab === "line"
                      ? "📈  History + Forecast"
                      : "📊  Forecast Only"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Line chart ───────────────────────────── */}
            {chartTab === "line" && (
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#F3F4F6",
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text
                  style={{ fontSize: 15, fontWeight: "700", marginBottom: 4 }}
                >
                  {currentPred.antibiotic} — Full Timeline
                </Text>

                {/* Legend */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 18,
                        height: 3,
                        backgroundColor: DARK_BLUE,
                        borderRadius: 2,
                      }}
                    />
                    <Text style={{ fontSize: 11, color: "#6B7280" }}>
                      Historical
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 18,
                        height: 3,
                        backgroundColor: DARK_GREEN,
                        borderRadius: 2,
                      }}
                    />
                    <Text style={{ fontSize: 11, color: "#6B7280" }}>
                      Forecast
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 18,
                        height: 3,
                        backgroundColor: "rgba(156,163,175,0.6)",
                        borderRadius: 2,
                      }}
                    />
                    <Text style={{ fontSize: 11, color: "#6B7280" }}>
                      95% CI
                    </Text>
                  </View>
                </View>

                <LineChart
                  key={`line-${currentPred.antibiotic}-${forecastYears}-${allPoints.length}`}
                  data={lineChartData}
                  width={CHART_W - 32}
                  height={240}
                  yAxisSuffix="%"
                  verticalLabelRotation={allPoints.length > 10 ? 30 : 0}
                  fromZero={false}
                  chartConfig={BASE_CHART_CONFIG}
                  bezier
                  withDots={false}
                  withShadow={false}
                />
              </View>
            )}

            {/* ── Bar chart (predictions only) ─────────── */}
            {chartTab === "bar" && forecastPoints.length > 0 && (
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#F3F4F6",
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text
                  style={{ fontSize: 15, fontWeight: "700", marginBottom: 4 }}
                >
                  {currentPred.antibiotic} — Predicted Resistance
                </Text>
                <Text
                  style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 12 }}
                >
                  Next {forecastYears} year{forecastYears > 1 ? "s" : ""}
                </Text>

                <BarChart
                  key={`bar-${currentPred.antibiotic}-${forecastYears}`}
                  data={barData}
                  width={CHART_W - 32}
                  height={240}
                  yAxisSuffix="%"
                  yAxisLabel=""
                  chartConfig={{
                    ...BASE_CHART_CONFIG,
                    color: (opacity = 1) => `rgba(1,71,55,${opacity})`,
                  }}
                  verticalLabelRotation={forecastPoints.length > 6 ? 30 : 0}
                  fromZero
                  showValuesOnTopOfBars
                  withInnerLines={false}
                />
              </View>
            )}

            {/* ── Summary stats ─────────────────────────── */}
            <View className="flex-row mt-6 gap-4">
              <View className="flex-1">
                <Text className="text-gray-500 text-xs">
                  Current ({currentYear})
                </Text>
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
                  className={`text-xl font-bold ${
                    currentPred.delta > 0 ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {currentPred.delta > 0 ? "▲" : "▼"}{" "}
                  {Math.abs(currentPred.delta)}%
                </Text>
              </View>
            </View>

            {/* ── Disclaimer ────────────────────────────── */}
            <View className="bg-gray-100 p-4 rounded-xl flex-row mt-6 mb-4">
              <Info size={18} color="#6B7280" />
              <Text className="text-gray-600 text-sm ml-2 flex-1">
                Predictions support—not replace—clinical decisions.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* ── Overlay spinner while refreshing ──────────── */}
        {isLoading && (
          <View className="absolute inset-0 bg-black/5 items-center justify-center">
            <ActivityIndicator size="large" color="#047857" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

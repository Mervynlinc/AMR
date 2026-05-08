import NetInfo from "@react-native-community/netinfo";
import { Info, TrendingUp } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Line,
  Path,
  Polyline,
  Rect,
  Text as SvgText,
} from "react-native-svg";
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

const DARK_BLUE = "#1e3a8a";
const DARK_GREEN = "#014737";
const CI_COLOR = "rgba(156,163,175,0.4)";

// ─────────────────────────────────────────────────────────
// Custom SVG line chart
// Draws two precisely-coloured segments that meet at the
// bridge year (2022) with no overlap or flat padding lines.
// ─────────────────────────────────────────────────────────
interface DataPoint {
  year: string;
  rate: number;
  upper?: number;
  lower?: number;
}

interface CustomLineChartProps {
  allPoints: DataPoint[];
  bridgeYear: string;
  width: number;
  height?: number;
}

function CustomLineChart({
  allPoints,
  bridgeYear,
  width,
  height = 260,
}: CustomLineChartProps) {
  const paddingLeft = 48;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 36;
  const plotW = width - paddingLeft - paddingRight;
  const plotH = height - paddingTop - paddingBottom;

  const n = allPoints.length;
  if (n < 2) return null;

  const bridgeIdx = allPoints.findIndex((p) => p.year === bridgeYear);

  // Y range
  const allRates = allPoints.map((p) => p.rate);
  const allUpper = allPoints.map((p) => p.upper ?? p.rate);
  const allLower = allPoints.map((p) => p.lower ?? p.rate);
  const yMax = Math.ceil(Math.max(...allRates, ...allUpper) / 10) * 10;
  const yMin = Math.max(
    0,
    Math.floor(Math.min(...allRates, ...allLower) / 10) * 10,
  );
  const yRange = yMax - yMin || 1;

  const xOf = (i: number) => paddingLeft + (i / (n - 1)) * plotW;
  const yOf = (val: number) =>
    paddingTop + plotH - ((val - yMin) / yRange) * plotH;

  const toPoints = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  // Historical points: index 0 → bridgeIdx (inclusive)
  const histPts = allPoints.slice(0, bridgeIdx + 1).map((p, i) => ({
    x: xOf(i),
    y: yOf(p.rate),
  }));

  // Forecast points: bridgeIdx → end (bridge point shared = seamless join)
  const forePts = allPoints.slice(bridgeIdx).map((p, i) => ({
    x: xOf(bridgeIdx + i),
    y: yOf(p.rate),
  }));

  // CI band polygon (forecast region only)
  const upperPts = allPoints.slice(bridgeIdx).map((p, i) => ({
    x: xOf(bridgeIdx + i),
    y: yOf(p.upper ?? p.rate),
  }));
  const lowerPts = allPoints.slice(bridgeIdx).map((p, i) => ({
    x: xOf(bridgeIdx + i),
    y: yOf(p.lower ?? p.rate),
  }));
  const ciPath =
    [...upperPts, ...[...lowerPts].reverse()]
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`,
      )
      .join(" ") + " Z";

  // Y ticks
  const tickStep = Math.ceil((yMax - yMin) / 5 / 10) * 10 || 10;
  const yTicks: number[] = [];
  for (let v = yMin; v <= yMax; v += tickStep) yTicks.push(v);

  const LABEL_STEP = 5; // show x labels every 5 years

  return (
    <Svg width={width} height={height}>
      <Rect x={0} y={0} width={width} height={height} fill="#fff" />

      {/* 1. Horizontal Grid Lines (High Contrast) */}
      {yTicks.map((v) => (
        <Line
          key={`g${v}`}
          x1={paddingLeft}
          y1={yOf(v)}
          x2={width - paddingRight}
          y2={yOf(v)}
          stroke="#CBD5E1" // darker than before for better visibility
          strokeWidth={1.5}
        />
      ))}

      {/* 2. Vertical Grid Lines (High Contrast) */}
      {allPoints.map((p, i) =>
        i % LABEL_STEP === 0 ? (
          <Line
            key={`vgrid${i}`}
            x1={xOf(i)}
            y1={paddingTop}
            x2={xOf(i)}
            y2={height - paddingBottom}
            stroke="#CBD5E1"
            strokeWidth={1.5}
            strokeDasharray="3,3" // slightly tighter dash for clarity
          />
        ) : null,
      )}

      {/* Y labels (Higher contrast text) */}
      {yTicks.map((v) => (
        <SvgText
          key={`y${v}`}
          x={paddingLeft - 6}
          y={yOf(v) + 4}
          fontSize={10}
          fill="#374151" // much darker text
          fontWeight="500"
          textAnchor="end"
        >
          {v}%
        </SvgText>
      ))}

      {/* X labels (Higher contrast text) */}
      {allPoints.map((p, i) =>
        i % LABEL_STEP === 0 ? (
          <SvgText
            key={`x${i}`}
            x={xOf(i)}
            y={height - 6}
            fontSize={10}
            fill="#374151"
            fontWeight="500"
            textAnchor="middle"
          >
            {p.year}
          </SvgText>
        ) : null,
      )}

      {/* Bridge dashed vertical line */}
      {bridgeIdx >= 0 && (
        <Line
          x1={xOf(bridgeIdx)}
          y1={paddingTop}
          x2={xOf(bridgeIdx)}
          y2={paddingTop + plotH}
          stroke="#D1D5DB"
          strokeWidth={1}
          strokeDasharray="4,3"
        />
      )}

      {/* CI band */}
      {upperPts.length > 1 && <Path d={ciPath} fill={CI_COLOR} stroke="none" />}

      {/* Historical line — dark blue, stops exactly at bridge */}
      {histPts.length > 1 && (
        <Polyline
          points={toPoints(histPts)}
          fill="none"
          stroke={DARK_BLUE}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {/* Forecast line — dark green, starts exactly at bridge */}
      {forePts.length > 1 && (
        <Polyline
          points={toPoints(forePts)}
          fill="none"
          stroke={DARK_GREEN}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────

export default function ClinicianPredictions() {
  const [forecastYears, setForecastYears] = useState(5);
  const { predictions, isLoading } = usePredictions(forecastYears);
  const [selectedAb, setSelectedAb] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [chartTab, setChartTab] = useState<"line" | "bar">("line");
  const barScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    barScrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [selectedAb, forecastYears]);

  if (isOnline === false) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader
          title="ML Predictions"
          subtitle="Resistance Forecast Trends"
        />
        <View className="flex-1 justify-center items-center px-8">
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

  const currentPred =
    predictions.find((p) => p.antibiotic === selectedAb) || predictions[0];
  const fullname =
    ANTIBIOTIC_NAMES[currentPred.antibiotic] || currentPred.antibiotic;
  const currentYear = new Date().getFullYear();

  // ─────────────────────────────────────────────────────────
  // BAR CHART (still uses react-native-chart-kit , no issues there)
  // ─────────────────────────────────────────────────────────
  const forecastPointsOnly = currentPred.forecastData || [];
  const PX_PER_BAR = 60;
  const barChartW = Math.max(CHART_W, forecastPointsOnly.length * PX_PER_BAR);

  const barData = {
    labels: forecastPointsOnly.map((d) => d.year),
    datasets: [{ data: forecastPointsOnly.map((d) => d.rate) }],
  };

  const barChartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: () => DARK_GREEN,
    labelColor: () => "#6B7280",
    propsForLabels: { fontSize: 10 },
    barPercentage: 0.65,
    fillShadowGradient: DARK_GREEN,
    fillShadowGradientOpacity: 1,
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader
        title="AMR Predictions"
        subtitle="Resistance Forecast Trends"
      />

      <View className="flex-1">
        <ScrollView
          className={`flex-1 ${isLoading ? "opacity-40" : "opacity-100"}`}
          scrollEnabled={!isLoading}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View className="bg-emerald-900 px-4 py-6 mb-2">
            <View className="flex-row items-center mb-1">
              <TrendingUp size={20} color="#6EE7B7" />
              <Text className="text-emerald-100 font-bold ml-2 text-xs">
                FORECAST DASHBOARD . V1
              </Text>
            </View>
            <Text className="text-white text-lg mt-2">
              {fullname} Resistance Forecast
            </Text>
            <View className="flex-row mt-4 gap-4">
              {[
                {
                  label: "MAE",
                  value: currentPred.mae?.toFixed(3) || "0.000",
                },
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
            {/* Antibiotic selector */}
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

            {/* Forecast horizon */}
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

            {/* Chart tab switcher */}
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

            {/* ── Custom SVG line chart — zero overlap, precise coloring ── */}
            {chartTab === "line" && (
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#F3F4F6",
                  elevation: 2,
                }}
              >
                <Text
                  style={{ fontSize: 15, fontWeight: "700", marginBottom: 4 }}
                >
                  {currentPred.antibiotic}
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
                  {[
                    { color: DARK_BLUE, label: "Historical (to 2022)" },
                    { color: DARK_GREEN, label: "Forecast (from 2022)" },
                    { color: "rgba(156,163,175,0.7)", label: "95% CI" },
                  ].map(({ color, label }) => (
                    <View
                      key={label}
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
                          backgroundColor: color,
                          borderRadius: 2,
                        }}
                      />
                      <Text style={{ fontSize: 11, color: "#6B7280" }}>
                        {label}
                      </Text>
                    </View>
                  ))}
                </View>

                <CustomLineChart
                  key={`svg-${currentPred.antibiotic}-${forecastYears}`}
                  allPoints={currentPred.historicalData}
                  bridgeYear="2022"
                  width={CHART_W - 32}
                  height={260}
                />
              </View>
            )}

            {/* Bar chart */}
            {chartTab === "bar" && forecastPointsOnly.length > 0 && (
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  paddingTop: 16,
                  paddingBottom: 4,
                  borderWidth: 1,
                  borderColor: "#F3F4F6",
                  elevation: 2,
                  overflow: "hidden",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    marginBottom: 4,
                    paddingHorizontal: 16,
                  }}
                >
                  {currentPred.antibiotic} — Predicted Resistance
                </Text>
                <ScrollView
                  ref={barScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator
                  bounces={false}
                >
                  <BarChart
                    key={`bar-${currentPred.antibiotic}-${forecastYears}`}
                    data={barData}
                    width={barChartW}
                    height={220}
                    yAxisSuffix="%"
                    chartConfig={barChartConfig}
                    fromZero
                    showValuesOnTopOfBars
                    withInnerLines={false}
                  />
                </ScrollView>
              </View>
            )}

            {/* Summary stats */}
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

            <View className="bg-gray-100 p-4 rounded-xl flex-row mt-6 mb-4">
              <Info size={18} color="#6B7280" />
              <Text className="text-gray-600 text-sm ml-2 flex-1">
                Predictions support—not replace—clinical decisions.
              </Text>
            </View>
          </View>
        </ScrollView>

        {isLoading && (
          <View className="absolute inset-0 bg-black/5 items-center justify-center">
            <ActivityIndicator size="large" color="#047857" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

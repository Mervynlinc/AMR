import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import ScreenHeader from "../../components/layout/ScreenHeader";

import { saveAST, deleteSample } from "../../services/api";
import useAMRStore from "../../store/amr";
import { ASTEntry, ASTResult } from "../../types";
import { Trash2 } from "lucide-react-native";

const ANTIBIOTICS = [
  { name: "Amikacin", abbr: "AMK", class: "Aminoglycoside" },
  { name: "Amoxicillin", abbr: "AMX", class: "Beta-lactam" },
  { name: "Amoxicillin/Clavulanate", abbr: "AMC", class: "Beta-lactam" },
  { name: "Ampicillin", abbr: "AMP", class: "Beta-lactam" },
  { name: "Azithromycin", abbr: "AZM", class: "Macrolide" },
  { name: "Cefotaxime", abbr: "CTX", class: "Beta-lactam" },
  { name: "Cefoxitin", abbr: "FOX", class: "Beta-lactam" },
  { name: "Ceftazidime", abbr: "CAZ", class: "Beta-lactam" },
  { name: "Ceftriaxone", abbr: "CRO", class: "Beta-lactam" },
  { name: "Cefuroxime", abbr: "CXM", class: "Beta-lactam" },
  { name: "Chloramphenicol", abbr: "CHL", class: "Amphenicol" },
  { name: "Ciprofloxacin", abbr: "CIP", class: "Fluoroquinolone" },
  { name: "Clindamycin", abbr: "CLI", class: "Lincosamide" },
  { name: "Erythromycin", abbr: "ERY", class: "Macrolide" },
  { name: "Gentamicin", abbr: "GEN", class: "Aminoglycoside" },
  { name: "Imipenem", abbr: "IPM", class: "Beta-lactam" },
  { name: "Linezolid", abbr: "LNZ", class: "Oxazolidinone" },
  { name: "Norfloxacin", abbr: "NOR", class: "Fluoroquinolone" },
  { name: "Oxacillin", abbr: "OXA", class: "Beta-lactam" },
  { name: "Pefloxacin", abbr: "PEF", class: "Fluoroquinolone" },
  { name: "Penicillin", abbr: "PEN", class: "Beta-lactam" },
  { name: "Tetracycline", abbr: "TCY", class: "Tetracycline" },
  { name: "Trimethoprim/Sulfamethoxazole", abbr: "SXT", class: "Folate pathway inhibitor" },
  { name: "Vancomycin", abbr: "VAN", class: "Glycopeptide" },
];

export default function LabAST() {
  const router = useRouter();
  const { sampleId, sampleCode } = useLocalSearchParams<{ sampleId: string; sampleCode: string }>();
  const { updateSample, removeSample } = useAMRStore();

  const [method, setMethod] = useState("Disk Diffusion");
  const [remarks, setRemarks] = useState("");
  const [results, setResults] = useState<
    Record<string, { result: ASTResult | null }>
  >(
    Object.fromEntries(
      ANTIBIOTICS.map((a) => [a.name, { result: null }]),
    ),
  );

  const displaySampleId = sampleCode || sampleId || "Unknown";

  const isMDR = useMemo(() => {
    const resistantClasses = new Set<string>();
    ANTIBIOTICS.forEach((ab) => {
      if (results[ab.name].result === "R") resistantClasses.add(ab.class);
    });
    return resistantClasses.size >= 3;
  }, [results]);

  const isMRSA = useMemo(() => {
    return (
      results["Oxacillin"]?.result === "R" ||
      results["Cefoxitin"]?.result === "R"
    );
  }, [results]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Sample",
      "Are you sure you want to delete this sample? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSample(sampleId);
              removeSample(sampleId);
              router.replace("/(lab)/home");
            } catch (error) {
              Alert.alert("Error", "Failed to delete sample.");
            }
          },
        },
      ]
    );
  };

  const handleResultChange = (antibiotic: string, result: ASTResult) => {
    setResults((prev) => ({
      ...prev,
      [antibiotic]: { result },
    }));
  };

  const handleClearResult = (antibiotic: string) => {
    setResults((prev) => ({
      ...prev,
      [antibiotic]: { result: null },
    }));
  };

  const handleComplete = async () => {
    if (!sampleId) return;

    const formattedResults: ASTEntry[] = ANTIBIOTICS.map((ab) => ({
      antibiotic: ab.name,
      abbreviation: ab.abbr,
      drug_class: ab.class,
      result: results[ab.name].result,
    }));

    try {
      await saveAST(sampleId, formattedResults, isMDR, isMRSA, remarks);

      const sample = useAMRStore.getState().samples.find((s) => s.id === sampleId);
      const existingIsolate = sample?.isolates;
      const updatedIsolates = existingIsolate ? {
        ...existingIsolate,
        is_mrsa: isMRSA,
        is_mdr: isMDR,
      } : undefined;

      updateSample(sampleId, {
        status: "complete",
        isolates: updatedIsolates,
      });

      Alert.alert("Success", "AST results saved successfully.", [
        { text: "OK", onPress: () => router.replace("/(lab)/home") },
      ]);
    } catch {
      Alert.alert("Error", "Failed to save AST results.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScreenHeader
        title="AST Results"
        subtitle={`Sample: ${displaySampleId}`}
        showBack
        onBack={() => router.replace(`/(lab)/isolate?sampleId=${sampleId}&sampleCode=${sampleCode}`)}
        rightAction={
          <TouchableOpacity onPress={handleDelete} className="p-2">
            <Trash2 size={20} color="#dc2626" />
          </TouchableOpacity>
        }
      />

      {isMDR && (
        <View className="bg-red-500 py-3 px-4 flex-row items-center justify-between">
          <Text className="text-white font-bold shrink-1">
            ⚠️ MDR ALERT: Resistance to ≥ 3 classes detected.
          </Text>
        </View>
      )}

      <ScrollView
        className="flex-1 px-4 pt-4 bg-gray-50"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Test Method</Text>
          <TextInput
            value={method}
            onChangeText={setMethod}
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
          />
        </View>

        <Text className="text-gray-900 font-bold text-lg mb-2 mt-2">
          Antibiotics Panel
        </Text>

        {ANTIBIOTICS.map((ab) => (
          <View
            key={ab.name}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3"
          >
            <View className="flex-row items-start justify-between mb-3 border-b border-gray-100 pb-2">
              <View className="flex-1">
                <Text className="font-bold text-gray-900 text-base">
                  {ab.name}
                </Text>
                <Text className="text-gray-400 text-xs">
                  {ab.abbr} • {ab.class}
                </Text>
              </View>
              {results[ab.name].result && (
                <TouchableOpacity
                  onPress={() => handleClearResult(ab.name)}
                  className="bg-gray-100 rounded-full w-6 h-6 items-center justify-center ml-2"
                >
                  <Text className="text-gray-500 text-xs font-bold">✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => handleResultChange(ab.name, "S")}
                className={`flex-1 py-2 items-center rounded border ${results[ab.name].result === "S" ? "bg-green-100 border-green-500" : "bg-gray-50 border-gray-200"}`}
              >
                <Text
                  className={`font-bold ${results[ab.name].result === "S" ? "text-green-800" : "text-gray-500"}`}
                >
                  S
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleResultChange(ab.name, "I")}
                className={`flex-1 py-2 items-center rounded border ${results[ab.name].result === "I" ? "bg-amber-100 border-amber-500" : "bg-gray-50 border-gray-200"}`}
              >
                <Text
                  className={`font-bold ${results[ab.name].result === "I" ? "text-amber-800" : "text-gray-500"}`}
                >
                  I
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleResultChange(ab.name, "R")}
                className={`flex-1 py-2 items-center rounded border ${results[ab.name].result === "R" ? "bg-red-100 border-red-500" : "bg-gray-50 border-gray-200"}`}
              >
                <Text
                  className={`font-bold ${results[ab.name].result === "R" ? "text-red-800" : "text-gray-500"}`}
                >
                  R
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View className="mb-4 mt-4">
          <Text className="text-gray-700 font-medium mb-2">
            Technician Remarks
          </Text>
          <TextInput
            value={remarks}
            onChangeText={setRemarks}
            placeholder="Add any additional remarks or observations..."
            multiline
            numberOfLines={4}
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          onPress={handleComplete}
          className="w-full py-4 rounded-xl flex-row justify-center items-center mt-4 mb-4 bg-emerald-700"
        >
          <Text className="text-white font-bold text-lg">
            Save Results & Complete
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import React, { useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { createIsolate, updateSampleStatus } from "../../services/api";
import useAMRStore from "../../store/amr";

export default function LabIsolate() {
  const router = useRouter();
  const { sampleId } = useLocalSearchParams<{ sampleId: string }>();
  const { updateSample } = useAMRStore();

  const [growth, setGrowth] = useState<boolean | null>(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirm = async () => {
    if (!sampleId) return;
    setIsSaving(true);
    try {
      // Persist isolate to Supabase
      await createIsolate(sampleId, growth === true);

      if (growth) {
        await updateSampleStatus(sampleId, "pending_ast");
        updateSample(sampleId, { status: "pending_ast" });
        router.replace(`/(lab)/ast?sampleId=${sampleId}`);
      } else {
        await updateSampleStatus(sampleId, "complete");
        updateSample(sampleId, { status: "complete" });
        Alert.alert("No Growth", "Sample marked as complete with no growth.", [
          { text: "OK", onPress: () => router.replace("/(lab)/home") },
        ]);
      }
    } catch (err) {
      console.error("Isolate save error:", err);
      Alert.alert(
        "Error",
        "Failed to save isolation result. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1">
      <ScreenHeader
        title="Confirm Isolation"
        subtitle={`Sample: ${sampleId || "Unknown"}`}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView className="flex-1 px-4 pt-6 bg-gray-50">
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <Text className="text-gray-700 font-medium mb-3">Culture Result</Text>
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              onPress={() => setGrowth(true)}
              className={`flex-1 py-3 px-2 flex-row justify-center items-center rounded-lg border ${growth === true ? "bg-emerald-100 border-emerald-500" : "bg-white border-gray-200"}`}
            >
              <Text
                className={
                  growth === true
                    ? "text-emerald-800 font-bold"
                    : "text-gray-600"
                }
              >
                Growth Detected
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setGrowth(false)}
              className={`flex-1 py-3 px-2 flex-row justify-center items-center rounded-lg border ${growth === false ? "bg-amber-100 border-amber-500" : "bg-white border-gray-200"}`}
            >
              <Text
                className={
                  growth === false
                    ? "text-amber-800 font-bold"
                    : "text-gray-600"
                }
              >
                No Growth
              </Text>
            </TouchableOpacity>
          </View>

          {growth && (
            <>
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-1">Organism</Text>
                <View className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3">
                  <Text className="text-gray-800 font-bold italic">
                    Staphylococcus aureus
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    (Locked based on workflow)
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity
          onPress={handleConfirm}
          disabled={isSaving}
          className={`w-full py-4 rounded-xl flex-row justify-center items-center mb-8 ${isSaving ? "bg-emerald-400" : "bg-emerald-700"}`}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">
              {growth ? "Confirm & Proceed to AST" : "Complete Record"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

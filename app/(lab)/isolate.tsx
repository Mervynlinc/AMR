import React, { useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { createIsolate, updateSampleStatus, deleteSample } from "../../services/api";
import useAMRStore from "../../store/amr";
import { Trash2 } from "lucide-react-native";

export default function LabIsolate() {
  const router = useRouter();
  const { sampleId, sampleCode } = useLocalSearchParams<{ sampleId: string; sampleCode: string }>();
  const { updateSample, removeSample } = useAMRStore();

  const [growth, setGrowth] = useState<boolean | null>(true);
  const [growthTime, setGrowthTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const displaySampleId = sampleCode || sampleId || "Unknown";

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

  const handleConfirm = async () => {
    if (!sampleId) return;
    setIsSaving(true);
    try {
      // Parse growth time if growth detected
      const growthTimeHours = growth ? parseInt(growthTime) || 24 : undefined;
      
      // Persist isolate to Supabase
      await createIsolate(sampleId, growth === true, growthTimeHours);

      if (growth) {
        await updateSampleStatus(sampleId, "pending_ast");
        updateSample(sampleId, { status: "pending_ast" });
        router.replace(`/(lab)/ast?sampleId=${sampleId}&sampleCode=${sampleCode}`);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScreenHeader
        title="Confirm Isolation"
        subtitle={`Sample: ${displaySampleId}`}
        showBack
        onBack={() => router.replace(`/(lab)/new-sample`)}
        rightAction={
          <TouchableOpacity onPress={handleDelete} className="p-2">
            <Trash2 size={20} color="#dc2626" />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1 px-4 pt-6 bg-gray-50">
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <Text className="text-gray-700 font-medium mb-3">Culture Result</Text>
          <View className="flex-row gap-3">
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
        </View>

        {growth && (
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            <Text className="text-gray-700 font-medium mb-1">Growth Time (hours)</Text>
            <TextInput
              value={growthTime}
              onChangeText={setGrowthTime}
              keyboardType="numeric"
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
            />
            <Text className="text-gray-500 text-xs mt-1">
              Maturity of sample in Hours            </Text>
          </View>
        )}

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
    </KeyboardAvoidingView>
  );
}

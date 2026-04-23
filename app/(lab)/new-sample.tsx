import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import ScreenHeader from "../../components/layout/ScreenHeader";
import {
    createSample
} from "../../services/api";
import useAMRStore from "../../store/amr";

export default function NewSample() {
  const router = useRouter();
  const { addSample } = useAMRStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    facility: "Central Lab",
    specimenType: "Blood",
    collectionDate: new Date().toISOString().split("T")[0],
    receivedDate: new Date().toISOString().split("T")[0],
    ageGroup: "Adult",
    sex: "M",
    patientType: "Inpatient",
    ward: "",
  });

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const newSample = await createSample(formData);
      addSample(newSample);
      router.replace(`/(lab)/isolate?sampleId=${newSample.id}`);
    } catch (e) {
      Alert.alert("Error", "Failed to create new sample.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPicker = (
    label: string,
    field: keyof typeof formData,
    options: string[],
  ) => (
    <View className="mb-4">
      <Text className="text-gray-700 font-medium mb-1">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => setFormData({ ...formData, [field]: opt })}
            className={`px-4 py-2 rounded-lg border ${formData[field] === opt ? "bg-emerald-100 border-emerald-500" : "bg-white border-gray-200"}`}
          >
            <Text
              className={`${formData[field] === opt ? "text-emerald-800 font-medium" : "text-gray-600"}`}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1">
        <ScreenHeader
          title="Register New Sample"
          showBack
          onBack={() => router.back()}
        />

        <ScrollView className="flex-1 px-4 pt-6 bg-gray-50">
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-1">Sample ID</Text>
              <TextInput
                value="(Auto-generated on save)"
                editable={false}
                className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-gray-500"
              />
            </View>

            {renderPicker("Originating Facility", "facility", [
              "Central Lab",
              "General Hospital",
              "Local Clinic",
            ])}
            {renderPicker("Specimen Type", "specimenType", [
              "Blood",
              "Wound swab",
              "Urine",
              "Sputum",
              "Other",
            ])}

            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-1">
                  Collection Date
                </Text>
                <TextInput
                  value={formData.collectionDate}
                  onChangeText={(text) =>
                    setFormData({ ...formData, collectionDate: text })
                  }
                  className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-1">
                  Received Date
                </Text>
                <TextInput
                  value={formData.receivedDate}
                  onChangeText={(text) =>
                    setFormData({ ...formData, receivedDate: text })
                  }
                  className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
                />
              </View>
            </View>

            {renderPicker("Age Group", "ageGroup", [
              "Neonatal",
              "Pediatric",
              "Adult",
              "Elderly",
            ])}
            {renderPicker("Sex", "sex", ["M", "F", "Other"])}
            {renderPicker("Patient Type", "patientType", [
              "Inpatient",
              "Outpatient",
            ])}

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-1">Ward</Text>
              <TextInput
                placeholder="e.g. ICU"
                value={formData.ward}
                onChangeText={(text) =>
                  setFormData({ ...formData, ward: text })
                }
                className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl flex-row justify-center items-center mb-8 ${isSubmitting ? "bg-emerald-400" : "bg-emerald-700"}`}
          >
            <Text className="text-white font-bold text-lg">
              Save & Continue to Isolate
            </Text>
          </TouchableOpacity>
        </ScrollView>

        
      </View>
    </KeyboardAvoidingView>
  );
}

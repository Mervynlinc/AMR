import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { Calendar } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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
import { createSample } from "../../services/api";
import useAMRStore from "../../store/amr";
import {
  AgeGroup,
  PatientType,
  Sample,
  SexType,
  SpecimenType,
} from "../../types";

export default function NewSample() {
  const router = useRouter();
  const { addSample } = useAMRStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sampleId, setSampleId] = useState("");

  const [formData, setFormData] = useState<{
    specimenType: SpecimenType;
    collectionDate: Date;
    ageGroup: AgeGroup;
    sex: SexType;
    patientType: PatientType;
  }>({
    specimenType: "Blood Culture",
    collectionDate: new Date(),
    ageGroup: "Adult (15-64y)",
    sex: "M",
    patientType: "Inpatient",
  });

  const [showPicker, setShowPicker] = useState<"collection" | null>(null);

  useEffect(() => {
    // Generate a formatted Sample ID on mount
    const dateStr = new Date().toISOString().replace(/[-:]/g, "").split("T")[0];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setSampleId(`SMP-${dateStr}-${randomNum}`);
  }, []);

  const handleSave = async () => {
    setIsSubmitting(true);
    const payload: Partial<Sample> = {
      id: sampleId,
      sample_code: sampleId,
      specimen_type: formData.specimenType,
      collection_date: formData.collectionDate.toISOString(),
      received_date: new Date().toISOString(),
      age_group: formData.ageGroup,
      sex: formData.sex,
      patient_type: formData.patientType,
      status: "pending_isolate",
    };

    try {
      const newSample = await createSample(payload);

      // If backend returns the sample use it, otherwise use the payload
      const sampleToAdd = (newSample || payload) as Sample;

      addSample(sampleToAdd);
      router.replace(`/(lab)/isolate?sampleId=${sampleToAdd.id}`);
    } catch (err) {
      console.log("Fallback to local save due to API error", err);
      // Force local save and proceed even if the network strictly fails
      addSample(payload as Sample);
      router.replace(`/(lab)/isolate?sampleId=${payload.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentPicker = showPicker;
    if (Platform.OS === "android") {
      setShowPicker(null);
    }
    if (selectedDate && currentPicker) {
      setFormData({ ...formData, [`${currentPicker}Date`]: selectedDate });
    }
  };

  const renderPicker = <T extends string>(
    label: string,
    field: keyof typeof formData,
    options: T[],
  ) => (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
      <Text className="text-gray-800 font-bold mb-3">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => setFormData({ ...formData, [field]: opt })}
            className={`px-4 py-2.5 rounded-xl border ${
              formData[field] === opt
                ? "bg-emerald-50 border-emerald-600"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <Text
              className={`text-sm ${
                formData[field] === opt
                  ? "text-emerald-800 font-bold"
                  : "text-gray-600 font-medium"
              }`}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDateField = (label: string, field: "collection") => (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
      <Text className="text-gray-800 font-bold mb-3">{label}</Text>
      <TouchableOpacity
        onPress={() => setShowPicker(field)}
        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
      >
        <Text className="text-gray-900 font-medium">
          {formData[`${field}Date`].toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Text>
        <Calendar size={20} color="#6b7280" />
      </TouchableOpacity>

      {showPicker === field && Platform.OS === "ios" && (
        <View className="mt-4 bg-gray-50 p-2 rounded-xl">
          <View className="flex-row justify-end mb-2">
            <TouchableOpacity onPress={() => setShowPicker(null)}>
              <Text className="text-blue-600 font-bold">Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={formData[`${field}Date`]}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 bg-gray-50">
        <ScreenHeader
          title="Register New Sample"
          showBack
          onBack={() => router.back()}
        />

        <ScrollView
          className="flex-1 px-4 pt-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Sample ID Card */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <Text className="text-gray-800 font-bold mb-3">Sample ID</Text>
            <TextInput
              value={sampleId}
              onChangeText={setSampleId}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 font-medium"
            />
            <Text className="text-xs text-gray-400 mt-2">
              Auto-generated for this session. You can modify it.
            </Text>
          </View>

          {/* Specimen Type */}
          {renderPicker<SpecimenType>("Specimen Type", "specimenType", [
            "Blood Culture",
            "Wound Swab",
            "Urine",
            "Sputum",
            "CSF",
            "Other",
          ])}

          {/* Dates */}
          {renderDateField("Collection Date", "collection")}

          {/* Demographics & Types */}
          {renderPicker<AgeGroup>("Age Group", "ageGroup", [
            "Neonate (0-28d)",
            "Infant (1-12m)",
            "Child (1-14y)",
            "Adult (15-64y)",
            "Elderly (65+y)",
          ])}
          {renderPicker<SexType>("Sex", "sex", ["M", "F"])}
          {renderPicker<PatientType>("Patient Type", "patientType", [
            "Inpatient",
            "Outpatient",
          ])}

          <TouchableOpacity
            onPress={handleSave}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl flex-row justify-center items-center mb-10 mt-2 ${
              isSubmitting ? "bg-emerald-400" : "bg-emerald-700"
            }`}
          >
            <Text className="text-white font-bold text-lg">
              Save & Continue to Isolate
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {showPicker && Platform.OS === "android" && (
          <DateTimePicker
            value={formData.collectionDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

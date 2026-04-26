import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../components/layout/ScreenHeader";

import ResistanceBar from "../../components/ui/ResistanceBar";

export default function ClinicianAMRData() {
  const [year, setYear] = useState("2024");

  const amrData = [
    { name: "Oxacillin", rate: 35 },
    { name: "Cefoxitin", rate: 35 },
    { name: "Vancomycin", rate: 0 },
    { name: "Linezolid", rate: 0 },
    { name: "Daptomycin", rate: 1 },
    { name: "Teicoplanin", rate: 2 },
    { name: "Erythromycin", rate: 45 },
    { name: "Clindamycin", rate: 28 },
    { name: "Azithromycin", rate: 42 },
    { name: "Trimethoprim/Sulfamethoxazole", rate: 12 },
    { name: "Ciprofloxacin", rate: 55 },
    { name: "Levofloxacin", rate: 52 },
    { name: "Moxifloxacin", rate: 48 },
    { name: "Gentamicin", rate: 15 },
    { name: "Amikacin", rate: 5 },
    { name: "Tobramycin", rate: 18 },
    { name: "Tetracycline", rate: 30 },
    { name: "Doxycycline", rate: 20 },
    { name: "Minocycline", rate: 8 },
    { name: "Rifampin", rate: 3 },
    { name: "Fusidic Acid", rate: 22 },
    { name: "Mupirocin", rate: 10 },
    { name: "Chloramphenicol", rate: 4 },
    { name: "Fosfomycin", rate: 9 },
    { name: "Quinupristin/Dalfopristin", rate: 0 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Global AMR Data"
        subtitle="S. aureus Resistance Rates"
      />

      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <Text className="text-gray-500 text-xs font-medium uppercase mb-2">
          Filter by Year
        </Text>
        <View className="flex-row gap-2">
          {["2021", "2022", "2023", "2024"].map((y) => (
            <TouchableOpacity
              key={y}
              onPress={() => setYear(y)}
              className={`px-4 py-1.5 rounded-lg border ${year === y ? "bg-emerald-100 border-emerald-500" : "bg-white border-gray-200"}`}
            >
              <Text
                className={
                  year === y ? "text-emerald-800 font-bold" : "text-gray-600"
                }
              >
                {y}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          {amrData
            .sort((a, b) => b.rate - a.rate)
            .map((ab, idx) => (
              <View
                key={ab.name}
                className={`py-3 ${idx < amrData.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <Text className="text-gray-800 font-bold mb-1.5">
                  {ab.name}
                </Text>
                <ResistanceBar rate={ab.rate} showLabel />
              </View>
            ))}
        </View>
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

import { useRouter } from "expo-router";
import { ArrowLeft, ListTodo, LogOut, Plus } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View, Alert } from "react-native";

import SampleCard from "../../components/ui/SampleCard";
import { useAuthContext } from "../../context/AuthContext";
import { useSamples } from "../../hooks/useSamples";
import { deleteSample } from "../../services/api";
import useAMRStore from "../../store/amr";

export default function LabHome() {
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const { samples, isLoading } = useSamples();
  const { removeSample } = useAMRStore();

  const handleBackToLanding = async () => {
    await logout();
    router.replace("/");
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const handleDeleteSample = async (sampleId: string) => {
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
              Alert.alert("Success", "Sample deleted successfully.");
            } catch (error) {
              Alert.alert("Error", "Failed to delete sample.");
            }
          },
        },
      ]
    );
  };

  const pendingSamples = samples.filter((s) => s.status.includes("pending"));
  
  // Get samples completed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedToday = samples.filter((s) => {
    if (s.status !== "complete") return false;
    const completedDate = new Date(s.created_at);
    completedDate.setHours(0, 0, 0, 0);
    return completedDate.getTime() === today.getTime();
  });

  // Get 7 most recent completed samples
  const recentSamples = [...samples]
    .filter((s) => s.status === "complete")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 7);

  return (
    <View className="flex-1">
      <View className="bg-emerald-700  px-4 flex-row items-center justify-between py-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleBackToLanding} className="p-2 mr-2">
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">
              Hello, {user?.name}
            </Text>
            <Text className="text-emerald-100 text-sm">{user?.facility}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} className="p-2">
          <LogOut size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        <View className="flex-row gap-4 mb-8">
          <TouchableOpacity
            onPress={() => router.push("/(lab)/new-sample")}
            className="flex-1 bg-emerald-600 rounded-2xl p-4 items-center shadow-sm"
          >
            <Plus size={32} color="#fff" className="mb-2" />
            <Text className="text-white font-bold">New Sample</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(lab)/samples")}
            className="flex-1 bg-white border border-emerald-100 rounded-2xl p-4 items-center shadow-sm"
          >
            <ListTodo size={32} color="#047857" className="mb-2" />
            <Text className="text-emerald-800 font-bold">All Samples</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-lg font-bold text-gray-800 mb-4">
          Pending Report Samples
        </Text>
        {isLoading ? (
          <Text className="text-gray-500 text-center py-4">
            Loading samples...
          </Text>
        ) : pendingSamples.length > 0 ? (
          pendingSamples.map((sample) => (
            <SampleCard
              key={sample.id}
              sample={sample}
              onPress={() => {
                if (sample.status === "pending_isolate") {
                  router.push(`/(lab)/isolate?sampleId=${sample.id}&sampleCode=${sample.sample_code}`);
                } else if (sample.status === "pending_ast") {
                  router.push(`/(lab)/ast?sampleId=${sample.id}&sampleCode=${sample.sample_code}`);
                }
              }}
              onDelete={() => handleDeleteSample(sample.id)}
            />
          ))
        ) : (
          <Text className="text-gray-500 text-center py-4">
            No pending work right now.
          </Text>
        )}

        <Text className="text-lg font-bold text-gray-800 mb-4 mt-6">
          Completed Today
        </Text>
        {!isLoading && completedToday.length === 0 && (
          <Text className="text-gray-500 text-center py-4">
            No samples completed today.
          </Text>
        )}
        {!isLoading && completedToday.length > 0 && (
          completedToday.map((sample) => (
            <SampleCard
              key={sample.id}
              sample={sample}
              onPress={() => {
                router.push(`/(lab)/report-view?sampleId=${sample.id}`);
              }}
            />
          ))
        )}

        <Text className="text-lg font-bold text-gray-800 mb-4 mt-6">
          Most Recent Samples
        </Text>
        {!isLoading && recentSamples.length === 0 && (
          <Text className="text-gray-500 text-center py-4">
            No samples yet.
          </Text>
        )}
        {!isLoading && recentSamples.length > 0 && (
          recentSamples.map((sample) => (
            <SampleCard
              key={sample.id}
              sample={sample}
              onPress={() => {
                router.push(`/(lab)/report-view?sampleId=${sample.id}`);
              }}
            />
          ))
        )}
      </ScrollView>

      
    </View>
  );
}

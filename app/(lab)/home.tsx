import { useRouter } from "expo-router";
import { ArrowLeft, ListTodo, LogOut, Plus } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import SampleCard from "../../components/ui/SampleCard";
import { useAuthContext } from "../../context/AuthContext";
import { useSamples } from "../../hooks/useSamples";

export default function LabHome() {
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const { samples, isLoading } = useSamples();

  const handleBackToLanding = async () => {
    await logout();
    router.replace("/");
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const pendingSamples = samples.filter((s) => s.status.includes("pending"));
  const completedSamples = samples.filter((s) => s.status === "complete");

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
          Pending Work
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
                  router.push(`/(lab)/isolate?sampleId=${sample.id}`);
                } else if (sample.status === "pending_ast") {
                  router.push(`/(lab)/ast?sampleId=${sample.id}`);
                }
              }}
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
        {!isLoading && completedSamples.length === 0 && (
          <Text className="text-gray-500 text-center py-4">
            No completed samples today.
          </Text>
        )}
        {!isLoading && completedSamples.length > 0 && (
          completedSamples.map((sample) => (
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

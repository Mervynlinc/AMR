import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthContext } from "../../context/AuthContext";
import { getLabUserStats, LabUserStats } from "../../services/api";

export default function LabProfile() {
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const [wifiOnly, setWifiOnly] = useState(true);
  const [stats, setStats] = useState<LabUserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Derive initials from name
  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("")
    : "?";

  // Format last activity date
  const formatLastActivity = (iso: string | null) => {
    if (!iso) return "No activity yet";
    const d = new Date(iso);
    const today = new Date();
    const diffDays = Math.floor(
      (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    setIsLoadingStats(true);

    getLabUserStats(user.id)
      .then((data) => {
        if (alive) setStats(data);
      })
      .catch((e) => console.error("Stats error:", e))
      .finally(() => {
        if (alive) setIsLoadingStats(false);
      });

    return () => {
      alive = false;
    };
  }, [user?.id]);

  const handleSignOut = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const StatCard = ({
    value,
    label,
    color = "text-gray-900",
  }: {
    value: number | string;
    label: string;
    color?: string;
  }) => (
    <View className="flex-1 items-center bg-white rounded-xl p-3 border border-gray-100 shadow-sm mx-1">
      {isLoadingStats ? (
        <ActivityIndicator size="small" color="#047857" />
      ) : (
        <Text className={`text-xl font-bold mb-1 ${color}`}>{value}</Text>
      )}
      <Text className="text-xs text-gray-500 text-center leading-tight">
        {label}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity
          className="w-9 h-9 rounded-lg bg-gray-100 items-center justify-center mr-3"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text className="text-xl text-gray-700 font-semibold">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Profile</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        {/* Avatar + Name */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-emerald-100 items-center justify-center mb-3">
            <Text className="text-2xl font-bold text-emerald-800">
              {initials}
            </Text>
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">
            {user?.name ?? "Lab Technician"}
          </Text>
          <View className="bg-emerald-50 px-4 py-1.5 rounded-full">
            <Text className="text-xs font-medium text-emerald-800">
              {user?.staff_id ?? "—"} • Lab Technician
            </Text>
          </View>
        </View>

        {/* Facility */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <Text className="text-xs font-medium text-gray-500 mb-1">
            Assigned Laboratory
          </Text>
          <Text className="text-base font-semibold text-gray-900">
            {user?.facility ?? "MUST"}
          </Text>
        </View>

        {/* Samples */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Samples
          </Text>
          <View className="flex-row">
            <StatCard value={stats?.total_samples ?? 0} label="Total Entered" />
            <StatCard
              value={stats?.completed ?? 0}
              label="Completed"
              color="text-emerald-700"
            />
            <StatCard
              value={stats?.pending ?? 0}
              label="Pending"
              color="text-amber-600"
            />
          </View>
        </View>

        {/* Isolates */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Isolates & Resistance
          </Text>
          <View className="flex-row">
            <StatCard
              value={stats?.total_isolates ?? 0}
              label="Total Isolates"
            />
            <StatCard
              value={stats?.mrsa_count ?? 0}
              label="MRSA"
              color="text-red-600"
            />
            <StatCard
              value={stats?.mdr_count ?? 0}
              label="MDR"
              color="text-red-600"
            />
          </View>
        </View>

        {/* AST Tests + Last Activity */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Activity
          </Text>
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="text-xs font-medium text-gray-500 mb-1">
                AST Tests Recorded
              </Text>
              {isLoadingStats ? (
                <ActivityIndicator size="small" color="#047857" />
              ) : (
                <Text className="text-lg font-bold text-gray-900">
                  {stats?.ast_count ?? 0}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium text-gray-500 mb-1">
                Last Sample
              </Text>
              {isLoadingStats ? (
                <ActivityIndicator size="small" color="#047857" />
              ) : (
                <Text className="text-sm font-semibold text-gray-900">
                  {formatLastActivity(stats?.last_sample_at ?? null)}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View className="bg-white rounded-xl mb-4 border border-gray-200 overflow-hidden">
          <Text className="text-sm font-semibold text-gray-500 px-4 pt-4 pb-2">
            Account Settings
          </Text>

          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-3.5 border-b border-gray-100"
            activeOpacity={0.7}
          >
            <Text className="text-base font-medium text-gray-900 flex-1">
              Default AST Method
            </Text>
            <Text className="text-sm font-medium text-gray-500">
              Disc Diffusion
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-3.5"
            activeOpacity={0.7}
          >
            <Text className="text-base font-medium text-gray-900 flex-1">
              About App
            </Text>
            <Text className="text-sm font-medium text-gray-500">
              Version 1.0.0
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          className="bg-white border-2 border-red-600 rounded-xl py-3.5 items-center mt-2"
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Text className="text-base font-semibold text-red-600">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

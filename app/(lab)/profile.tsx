import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function LabProfile() {
  const router = useRouter();
  const [wifiOnly, setWifiOnly] = useState(true);

  const handleSignOut = () => {
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
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
        contentContainerClassName="p-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-emerald-100 items-center justify-center mb-3">
            <Text className="text-2xl font-bold text-emerald-800">JM</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">
            Joan Mugisha
          </Text>
          <View className="bg-emerald-50 px-4 py-1.5 rounded-full">
            <Text className="text-xs font-medium text-emerald-800">
              LAB-001 • Lab Technician
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <Text className="text-xs font-medium text-gray-500 mb-1">
            Assigned Laboratory
          </Text>
          <Text className="text-base font-semibold text-gray-900">
            MUST Microbiology Laboratory
          </Text>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Your Activity
          </Text>
          <View className="flex-row justify-between">
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-gray-900 mb-1">
                1,247
              </Text>
              <Text className="text-xs font-medium text-gray-500 text-center">
                Samples Entered
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-gray-900 mb-1">
                1,189
              </Text>
              <Text className="text-xs font-medium text-gray-500 text-center">
                Reports Generated
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-gray-900 mb-1">342</Text>
              <Text className="text-xs font-medium text-gray-500 text-center">
                MDR Isolates
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Device Sync
          </Text>
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="text-xs font-medium text-gray-500 mb-1">
                Last Sync
              </Text>
              <Text className="text-sm font-semibold text-gray-900">
                Today, 10:32 AM
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium text-gray-500 mb-1">
                Pending Upload
              </Text>
              <Text className="text-sm font-semibold text-gray-900">
                12 records
              </Text>
            </View>
          </View>
        </View>

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

          <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-gray-100">
            <Text className="text-base font-medium text-gray-900 flex-1">
              Sync over Wi-Fi only
            </Text>
            <Switch
              value={wifiOnly}
              onValueChange={setWifiOnly}
              trackColor={{ false: '#e5e7eb', true: '#047857' }}
              thumbColor={wifiOnly ? '#ffffff' : '#f3f4f6'}
            />
          </View>

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

        <TouchableOpacity
          className="bg-white border-2 border-red-600 rounded-xl py-3.5 items-center mt-2"
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Text className="text-base font-semibold text-red-600">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
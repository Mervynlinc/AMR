import { useRouter } from "expo-router";
import { ArrowLeft, Eye, EyeOff, Microscope } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthContext } from "../../context/AuthContext";
import { AuthError, login as authLogin } from "../../services/auth";

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuthContext();
  const router = useRouter();

  const handleLogin = async () => {
    if (!id || !password) {
      setError("Please enter both ID and password");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authLogin(id, password);
      await login(response.token, response.role, response.user);
      router.replace("/");
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-6 pt-16">
        <TouchableOpacity
          className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-8"
          onPress={() => router.replace("/")}
        >
          <ArrowLeft size={20} color="#4b5563" />
        </TouchableOpacity>

        <View className="flex-row items-center gap-4 mb-10">
          <View className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Microscope size={24} color="#047857" />
          </View>
          <View>
            <Text className="text-xl font-bold text-gray-900">
              Lab Personnel Login
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Access data entry system
            </Text>
          </View>
        </View>

        <View className="space-y-5">
          <View>
            <Text className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              LAB TECHNICIAN ID *
            </Text>
            <TextInput
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-base"
              placeholder="e.g., LAB-001"
              value={id}
              onChangeText={(text) => {
                setId(text);
                setError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View>
            <Text className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              PASSWORD *
            </Text>
            <View className="w-full relative">
              <TextInput
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 pr-12 text-base"
                placeholder="Enter password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError(null);
                }}
                secureTextEntry={!showPassword}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={22} color="#6B7280" />
                ) : (
                  <Eye size={22} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isSubmitting}
            className={`w-full rounded-xl py-4 mt-4 flex-row justify-center items-center ${isSubmitting ? "bg-emerald-500" : "bg-emerald-700"}`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="text-white font-bold text-base">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-10 items-center">
          <Text className="text-xs text-gray-400 text-center leading-loose">
            Accounts are pre-provisioned by administrators.{"\n"}
            If you forgot your credentials, contact your Lab Supervisor.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

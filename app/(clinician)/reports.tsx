
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import ScreenHeader from '../../components/layout/ScreenHeader';

import Badge from "../../components/ui/Badge";
import { getReports } from "../../services/api";
import useAMRStore from "../../store/amr";

export default function ClinicianReports() {
  const router = useRouter();
  const { reports, setReports } = useAMRStore();
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "MRSA Only" | "MSSA Only">("All");
  const [dateMode, setDateMode] = useState<"off" | "specific" | "range">("off");
  const [specificDate, setSpecificDate] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<"specific" | "start" | "end" | null>(null);
  const [showDateFilter, setShowDateFilter] = useState(false);

  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    const fetchReps = async () => {
      setIsLoading(true);
      const res = await getReports();
      setReports(res);
      setIsLoading(false);
    };
    fetchReps();
  }, [setReports]);

  const filtered = reports.filter(r => {
    const matchSearch = r.id.toLowerCase().includes(search.toLowerCase()) ||
                        r.patientDemographics.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;

    if (filter === "MRSA Only") return r.isMRSA;
    if (filter === "MSSA Only") return !r.isMRSA;

    if (dateMode === "specific" && specificDate) {
      const reportDate = formatDate(new Date(r.date));
      if (reportDate !== formatDate(specificDate)) return false;
    }

    if (dateMode === "range") {
      const reportDate = new Date(r.date);
      if (startDate && reportDate < startDate) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (reportDate > end) return false;
      }
    }

    return true;
  });

  const clearDates = () => {
    setSpecificDate(null);
    setStartDate(null);
    setEndDate(null);
    setDateMode("off");
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="Lab Reports"/>
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <View className="flex-row bg-gray-100 items-center px-4 py-2.5 rounded-xl border border-gray-200 mb-4">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search by ID or Demographics..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 py-1 text-gray-800"
          />
        </View>

        <View className="flex-row gap-2 mb-3">
          {['All', 'MRSA Only', 'MSSA Only'].map(opt => (
            <TouchableOpacity
              key={opt}
              onPress={() => setFilter(opt as any)}
              className={`px-3 py-1.5 rounded-full border ${filter === opt ? 'bg-emerald-700 border-emerald-700' : 'bg-white border-gray-300'}`}
            >
              <Text className={filter === opt ? 'text-white font-medium text-xs' : 'text-gray-600 text-xs'}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setShowDateFilter(!showDateFilter)}
          className={`flex-row items-center justify-center py-2 rounded-xl border ${showDateFilter ? 'bg-emerald-700 border-emerald-700' : 'bg-white border-gray-300'}`}
        >
          <Calendar size={16} color={showDateFilter ? '#fff' : '#6B7280'} />
          <Text className={`ml-2 text-sm font-medium ${showDateFilter ? 'text-white' : 'text-gray-600'}`}>
            {dateMode === "off" ? "Filter by Date" : dateMode === "specific" ? `Date: ${specificDate ? formatDate(specificDate) : "..."}` : `Range: ${startDate ? formatDate(startDate) : "..."} – ${endDate ? formatDate(endDate) : "..."}`}
          </Text>
        </TouchableOpacity>

        {showDateFilter && (
          <View className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <View className="flex-row gap-2 mb-3">
              {(["off", "specific", "range"] as const).map(mode => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => { setDateMode(mode); if (mode === "off") clearDates(); }}
                  className={`px-3 py-1.5 rounded-full border ${dateMode === mode ? 'bg-emerald-700 border-emerald-700' : 'bg-white border-gray-300'}`}
                >
                  <Text className={dateMode === mode ? 'text-white font-medium text-xs' : 'text-gray-600 text-xs'}>
                    {mode === "off" ? "Off" : mode === "specific" ? "Specific Date" : "Date Range"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {dateMode === "specific" && (
              <View>
                <TouchableOpacity
                  onPress={() => setShowDatePicker("specific")}
                  className="bg-white px-4 py-2.5 rounded-lg border border-gray-300"
                >
                  <Text className={specificDate ? "text-gray-900" : "text-gray-400"}>
                    {specificDate ? formatDate(specificDate) : "Tap to pick date"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {dateMode === "range" && (
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-1">Start</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker("start")}
                    className="bg-white px-3 py-2 rounded-lg border border-gray-300"
                  >
                    <Text className={startDate ? "text-gray-900 text-sm" : "text-gray-400 text-sm"}>
                      {startDate ? formatDate(startDate) : "Pick"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-1">End</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker("end")}
                    className="bg-white px-3 py-2 rounded-lg border border-gray-300"
                  >
                    <Text className={endDate ? "text-gray-900 text-sm" : "text-gray-400 text-sm"}>
                      {endDate ? formatDate(endDate) : "Pick"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {dateMode !== "off" && (
              <TouchableOpacity onPress={clearDates} className="mt-2">
                <Text className="text-red-500 text-xs text-center">Clear dates</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {showDatePicker && Platform.OS !== 'web' && (
          <DateTimePicker
            value={
              showDatePicker === "specific" ? (specificDate ?? new Date()) :
              showDatePicker === "start" ? (startDate ?? new Date()) : (endDate ?? new Date())
            }
            mode="date"
            onChange={(_, selectedDate) => {
              setShowDatePicker(null);
              if (!selectedDate) return;
              if (showDatePicker === "specific") setSpecificDate(selectedDate);
              else if (showDatePicker === "start") setStartDate(selectedDate);
              else setEndDate(selectedDate);
            }}
          />
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#047857" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4">
          {filtered.map((report) => (
            <TouchableOpacity
              key={report.id}
              onPress={() => router.push(`/(clinician)/report-view?reportId=${report.id}`)}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>
                  {report.id}
                </Text>
                <Badge
                  label={report.isMRSA ? "MRSA" : "MSSA"}
                  variant={report.isMRSA ? "danger" : "warning"}
                />
              </View>
              <Text className="text-gray-600 mb-1">
                {report.patientDemographics.split(" ").slice(0, 2).join(" ")} • {report.patientDemographics.split(" ")[2]}
              </Text>
            </TouchableOpacity>
          ))}
          {filtered.length === 0 && (
            <View className="py-8 items-center">
              <Text className="text-gray-500 text-sm">No reports found.</Text>
            </View>
          )}
          <View className="h-6" />
        </ScrollView>
      )}
    </View>
  );
}

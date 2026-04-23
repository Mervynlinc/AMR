import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Sample } from "../../types/index";
import Badge from "./Badge";

export interface SampleCardProps {
  sample: Sample;
  onPress: () => void;
}

const SampleCard: React.FC<SampleCardProps> = ({ sample, onPress }) => {
  let badgeLabel = "Unknown";
  let badgeVariant: "success" | "warning" | "danger" | "neutral" = "neutral";

  if (sample.status === "pending_isolate") {
    badgeLabel = "Identify";
    badgeVariant = "warning";
  } else if (sample.status === "pending_ast") {
    badgeLabel = "AST";
    badgeVariant = "warning";
  } else if (sample.status === "complete") {
    badgeLabel = "Done";
    badgeVariant = "success";
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <Text style={styles.id}>{sample.id}</Text>
        <Badge label={badgeLabel} variant={badgeVariant} />
      </View>
      <Text style={styles.detail}>{sample.specimenType} | S. aureus</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  id: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  detail: {
    fontSize: 12,
    color: "#6b7280",
  },
});

export default SampleCard;

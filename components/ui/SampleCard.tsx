import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Sample } from "../../types/index";
import Badge from "./Badge";
import { Trash2 } from "lucide-react-native";

export interface SampleCardProps {
  sample: Sample;
  onPress: () => void;
  onDelete?: () => void;
}

const SampleCard: React.FC<SampleCardProps> = ({ sample, onPress, onDelete }) => {
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

  const getResistanceStatus = () => {
    if (!sample.isolates) {
      return "S. aureus";
    }
    const isolate = Array.isArray(sample.isolates) ? sample.isolates[0] : sample.isolates;
    return isolate?.is_mrsa ? "MRSA" : "MSSA";
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.row}>
          <Text style={styles.id}>{sample.sample_code}</Text>
          <Badge label={badgeLabel} variant={badgeVariant} />
        </View>
        <Text style={styles.detail}>{sample.specimen_type} | {getResistanceStatus()}</Text>
      </TouchableOpacity>
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={16} color="#dc2626" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: "relative",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
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
  deleteButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 6,
  },
});

export default SampleCard;

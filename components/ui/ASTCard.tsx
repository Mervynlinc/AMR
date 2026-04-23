import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ASTEntry } from "../../types/index";
import Badge from "./Badge";

export interface ASTCardProps {
  entry: ASTEntry;
}

const ASTCard: React.FC<ASTCardProps> = ({ entry }) => {
  let bgColor = "#ffffff";
  let borderColor = "#e5e7eb";
  let badgeVariant: "danger" | "warning" | "success" | "neutral" = "neutral";

  if (entry.result === "R") {
    bgColor = "#fef2f2";
    borderColor = "#fecaca";
    badgeVariant = "danger";
  } else if (entry.result === "I") {
    bgColor = "#fffbeb";
    borderColor = "#fde68a";
    badgeVariant = "warning";
  } else if (entry.result === "S") {
    bgColor = "#f0fdf4";
    borderColor = "#bbf7d0";
    badgeVariant = "success";
  }

  return (
    <View style={[styles.card, { backgroundColor: bgColor, borderColor }]}>
      <View style={styles.left}>
        <Text style={styles.name}>{entry.antibiotic}</Text>
        <Text style={styles.abbr}>({entry.abbreviation})</Text>
      </View>
      <View style={styles.right}>
        {entry.zoneDiameter !== null && (
          <Text style={styles.zone}>{entry.zoneDiameter}mm</Text>
        )}
        <Badge label={entry.result ?? "—"} variant={badgeVariant} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  left: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  abbr: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  zone: {
    fontSize: 12,
    color: "#6b7280",
  },
});

export default ASTCard;

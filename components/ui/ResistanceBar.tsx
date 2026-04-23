import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface ResistanceBarProps {
  rate: number;
  showLabel?: boolean;
}

const ResistanceBar: React.FC<ResistanceBarProps> = ({ rate, showLabel }) => {
  let color = "#22c55e";
  if (rate > 50) {
    color = "#ef4444";
  } else if (rate >= 25) {
    color = "#f59e0b";
  }

  return (
    <View style={styles.row}>
      <View style={styles.track}>
        <View
          style={[styles.fill, { width: `${rate}%`, backgroundColor: color }]}
        />
      </View>
      {showLabel && <Text style={styles.label}>{rate}%</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 36,
    textAlign: "right",
  },
});

export default ResistanceBar;

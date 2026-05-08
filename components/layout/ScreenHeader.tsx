import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBack,
  onBack,
  rightAction,
}) => {
  return (
    <View style={styles.header}>
      {showBack && (
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>{"<"}</Text>
        </TouchableOpacity>
      )}
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  backArrow: {
    fontSize: 18,
    color: "#374151",
    fontWeight: "500",
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  rightAction: {
    marginLeft: 8,
  },
});

export default ScreenHeader;

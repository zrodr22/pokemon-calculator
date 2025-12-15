import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";

interface CalendarModalProps {
  onDayPress: (dateString: string) => void;
  onClose: () => void;
}

export default function CalendarModal({
  onDayPress,
  onClose,
}: CalendarModalProps) {
  return (
    <SafeAreaView style={styles.modal}>
      <Calendar
        onDayPress={(d) => {
          onDayPress(d.dateString);
        }}
      />
      <TouchableOpacity
        style={[styles.navButton, { alignSelf: "center" }]}
        onPress={onClose}
      >
        <Text style={styles.navButtonText}>Close</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  navButton: {
    paddingVertical: 8,
  },
  navButtonText: {
    color: "#3d6694ff",
    fontSize: 16,
  },
  modal: { flex: 1, padding: 20, backgroundColor: "#fff" },
});
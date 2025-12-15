import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface HistoryItem {
  entry: string;
  date: string;
  displayDate: string;
  note?: string;
}

interface HistoryModalProps {
  filteredHistory: HistoryItem[];
  historyParent: "calendar" | null;
  onBack: () => void;
  onClose: () => void;
  onOpenNote: (index: number) => void;
}

export default function HistoryModal({
  filteredHistory,
  historyParent,
  onBack,
  onClose,
  onOpenNote,
}: HistoryModalProps) {
  return (
    <SafeAreaView style={styles.modal}>
      {historyParent === "calendar" && (
        <TouchableOpacity
          style={[styles.navButton, { alignSelf: "flex-start" }]}
          onPress={onBack}
        >
          <Text style={styles.navButtonText}>{"< Back"}</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.modalTitle}>History</Text>
      <ScrollView>
        {filteredHistory.map((h, i) => (
          <TouchableOpacity
            key={i}
            style={styles.historyItem}
            onPress={() => onOpenNote(i)}
          >
            <Text>{`[${h.displayDate}] ${h.entry}`}</Text>
            <Text style={styles.note}>
              {h.note ? `Note: ${h.note}` : "Tap to add note"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  historyItem: { marginBottom: 15 },
  note: { fontStyle: "italic", color: "#555" },
});
import React from "react";
import {
  Text,
  TextInput,
  Button,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface NoteModalProps {
  noteText: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function NoteModal({
  noteText,
  onChangeText,
  onSave,
  onCancel,
}: NoteModalProps) {
  return (
    <SafeAreaView style={styles.modal}>
      <Text style={styles.modalTitle}>Add Note</Text>
      <TextInput
        style={styles.input}
        value={noteText}
        onChangeText={onChangeText}
        placeholder="Note..."
      />
      <Button title="Save" onPress={onSave} />
      <Button title="Cancel" onPress={onCancel} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1, padding: 20, backgroundColor: "#fff" },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
  },
});
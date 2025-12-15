import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HistoryModal from "./HistoryModal";
import NoteModal from "./NoteModal";
import CalendarModal from "./CalendarModal";

interface HistoryItem {
  entry: string;
  date: string;
  displayDate: string;
  note?: string;
}

const STORAGE_KEY = "@calculator_history";

export default function App() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeModal, setActiveModal] = useState<"history" | "note" | "calendar" | null>(null);
  const [noteText, setNoteText] = useState("");
  const [noteIndex, setNoteIndex] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [historyParent, setHistoryParent] = useState<"calendar" | null>(null);
// const [showScientific, setShowScientific] = useState(false);

  // Track screen dimensions
  const [screenHeight, setScreenHeight] = useState(Dimensions.get("window").height);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setHistory(JSON.parse(data));
    });

    const onChange = ({ window }: { window: { height: number; width: number } }) => {
      setScreenHeight(window.height);
      setScreenWidth(window.width);
    };

    const dimSub = Dimensions.addEventListener("change", onChange);
    return () => {
      if (dimSub && typeof (dimSub as any).remove === "function") {
        (dimSub as any).remove();
      }
    };
  }, []);

  const persist = (data: HistoryItem[]) => {
    setHistory(data);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
      .getDate()
      .toString()
      .padStart(2, "0")}`;
  };

  const evaluate = () => {
    try {
      const expression = input.replace("×", "*").replace("÷", "/").replace("√", "Math.sqrt");
      const result = eval(expression);
      const now = new Date();

      const entry: HistoryItem = {
        entry: `${input} = ${result}`,
        date: todayKey(),
        displayDate: now.toLocaleString(),
      };

      const updated = [entry, ...history];
      persist(updated);
      setInput(String(result));
    } catch {
      setInput("Error");
    }
  };

  const press = (val: string) => {
    if (val === "AC") setInput("");
    else if (val === "⌫") setInput(input.slice(0, -1));
    else if (val === "=") evaluate();
    else if (["sin", "cos", "tan"].includes(val)) {
      try {
        const r = Math[val](parseFloat(input));
        const entry: HistoryItem = {
          entry: `${val}(${input}) = ${r}`,
          date: todayKey(),
          displayDate: new Date().toLocaleString(),
        };
        persist([entry, ...history]);
        setInput(String(r));
      } catch {
        setInput("Error");
      }
    } else setInput(input + val);
  };

  const openNote = (filteredIndex: number) => {
    const filteredItem = filteredHistory[filteredIndex];
    const masterIndex = history.findIndex(
      (h) => h.date === filteredItem.date && h.entry === filteredItem.entry
    );

    if (masterIndex === -1) return; // safety check

    setNoteIndex(masterIndex);
    setNoteText(filteredItem.note || "");
    setActiveModal("note");
  };

  const saveNote = () => {
    if (noteIndex === null) return;
    const updated = [...history];
    updated[noteIndex].note = noteText;
    persist(updated);
    setActiveModal("history");
  };
  
  const cancelNote = () => {
    setActiveModal("history");
  };

  const handleCalendarDayPress = (dateString: string) => {
    setSelectedDate(dateString);
    setHistoryParent("calendar");
    setActiveModal("history");
  };

  const handleHistoryBack = () => {
    setActiveModal("calendar");
    setHistoryParent(null);
  };

  const filteredHistory = selectedDate
    ? history.filter((h) => h.date === selectedDate)
    : history;

  // Scaling factors
  const buttonHeight = Math.max(screenHeight * 0.08, 50); // min 50
  const buttonFontSize = Math.max(screenHeight * 0.025, 18); // min 18
  const displayFontSize = Math.min(screenHeight * 0.06, 48); // max 48

  const standardButtons = [
    ["AC", "⌫", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "−"],
    ["1", "2", "3", "+"],
  ];

  const scientificButtons = [["sin", "cos", "tan", "√"]];

  return (
    <SafeAreaView style={styles.container}>
      {/* Display */}
      <View style={styles.display}>
        <ScrollView horizontal>
          <Text style={[styles.displayText, { fontSize: displayFontSize }]}>{input || "0"}</Text>
        </ScrollView>

        <View style={styles.topButtons}>
          <TouchableOpacity onPress={() => { 
                setSelectedDate(null); 
                setHistoryParent(null); 
                setActiveModal("history"); 
              }
            }>
            <Text style={styles.topText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveModal("calendar")}>
            <Text style={styles.topText}>Calendar</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => setShowScientific(!showScientific)}>
            <Text style={styles.topText}>{showScientific ? "Hide Sci" : "Sci"}</Text>
          </TouchableOpacity> */}
        </View>
      </View>

      {/* Buttons */}
      <View style={[styles.pad]}>
        {/* {showScientific &&
          scientificButtons.map((row, i) => (
            <View key={`sci-${i}`} style={styles.row}>
              {row.map((b) => (
                <CalcButton key={b} label={b} onPress={press} height={buttonHeight} fontSize={buttonFontSize} />
              ))}
            </View>
          ))} */}

        {standardButtons.map((row, i) => (
          <View key={`std-${i}`} style={styles.row}>
            {row.map((b) => (
              <CalcButton key={b} label={b} onPress={press} height={buttonHeight} fontSize={buttonFontSize} />
            ))}
          </View>
        ))}

        {/* Bottom row with 0 */}
        <View style={styles.row}>
          <CalcButton label="0" wide onPress={press} height={buttonHeight} fontSize={buttonFontSize} />
          <CalcButton label="." onPress={press} height={buttonHeight} fontSize={buttonFontSize} />
          <CalcButton label="=" onPress={press} height={buttonHeight} fontSize={buttonFontSize} />
        </View>
      </View>

      {/* MODALS */}
      <Modal visible={activeModal !== null} animationType="slide">
        {activeModal === "history" && (
          <HistoryModal
            filteredHistory={filteredHistory}
            historyParent={historyParent}
            onBack={handleHistoryBack}
            onClose={() => setActiveModal(null)}
            onOpenNote={openNote}
          />
        )}
        {activeModal === "note" && (
          <NoteModal
            noteText={noteText}
            onChangeText={setNoteText}
            onSave={saveNote}
            onCancel={cancelNote}
          />
        )}
        {activeModal === "calendar" && (
          <CalendarModal
            onDayPress={handleCalendarDayPress}
            onClose={() => setActiveModal(null)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

function CalcButton({
  label,
  onPress,
  wide,
  height,
  fontSize,
}: {
  label: string;
  onPress: (v: string) => void;
  wide?: boolean;
  height: number;
  fontSize: number;
}) {
  return (
    <TouchableOpacity
      onPress={() => onPress(label)}
      style={[
        styles.button,
        wide && styles.wide,
        { height, justifyContent: "center", alignItems: "center" },
      ]}
    >
      <Text style={[styles.buttonText, { fontSize }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  display: { flex: 1, justifyContent: "flex-end", padding: 10 },
  displayText: { color: "white" },
  topButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  topText: { color: "#aaa" },
  pad: { flex: 1.2, padding: 5, justifyContent: "space-between" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  button: { flex: 1, backgroundColor: "#333", margin: 3, borderRadius: 35, minHeight: 50 },
  wide: { flex: 2 },
  buttonText: { color: "white" },
});

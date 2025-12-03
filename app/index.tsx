import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AdMobBanner } from 'expo-ads-admob';

// Button layout
const basicButtons = [
  ["7", "8", "9", "/"],
  ["4", "5", "6", "*"],
  ["1", "2", "3", "-"],
  ["0", ".", "=", "+"],
];

const extraButtons = [["C", "(", ")", "⌫"]]; // always visible 4-column row

const scientificButtons = [
  ["sin", "cos", "tan", "√"],
  ["^"], // foldable scientific
];

interface HistoryItem {
  entry: string;
  date: string; // YYYY-MM-DD for calendar filtering
  displayDate: string; // friendly display
  note?: string;
}

export default function App() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showScientific, setShowScientific] = useState(false);

  // AsyncStorage key
  const STORAGE_KEY = "@calculator_history";

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setHistory(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load history", e);
      }
    };
    loadHistory();
  }, []);

  // Save history helper
  const saveHistory = async (newHistory: HistoryItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  const getLocalDateString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
  };

  const handlePress = (button: string) => {
    if (button === "C") {
      setInput("");
    } else if (button === "⌫") {
      setInput(input.slice(0, -1));
    } else if (button === "=") {
      try {
        let expression = input.replace("√", "Math.sqrt").replace("^", "**");
        const result = eval(expression);

        const now = new Date();
        const dateString = getLocalDateString();
        const displayDate = now.toLocaleString();

        const newEntry = { entry: `${input} = ${result}`, date: dateString, displayDate };
        const updatedHistory = [newEntry, ...history];

        setHistory(updatedHistory);
        saveHistory(updatedHistory);
        setInput(result.toString());
      } catch {
        setInput("Error");
      }
    } else if (["sin", "cos", "tan"].includes(button)) {
      try {
        const val = Math[button](parseFloat(input));
        const now = new Date();
        const dateString = getLocalDateString();
        const displayDate = now.toLocaleString();

        const newEntry = { entry: `${button}(${input}) = ${val}`, date: dateString, displayDate };
        const updatedHistory = [newEntry, ...history];

        setHistory(updatedHistory);
        saveHistory(updatedHistory);
        setInput(val.toString());
      } catch {
        setInput("Error");
      }
    } else {
      setInput(input + button);
    }
  };

  const openNoteModal = (index: number) => {
    setCurrentNoteIndex(index);
    setNoteText(history[index].note || "");
    setNoteModalVisible(true);
  };

  const saveNote = () => {
    if (currentNoteIndex !== null) {
      const updatedHistory = [...history];
      updatedHistory[currentNoteIndex].note = noteText;
      setHistory(updatedHistory);
      saveHistory(updatedHistory);
      setNoteModalVisible(false);
    }
  };

  const filteredHistory = selectedDate
    ? history.filter((h) => h.date === selectedDate)
    : history;

  return (
    <SafeAreaView style={styles.container}>
      {/* Display */}
      <View style={styles.display}>
        <ScrollView horizontal>
          <Text style={styles.displayText}>{input || "0"}</Text>
        </ScrollView>

        {/* History & Calendar Buttons */}
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => {
              setSelectedDate(null);
              setHistoryVisible(true);
            }}
          >
            <Text style={{ color: "white" }}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.historyButton, { marginLeft: 10 }]}
            onPress={() => setCalendarVisible(true)}
          >
            <Text style={{ color: "white" }}>Calendar</Text>
          </TouchableOpacity>
        </View>

        {/* Toggle Scientific */}
        <TouchableOpacity
          style={[styles.historyButton, { marginTop: 10 }]}
          onPress={() => setShowScientific(!showScientific)}
        >
          <Text style={{ color: "white" }}>
            {showScientific ? "Hide Scientific" : "Show Scientific"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Buttons Container */}
      <View style={styles.buttonsContainer}>
        {/* Basic Buttons */}
        {basicButtons.map((row, i) => (
          <View key={`basic-${i}`} style={styles.flexRow}>
            {row.map((btn) => (
              <TouchableOpacity
                key={btn}
                style={styles.flexButton}
                onPress={() => handlePress(btn)}
              >
                <Text style={styles.buttonText}>{btn}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Always-visible extra buttons */}
        {extraButtons.map((row, i) => (
          <View key={`extra-${i}`} style={styles.flexRow}>
            {row.map((btn) => (
              <TouchableOpacity
                key={btn}
                style={styles.flexButton}
                onPress={() => handlePress(btn)}
              >
                <Text style={styles.buttonText}>{btn}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Foldable scientific buttons */}
        {showScientific &&
          scientificButtons.map((row, i) => (
            <View key={`sci-${i}`} style={styles.flexRow}>
              {row.map((btn) => (
                <TouchableOpacity
                  key={btn}
                  style={styles.flexButton}
                  onPress={() => handlePress(btn)}
                >
                  <Text style={styles.buttonText}>{btn}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
      </View>

      {/* AdMob Banner */}
      {/* <AdMobBanner
        bannerSize="fullBanner"
        adUnitID="ca-app-pub-3940256099942544/6300978111" // Test Ad Unit ID
        servePersonalizedAds={true}
        onDidFailToReceiveAdWithError={(error) => console.error(error)}
      /> */}

      {/* History Modal */}
      <Modal
        visible={historyVisible}
        animationType="slide"
        onRequestClose={() => setHistoryVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {selectedDate ? `History for ${selectedDate}` : "History"}
          </Text>
          <ScrollView>
            {filteredHistory.length === 0 ? (
              <Text>No calculations yet.</Text>
            ) : (
              filteredHistory.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => openNoteModal(index)}
                  style={styles.historyItem}
                >
                  <Text style={styles.historyEntry}>
                    [{item.displayDate}] {item.entry}
                  </Text>
                  {item.note ? (
                    <Text style={styles.noteText}>Note: {item.note}</Text>
                  ) : (
                    <Text style={styles.addNoteText}>Tap to add note</Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
          <Button title="Close" onPress={() => setHistoryVisible(false)} />
        </SafeAreaView>
      </Modal>

      {/* Note Modal */}
      <Modal
        visible={noteModalVisible}
        animationType="slide"
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Note</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Enter note here"
            value={noteText}
            onChangeText={setNoteText}
          />
          <Button title="Save Note" onPress={saveNote} />
          <Button title="Cancel" onPress={() => setNoteModalVisible(false)} />
        </SafeAreaView>
      </Modal>

      {/* Calendar Modal */}
      <Modal
        visible={calendarVisible}
        animationType="slide"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Date</Text>
          <Calendar
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setCalendarVisible(false);
              setHistoryVisible(true);
            }}
          />
          <Button title="Close" onPress={() => setCalendarVisible(false)} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#222" },
  display: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    padding: 20,
  },
  displayText: { fontSize: 40, color: "white" },
  historyButton: {
    marginTop: 10,
    backgroundColor: "#555",
    padding: 10,
    borderRadius: 5,
  },
  buttonsContainer: {
    flex: 2,
    padding: 10,
    justifyContent: "space-around",
  },
  flexRow: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-around",
    marginBottom: 10,
  },
  flexButton: {
    backgroundColor: "#444",
    flex: 1,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: { color: "white", fontSize: 20 },
  modalContainer: { flex: 1, padding: 20, backgroundColor: "#fff" },
  modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  historyEntry: { fontSize: 18 },
  historyItem: { marginBottom: 15 },
  noteText: { fontSize: 16, fontStyle: "italic", color: "blue" },
  addNoteText: { fontSize: 16, fontStyle: "italic", color: "gray" },
  noteInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
});



//********* NO ADS******************* */
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Modal,
//   TextInput,
//   Button,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Calendar } from "react-native-calendars";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Button layout
// const basicButtons = [
//   ["7", "8", "9", "/"],
//   ["4", "5", "6", "*"],
//   ["1", "2", "3", "-"],
//   ["0", ".", "=", "+"],
// ];

// const extraButtons = [["C", "(", ")", "⌫"]]; // always visible 4-column row

// const scientificButtons = [
//   ["sin", "cos", "tan", "√"],
//   ["^"], // foldable scientific
// ];

// interface HistoryItem {
//   entry: string;
//   date: string; // YYYY-MM-DD for calendar filtering
//   displayDate: string; // friendly display
//   note?: string;
// }

// export default function App() {
//   const [input, setInput] = useState("");
//   const [history, setHistory] = useState<HistoryItem[]>([]);
//   const [historyVisible, setHistoryVisible] = useState(false);
//   const [noteModalVisible, setNoteModalVisible] = useState(false);
//   const [currentNoteIndex, setCurrentNoteIndex] = useState<number | null>(null);
//   const [noteText, setNoteText] = useState("");
//   const [calendarVisible, setCalendarVisible] = useState(false);
//   const [selectedDate, setSelectedDate] = useState<string | null>(null);
//   const [showScientific, setShowScientific] = useState(false);

//   // AsyncStorage key
//   const STORAGE_KEY = "@calculator_history";

//   // Load history on mount
//   useEffect(() => {
//     const loadHistory = async () => {
//       try {
//         const saved = await AsyncStorage.getItem(STORAGE_KEY);
//         if (saved) {
//           setHistory(JSON.parse(saved));
//         }
//       } catch (e) {
//         console.error("Failed to load history", e);
//       }
//     };
//     loadHistory();
//   }, []);

//   // Save history helper
//   const saveHistory = async (newHistory: HistoryItem[]) => {
//     try {
//       await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
//     } catch (e) {
//       console.error("Failed to save history", e);
//     }
//   };

//   const getLocalDateString = () => {
//     const now = new Date();
//     return `${now.getFullYear()}-${(now.getMonth() + 1)
//       .toString()
//       .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
//   };

//   const handlePress = (button: string) => {
//     if (button === "C") {
//       setInput("");
//     } else if (button === "⌫") {
//       setInput(input.slice(0, -1));
//     } else if (button === "=") {
//       try {
//         let expression = input.replace("√", "Math.sqrt").replace("^", "**");
//         const result = eval(expression);

//         const now = new Date();
//         const dateString = getLocalDateString();
//         const displayDate = now.toLocaleString();

//         const newEntry = { entry: `${input} = ${result}`, date: dateString, displayDate };
//         const updatedHistory = [newEntry, ...history];

//         setHistory(updatedHistory);
//         saveHistory(updatedHistory);
//         setInput(result.toString());
//       } catch {
//         setInput("Error");
//       }
//     } else if (["sin", "cos", "tan"].includes(button)) {
//       try {
//         const val = Math[button](parseFloat(input));
//         const now = new Date();
//         const dateString = getLocalDateString();
//         const displayDate = now.toLocaleString();

//         const newEntry = { entry: `${button}(${input}) = ${val}`, date: dateString, displayDate };
//         const updatedHistory = [newEntry, ...history];

//         setHistory(updatedHistory);
//         saveHistory(updatedHistory);
//         setInput(val.toString());
//       } catch {
//         setInput("Error");
//       }
//     } else {
//       setInput(input + button);
//     }
//   };

//   const openNoteModal = (index: number) => {
//     setCurrentNoteIndex(index);
//     setNoteText(history[index].note || "");
//     setNoteModalVisible(true);
//   };

//   const saveNote = () => {
//     if (currentNoteIndex !== null) {
//       const updatedHistory = [...history];
//       updatedHistory[currentNoteIndex].note = noteText;
//       setHistory(updatedHistory);
//       saveHistory(updatedHistory);
//       setNoteModalVisible(false);
//     }
//   };

//   const filteredHistory = selectedDate
//     ? history.filter((h) => h.date === selectedDate)
//     : history;

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Display */}
//       <View style={styles.display}>
//         <ScrollView horizontal>
//           <Text style={styles.displayText}>{input || "0"}</Text>
//         </ScrollView>

//         {/* History & Calendar Buttons */}
//         <View style={{ flexDirection: "row", marginTop: 10 }}>
//           <TouchableOpacity
//             style={styles.historyButton}
//             onPress={() => {
//               setSelectedDate(null);
//               setHistoryVisible(true);
//             }}
//           >
//             <Text style={{ color: "white" }}>History</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.historyButton, { marginLeft: 10 }]}
//             onPress={() => setCalendarVisible(true)}
//           >
//             <Text style={{ color: "white" }}>Calendar</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Toggle Scientific */}
//         <TouchableOpacity
//           style={[styles.historyButton, { marginTop: 10 }]}
//           onPress={() => setShowScientific(!showScientific)}
//         >
//           <Text style={{ color: "white" }}>
//             {showScientific ? "Hide Scientific" : "Show Scientific"}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Buttons Container */}
//       <View style={styles.buttonsContainer}>
//         {/* Basic Buttons */}
//         {basicButtons.map((row, i) => (
//           <View key={`basic-${i}`} style={styles.flexRow}>
//             {row.map((btn) => (
//               <TouchableOpacity
//                 key={btn}
//                 style={styles.flexButton}
//                 onPress={() => handlePress(btn)}
//               >
//                 <Text style={styles.buttonText}>{btn}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         ))}

//         {/* Always-visible extra buttons */}
//         {extraButtons.map((row, i) => (
//           <View key={`extra-${i}`} style={styles.flexRow}>
//             {row.map((btn) => (
//               <TouchableOpacity
//                 key={btn}
//                 style={styles.flexButton}
//                 onPress={() => handlePress(btn)}
//               >
//                 <Text style={styles.buttonText}>{btn}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         ))}

//         {/* Foldable scientific buttons */}
//         {showScientific &&
//           scientificButtons.map((row, i) => (
//             <View key={`sci-${i}`} style={styles.flexRow}>
//               {row.map((btn) => (
//                 <TouchableOpacity
//                   key={btn}
//                   style={styles.flexButton}
//                   onPress={() => handlePress(btn)}
//                 >
//                   <Text style={styles.buttonText}>{btn}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           ))}
//       </View>

//       {/* History Modal */}
//       <Modal
//         visible={historyVisible}
//         animationType="slide"
//         onRequestClose={() => setHistoryVisible(false)}
//       >
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.modalTitle}>
//             {selectedDate ? `History for ${selectedDate}` : "History"}
//           </Text>
//           <ScrollView>
//             {filteredHistory.length === 0 ? (
//               <Text>No calculations yet.</Text>
//             ) : (
//               filteredHistory.map((item, index) => (
//                 <TouchableOpacity
//                   key={index}
//                   onPress={() => openNoteModal(index)}
//                   style={styles.historyItem}
//                 >
//                   <Text style={styles.historyEntry}>
//                     [{item.displayDate}] {item.entry}
//                   </Text>
//                   {item.note ? (
//                     <Text style={styles.noteText}>Note: {item.note}</Text>
//                   ) : (
//                     <Text style={styles.addNoteText}>Tap to add note</Text>
//                   )}
//                 </TouchableOpacity>
//               ))
//             )}
//           </ScrollView>
//           <Button title="Close" onPress={() => setHistoryVisible(false)} />
//         </SafeAreaView>
//       </Modal>

//       {/* Note Modal */}
//       <Modal
//         visible={noteModalVisible}
//         animationType="slide"
//         onRequestClose={() => setNoteModalVisible(false)}
//       >
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.modalTitle}>Add Note</Text>
//           <TextInput
//             style={styles.noteInput}
//             placeholder="Enter note here"
//             value={noteText}
//             onChangeText={setNoteText}
//           />
//           <Button title="Save Note" onPress={saveNote} />
//           <Button title="Cancel" onPress={() => setNoteModalVisible(false)} />
//         </SafeAreaView>
//       </Modal>

//       {/* Calendar Modal */}
//       <Modal
//         visible={calendarVisible}
//         animationType="slide"
//         onRequestClose={() => setCalendarVisible(false)}
//       >
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.modalTitle}>Select Date</Text>
//           <Calendar
//             onDayPress={(day) => {
//               setSelectedDate(day.dateString);
//               setCalendarVisible(false);
//               setHistoryVisible(true);
//             }}
//           />
//           <Button title="Close" onPress={() => setCalendarVisible(false)} />
//         </SafeAreaView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#222" },
//   display: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "flex-end",
//     padding: 20,
//   },
//   displayText: { fontSize: 40, color: "white" },
//   historyButton: {
//     marginTop: 10,
//     backgroundColor: "#555",
//     padding: 10,
//     borderRadius: 5,
//   },
//   buttonsContainer: {
//     flex: 2,
//     padding: 10,
//     justifyContent: "space-around",
//   },
//   flexRow: {
//     flexDirection: "row",
//     flex: 1,
//     justifyContent: "space-around",
//     marginBottom: 10,
//   },
//   flexButton: {
//     backgroundColor: "#444",
//     flex: 1,
//     margin: 5,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 10,
//   },
//   buttonText: { color: "white", fontSize: 20 },
//   modalContainer: { flex: 1, padding: 20, backgroundColor: "#fff" },
//   modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
//   historyEntry: { fontSize: 18 },
//   historyItem: { marginBottom: 15 },
//   noteText: { fontSize: 16, fontStyle: "italic", color: "blue" },
//   addNoteText: { fontSize: 16, fontStyle: "italic", color: "gray" },
//   noteInput: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 10,
//     marginBottom: 20,
//     borderRadius: 5,
//   },
// });


// ******* NO PERSISTENCE NO ADS **********
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Modal,
//   TextInput,
//   Button,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Calendar } from "react-native-calendars";

// // Button layout
// const basicButtons = [
//   ["7", "8", "9", "/"],
//   ["4", "5", "6", "*"],
//   ["1", "2", "3", "-"],
//   ["0", ".", "=", "+"],
// ];

// const extraButtons = [["C", "(", ")", "⌫"]]; // always visible 4-column row

// const scientificButtons = [
//   ["sin", "cos", "tan", "√"],
//   ["^"], // foldable scientific
// ];

// interface HistoryItem {
//   entry: string;
//   date: string; // YYYY-MM-DD for calendar filtering
//   displayDate: string; // friendly display
//   note?: string;
// }

// export default function App() {
//   const [input, setInput] = useState("");
//   const [history, setHistory] = useState<HistoryItem[]>([]);
//   const [historyVisible, setHistoryVisible] = useState(false);
//   const [noteModalVisible, setNoteModalVisible] = useState(false);
//   const [currentNoteIndex, setCurrentNoteIndex] = useState<number | null>(null);
//   const [noteText, setNoteText] = useState("");

//   const [calendarVisible, setCalendarVisible] = useState(false);
//   const [selectedDate, setSelectedDate] = useState<string | null>(null);
//   const [showScientific, setShowScientific] = useState(false);

//   const getLocalDateString = () => {
//     const now = new Date();
//     return `${now.getFullYear()}-${(now.getMonth() + 1)
//       .toString()
//       .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
//   };

//   const handlePress = (button: string) => {
//     if (button === "C") {
//       setInput("");
//     } else if (button === "⌫") {
//       setInput(input.slice(0, -1));
//     } else if (button === "=") {
//       try {
//         let expression = input.replace("√", "Math.sqrt").replace("^", "**");
//         const result = eval(expression);

//         const now = new Date();
//         const dateString = getLocalDateString();
//         const displayDate = now.toLocaleString();

//         setHistory([{ entry: `${input} = ${result}`, date: dateString, displayDate }, ...history]);
//         setInput(result.toString());
//       } catch {
//         setInput("Error");
//       }
//     } else if (["sin", "cos", "tan"].includes(button)) {
//       try {
//         const val = Math[button](parseFloat(input));
//         const now = new Date();
//         const dateString = getLocalDateString();
//         const displayDate = now.toLocaleString();

//         setHistory([{ entry: `${button}(${input}) = ${val}`, date: dateString, displayDate }, ...history]);
//         setInput(val.toString());
//       } catch {
//         setInput("Error");
//       }
//     } else {
//       setInput(input + button);
//     }
//   };

//   const openNoteModal = (index: number) => {
//     setCurrentNoteIndex(index);
//     setNoteText(history[index].note || "");
//     setNoteModalVisible(true);
//   };

//   const saveNote = () => {
//     if (currentNoteIndex !== null) {
//       const updatedHistory = [...history];
//       updatedHistory[currentNoteIndex].note = noteText;
//       setHistory(updatedHistory);
//       setNoteModalVisible(false);
//     }
//   };

//   const filteredHistory = selectedDate
//     ? history.filter((h) => h.date === selectedDate)
//     : history;

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Display */}
//       <View style={styles.display}>
//         <ScrollView horizontal>
//           <Text style={styles.displayText}>{input || "0"}</Text>
//         </ScrollView>

//         {/* History & Calendar Buttons */}
//         <View style={{ flexDirection: "row", marginTop: 10 }}>
//           <TouchableOpacity
//             style={styles.historyButton}
//             onPress={() => {
//               setSelectedDate(null);
//               setHistoryVisible(true);
//             }}
//           >
//             <Text style={{ color: "white" }}>History</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.historyButton, { marginLeft: 10 }]}
//             onPress={() => setCalendarVisible(true)}
//           >
//             <Text style={{ color: "white" }}>Calendar</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Toggle Scientific */}
//         <TouchableOpacity
//           style={[styles.historyButton, { marginTop: 10 }]}
//           onPress={() => setShowScientific(!showScientific)}
//         >
//           <Text style={{ color: "white" }}>
//             {showScientific ? "Hide Scientific" : "Show Scientific"}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Buttons Container */}
//       <View style={styles.buttonsContainer}>
//         {/* Basic Buttons */}
//         {basicButtons.map((row, i) => (
//           <View key={`basic-${i}`} style={styles.flexRow}>
//             {row.map((btn) => (
//               <TouchableOpacity
//                 key={btn}
//                 style={styles.flexButton}
//                 onPress={() => handlePress(btn)}
//               >
//                 <Text style={styles.buttonText}>{btn}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         ))}

//         {/* Always-visible extra buttons */}
//         {extraButtons.map((row, i) => (
//           <View key={`extra-${i}`} style={styles.flexRow}>
//             {row.map((btn) => (
//               <TouchableOpacity
//                 key={btn}
//                 style={styles.flexButton}
//                 onPress={() => handlePress(btn)}
//               >
//                 <Text style={styles.buttonText}>{btn}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         ))}

//         {/* Foldable scientific buttons */}
//         {showScientific &&
//           scientificButtons.map((row, i) => (
//             <View key={`sci-${i}`} style={styles.flexRow}>
//               {row.map((btn) => (
//                 <TouchableOpacity
//                   key={btn}
//                   style={styles.flexButton}
//                   onPress={() => handlePress(btn)}
//                 >
//                   <Text style={styles.buttonText}>{btn}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           ))}
//       </View>

//       {/* History Modal */}
//       <Modal
//         visible={historyVisible}
//         animationType="slide"
//         onRequestClose={() => setHistoryVisible(false)}
//       >
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.modalTitle}>
//             {selectedDate ? `History for ${selectedDate}` : "History"}
//           </Text>
//           <ScrollView>
//             {filteredHistory.length === 0 ? (
//               <Text>No calculations yet.</Text>
//             ) : (
//               filteredHistory.map((item, index) => (
//                 <TouchableOpacity
//                   key={index}
//                   onPress={() => openNoteModal(index)}
//                   style={styles.historyItem}
//                 >
//                   <Text style={styles.historyEntry}>
//                     [{item.displayDate}] {item.entry}
//                   </Text>
//                   {item.note ? (
//                     <Text style={styles.noteText}>Note: {item.note}</Text>
//                   ) : (
//                     <Text style={styles.addNoteText}>Tap to add note</Text>
//                   )}
//                 </TouchableOpacity>
//               ))
//             )}
//           </ScrollView>
//           <Button title="Close" onPress={() => setHistoryVisible(false)} />
//         </SafeAreaView>
//       </Modal>

//       {/* Note Modal */}
//       <Modal
//         visible={noteModalVisible}
//         animationType="slide"
//         onRequestClose={() => setNoteModalVisible(false)}
//       >
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.modalTitle}>Add Note</Text>
//           <TextInput
//             style={styles.noteInput}
//             placeholder="Enter note here"
//             value={noteText}
//             onChangeText={setNoteText}
//           />
//           <Button title="Save Note" onPress={saveNote} />
//           <Button title="Cancel" onPress={() => setNoteModalVisible(false)} />
//         </SafeAreaView>
//       </Modal>

//       {/* Calendar Modal */}
//       <Modal
//         visible={calendarVisible}
//         animationType="slide"
//         onRequestClose={() => setCalendarVisible(false)}
//       >
//         <SafeAreaView style={styles.modalContainer}>
//           <Text style={styles.modalTitle}>Select Date</Text>
//           <Calendar
//             onDayPress={(day) => {
//               setSelectedDate(day.dateString);
//               setCalendarVisible(false);
//               setHistoryVisible(true);
//             }}
//           />
//           <Button title="Close" onPress={() => setCalendarVisible(false)} />
//         </SafeAreaView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#222" },
//   display: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "flex-end",
//     padding: 20,
//   },
//   displayText: { fontSize: 40, color: "white" },
//   historyButton: {
//     marginTop: 10,
//     backgroundColor: "#555",
//     padding: 10,
//     borderRadius: 5,
//   },
//   buttonsContainer: {
//     flex: 2,
//     padding: 10,
//     justifyContent: "space-around",
//   },
//   flexRow: {
//     flexDirection: "row",
//     flex: 1,
//     justifyContent: "space-around",
//     marginBottom: 10,
//   },
//   flexButton: {
//     backgroundColor: "#444",
//     flex: 1,
//     margin: 5,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 10,
//   },
//   buttonText: { color: "white", fontSize: 20 },
//   modalContainer: { flex: 1, padding: 20, backgroundColor: "#fff" },
//   modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
//   historyEntry: { fontSize: 18 },
//   historyItem: { marginBottom: 15 },
//   noteText: { fontSize: 16, fontStyle: "italic", color: "blue" },
//   addNoteText: { fontSize: 16, fontStyle: "italic", color: "gray" },
//   noteInput: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 10,
//     marginBottom: 20,
//     borderRadius: 5,
//   },
// });


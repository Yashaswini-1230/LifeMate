import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ArrowLeft, CalendarDays, Check, Trash2 } from "lucide-react-native";

type Task = {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  createdAt: string;
  scheduledTime: string | null;
  dueDate?: string;
};

const TASKS_KEY = "lifemate_tasks";
type FilterKey =
  | "All"
  | "Today"
  | "Tomorrow"
  | "This Week"
  | "Upcoming"
  | "Overdue"
  | "Completed";

function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateKey(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isValidDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = parseDateKey(value);
  return dateKey(date) === value;
}

function formatDate(value: string) {
  if (!isValidDateKey(value)) return value;
  return parseDateKey(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const filters: FilterKey[] = [
  "All",
  "Today",
  "Tomorrow",
  "This Week",
  "Upcoming",
  "Overdue",
  "Completed",
];

export default function ScheduleScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("All");
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()));
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(TASKS_KEY);
        const parsed: Task[] = raw ? JSON.parse(raw) : [];
        setTasks(
          parsed.map((task) => ({
            ...task,
            scheduledTime: task.scheduledTime ?? null,
            dueDate: task.dueDate ?? dateKey(new Date(task.createdAt)),
          })),
        );
      } catch (error) {
        console.log("SCHEDULE LOAD FAILED:", error);
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks)).catch((error) =>
      console.log("SCHEDULE SAVE FAILED:", error),
    );
  }, [tasks, loaded]);

  const today = dateKey(new Date());
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = dateKey(tomorrowDate);
  const weekEndDate = new Date();
  weekEndDate.setDate(
    weekEndDate.getDate() + (6 - ((weekEndDate.getDay() + 6) % 7)),
  );
  const weekEnd = dateKey(weekEndDate);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const due = task.dueDate ?? today;
        if (filter === "Completed") return task.completed;
        if (task.completed && filter !== "All") return false;
        if (filter === "Today") return due === today;
        if (filter === "Tomorrow") return due === tomorrow;
        if (filter === "This Week") return due >= today && due <= weekEnd;
        if (filter === "Upcoming") return due > today && !task.completed;
        if (filter === "Overdue") return due < today && !task.completed;
        return true;
      })
      .sort((a, b) => {
        const dateCompare = (a.dueDate ?? today).localeCompare(
          b.dueDate ?? today,
        );
        if (dateCompare !== 0) return dateCompare;
        return (a.scheduledTime ?? "").localeCompare(b.scheduledTime ?? "");
      });
  }, [tasks, filter, today, tomorrow, weekEnd]);

  const toggleTask = (id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  const selectDate = () => {
    if (!isValidDateKey(selectedDate)) {
      setDateError("Enter a valid date in YYYY-MM-DD format.");
      return;
    }
    setDateError("");
    setFilter("All");
  };

  const dateTasks = tasks.filter(
    (task) => (task.dueDate ?? today) === selectedDate,
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={19} color="#755DB7" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>LIFEMATE AI</Text>
            <Text style={styles.title}>My Schedule</Text>
            <Text style={styles.subtitle}>
              Plan today and everything ahead.
            </Text>
          </View>
          <CalendarDays size={25} color="#8B70D9" />
        </View>

        <View style={styles.dateCard}>
          <Text style={styles.cardTitle}>Tasks on a specific date</Text>
          <TextInput
            style={styles.dateInput}
            value={selectedDate}
            onChangeText={(value) => {
              setSelectedDate(value);
              setDateError("");
            }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#A7A1B2"
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.dateReadable}>
            {isValidDateKey(selectedDate)
              ? formatDate(selectedDate)
              : "Enter date as YYYY-MM-DD"}
          </Text>
          {dateError ? <Text style={styles.error}>{dateError}</Text> : null}
          <Pressable style={styles.primaryButton} onPress={selectDate}>
            <Text style={styles.primaryButtonText}>
              View selected date ({dateTasks.length})
            </Text>
          </Pressable>
          {dateTasks.length > 0 && (
            <View style={styles.selectedTasks}>
              {dateTasks.map((task) => (
                <Text key={task.id} style={styles.selectedTaskText}>
                  • {task.title}
                </Text>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Browse tasks</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((item) => (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={[
                styles.filterChip,
                filter === item && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item && styles.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.taskList}>
          {!loaded ? (
            <ActivityIndicator color="#8B70D9" style={{ padding: 28 }} />
          ) : filteredTasks.length === 0 ? (
            <View style={styles.empty}>
              <CalendarDays size={28} color="#B7A9D9" />
              <Text style={styles.emptyTitle}>No tasks in this view</Text>
              <Text style={styles.emptySubtitle}>
                Add a task from your dashboard and choose its date.
              </Text>
            </View>
          ) : (
            filteredTasks.map((task, index) => (
              <View key={task.id}>
                <View style={styles.taskRow}>
                  <Pressable
                    style={[
                      styles.checkButton,
                      task.completed && styles.checkButtonCompleted,
                    ]}
                    onPress={() => toggleTask(task.id)}
                  >
                    {task.completed ? (
                      <Check size={15} color="#FFFFFF" />
                    ) : null}
                  </Pressable>
                  <View style={styles.taskInfo}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.completed && styles.completed,
                      ]}
                    >
                      {task.title}
                    </Text>
                    <Text style={styles.taskMeta}>
                      {formatDate(task.dueDate ?? today)} ·{" "}
                      {task.scheduledTime ?? "No time"} · {task.category}
                    </Text>
                    {(task.dueDate ?? today) < today && !task.completed ? (
                      <Text style={styles.overdue}>Overdue</Text>
                    ) : null}
                  </View>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => deleteTask(task.id)}
                  >
                    <Trash2 size={16} color="#B5A9C9" />
                  </Pressable>
                </View>
                {index !== filteredTasks.length - 1 ? (
                  <View style={styles.divider} />
                ) : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF9FF" },
  content: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 850,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginBottom: 22,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#F0EAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    color: "#8B70D9",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: { color: "#25213A", fontSize: 25, fontWeight: "900", marginTop: 3 },
  subtitle: { color: "#817B96", fontSize: 12, marginTop: 4 },
  dateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: "#EEE9F6",
    marginBottom: 24,
  },
  cardTitle: {
    color: "#302B43",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 12,
  },
  dateInput: {
    height: 46,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#EAE4F3",
    backgroundColor: "#FBF9FF",
    paddingHorizontal: 12,
    color: "#25213A",
  },
  dateReadable: {
    color: "#8B70D9",
    fontSize: 11,
    marginTop: 8,
    fontWeight: "700",
  },
  error: { color: "#C43D3D", fontSize: 11, marginTop: 7 },
  primaryButton: {
    backgroundColor: "#8B70D9",
    borderRadius: 11,
    padding: 12,
    alignItems: "center",
    marginTop: 12,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  selectedTasks: { marginTop: 12, gap: 7 },
  selectedTaskText: { color: "#5F5871", fontSize: 12 },
  sectionTitle: {
    color: "#25213A",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  filterRow: { gap: 8, paddingBottom: 13 },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: "#F0EAFE",
  },
  filterChipActive: { backgroundColor: "#8B70D9" },
  filterText: { color: "#756B88", fontSize: 11, fontWeight: "700" },
  filterTextActive: { color: "#FFFFFF" },
  taskList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#EEE9F6",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 15,
  },
  checkButton: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#D9D0E9",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkButtonCompleted: { backgroundColor: "#8B70D9", borderColor: "#8B70D9" },
  taskInfo: { flex: 1 },
  taskTitle: { color: "#302B43", fontSize: 13, fontWeight: "800" },
  completed: { color: "#A7A1B2", textDecorationLine: "line-through" },
  taskMeta: { color: "#9991AB", fontSize: 10, marginTop: 5 },
  overdue: { color: "#C43D3D", fontSize: 10, fontWeight: "800", marginTop: 4 },
  deleteButton: { padding: 7 },
  divider: { height: 1, backgroundColor: "#F1EDF6" },
  empty: { alignItems: "center", padding: 28 },
  emptyTitle: {
    color: "#302B43",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 10,
  },
  emptySubtitle: {
    color: "#9991AB",
    fontSize: 11,
    textAlign: "center",
    marginTop: 5,
    lineHeight: 17,
  },
});

import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
const tr = (key: string) => i18n.t(key);
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Keyboard,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Check,
  Clock,
  CalendarDays,
  Flame,
  ListTodo,
  LogOut,
  Plus,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import ProfileAvatar from "../../components/ProfileAvatar";
import { useProfile } from "../../context/ProfileContext";
import { getTasks, createTask, toggleStoredTask, deleteStoredTask, type Task } from "../../lib/taskStorage";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { usePreferences } from "../../context/PreferencesContext";

type Habit = {
  id: string;
  title: string;
  subtitle: string;
  createdAt: string;
  completedDates: string[];
};


const categories = ["Personal", "Study", "Work", "Health"];

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLastSevenDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return {
      key: getDateKey(date),
      label: date.toLocaleDateString(i18n.language, { weekday: "short" }),
    };
  });
}

function getHabitStreak(completedDates: string[]) {
  const completed = new Set(completedDates);
  const cursor = new Date();

  if (!completed.has(getDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (completed.has(getDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function parseTime(value: string): Date | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    return null;
  }

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

export default function HomeScreen() {
  useTranslation();
  const { profile, loading } = useProfile();

  if (loading || !profile) return null;

  const firstName =
    profile.name.trim().split(/\s+/)[0] || "there";

  return (
    <AccountHome
      key={profile.uid}
      uid={profile.uid}
      firstName={firstName}
    />
  );
}

function AccountHome({ uid, firstName }: { uid: string; firstName: string }) {
  useTranslation();

  const { preferences } = usePreferences();

  const habitsEnabled =
    preferences?.features.habits === true;

  const HABITS_KEY = `lifemate_habits_${uid}`;
  const router = useRouter();


  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitsLoaded, setHabitsLoaded] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitSubtitle, setNewHabitSubtitle] = useState("");
  const [habitError, setHabitError] = useState("");

  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("Personal");
  const [manualTime, setManualTime] = useState("");
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  const [newTaskDueDate, setNewTaskDueDate] = useState(getDateKey());
  const [pickerDate, setPickerDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [taskError, setTaskError] = useState("");

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [storageError, setStorageError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setTasksLoaded(false);
    setHabitsLoaded(false);
    setStorageError("");
    async function load() {
      try {
        const [rawTasks, rawHabits] = await Promise.all([
          getTasks(uid),
          AsyncStorage.getItem(HABITS_KEY),
        ]);
        const t = rawTasks;
        const h = rawHabits === null ? [] : JSON.parse(rawHabits);
        if (!Array.isArray(t) || !t.every((x: any) => x && typeof x.id === "string" && typeof x.title === "string" && typeof x.completed === "boolean" && typeof x.dueDate === "string" && typeof x.category === "string" && typeof x.createdAt === "string" && (x.scheduledTime === null || typeof x.scheduledTime === "string")) ||
            !Array.isArray(h) || !h.every((x: any) => x && typeof x.id === "string" && typeof x.title === "string" && typeof x.subtitle === "string" && typeof x.createdAt === "string" && Array.isArray(x.completedDates) && x.completedDates.every((d: unknown) => typeof d === "string"))) {
          throw new Error("Invalid stored records");
        }
        if (!active || auth.currentUser?.uid !== uid) return;
        setTasks(t);
        setHabits(h);
        setTasksLoaded(true);
        setHabitsLoaded(true);
      } catch (error) {
        if (active) setStorageError(tr("ui.s131"));
      }
    }
    void load();
    return () => { active = false; };
  }, [uid, retry]);

  const busy = useRef(false);
  const [saving, setSaving] = useState(false);
  useFocusEffect(useCallback(() => {
    let active = true;
    getTasks(uid).then(data => { if (active && auth.currentUser?.uid === uid) setTasks(data); }).catch(() => { if (active) setStorageError(tr("ui.s132")); });
    return () => { active = false; };
  }, [uid]));
  async function mutate(action: () => Promise<Task[]>) {
    if (busy.current || !tasksLoaded) return false;
    busy.current = true; setSaving(true);
    try {
      const data = await action();
      if (auth.currentUser?.uid !== uid) return false;
      setTasks(data); return true;
    } catch (e) {
      if (e instanceof Error && e.message === "DUPLICATE_TASK") setTaskError(tr("ui.s133"));
      else Alert.alert(tr("ui.s134"), tr("ui.s118"));
      return false;
    } finally { busy.current = false; setSaving(false); }
  }

  useEffect(() => {
    if (!habitsLoaded || auth.currentUser?.uid !== uid) return;
    AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits)).catch(() => {
      setStorageError(tr("ui.s135"));
    });
  }, [habits, habitsLoaded, uid]);

  const todayKey = getDateKey();
  const weekDays = getLastSevenDays();
  const todayTasks = tasks.filter((task) => task.dueDate === todayKey);
  const completedTasks = todayTasks.filter((task) => task.completed).length;
  const taskProgress =
    todayTasks.length === 0 ? 0 : (completedTasks / todayTasks.length) * 100;

  const completedHabits = habits.filter((habit) =>
    habit.completedDates.includes(todayKey),
  ).length;

  const toggleTask = (id: string) => { void mutate(() => toggleStoredTask(uid, id)); };

  const chooseClockTime = () => {
    Keyboard.dismiss();
    setTaskError("");
    setShowTimePicker(true);
  };

  const onClockChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (event.type === "dismissed" || !selectedDate) return;

    setPickerDate(selectedDate);

    const formatted = formatTime(selectedDate);
    setManualTime(formatted);
    setScheduledTime(formatted);
    setTaskError("");
  };

  const addTask = async () => {
    if (!tasksLoaded || busy.current) return;
    const title = newTaskTitle.trim();

    if (!title) {
      setTaskError(tr("ui.s119"));
      return;
    }

    const dueDateValue = newTaskDueDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDateValue)) {
      setTaskError(tr("ui.s136"));
      return;
    }
    const dateParts = dueDateValue.split("-").map(Number);
    const checkedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    if (
      checkedDate.getFullYear() !== dateParts[0] ||
      checkedDate.getMonth() !== dateParts[1] - 1 ||
      checkedDate.getDate() !== dateParts[2]
    ) {
      setTaskError(tr("ui.s137"));
      return;
    }

    let finalTime: string | null = null;

    if (manualTime.trim()) {
      const parsed = parseTime(manualTime);

      if (!parsed) {
        setTaskError(tr("ui.s138"));
        return;
      }

      finalTime = formatTime(parsed);
    }

    if (dueDateValue < getDateKey()) {
      setTaskError(tr("ui.s122"));
      return;
    }
    if (finalTime && dueDateValue === getDateKey()) {
      const time = parseTime(finalTime);
      if (time && time.getTime() < Date.now() - 60000) {
        setTaskError(tr("ui.s123"));
        return;
      }
    }

    const task: Task = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      category: newTaskCategory,
      completed: false,
      createdAt: new Date().toISOString(),
      scheduledTime: finalTime,
      dueDate: dueDateValue,
    };

    if (!(await mutate(() => createTask(uid, task)))) return;
    Alert.alert(tr("ui.s124"), `${title} · ${dueDateValue} · ${finalTime ?? tr("ui.s32")}`);

    setNewTaskTitle("");
    setNewTaskCategory("Personal");
    setManualTime("");
    setScheduledTime(null);
    setNewTaskDueDate(getDateKey());
    setTaskError("");
    setShowAddTask(false);
    setShowTimePicker(false);
    Keyboard.dismiss();
  };

  const deleteTask = (id: string) => {
    Alert.alert(tr("ui.s125"), tr("ui.s126"), [
      { text: tr("ui.s53"), style: "cancel" },
      { text: tr("ui.s54"), style: "destructive", onPress: () => { void mutate(() => deleteStoredTask(uid, id)); } },
    ]);
  };

  const toggleHabit = (id: string) => {
    setHabits((current) =>
      current.map((habit) => {
        if (habit.id !== id) return habit;

        const alreadyCompleted = habit.completedDates.includes(todayKey);
        return {
          ...habit,
          completedDates: alreadyCompleted
            ? habit.completedDates.filter((date) => date !== todayKey)
            : [...habit.completedDates, todayKey],
        };
      }),
    );
  };

  const addHabit = () => {
    if (!habitsLoaded) return;
    const title = newHabitTitle.trim();

    if (!title) {
      setHabitError(tr("ui.s120"));
      return;
    }

    const habit: Habit = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      subtitle: newHabitSubtitle.trim() || "",
      createdAt: new Date().toISOString(),
      completedDates: [],
    };

    setHabits((current) => [habit, ...current]);
    setNewHabitTitle("");
    setNewHabitSubtitle("");
    setHabitError("");
    setShowAddHabit(false);
    Keyboard.dismiss();
  };

  const deleteHabit = (id: string) => {
    Alert.alert(tr("ui.s127"), tr("ui.s128"), [
      { text: tr("ui.s53"), style: "cancel" },
      { text: tr("ui.s54"), style: "destructive", onPress: () => setHabits(current => current.filter(habit => habit.id !== id)) },
    ]);
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      await signOut(auth);
      router.replace("/(auth)/login");
    } catch (error: any) {
      console.log("LOGOUT FAILED:", error?.code, error?.message);
      setErrorMessage(tr("ui.s139"));
    } finally {
      setLoading(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={{flex: 1, minWidth: 0, marginEnd: 8}}>
            <Text style={styles.brand}>LifeMate AI</Text>
            <Text style={styles.greeting}>{tr("ui.s1")}{" "}{firstName === "there" ? tr("ui.s2") : firstName} 👋</Text>
            <Text style={styles.headerSubtitle}>{tr("ui.s3")}</Text>
          </View>

          <View style={styles.headerActions}>
           <ProfileAvatar
              name={firstName === "there" ? "" : firstName}
              size={44}
              onPress={() => router.push("/profile")}
            />
            <Pressable
              style={styles.iconButton}
              onPress={() => setShowLogoutConfirm(true)}
            >
              <LogOut size={19} color="#7561B5" />
            </Pressable>
          </View>
        </View>

        {storageError !== "" && (
          <View style={styles.addTaskCard}>
            <Text style={styles.formError}>{storageError}</Text>
            {!tasksLoaded && <Pressable onPress={() => setRetry(n => n + 1)}><Text style={styles.formTitle}>{tr("common.retry")}</Text></Pressable>}
          </View>
        )}
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View style={{flex: 1, minWidth: 0, marginEnd: 8}}>
              <Text style={styles.cardEyebrow}>{tr("ui.s4")}</Text>
              <Text style={styles.progressTitle}>{tr("ui.s5")}</Text>
              <Text style={styles.progressSubtitle}>{tr("ui.s6")}</Text>
            </View>
            <View style={styles.progressIcon}>
              <Target size={25} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.progressNumbers}>
            <Text style={styles.progressCount}>
              {completedTasks}/{todayTasks.length}
            </Text>
            <Text style={styles.progressPercent}>
              {Math.round(taskProgress)}{tr("ui.s7")}</Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${taskProgress}%` }]}
            />
          </View>

          <Text style={styles.progressBottom}>
            {todayTasks.length - completedTasks}{" "}{tr("ui.s8")}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#F0EAFE" }]}>
              <ListTodo size={20} color="#8B70D9" />
            </View>
            <Text style={styles.statNumber}>{todayTasks.length}</Text>
            <Text style={styles.statLabel}>{tr("ui.s9")}</Text>
          </View>

          {habitsEnabled && (
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#FFF0E7" }]}>
                <Flame size={20} color="#F29B59" />
              </View>
              <Text style={styles.statNumber}>{completedHabits}/{habits.length}</Text>
              <Text style={styles.statLabel}>{tr("ui.s10")}</Text>
            </View>
          )}

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#E9F7F0" }]}>
              <Check size={20} color="#46A77A" />
            </View>
            <Text style={styles.statNumber}>{completedTasks}</Text>
            <Text style={styles.statLabel}>{tr("ui.s11")}</Text>
          </View>
        </View>

        <Pressable
          style={styles.scheduleButton}
          onPress={() => router.push("/schedule")}
        >
          <CalendarDays size={18} color="#755DB7" />
          <Text style={styles.scheduleButtonText}>{tr("ui.s12")}</Text>
          <Text style={styles.scheduleButtonHint}>{tr("ui.s13")}</Text>
        </Pressable>

        <View style={styles.sectionHeader}>
          <View style={{flex: 1, minWidth: 0, marginEnd: 8}}>
            <Text style={styles.sectionTitle}>{tr("ui.s9")}</Text>
            <Text style={styles.sectionSubtitle}>{tr("ui.s14")}</Text>
          </View>

          <Pressable
            style={styles.addTaskButton}
            onPress={() => {
              setTaskError("");
              setShowAddTask(!showAddTask);
            }}
          >
            {showAddTask ? (
              <X size={17} color="#FFFFFF" />
            ) : (
              <Plus size={17} color="#FFFFFF" />
            )}
            <Text style={styles.addTaskButtonText}>
              {showAddTask ? tr("ui.s15") : tr("ui.s16")}
            </Text>
          </Pressable>
        </View>

        {showAddTask && (
          <View style={styles.addTaskCard}>
            <Text style={styles.formTitle}>{tr("ui.s17")}</Text>

            <TextInput
              style={styles.taskInput}
              placeholder={tr("ui.s18")}
              placeholderTextColor="#A7A1B2"
              value={newTaskTitle}
              onChangeText={(value) => {
                setNewTaskTitle(value);
                setTaskError("");
              }}
              maxLength={150}
              returnKeyType="done"
            />

            <Text style={styles.categoryLabel}>{tr("ui.s19")}</Text>

            <View style={styles.categoryRow}>
              {categories.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => setNewTaskCategory(category)}
                  style={[
                    styles.categoryChip,
                    newTaskCategory === category && styles.categoryChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      newTaskCategory === category &&
                        styles.categoryChipTextActive,
                    ]}
                  >
                    {tr(({Personal:"ui.s20",Study:"ui.s21",Work:"ui.s22",Health:"ui.s23"} as Record<string,string>)[category] || category)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.categoryLabel}>{tr("ui.s24")}</Text>
            <TextInput
              style={styles.taskInput}
              value={newTaskDueDate}
              onChangeText={(value) => {
                setNewTaskDueDate(value);
                setTaskError("");
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#A7A1B2"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
            <Text style={styles.dateHint}>{tr("ui.s25")}</Text>

            <Text style={styles.categoryLabel}>{tr("ui.s26")}</Text>

            <View style={styles.timeRow}>
              <View style={styles.timeInputWrapper}>
                <Clock size={17} color="#8B70D9" />
                <TextInput
                  style={styles.timeInput}
                  value={manualTime}
                  onChangeText={(value) => {
                    setManualTime(value);
                    setScheduledTime(null);
                    setTaskError("");
                  }}
                  placeholder="06:30 PM"
                  placeholderTextColor="#A7A1B2"
                  keyboardType="default"
                  autoCapitalize="characters"
                />
              </View>

              <Pressable style={styles.clockButton} onPress={chooseClockTime}>
                <Clock size={18} color="#FFFFFF" />
                <Text style={styles.clockButtonText}>{tr("ui.s27")}</Text>
              </Pressable>
            </View>

            {showTimePicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={pickerDate}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onClockChange}
                />

                {Platform.OS === "ios" && (
                  <Pressable
                    style={styles.pickerDone}
                    onPress={() => setShowTimePicker(false)}
                  >
                    <Text style={styles.pickerDoneText}>{tr("common.done")}</Text>
                  </Pressable>
                )}
              </View>
            )}

            {taskError !== "" && (
              <Text style={styles.formError}>{taskError}</Text>
            )}

            <Pressable style={styles.saveTaskButton} onPress={addTask} disabled={!tasksLoaded || saving}>
              <Text style={styles.saveTaskText}>{saving ? tr("ui.s28") : tr("ui.s29")}</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.taskCard}>
          {!tasksLoaded ? (
            <ActivityIndicator color="#8B70D9" style={{ padding: 25 }} />
          ) : todayTasks.length === 0 ? (
            <View style={styles.emptyTasks}>
              <ListTodo size={28} color="#B7A9D9" />
              <Text style={styles.emptyTitle}>{tr("ui.s30")}</Text>
              <Text style={styles.emptySubtitle}>{tr("ui.s31")}</Text>
            </View>
          ) : (
            todayTasks.map((task, index) => (
              <View key={task.id}>
                <View style={styles.taskRow}>
                  <Pressable
                    style={styles.taskMain}
                    onPress={() => toggleTask(task.id)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        task.completed && styles.checkboxCompleted,
                      ]}
                    >
                      {task.completed && (
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      )}
                    </View>
                    <View style={styles.taskDetails}>
                      <Text
                        style={[
                          styles.taskTitle,
                          task.completed && styles.completedText,
                        ]}
                      >
                        {task.title}
                      </Text>

                      <View style={styles.taskMeta}>
                        <Text style={styles.taskTime}>
                          {task.scheduledTime || tr("ui.s32")}
                        </Text>
                        <View style={styles.categoryDot} />
                        <Text style={styles.taskCategory}>{tr(({Personal:"ui.s20",Study:"ui.s21",Work:"ui.s22",Health:"ui.s23"} as Record<string,string>)[task.category] || task.category)}</Text>
                      </View>
                    </View>
                  </Pressable>

                  <View style={styles.taskActions}>
                    {task.completed && (
                      <Text style={styles.doneLabel}>{tr("common.done")}</Text>
                    )}
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => deleteTask(task.id)}
                    >
                      <Trash2 size={15} color="#B5A9C9" />
                    </Pressable>
                  </View>
                </View>

                {index !== todayTasks.length - 1 && (
                  <View style={styles.taskDivider} />
                )}
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{tr("ui.s33")}</Text></View>
        <View style={styles.taskCard}>
          {tasks.filter(t => t.dueDate > todayKey && !t.completed).length === 0 ? <Text style={styles.emptySubtitle}>{tr("ui.s34")}</Text> : tasks.filter(t => t.dueDate > todayKey && !t.completed).sort((a,b) => a.dueDate.localeCompare(b.dueDate)).slice(0,5).map(t => <View key={t.id} style={styles.taskRow}><View style={styles.taskDetails}><Text style={styles.taskTitle}>{t.title}</Text><Text style={styles.taskTime}>{t.dueDate} · {t.scheduledTime ?? tr("ui.s32")}</Text></View></View>)}
          <Pressable style={styles.taskRow} onPress={() => router.push("/schedule")}><Text style={styles.scheduleButtonText}>{tr("ui.s35")}</Text></Pressable>
        </View>
        {habitsEnabled && (
          <>
            <View style={styles.sectionHeader}>
              <View style={{flex: 1, minWidth: 0, marginEnd: 8}}>
                <Text style={styles.sectionTitle}>{tr("ui.s36")}</Text>
            <Text style={styles.sectionSubtitle}>{tr("ui.s37")}</Text>
          </View>

          <Pressable
            style={styles.addTaskButton}
            onPress={() => {
              setHabitError("");
              setShowAddHabit((current) => !current);
            }}
          >
            {showAddHabit ? (
              <X size={17} color="#FFFFFF" />
            ) : (
              <Plus size={17} color="#FFFFFF" />
            )}
            <Text style={styles.addTaskButtonText}>
              {showAddHabit ? tr("ui.s15") : tr("ui.s38")}
            </Text>
          </Pressable>
        </View>

        {showAddHabit && (
          <View style={styles.addTaskCard}>
            <Text style={styles.formTitle}>{tr("ui.s39")}</Text>
            <TextInput
              style={styles.taskInput}
              placeholder={tr("ui.s40")}
              placeholderTextColor="#A7A1B2"
              value={newHabitTitle}
              onChangeText={(value) => {
                setNewHabitTitle(value);
                setHabitError("");
              }}
              maxLength={60}
              returnKeyType="next"
            />
            <TextInput
              style={[styles.taskInput, styles.habitSubtitleInput]}
              placeholder={tr("ui.s41")}
              placeholderTextColor="#A7A1B2"
              value={newHabitSubtitle}
              onChangeText={setNewHabitSubtitle}
              maxLength={80}
              returnKeyType="done"
            />
            {habitError !== "" && (
              <Text style={styles.formError}>{habitError}</Text>
            )}
            <Pressable style={styles.saveTaskButton} onPress={addHabit} disabled={!habitsLoaded}>
              <Text style={styles.saveTaskText}>{tr("ui.s42")}</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.weeklyCard}>
          <View style={styles.weeklyHeader}>
            <View>
              <Text style={styles.weeklyTitle}>{tr("ui.s43")}</Text>
              <Text style={styles.weeklySubtitle}>{tr("ui.s44")}</Text>
            </View>
            <Text style={styles.weeklyCount}>
              {habits.reduce(
                (total, habit) =>
                  total +
                  habit.completedDates.filter((date) =>
                    weekDays.some((day) => day.key === date),
                  ).length,
                0,
              )}{" "}
              {tr("common.done")}
            </Text>
          </View>
          <View style={styles.weekDaysRow}>
            {weekDays.map((day) => {
              const doneCount = habits.filter((habit) =>
                habit.completedDates.includes(day.key),
              ).length;
              return (
                <View key={day.key} style={styles.weekDay}>
                  <Text style={styles.weekDayLabel}>{day.label}</Text>
                  <View
                    style={[
                      styles.weekDayDot,
                      doneCount > 0 && styles.weekDayDotActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.weekDayNumber,
                        doneCount > 0 && styles.weekDayNumberActive,
                      ]}
                    >
                      {doneCount}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.habitCard}>
          {!habitsLoaded ? (
            <ActivityIndicator color="#8B70D9" style={{ padding: 25 }} />
          ) : habits.length === 0 ? (
            <View style={styles.emptyTasks}>
              <Flame size={27} color="#B7A9D9" />
              <Text style={styles.emptyTitle}>{tr("ui.s45")}</Text>
              <Text style={styles.emptySubtitle}>{tr("ui.s46")}</Text>
            </View>
          ) : (
            habits.map((habit, index) => {
              const completedToday = habit.completedDates.includes(todayKey);
              const streak = getHabitStreak(habit.completedDates);
              const lastSevenDone = weekDays.filter((day) =>
                habit.completedDates.includes(day.key),
              ).length;

              return (
                <View key={habit.id}>
                  <View style={styles.habitRow}>
                    <Pressable
                      style={styles.habitMain}
                      onPress={() => toggleHabit(habit.id)}
                    >
                      <View
                        style={[
                          styles.habitCheck,
                          completedToday && styles.habitCheckCompleted,
                        ]}
                      >
                        {completedToday && (
                          <Check size={13} color="#FFFFFF" strokeWidth={3} />
                        )}
                      </View>

                      <View style={styles.habitDetails}>
                        <Text style={styles.habitTitle}>{habit.title}</Text>
                        <Text style={styles.habitSubtitle}>
                          {habit.subtitle || tr("ui.s121")}
                        </Text>
                        <View style={styles.habitMetaRow}>
                          <Flame size={12} color="#F29B59" />
                          <Text style={styles.habitMetaText}>
                            {streak}{" "}{tr("ui.s47")}</Text>
                          <Text style={styles.habitMetaSeparator}>·</Text>
                          <Text style={styles.habitMetaText}>
                            {lastSevenDone}{tr("ui.s48")}</Text>
                        </View>
                      </View>
                    </Pressable>

                    <View style={styles.habitActions}>
                      <Text
                        style={[
                          styles.habitStatus,
                          completedToday && styles.habitStatusDone,
                        ]}
                      >
                        {completedToday ? tr("common.done") : tr("ui.s49")}
                      </Text>
                      <Pressable
                        style={styles.deleteButton}
                        onPress={() => deleteHabit(habit.id)}
                        accessibilityLabel={`${tr("ui.s54")} ${habit.title}`}
                      >
                        <Trash2 size={14} color="#B5A9C9" />
                      </Pressable>
                    </View>
                  </View>

                  {index !== habits.length - 1 && (
                    <View style={styles.taskDivider} />
                  )}
                </View>
              );
            })
          )}
        </View>
          </>
)}

        <View style={styles.aiCard}>
          <View style={styles.aiIcon}>
            <Sparkles size={23} color="#FFFFFF" />
          </View>
          <View style={styles.aiTextContainer}>
            <Text style={styles.aiTitle}>{tr("ui.s50")}</Text>
            <Text style={styles.aiSubtitle}>{tr("ui.s51")}</Text>
          </View>
        </View>

        <Text style={styles.bottomMessage}>{tr("ui.s52")}</Text>
      </ScrollView>

      {showLogoutConfirm && (
        <View style={styles.overlay}>
          <View style={styles.logoutModal}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setShowLogoutConfirm(false)}
            >
              <X size={19} color="#817B96" />
            </Pressable>

            <View style={styles.modalIcon}>
              <LogOut size={23} color="#8B70D9" />
            </View>

            <Text style={styles.modalTitle}>{tr("ui.s55")}</Text>
            <Text style={styles.modalSubtitle}>{tr("ui.s56")}</Text>

            {errorMessage !== "" && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowLogoutConfirm(false)}
                disabled={loading}
              >
                <Text style={styles.cancelText}>{tr("ui.s53")}</Text>
              </Pressable>

              <Pressable
                style={styles.confirmButton}
                onPress={handleLogout}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmText}>{tr("ui.s57")}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF9FF" },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 35 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 23,
  },
  brand: { color: "#8B70D9", fontSize: 15, fontWeight: "900", marginBottom: 9 },
  greeting: { color: "#25213A", fontSize: 26, fontWeight: "900" },
  headerSubtitle: { color: "#817B96", fontSize: 13, marginTop: 5 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: "#8B70D9",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#F0EAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  progressCard: {
    backgroundColor: "#8B70D9",
    borderRadius: 23,
    padding: 20,
    marginBottom: 16,
  },
  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardEyebrow: {
    color: "#E8DFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  progressTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    marginTop: 8,
  },
  progressSubtitle: { color: "#EEE8FF", fontSize: 12, marginTop: 5 },
  progressIcon: {
    width: 47,
    height: 47,
    borderRadius: 16,
    backgroundColor: "#A38CE8",
    alignItems: "center",
    justifyContent: "center",
  },
  progressNumbers: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 23,
    marginBottom: 10,
  },
  progressCount: { color: "#FFFFFF", fontSize: 23, fontWeight: "900" },
  progressPercent: { color: "#F0EAFF", fontSize: 12, fontWeight: "700" },
  progressTrack: {
    height: 8,
    backgroundColor: "#B9A8ED",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  progressBottom: { color: "#F0EAFF", fontSize: 11, marginTop: 10 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 26 },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 13,
    borderWidth: 1,
    borderColor: "#EEE9F6",
  },
  statIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },
  statNumber: { color: "#25213A", fontSize: 19, fontWeight: "900" },
  statLabel: { flexShrink: 1, color: "#817B96", fontSize: 10, marginTop: 4 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },
  sectionTitle: { color: "#25213A", fontSize: 19, fontWeight: "900" },
  sectionSubtitle: { color: "#9991AB", fontSize: 12, marginTop: 4 },
  scheduleButton: {
    backgroundColor: "#F0EAFE",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 20,
  },
  scheduleButtonText: { flexShrink: 1, color: "#755DB7", fontSize: 12, fontWeight: "900" },
  scheduleButtonHint: { flexShrink: 1, color: "#9A8BBE", fontSize: 10, marginLeft: "auto" },
  addTaskButton: {
    backgroundColor: "#8B70D9",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addTaskButtonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  addTaskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#E8E1F3",
  },
  formTitle: {
    color: "#25213A",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 13,
  },
  taskInput: {
    height: 48,
    backgroundColor: "#FBF9FF",
    borderWidth: 1,
    borderColor: "#EAE4F3",
    borderRadius: 12,
    paddingHorizontal: 13,
    color: "#25213A",
    fontSize: 13,
  },
  dateHint: { color: "#A39AAF", fontSize: 10, marginTop: 6 },
  categoryLabel: {
    color: "#817B96",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 15,
    marginBottom: 9,
  },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F4F0FA",
  },
  categoryChipActive: { backgroundColor: "#8B70D9" },
  categoryChipText: { color: "#756B88", fontSize: 10, fontWeight: "700" },
  categoryChipTextActive: { color: "#FFFFFF" },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  timeInputWrapper: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#EAE4F3",
    borderRadius: 12,
    backgroundColor: "#FBF9FF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  timeInput: { flex: 1, color: "#25213A", fontSize: 14, paddingVertical: 8 },
  clockButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#8B70D9",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  clockButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  pickerContainer: { marginTop: 12, alignItems: "center" },
  pickerDone: {
    backgroundColor: "#F0EAFE",
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 10,
  },
  pickerDoneText: { color: "#755DB7", fontWeight: "800" },
  formError: { color: "#C43D3D", fontSize: 11, marginTop: 10 },
  saveTaskButton: {
    backgroundColor: "#8B70D9",
    borderRadius: 12,
    padding: 13,
    alignItems: "center",
    marginTop: 15,
  },
  saveTaskText: { color: "#FFFFFF", fontWeight: "800", fontSize: 12 },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    paddingHorizontal: 15,
    marginBottom: 27,
    borderWidth: 1,
    borderColor: "#EEE9F6",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  taskMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#D9D0E9",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCompleted: { backgroundColor: "#8B70D9", borderColor: "#8B70D9" },
  taskDetails: { flex: 1 },
  taskTitle: { color: "#302B43", fontSize: 13, fontWeight: "700" },
  completedText: { color: "#A7A1B2", textDecorationLine: "line-through" },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    gap: 5,
  },
  taskTime: { color: "#9991AB", fontSize: 10 },
  categoryDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#B9B0CA",
    marginHorizontal: 3,
  },
  taskCategory: { color: "#8B70D9", fontSize: 10, fontWeight: "700" },
  taskActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  doneLabel: { color: "#46A77A", fontSize: 10, fontWeight: "800" },
  deleteButton: { padding: 6 },
  taskDivider: { height: 1, backgroundColor: "#F1EDF6" },
  emptyTasks: { alignItems: "center", padding: 25 },
  emptyTitle: {
    color: "#302B43",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 10,
  },
  emptySubtitle: { color: "#9991AB", fontSize: 11, marginTop: 5 },
  habitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    paddingHorizontal: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#EEE9F6",
  },
  weeklyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEE9F6",
  },
  weeklyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weeklyTitle: { color: "#302B43", fontSize: 13, fontWeight: "900" },
  weeklySubtitle: { color: "#9991AB", fontSize: 10, marginTop: 4 },
  weeklyCount: { color: "#8B70D9", fontSize: 12, fontWeight: "900" },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  weekDay: { alignItems: "center", gap: 7 },
  weekDayLabel: { color: "#9991AB", fontSize: 10, fontWeight: "700" },
  weekDayDot: {
    width: 27,
    height: 27,
    borderRadius: 10,
    backgroundColor: "#F4F0FA",
    alignItems: "center",
    justifyContent: "center",
  },
  weekDayDotActive: { backgroundColor: "#8B70D9" },
  weekDayNumber: { color: "#817B96", fontSize: 10, fontWeight: "800" },
  weekDayNumberActive: { color: "#FFFFFF" },
  habitSubtitleInput: { marginTop: 9 },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    gap: 8,
  },
  habitMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  habitActions: { alignItems: "flex-end", gap: 5 },
  habitMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 7,
  },
  habitMetaText: { color: "#A39AAF", fontSize: 9, fontWeight: "600" },
  habitMetaSeparator: { color: "#C4BBD3", fontSize: 10 },
  habitCheck: {
    width: 23,
    height: 23,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#D9D0E9",
    alignItems: "center",
    justifyContent: "center",
  },
  habitCheckCompleted: { backgroundColor: "#8B70D9", borderColor: "#8B70D9" },
  habitDetails: { flex: 1 },
  habitTitle: { color: "#302B43", fontSize: 13, fontWeight: "700" },
  habitSubtitle: { color: "#9991AB", fontSize: 10, marginTop: 4 },
  habitStatus: { color: "#9991AB", fontSize: 10, fontWeight: "700" },
  habitStatusDone: { color: "#46A77A" },
  aiCard: {
    backgroundColor: "#F0EAFE",
    borderRadius: 19,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  aiIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#8B70D9",
    alignItems: "center",
    justifyContent: "center",
  },
  aiTextContainer: { flex: 1 },
  aiTitle: { color: "#30264B", fontSize: 13, fontWeight: "900" },
  aiSubtitle: { color: "#817B96", fontSize: 10, lineHeight: 16, marginTop: 4 },
  bottomMessage: {
    textAlign: "center",
    color: "#A7A1B2",
    fontSize: 11,
    marginTop: 25,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(35, 27, 55, 0.38)",
    justifyContent: "center",
    alignItems: "center",
    padding: 22,
  },
  logoutModal: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
  },
  closeButton: { alignSelf: "flex-end", padding: 4 },
  modalIcon: {
    width: 49,
    height: 49,
    borderRadius: 16,
    backgroundColor: "#F0EAFE",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  modalTitle: {
    color: "#25213A",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 17,
  },
  modalSubtitle: {
    color: "#817B96",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 19,
  },
  errorText: { color: "#D14343", fontSize: 12, marginTop: 12 },
  modalButtons: { flexDirection: "row", gap: 10, width: "100%", marginTop: 22 },
  cancelButton: {
    flex: 1,
    height: 47,
    borderRadius: 13,
    backgroundColor: "#F0EAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { color: "#6D5A9E", fontSize: 12, fontWeight: "800" },
  confirmButton: {
    flex: 1,
    height: 47,
    borderRadius: 13,
    backgroundColor: "#8B70D9",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
});

import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "./firebase";

export type Task = {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  createdAt: string;
  scheduledTime: string | null;
  dueDate: string;
};

function getStorageKey(uid: string) {
  if (auth.currentUser?.uid !== uid) {
    throw new Error("Invalid user session.");
  }

  return `lifemate_tasks_${uid}`;
}

function normalizeTitle(title: string) {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isDuplicateTask(a: Task, b: Task) {
  return (
    normalizeTitle(a.title) === normalizeTitle(b.title) &&
    a.dueDate === b.dueDate &&
    a.scheduledTime === b.scheduledTime
  );
}

export async function getTasks(uid: string): Promise<Task[]> {
  const raw = await AsyncStorage.getItem(getStorageKey(uid));

  if (!raw) return [];

  const tasks = JSON.parse(raw);

  if (!Array.isArray(tasks)) {
    throw new Error("Invalid task data.");
  }

  return tasks;
}

let pending: Promise<unknown> = Promise.resolve();

export function updateTasks(
  uid: string,
  update: (tasks: Task[]) => Task[]
): Promise<Task[]> {
  const operation = pending.then(async () => {
    const current = await getTasks(uid);
    const updated = update(current);

    await AsyncStorage.setItem(
      getStorageKey(uid),
      JSON.stringify(updated)
    );

    return updated;
  });

  pending = operation.catch(() => undefined);

  return operation;
}

export function createTask(uid: string, task: Task) {
  return updateTasks(uid, (tasks) => {
    if (tasks.some((existing) => isDuplicateTask(existing, task))) {
      throw new Error("DUPLICATE_TASK");
    }

    return [task, ...tasks];
  });
}

export function toggleStoredTask(uid: string, id: string) {
  return updateTasks(uid, (tasks) =>
    tasks.map((task) =>
      task.id === id
        ? { ...task, completed: !task.completed }
        : task
    )
  );
}

export function deleteStoredTask(uid: string, id: string) {
  return updateTasks(uid, (tasks) =>
    tasks.filter((task) => task.id !== id)
  );
}
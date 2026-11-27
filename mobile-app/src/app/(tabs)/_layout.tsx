
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

import {
  House,
  CalendarDays,
  ChartNoAxesCombined,
  LockKeyhole,
  Menu,
} from "lucide-react-native";

const PURPLE = "#8B70D9";
const MUTED = "#817B96";

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: PURPLE,
        tabBarInactiveTintColor: MUTED,

        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#EAE4F3",
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          elevation: 8,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          textAlign: "center",
        },

        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color, size }) => (
            <House color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="schedule"
        options={{
          title: t("tabs.planner"),
          tabBarIcon: ({ color, size }) => (
            <CalendarDays color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="journey"
        options={{
          title: t("tabs.journey"),
          tabBarIcon: ({ color, size }) => (
            <ChartNoAxesCombined
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="private"
        options={{
          title: t("tabs.private"),
          tabBarIcon: ({ color, size }) => (
            <LockKeyhole color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: t("tabs.more"),
          tabBarIcon: ({ color, size }) => (
            <Menu color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

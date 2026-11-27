
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { Search, Check, ChevronDown } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../i18n";
const PURPLE = "#8B70D9";
const DARK = "#25213A";
const MUTED = "#817B96";

export const LANGUAGES = SUPPORTED_LANGUAGES.map(item => ({code: item.code, name: item.name, native: item.nativeName}));

export function getLanguageName(value: string): string {
  const language = LANGUAGES.find(
    (item) =>
      item.code === value ||
      item.name === value ||
      item.native === value
  );
return language?.native ?? value;
  
}

type Props = {
  value: string;
  onChange: (language: string) => void;
};

export default function LanguageSelector({
  value,
  onChange,
}: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);

  const query = search.trim().toLowerCase();

  const filtered = LANGUAGES.filter(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      item.native.toLowerCase().includes(query) ||
      item.code.toLowerCase() === query
  );

  const visibleLanguages =
    query || expanded
      ? filtered
      : LANGUAGES.filter(
          (item, index) =>
            index < 5 ||
            item.code === value ||
            item.name === value ||
            item.native === value
        );

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Search size={20} color={MUTED} />

        <TextInput
          style={styles.searchInput}
          placeholder={t("language.search")}
          placeholderTextColor={MUTED}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />

        {search.length > 0 && (
          <Pressable
            onPress={() => setSearch("")}
            accessibilityLabel={t("language.clear")}
          >
            <Text style={styles.clear}>✕</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.heading}>
        {query
          ? t("language.results")
          : expanded
            ? t("language.all")
            : t("language.popular")}
      </Text>

      {visibleLanguages.map((item) => {
        const selected =
          value === item.code ||
          value === item.name ||
          value === item.native;

        return (
          <Pressable
            key={item.code}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            style={[
              styles.option,
              selected && styles.selectedOption,
            ]}
            onPress={() => onChange(item.code)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.nativeName}>
                {item.native}
              </Text>

              {item.native !== item.name && (
                <Text style={styles.englishName}>
                  {item.name}
                </Text>
              )}
            </View>

            <View
              style={[
                styles.radio,
                selected && styles.selectedRadio,
              ]}
            >
              {selected && (
                <Check size={14} color="#FFFFFF" />
              )}
            </View>
          </Pressable>
        );
      })}

      {visibleLanguages.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            {t("language.notFound")}
          </Text>

          <Text style={styles.hint}>
            {t("language.searchHint")}
          </Text>
        </View>
      )}

      {!query && (
        <Pressable
          style={styles.expandButton}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.expandText}>
            {expanded
              ? t("language.showLess")
              : t("language.viewAll", { count: LANGUAGES.length })}
          </Text>

          <ChevronDown
            size={18}
            color={PURPLE}
            style={{
              transform: [
                { rotate: expanded ? "180deg" : "0deg" },
              ],
            }}
          />
        </Pressable>
      )}

      <View style={styles.selection}>
        <Check size={17} color={PURPLE} />

        <Text style={styles.selectionText}>
          {t("language.selected", { name: getLanguageName(value) })}
        </Text>
      </View>

      <Text style={styles.hint}>
        {t("language.hint")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE4F3",
    borderRadius: 15,
    paddingHorizontal: 15,
    minHeight: 54,
  },
  searchInput: {
    flex: 1,
    color: DARK,
    fontSize: 14,
    paddingVertical: 12,
  },
  clear: {
    color: MUTED,
    fontSize: 16,
    padding: 5,
  },
  heading: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
  },
  option: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE4F3",
    borderRadius: 15,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectedOption: {
    backgroundColor: "#F0EAFE",
    borderColor: PURPLE,
  },
  nativeName: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK,
  },
  englishName: {
    fontSize: 12,
    color: MUTED,
    marginTop: 4,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedRadio: {
    backgroundColor: PURPLE,
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
  },
  expandText: {
    color: PURPLE,
    fontSize: 14,
    fontWeight: "700",
  },
  selection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0EAFE",
    borderRadius: 12,
    padding: 12,
  },
  selectionText: {
    flex: 1,
    color: DARK,
    fontWeight: "600",
    fontSize: 13,
  },
  hint: {
    fontSize: 12,
    color: MUTED,
    lineHeight: 19,
  },
  empty: {
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    color: DARK,
    fontWeight: "700",
  },
});

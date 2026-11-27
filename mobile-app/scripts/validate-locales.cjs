
const fs = require("node:fs");
const path = require("node:path");

const directory = path.join(
  __dirname,
  "../src/i18n/locales"
);

const languages = [
  "en", "te", "hi", "ta", "kn",
  "ml", "mr", "bn", "es", "ar"
];

function readLocale(code) {
  return JSON.parse(
    fs.readFileSync(
      path.join(directory, `${code}.json`),
      "utf8"
    )
  );
}

function flatten(object, prefix = "") {
  const result = {};

  for (const [key, value] of Object.entries(object)) {
    const fullKey = prefix
      ? `${prefix}.${key}`
      : key;

    if (value !== null && typeof value === "object") {
      Object.assign(result, flatten(value, fullKey));
    } else {
      result[fullKey] = value;
    }
  }

  return result;
}

function getPlaceholders(value) {
  if (typeof value !== "string") {
    return [];
  }

  return [...value.matchAll(/{{\s*(\w+)\s*}}/g)]
    .map((match) => match[1])
    .sort();
}

const reference = flatten(readLocale("en"));
const requiredKeys = Object.keys(reference);

let failed = false;

for (const code of languages) {
  const issues = [];

  try {
    const locale = flatten(readLocale(code));

    for (const key of requiredKeys) {
      if (!(key in locale)) {
        issues.push(`Missing key: ${key}`);
        continue;
      }

      const value = locale[key];

      if (
        typeof value !== "string" ||
        !value.trim()
      ) {
        issues.push(`Invalid or empty value: ${key}`);
        continue;
      }

      const expected = getPlaceholders(reference[key]);
      const actual = getPlaceholders(value);

      if (
        JSON.stringify(expected) !==
        JSON.stringify(actual)
      ) {
        issues.push(`Placeholder mismatch: ${key}`);
      }
    }

    for (const key of Object.keys(locale)) {
      if (!(key in reference)) {
        issues.push(`Unexpected key: ${key}`);
      }
    }

    if (issues.length === 0) {
      console.log(
        `PASS ${code}: ${requiredKeys.length} keys validated`
      );
    } else {
      failed = true;

      console.error(`FAIL ${code}:`);

      for (const issue of issues) {
        console.error(`  - ${issue}`);
      }
    }
  } catch (error) {
    failed = true;

    console.error(
      `FAIL ${code}: ${error.message}`
    );
  }
}

if (failed) {
  console.error("\nTranslation validation failed.");
  process.exitCode = 1;
} else {
  console.log("\nAll 10 languages passed validation.");
}

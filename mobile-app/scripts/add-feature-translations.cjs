const fs = require("fs");
const path = require("path");

const translations = {
  en: "Disabling a feature hides it without deleting your saved data.",

  te: "ఒక ఫీచర్‌ను నిలిపివేస్తే అది కనిపించదు. మీరు సేవ్ చేసిన సమాచారం తొలగించబడదు.",

  hi: "किसी सुविधा को बंद करने पर वह छिप जाती है, लेकिन आपका सहेजा गया डेटा नहीं मिटता।",

  ta: "ஒரு அம்சத்தை முடக்கினால் அது மறைக்கப்படும். சேமித்த தரவு நீக்கப்படாது.",

  kn: "ವೈಶಿಷ್ಟ್ಯವನ್ನು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿದರೆ ಅದು ಮರೆಯಾಗುತ್ತದೆ. ಉಳಿಸಿದ ಡೇಟಾ ಅಳಿಸಲ್ಪಡುವುದಿಲ್ಲ.",

  ml: "ഒരു ഫീച്ചർ പ്രവർത്തനരഹിതമാക്കിയാൽ അത് മറയ്ക്കപ്പെടും. സംരക്ഷിച്ച ഡാറ്റ ഇല്ലാതാകില്ല.",

  mr: "एखादे वैशिष्ट्य बंद केल्यास ते लपवले जाते, परंतु जतन केलेली माहिती हटवली जात नाही.",

  bn: "কোনো ফিচার বন্ধ করলে সেটি লুকানো হবে, কিন্তু সংরক্ষিত তথ্য মুছে যাবে না।",

  es: "Desactivar una función la oculta sin eliminar los datos guardados.",

  ar: "يؤدي تعطيل الميزة إلى إخفائها دون حذف بياناتك المحفوظة.",
};

const localeDir = path.join(
  __dirname,
  "../src/i18n/locales"
);

for (const [language, message] of Object.entries(
  translations
)) {
  const filePath = path.join(
    localeDir,
    `${language}.json`
  );

  const data = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  );

  data.manageFeatures = {
    ...data.manageFeatures,
    dataSafety: message,
  };

  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2) + "\n",
    "utf8"
  );

  console.log(`Updated ${language}`);
}

console.log("Feature translations added successfully.");
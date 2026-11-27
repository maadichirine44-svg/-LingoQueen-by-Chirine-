import { LanguageId } from '../types';

export interface WordOfTheDayEntry {
  id: string;
  languageId: LanguageId;
  word: string;
  phonetic: string;
  english: string;
  arabicFusha: string;
  example: string;
  exampleEnglish: string;
  exampleArabic: string;
}

export const WORD_OF_THE_DAY_POOL: WordOfTheDayEntry[] = [
  {
    id: 'wotd-fr-1',
    languageId: 'fr',
    word: 'Épanouissement',
    phonetic: 'ay-pa-nwee-smahn',
    english: 'Personal flourishing & fulfillment',
    arabicFusha: 'الازدهار والنماء الشخصي',
    example: 'La lecture quotidienne favorise l’épanouissement de l’esprit.',
    exampleEnglish: 'Daily reading nurtures the flourishing of the mind.',
    exampleArabic: 'تُعزّز القراءة اليومية ازدهار العقل ونماءه.',
  },
  {
    id: 'wotd-en-1',
    languageId: 'en',
    word: 'Serendipity',
    phonetic: 'seh-run-dip-ih-tee',
    english: 'A fortunate discovery made unexpectedly',
    arabicFusha: 'المصادفة السعيدة والاكتشاف الموفّق',
    example: 'Finding that quiet bookshop in Algiers was pure serendipity.',
    exampleEnglish: 'Finding that quiet bookshop in Algiers was pure serendipity.',
    exampleArabic: 'كان العثور على تلك المكتبة الهادئة في الجزائر مصادفةً سعيدة بحق.',
  },
  {
    id: 'wotd-es-1',
    languageId: 'es',
    word: 'Sobremesa',
    phonetic: 'so-bre-me-sa',
    english: 'Warm conversation lingering after a shared meal',
    arabicFusha: 'السمر الودّي والحديث بعد الطعام',
    example: 'La sobremesa con la familia dura siempre más que la cena.',
    exampleEnglish: 'The after-dinner talk with family always lasts longer than dinner itself.',
    exampleArabic: 'يمتد الحديث الدافئ مع العائلة بعد الطعام أطول من العشاء نفسه.',
  },
  {
    id: 'wotd-it-1',
    languageId: 'it',
    word: 'Meraviglia',
    phonetic: 'meh-rah-vee-lya',
    english: 'Sense of wonder & marvel',
    arabicFusha: 'الدهشة والروعة البديعة',
    example: 'Osservare l’alba sul mare riempie il cuore di meraviglia.',
    exampleEnglish: 'Watching sunrise over the sea fills the heart with wonder.',
    exampleArabic: 'تأمل شروق الشمس فوق البحر يملأ القلب دهشةً وبهجة.',
  },
  {
    id: 'wotd-zh-1',
    languageId: 'zh',
    word: '心照不宣',
    phonetic: 'xīn zhào bù xuān',
    english: 'Silent mutual understanding between friends',
    arabicFusha: 'التفاهم الصامت والوئام القلبي دون كلام',
    example: '多年老友之间，往往一个微笑便能心照不宣。',
    exampleEnglish: 'Among longtime friends, a single smile conveys mutual understanding.',
    exampleArabic: 'بين الأصدقاء القدامى، تكفي ابتسامة واحدة لنقل التفاهم العميق.',
  },
  {
    id: 'wotd-de-1',
    languageId: 'de',
    word: 'Fernweh',
    phonetic: 'fairn-vay',
    english: 'Longing to travel to distant places',
    arabicFusha: 'الشوق إلى السفر واستكشاف الآفاق البعيدة',
    example: 'Wenn ich Reiseliteratur lese, packt mich sofort das Fernweh.',
    exampleEnglish: 'Whenever I read travel books, wanderlust immediately takes hold of me.',
    exampleArabic: 'كلما قرأتُ أدب الرحلات، تملّكني الشوق إلى السفر واستكشاف الآفاق.',
  },
  {
    id: 'wotd-fr-2',
    languageId: 'fr',
    word: 'Bienveillance',
    phonetic: 'byan-vay-yahns',
    english: 'Gracious kindness & goodwill',
    arabicFusha: 'اللطف وحسن النية والرفق',
    example: 'Elle accueille chaque voyageur avec sincère bienveillance.',
    exampleEnglish: 'She welcomes every traveler with sincere kindness.',
    exampleArabic: 'تستقبل كل مسافرٍ بلطفٍ صادق ومودة أصيلة.',
  },
  {
    id: 'wotd-en-2',
    languageId: 'en',
    word: 'Resilience',
    phonetic: 'rih-zil-yuhns',
    english: 'Strength to recover and grow gracefully',
    arabicFusha: 'المرونة النفسية والقدرة على النهوض والتجدد',
    example: 'Daily language practice builds quiet resilience and confidence.',
    exampleEnglish: 'Daily language practice builds quiet resilience and confidence.',
    exampleArabic: 'تبني الممارسة اليومية للغات ثقةً راسخة ومرونةً متينة.',
  },
];

export function getWordOfTheDay(dateISO: string): WordOfTheDayEntry {
  let hash = 0;
  for (let i = 0; i < dateISO.length; i++) {
    hash = (hash * 31 + dateISO.charCodeAt(i)) >>> 0;
  }
  return WORD_OF_THE_DAY_POOL[hash % WORD_OF_THE_DAY_POOL.length];
}

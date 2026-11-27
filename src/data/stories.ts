import { LanguageId } from '../types';

export interface StoryParagraph {
  text: string;
  english: string;
  arabicFusha: string;
}

export interface StoryVocab {
  word: string;
  arabicFusha: string;
  english: string;
}

export interface FunStory {
  id: string;
  languageId: LanguageId;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  paragraphs: StoryParagraph[];
  vocab: StoryVocab[];
  quizQuestion: string;
  quizQuestionAr: string;
  quizOptions: string[];
  quizCorrect: number;
}

export const FUN_STORIES: FunStory[] = [
  // FRENCH
  {
    id: 'story-fr-1',
    languageId: 'fr',
    level: 'A1',
    title: 'Le Chat et le Croissant d’Or',
    titleAr: 'القط والكرواسون الذهبي',
    summary: 'A curious Parisian cat helps a young baker find her missing recipe notebook.',
    summaryAr: 'قطّ فضولي في باريس يساعد خبازة شابة على إيجاد دفتر وصفاتها المفقود.',
    paragraphs: [
      {
        text: 'Chaque matin à six heures, Amélie ouvre sa petite boulangerie dans une rue calme de Paris.',
        english: 'Every morning at six o’clock, Amélie opens her little bakery on a quiet street in Paris.',
        arabicFusha: 'في كل صباح عند الساعة السادسة، تفتح أميلي مخبزها الصغير في شارع هادئ بباريس.',
      },
      {
        text: 'Un jour, elle cherche partout son carnet bleu contenant la recette secrète des croissants au miel.',
        english: 'One day, she looks everywhere for her blue notebook containing the secret honey croissant recipe.',
        arabicFusha: 'ذات يوم، بحثت في كل مكان عن دفترها الأزرق الذي يضم الوصفة السرية للكرواسون بالعسل.',
      },
      {
        text: 'Soudain, un petit chat roux nommé Brioche tire doucement sur son tablier et court vers le jardin fleuri.',
        english: 'Suddenly, a little ginger cat named Brioche gently tugs her apron and runs toward the blooming garden.',
        arabicFusha: 'فجأةً، شدّ قطٌ صغير برتقالي اللون اسمه بريوش مئزرها بلطف وركض نحو الحديقة المزهرة.',
      },
      {
        text: 'Sous un banc en bois, le carnet attendait bien au sec ! Pour le remercier, Amélie lui offre un peu de lait tiède.',
        english: 'Under a wooden bench, the notebook was waiting safely dry! To thank him, Amélie offers him warm milk.',
        arabicFusha: 'تحت مقعدٍ خشبي، كان الدفتر محفوظاً في أمان! وشكراً له، قدّمت له أميلي قليلاً من الحليب الدافئ.',
      },
    ],
    vocab: [
      { word: 'la boulangerie', english: 'bakery', arabicFusha: 'المخبز' },
      { word: 'le carnet bleu', english: 'blue notebook', arabicFusha: 'الدفتر الأزرق' },
      { word: 'doucement', english: 'gently', arabicFusha: 'بلطف' },
      { word: 'le banc en bois', english: 'wooden bench', arabicFusha: 'المقعد الخشبي' },
    ],
    quizQuestion: 'Where did Brioche the cat lead Amélie to find her notebook?',
    quizQuestionAr: 'أين قاد القط بريوش أميلي للعثور على دفترها؟',
    quizOptions: [
      'Under a wooden bench in the garden (تحت مقعد خشبي في الحديقة)',
      'Inside the train station (داخل محطة القطار)',
      'On top of the Eiffel Tower (فوق برج إيفل)',
      'Inside a suitcase (داخل حقيبة سفر)',
    ],
    quizCorrect: 0,
  },
  {
    id: 'story-fr-2',
    languageId: 'fr',
    level: 'B1',
    title: 'La Lettre dans la Bouteille Bleue',
    titleAr: 'الرسالة في القارورة الزرقاء',
    summary: 'Two friends discover an encouraging message from fifty years ago by the Mediterranean coast.',
    summaryAr: 'صديقان يكتشفان رسالة مشجعة تعود لخمسين عاماً مضت على ساحل البحر المتوسط.',
    paragraphs: [
      {
        text: 'Après la pluie d’automne, Yasmine et Lucas se promènent le long des rochers dorés face à la mer.',
        english: 'After the autumn rain, Yasmine and Lucas walk along the golden rocks facing the sea.',
        arabicFusha: 'بعد مطر الخريف، سارت ياسمين ولوكاس بمحاذاة الصخور الذهبية المقابلة للبحر.',
      },
      {
        text: 'Entre deux galets brillants, Yasmine aperçoit une ancienne bouteille en verre scellée avec soin.',
        english: 'Between two shiny pebbles, Yasmine spots an old glass bottle sealed with care.',
        arabicFusha: 'بين حصاتين لامعتين، لمحت ياسمين قارورةً زجاجية قديمة محكمة الإغلاق بعناية.',
      },
      {
        text: 'À l’intérieur, une lettre écrite en 1976 souhaite bonheur et curiosité à quiconque traverserait ces vagues.',
        english: 'Inside, a letter written in 1976 wishes joy and curiosity to whoever might cross these waves.',
        arabicFusha: 'في داخلها، كانت رسالة مكتوبة عام 1976 تتمنى السعادة وحب المعرفة لكل من يعبر هذه الأمواج.',
      },
    ],
    vocab: [
      { word: 'les rochers dorés', english: 'golden rocks', arabicFusha: 'الصخور الذهبية' },
      { word: 'scellée avec soin', english: 'sealed carefully', arabicFusha: 'محكمة الإغلاق بعناية' },
      { word: 'la curiosité', english: 'curiosity', arabicFusha: 'حب المعرفة / الفضول العلمي' },
    ],
    quizQuestion: 'What did the 1976 letter wish for the finder?',
    quizQuestionAr: 'ماذا تمنت رسالة عام 1976 لمن يعثر عليها؟',
    quizOptions: [
      'Happiness and curiosity (السعادة وحب المعرفة)',
      'A free boat ticket (تذكرة قارب مجانية)',
      'A map of mountains (خريطة للجبال)',
      'Cold winter weather (طقس شتوي بارد)',
    ],
    quizCorrect: 0,
  },

  // ENGLISH
  {
    id: 'story-en-1',
    languageId: 'en',
    level: 'A1',
    title: 'The Mystery of the Midnight Library',
    titleAr: 'لغز مكتبة منتصف الليل',
    summary: 'Maya stays past closing in a cozy bookshop and discovers a secret reading club of owls.',
    summaryAr: 'تبقى مايا بعد موعد الإغلاق في مكتبة دافئة وتكتشف نادياً سرياً للقراءة.',
    paragraphs: [
      {
        text: 'Maya loved the smell of old paper inside her grandfather’s bookshop on Maple Street.',
        english: 'Maya loved the smell of old paper inside her grandfather’s bookshop on Maple Street.',
        arabicFusha: 'أحبّت مايا رائحة الورق القديم داخل مكتبة جدّها في شارع القيقب.',
      },
      {
        text: 'One rainy Tuesday, she heard soft pages turning upstairs long after the front door was locked.',
        english: 'One rainy Tuesday, she heard soft pages turning upstairs long after the front door was locked.',
        arabicFusha: 'في يوم ثلاثاء ممطر، سمعت صوت تقليب الصفحات في الطابق العلوي بعد إغلاق الباب الأمامي بزمن طويل.',
      },
      {
        text: 'Climbing the wooden stairs, Maya found a silver bookmark glowing beside a dictionary of world proverbs.',
        english: 'Climbing the wooden stairs, Maya found a silver bookmark glowing beside a dictionary of world proverbs.',
        arabicFusha: 'عند صعودها السلم الخشبي، وجدت فاصلاً فضياً للكتب يلمع بجانب قاموسٍ للأمثال العالمية.',
      },
      {
        text: 'A gentle breeze from the open window had turned the pages right to a quote: "Every new language opens a new window."',
        english: 'A gentle breeze from the open window had turned the pages right to a quote: "Every new language opens a new window."',
        arabicFusha: 'كان نسيم لطيف من النافذة المفتوحة قد قلّب الصفحات تماماً نحو عبارة: «كل لغة جديدة تفتح نافذةً جديدة».',
      },
    ],
    vocab: [
      { word: 'wooden stairs', english: 'steps made of wood', arabicFusha: 'السلم الخشبي' },
      { word: 'silver bookmark', english: 'metallic page marker', arabicFusha: 'فاصل كتب فضي' },
      { word: 'gentle breeze', english: 'soft wind', arabicFusha: 'نسيم لطيف' },
    ],
    quizQuestion: 'What actually turned the pages upstairs in the bookshop?',
    quizQuestionAr: 'ما الذي كان يقلّب الصفحات في الطابق العلوي من المكتبة؟',
    quizOptions: [
      'A gentle breeze from the open window (نسيم لطيف من النافذة المفتوحة)',
      'A lost tourist (سائح تائه)',
      'A loud thunderstorm (عاصفة رعدية صاخبة)',
      'A neighbor’s dog (كلب الجيران)',
    ],
    quizCorrect: 0,
  },
  {
    id: 'story-en-2',
    languageId: 'en',
    level: 'B1',
    title: 'The Clockmaker’s Apprentice',
    titleAr: 'متدرب صانع الساعات',
    summary: 'Patience and attention to detail help Noah repair a century-old station clock.',
    summaryAr: 'الصبر والدقة يساعدان نوح على إصلاح ساعة محطة عتيقة عمرها قرن من الزمان.',
    paragraphs: [
      {
        text: 'For thirty years, the grand brass clock in Old Town Square had stopped at exactly four fifteen.',
        english: 'For thirty years, the grand brass clock in Old Town Square had stopped at exactly four fifteen.',
        arabicFusha: 'لمدة ثلاثين عاماً، توقفت الساعة النحاسية الكبرى في ساحة البلدة القديمة عند الرابعة والربع تماماً.',
      },
      {
        text: 'Instead of rushing with heavy tools, young Noah listened carefully to the silent gears with patience.',
        english: 'Instead of rushing with heavy tools, young Noah listened carefully to the silent gears with patience.',
        arabicFusha: 'بدلاً من التسرع باستخدام الأدوات الثقيلة، أنصت الشاب نوح بعناية وصبرٍ إلى التروس الصامتة.',
      },
      {
        text: 'Removing a single speck of dust from the tiny balance wheel brought the golden chimes back to life.',
        english: 'Removing a single speck of dust from the tiny balance wheel brought the golden chimes back to life.',
        arabicFusha: 'إزالة ذرة غبار واحدة من عجلة التوازن الصغيرة أعادت رنين الأجراس الذهبية إلى الحياة.',
      },
    ],
    vocab: [
      { word: 'brass clock', english: 'metal timepiece', arabicFusha: 'الساعة النحاسية' },
      { word: 'patience', english: 'calm endurance', arabicFusha: 'الصبر والأناة' },
      { word: 'golden chimes', english: 'melodic bell sounds', arabicFusha: 'الرنين الذهبي' },
    ],
    quizQuestion: 'What finally fixed the silent station clock?',
    quizQuestionAr: 'ما الذي أصلح ساعة الساحة الصامتة في النهاية؟',
    quizOptions: [
      'Carefully removing a speck of dust from the balance wheel (إزالة ذرة غبار بعناية عن عجلة التوازن)',
      'Replacing the entire brass tower (استبدال البرج النحاسي بالكامل)',
      'Painting the clock hands blue (طلاء عقارب الساعة بالأزرق)',
      'Installing digital batteries (تركيب بطاريات رقمية)',
    ],
    quizCorrect: 0,
  },

  // SPANISH
  {
    id: 'story-es-1',
    languageId: 'es',
    level: 'A2',
    title: 'El Viaje del Sombrero Rojo',
    titleAr: 'رحلة القبعة الحمراء',
    summary: 'A cheerful red hat blows across Barcelona and unites three strangers with kindness.',
    summaryAr: 'قبعة حمراء مبهجة تطير مع النسيم في برشلونة وتجمع ثلاثة غرباء في موقف لطيف.',
    paragraphs: [
      {
        text: 'En una tarde soleada en Barcelona, el viento jugó una broma y levantó el sombrero rojo de Sofía.',
        english: 'On a sunny afternoon in Barcelona, the wind played a joke and lifted Sofía’s red hat.',
        arabicFusha: 'في ظهيرةٍ مشمسة ببرشلونة، مازحت الريح صوفيا ورفعت قبعتها الحمراء في الهواء.',
      },
      {
        text: 'El sombrero aterrizó suavemente junto a un músico callejero que tocaba la guitarra española.',
        english: 'The hat landed gently beside a street musician playing the Spanish guitar.',
        arabicFusha: 'حطّت القبعة بلطفٍ بجانب عازف شوارع يعزف على الغيتار الإسباني.',
      },
      {
        text: 'Un niño sonriente corrió para recogerlo y devolvérselo a Sofía entre aplausos y risas.',
        english: 'A smiling boy ran to pick it up and return it to Sofía amid applause and laughter.',
        arabicFusha: 'ركض طفل مبتسم لالتقاطها وإعادتها إلى صوفيا وسط التصفيق والضحكات.',
      },
    ],
    vocab: [
      { word: 'tarde soleada', english: 'sunny afternoon', arabicFusha: 'ظهيرة مشمسة' },
      { word: 'el sombrero rojo', english: 'the red hat', arabicFusha: 'القبعة الحمراء' },
      { word: 'devolver', english: 'to return something', arabicFusha: 'يعيد / يرجع' },
    ],
    quizQuestion: 'Where did Sofía’s red hat land?',
    quizQuestionAr: 'أين حطّت قبعة صوفيا الحمراء؟',
    quizOptions: [
      'Beside a guitarist in Barcelona (بجانب عازف غيتار في برشلونة)',
      'Inside a museum fountain (داخل نافورة متحف)',
      'On a high-speed train (على متن قطار سريع)',
      'In a seafood restaurant (في مطعم مأكولات بحرية)',
    ],
    quizCorrect: 0,
  },
  {
    id: 'story-es-2',
    languageId: 'es',
    level: 'B1',
    title: 'La Receta de la Abuela Elena',
    titleAr: 'وصفة الجدة إيلينا',
    summary: 'Cooking saffron rice together teaches patience and preserves family stories.',
    summaryAr: 'تحضير طبق الأرز بالزعفران معاً يعلم الصبر ويحفظ حكايات العائلة.',
    paragraphs: [
      {
        text: 'Cada domingo, Elena reúne a sus nietos alrededor de la mesa de madera para preparar paella de verduras.',
        english: 'Every Sunday, Elena gathers her grandchildren around the wooden table to prepare vegetable paella.',
        arabicFusha: 'في كل يوم أحد، تجمع إيلينا أحفادها حول المائدة الخشبية لإعداد طبق الباييا بالخضار.',
      },
      {
        text: 'Ella explica que el secreto no está en tener prisa, sino en escuchar cómo canta el arroz con azafrán.',
        english: 'She explains that the secret is not rushing, rather listening to how the saffron rice simmers.',
        arabicFusha: 'توضح لهم أن السر لا يكمن في العجلة، بل في الإصغاء إلى نضج الأرز مع الزعفران على نار هادئة.',
      },
    ],
    vocab: [
      { word: 'los nietos', english: 'grandchildren', arabicFusha: 'الأحفاد' },
      { word: 'el azafrán', english: 'saffron', arabicFusha: 'الزعفران' },
      { word: 'tener prisa', english: 'to be in a hurry', arabicFusha: 'يكون على عجلة' },
    ],
    quizQuestion: 'According to Elena, what is the secret of great cooking?',
    quizQuestionAr: 'بحسب الجدة إيلينا، ما سرّ الطهي المتقن؟',
    quizOptions: [
      'Patience instead of rushing (الصبر وعدم التسرع)',
      'Using extra salt (استخدام ملح إضافي)',
      'Cooking in a microwave (الطهي السريع)',
      'Reading while running (القراءة أثناء الجري)',
    ],
    quizCorrect: 0,
  },

  // ITALIAN
  {
    id: 'story-it-1',
    languageId: 'it',
    level: 'A1',
    title: 'Un Gelato Sotto le Stelle di Roma',
    titleAr: 'مثلجات تحت نجوم روما',
    summary: 'Two friends explore Rome’s evening fountains before choosing pistachio gelato.',
    summaryAr: 'صديقتان تتجولان بين نوافير روما المسائية قبل اختيار مثلجات الفستق.',
    paragraphs: [
      {
        text: 'La sera d’estate a Roma è fresca e luminosa vicino alle antiche fontane di pietra.',
        english: 'Summer evenings in Rome are breezy and bright near the ancient stone fountains.',
        arabicFusha: 'أمسيات الصيف في روما عليلة ومضيئة بالقرب من النوافير الحجرية العتيقة.',
      },
      {
        text: 'Giulia e Nadia entrano in una gelateria artigianale per assaggiare il famoso gusto al pistacchio.',
        english: 'Giulia and Nadia step into an artisan gelato shop to taste the famous pistachio flavor.',
        arabicFusha: 'تدخل جوليا ونادية متجر مثلجات تقليدياً لتذوق نكهة الفستق الشهيرة.',
      },
      {
        text: 'Sotto un cielo pieno di stelle, brindano alla loro amicizia e alle nuove parole imparate oggi.',
        english: 'Under a sky full of stars, they toast their friendship and the new words learned today.',
        arabicFusha: 'تحت سماء مرصعة بالنجوم، تحتفيان بصداقتهما وبالكلمات الجديدة التي تعلمتاها اليوم.',
      },
    ],
    vocab: [
      { word: 'la fontana', english: 'fountain', arabicFusha: 'النافورة' },
      { word: 'artigianale', english: 'artisan / handmade', arabicFusha: 'حرفي تقليدي' },
      { word: 'sotto le stelle', english: 'under the stars', arabicFusha: 'تحت النجوم' },
    ],
    quizQuestion: 'Which gelato flavor do Giulia and Nadia choose in Rome?',
    quizQuestionAr: 'ما نكهة المثلجات التي اختارتها جوليا ونادية في روما؟',
    quizOptions: [
      'Pistachio (الفستق)',
      'Green apple (التفاح الأخضر)',
      'Espresso beans (حبوب القهوة)',
      'Mint chocolate (النعناع والشوكولاتة)',
    ],
    quizCorrect: 0,
  },
  {
    id: 'story-it-2',
    languageId: 'it',
    level: 'B1',
    title: 'Il Pittore della Piazza Piccola',
    titleAr: 'رسّام الساحة الصغيرة',
    summary: 'An artist paints every neighbor’s kindness into a joyful mural.',
    summaryAr: 'رسّام يخلّد لطف الجيران جميعاً في لوحة جدارية مبهجة.',
    paragraphs: [
      {
        text: 'Marco dipinge da trent’anni acquerelli luminosi nella piccola piazza di Siena.',
        english: 'Marco has painted luminous watercolors in the small square of Siena for thirty years.',
        arabicFusha: 'يرسم ماركو منذ ثلاثين عاماً لوحات مائية مشرقة في ساحة سيينا الصغيرة.',
      },
      {
        text: 'Quando un temporale bagna i suoi colori, tutto il quartiere gli porta nuovi pennelli e tè caldo.',
        english: 'When a storm wets his paints, the whole neighborhood brings him fresh brushes and hot tea.',
        arabicFusha: 'حين بلّلت عاصفة ألوانه، أحضر له الحيّ بأكمله فراشٍ جديدة وشاياً ساخناً.',
      },
    ],
    vocab: [
      { word: 'acquerelli', english: 'watercolors', arabicFusha: 'الألوان المائية' },
      { word: 'il quartiere', english: 'the neighborhood', arabicFusha: 'الحيّ' },
      { word: 'i pennelli', english: 'paintbrushes', arabicFusha: 'فراشي الرسم' },
    ],
    quizQuestion: 'How did the neighborhood help Marco after the storm?',
    quizQuestionAr: 'كيف ساعد الحيّ ماركو بعد العاصفة؟',
    quizOptions: [
      'Brought him new brushes and hot tea (أحضروا له فراشٍ جديدة وشاياً ساخناً)',
      'Bought him a bicycle (اشتروا له دراجة)',
      'Closed the square for a week (أغلقوا الساحة أسبوعاً)',
      'Asked him to move away (طلبوا منه الرحيل)',
    ],
    quizCorrect: 0,
  },

  // CHINESE
  {
    id: 'story-zh-1',
    languageId: 'zh',
    level: 'A2',
    title: '茶馆里的微笑 (A Smile in the Teahouse)',
    titleAr: 'ابتسامة في بيت الشاي',
    summary: 'A helpful teahouse host bridges two travelers speaking different languages.',
    summaryAr: 'مضيفة لطيفة في بيت شاي تقليدي تجمع بين مسافرين يتحدثان لغتين مختلفتين.',
    paragraphs: [
      {
        text: '星期天下午，北京的一家安静茶馆里飘着淡淡的茉莉花香。',
        english: 'On Sunday afternoon, a faint jasmine fragrance floated inside a quiet Beijing teahouse.',
        arabicFusha: 'بعد ظهر يوم الأحد، انتشرت رائحة الياسمين اللطيفة داخل بيت شاي هادئ في بكين.',
      },
      {
        text: '一位刚学中文的旅行者想点热茶，却忘记了“茶壶”怎么说。',
        english: 'A traveler who had just started learning Chinese wanted to order hot tea, yet forgot how to say "teapot."',
        arabicFusha: 'أراد مسافر مبتدئ في تعلم الصينية أن يطلب شاياً ساخناً، لكنه نسي كيف ينطق كلمة «إبريق الشاي».',
      },
      {
        text: '店主林薇微笑着画出茶壶的简笔画，还耐心地教他读出声调。',
        english: 'Owner Lin Wei smiled, drew a quick sketch of a teapot, and patiently taught him the tones.',
        arabicFusha: 'ابتسمت صاحبة المكان لين وي، ورسمت رسماً بسيطاً لإبريق شاي، وعلّمته النغمات الصوتية بصبر.',
      },
    ],
    vocab: [
      { word: '茉莉花茶 (mò lì huā chá)', english: 'jasmine tea', arabicFusha: 'شاي الياسمين' },
      { word: '茶壶 (chá hú)', english: 'teapot', arabicFusha: 'إبريق الشاي' },
      { word: '耐心 (nài xīn)', english: 'patience', arabicFusha: 'الصبر واللطف' },
    ],
    quizQuestion: 'How did Lin Wei help the traveler understand?',
    quizQuestionAr: 'كيف ساعدت لين وي المسافر على الفهم؟',
    quizOptions: [
      'She smiled, sketched a teapot, and taught the tones (ابتسمت ورسمت إبريقاً وعلمته النطق)',
      'She asked him to leave (طلبت منه المغادرة)',
      'She served cold soup (قدمت حساءً بارداً)',
      'She turned off the lights (أطفأت الأضواء)',
    ],
    quizCorrect: 0,
  },
  {
    id: 'story-zh-2',
    languageId: 'zh',
    level: 'B1',
    title: '山顶上的灯笼 (Lanterns on the Hilltop)',
    titleAr: 'الفوانيس على قمة التل',
    summary: 'Climbing together at dusk rewards friends with lantern light and shared mooncakes.',
    summaryAr: 'التسلق معاً عند الغسق يكافئ الأصدقاء بضوء الفوانيس وتقاسم كعك القمر.',
    paragraphs: [
      {
        text: '中秋节的傍晚，几个好朋友沿着石阶慢慢爬上苏州的小山坡。',
        english: 'On Mid-Autumn evening, good friends slowly climbed stone steps up a gentle hill in Suzhou.',
        arabicFusha: 'في مساء عيد منتصف الخريف، صعد أصدقاء أوفياء الدرجات الحجرية ببطء نحو تلة هادئة في سوتشو.',
      },
      {
        text: '山顶挂满温暖的红灯笼，大家一起喝乌龙茶、欣赏圆月。',
        english: 'The hilltop glowed with warm red lanterns as everyone drank oolong tea and admired the full moon.',
        arabicFusha: 'تألقت قمة التل بالفوانيس الحمراء الدافئة بينما شرب الجميع الشاي وتأملوا البدر المكتمل.',
      },
    ],
    vocab: [
      { word: '灯笼 (dēng long)', english: 'lantern', arabicFusha: 'فانوس' },
      { word: '圆月 (yuán yuè)', english: 'full moon', arabicFusha: 'البدر المكتمل' },
      { word: '山顶 (shān dǐng)', english: 'hilltop', arabicFusha: 'قمة التل' },
    ],
    quizQuestion: 'What decorated the hilltop during the Mid-Autumn evening?',
    quizQuestionAr: 'ماذا كان يزيّن قمة التل في تلك الأمسية؟',
    quizOptions: [
      'Warm red lanterns (الفوانيس الحمراء الدافئة)',
      'Snowmen (تماثيل ثلجية)',
      'Traffic cones (أقماع مرورية)',
      'Large umbrellas (مظلات ضخمة)',
    ],
    quizCorrect: 0,
  },

  // GERMAN
  {
    id: 'story-de-1',
    languageId: 'de',
    level: 'A2',
    title: 'Der verlorene Schal im Zug',
    titleAr: 'الوشاح المفقود في القطار',
    summary: 'Honesty at Berlin Central Station turns a lost scarf into a lasting friendship.',
    summaryAr: 'الأمانة في محطة برلين المركزية تحوّل وشاحاً مفقوداً إلى صداقة دائمة.',
    paragraphs: [
      {
        text: 'An einem kalten Novembermorgen vergaß Clara ihren blauen Wollschal im Schnellzug nach Berlin.',
        english: 'On a cold November morning, Clara forgot her blue wool scarf on the express train to Berlin.',
        arabicFusha: 'في صباح نوفمبر بارد، نسيت كلارا وشاحها الصوفي الأزرق داخل القطار السريع المتجه إلى برلين.',
      },
      {
        text: 'Am nächsten Tag rief eine freundliche Mitarbeiterin vom Fundbüro an: Der Schal wartete schon.',
        english: 'The next day, a kind clerk from the lost-and-found office called: the scarf was already waiting.',
        arabicFusha: 'في اليوم التالي، اتصلت موظفة لطيفة من مكتب المفقودات لتبشّرها بأن الوشاح محفوظ بانتظارها.',
      },
      {
        text: 'Eine aufmerksame Mitreisende hatte ihn abgegeben und eine nette Postkarte beigelegt.',
        english: 'An attentive fellow passenger had handed it in and tucked in a kind postcard.',
        arabicFusha: 'كانت مسافرة متيقظة قد سلمته للمكتب وأرفقت معه بطاقة بريدية لطيفة.',
      },
    ],
    vocab: [
      { word: 'der Wollschal', english: 'wool scarf', arabicFusha: 'الوشاح الصوفي' },
      { word: 'das Fundbüro', english: 'lost and found office', arabicFusha: 'مكتب المفقودات' },
      { word: 'aufmerksam', english: 'attentive / thoughtful', arabicFusha: 'متيقظ ومراعٍ' },
    ],
    quizQuestion: 'Who turned in Clara’s blue scarf with a postcard?',
    quizQuestionAr: 'من الذي سلّم وشاح كلارا الأزرق مع بطاقة بريدية؟',
    quizOptions: [
      'An attentive fellow passenger (مسافرة متيقظة في القطار)',
      'The train engine driver (سائق القطار)',
      'A bakery owner (صاحب مخبز)',
      'Nobody found it (لم يجده أحد)',
    ],
    quizCorrect: 0,
  },
  {
    id: 'story-de-2',
    languageId: 'de',
    level: 'B1',
    title: 'Musik im Stadtpark',
    titleAr: 'موسيقى في حديقة المدينة',
    summary: 'An outdoor violin rehearsal brings neighbors together under tall summer oaks.',
    summaryAr: 'بروفة كمان في الهواء الطلق تجمع الجيران تحت أشجار البلوط الصيفية.',
    paragraphs: [
      {
        text: 'Jeden Freitagabend übte Lukas unter einer alten Eiche im Park seine Geigenstücke.',
        english: 'Every Friday evening, Lukas practiced his violin pieces beneath an old oak tree in the park.',
        arabicFusha: 'في مساء كل جمعة، كان لوكاس يتدرب على مقطوعاته بالكمان تحت شجرة بلوط عتيقة في الحديقة.',
      },
      {
        text: 'Bald brachten Familien Decken und warmen Apfelsaft mit, um der kostenlosen Musik zu lauschen.',
        english: 'Soon families brought blankets and warm apple juice to listen to the open-air music.',
        arabicFusha: 'سرعان ما أحضرت العائلات أغطية وعصير تفاح دافئاً للاستماع إلى هذه الموسيقى المجانية في الهواء الطلق.',
      },
    ],
    vocab: [
      { word: 'die Geige', english: 'violin', arabicFusha: 'آلة الكمان' },
      { word: 'die Eiche', english: 'oak tree', arabicFusha: 'شجرة البلوط' },
      { word: 'lauschen', english: 'to listen attentively', arabicFusha: 'يصغي بشغف' },
    ],
    quizQuestion: 'Where did Lukas practice his violin on Friday evenings?',
    quizQuestionAr: 'أين كان لوكاس يتدرب على العزف مساء كل جمعة؟',
    quizOptions: [
      'Under an old oak tree in the park (تحت شجرة بلوط عتيقة في الحديقة)',
      'Inside a subway tunnel (داخل نفق المترو)',
      'On a museum roof (فوق سطح المتحف)',
      'At the airport gate (عند بوابة المطار)',
    ],
    quizCorrect: 0,
  },
];

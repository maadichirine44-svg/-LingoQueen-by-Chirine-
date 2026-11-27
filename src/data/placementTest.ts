import { LanguageId, PlacementCEFR } from '../types';

export interface PlacementQuestion {
  id: string;
  level: PlacementCEFR;
  question: string;
  options: string[];
  correctIndex: number;
}

export const PLACEMENT_QUESTIONS: Record<LanguageId, PlacementQuestion[]> = {
  en: [
    {
      id: 'pl-en-1',
      level: 'A1',
      question: 'Choose the polite morning greeting for a hotel guest:',
      options: [
        'Good morning, how may I help you?',
        'Morning you, what want?',
        'Hello yesterday, sit here.',
        'Good night, welcome breakfast.',
      ],
      correctIndex: 0,
    },
    {
      id: 'pl-en-2',
      level: 'A1',
      question: 'Complete: "She ___ from London and works at a bookshop."',
      options: ['are', 'is', 'am', 'be'],
      correctIndex: 1,
    },
    {
      id: 'pl-en-3',
      level: 'A2',
      question: 'Complete: "Last weekend we ___ three stone castles in Scotland."',
      options: ['explore', 'exploring', 'explored', 'will exploring'],
      correctIndex: 2,
    },
    {
      id: 'pl-en-4',
      level: 'A2',
      question: 'Choose the natural comparison: "This wool cardigan is ___ than my light jacket."',
      options: ['more warmer', 'warmest', 'warmer', 'as warmest'],
      correctIndex: 2,
    },
    {
      id: 'pl-en-5',
      level: 'B1',
      question: 'Complete: "If we ___ closer to the station, we would walk every morning."',
      options: ['live', 'lived', 'living', 'have live'],
      correctIndex: 1,
    },
    {
      id: 'pl-en-6',
      level: 'B1',
      question: 'Choose the best sentence: "I’m calling to ask ___ you have any rooms available."',
      options: ['whether', 'despite', 'unless', 'during'],
      correctIndex: 0,
    },
    {
      id: 'pl-en-7',
      level: 'B2',
      question: 'Complete: "Had I known about your early arrival, I ___ the suite prepared sooner."',
      options: ['would have had', 'will have', 'had had', 'have had'],
      correctIndex: 0,
    },
    {
      id: 'pl-en-8',
      level: 'B2',
      question: 'Which connector expresses contrast smoothly? "The flight was delayed; ___, all guests made the dinner."',
      options: ['consequently', 'nevertheless', 'moreover', 'similarly'],
      correctIndex: 1,
    },
    {
      id: 'pl-en-9',
      level: 'C1',
      question: 'Choose the correct negative inversion: "Not only ___ the complaint, she also offered a thoughtful upgrade."',
      options: ['she resolved', 'did she resolve', 'resolved she', 'had resolve she'],
      correctIndex: 1,
    },
    {
      id: 'pl-en-10',
      level: 'C1',
      question: 'Select the most precise word: "A good concierge anticipates guests’ needs with quiet ___."',
      options: ['discretion', 'hesitation', 'friction', 'repetition'],
      correctIndex: 0,
    },
    {
      id: 'pl-en-11',
      level: 'C2',
      question: 'Choose the most idiomatic C2 phrasing: "Her remarks ___ the delicate balance between tradition and innovation."',
      options: ['underscored', 'overlooked around', 'made under', 'put above'],
      correctIndex: 0,
    },
    {
      id: 'pl-en-12',
      level: 'C2',
      question: 'Complete with C2 precision: "Were the committee ___ the proposal today, implementation would begin in autumn."',
      options: ['approve', 'to approve', 'approved', 'approving'],
      correctIndex: 1,
    },
  ],
  fr: [
    {
      id: 'pl-fr-1',
      level: 'A1',
      question: 'Complétez : « Bonjour madame, je ___ un café crème, s’il vous plaît. »',
      options: ['voudrais', 'sommes', 'avez', 'être'],
      correctIndex: 0,
    },
    {
      id: 'pl-fr-2',
      level: 'A1',
      question: 'Choisissez l’article correct : « ___ hôtel près de la gare est magnifique. »',
      options: ['Le', 'La', 'L’', 'Les'],
      correctIndex: 2,
    },
    {
      id: 'pl-fr-3',
      level: 'A2',
      question: 'Complétez au passé composé : « Hier, nous ___ arrivés à Lyon en train. »',
      options: ['avons', 'sommes', 'étions', 'allons'],
      correctIndex: 1,
    },
    {
      id: 'pl-fr-4',
      level: 'A2',
      question: 'Remplacez le lieu : « Tu vas à la gare ? Oui, ___ vais maintenant. »',
      options: ['j’y', 'j’en', 'je lui', 'je les'],
      correctIndex: 0,
    },
    {
      id: 'pl-fr-5',
      level: 'B1',
      question: 'Complétez : « L’article ___ tu m’as recommandé est passionnant. »',
      options: ['qui', 'que', 'où', 'dont'],
      correctIndex: 1,
    },
    {
      id: 'pl-fr-6',
      level: 'B1',
      question: 'Choisissez le subjonctif correct : « Il faut que nous ___ nos forêts. »',
      options: ['protégeons', 'protégions', 'protégerons', 'protégions-nous'],
      correctIndex: 1,
    },
    {
      id: 'pl-fr-7',
      level: 'B2',
      question: 'Complétez : « Bien que le marché ___ exigeant, l’entreprise prospère. »',
      options: ['est', 'soit', 'sera', 'était'],
      correctIndex: 1,
    },
    {
      id: 'pl-fr-8',
      level: 'B2',
      question: 'Complétez la phrase hypothétique : « Si nous avions plus de temps, nous ___ plus souvent. »',
      options: ['voyagerons', 'voyagerions', 'voyageons', 'aurions voyagé'],
      correctIndex: 1,
    },
    {
      id: 'pl-fr-9',
      level: 'C1',
      question: 'Choisissez le pronom relatif juste : « C’est un patrimoine ___ nous sommes fiers. »',
      options: ['que', 'qui', 'dont', 'lequel'],
      correctIndex: 2,
    },
    {
      id: 'pl-fr-10',
      level: 'C1',
      question: 'Complétez au subjonctif passé : « Je doute qu’ils ___ cette objection. »',
      options: ['ont anticipé', 'aient anticipé', 'anticipaient', 'anticiperont'],
      correctIndex: 1,
    },
    {
      id: 'pl-fr-11',
      level: 'C2',
      question: 'Repérez l’inversion littéraire correcte :',
      options: [
        'Ainsi comprit-elle la portée de ce geste.',
        'Ainsi elle comprit-il la portée de ce geste.',
        'Ainsi a compris-elle la portée de ce geste.',
        'Ainsi comprenait-t-elle la portée de ce geste.',
      ],
      correctIndex: 0,
    },
    {
      id: 'pl-fr-12',
      level: 'C2',
      question: 'Que signifie l’expression « mettre les bouchées doubles » ?',
      options: [
        'Redoubler d’efforts pour aller plus vite',
        'Annuler un rendez-vous important',
        'Prendre une longue pause déjeuner',
        'Hésiter avant de prendre une décision',
      ],
      correctIndex: 0,
    },
  ],
  es: [
    {
      id: 'pl-es-1',
      level: 'A1',
      question: 'Completa: «Hola, me ___ Sofía y vivo en Barcelona.»',
      options: ['llamo', 'soy', 'estoy', 'tengo'],
      correctIndex: 0,
    },
    {
      id: 'pl-es-2',
      level: 'A1',
      question: 'Elige la forma correcta: «___ gustan mucho las naranjas dulces.»',
      options: ['Me', 'Yo', 'Mi', 'Mí'],
      correctIndex: 0,
    },
    {
      id: 'pl-es-3',
      level: 'A2',
      question: 'Completa en pretérito: «Ayer nosotros ___ el museo histórico.»',
      options: ['visitamos', 'visitaremos', 'visitemos', 'visitábamos'],
      correctIndex: 0,
    },
    {
      id: 'pl-es-4',
      level: 'A2',
      question: 'Elige la opción correcta: «Por la mañana me ___ a las siete.»',
      options: ['levanto', 'levantar', 'levanta', 'levantas'],
      correctIndex: 0,
    },
    {
      id: 'pl-es-5',
      level: 'B1',
      question: 'Completa con subjuntivo: «Espero que ___ un excelente viaje.»',
      options: ['tienes', 'tengas', 'tendrás', 'tenías'],
      correctIndex: 1,
    },
    {
      id: 'pl-es-6',
      level: 'B1',
      question: 'Elige la preposición correcta: «Gracias ___ su amabilidad y paciencia.»',
      options: ['para', 'por', 'con', 'hacia'],
      correctIndex: 1,
    },
    {
      id: 'pl-es-7',
      level: 'B2',
      question: 'Completa: «Si ___ más tiempo, exploraríamos toda la costa.»',
      options: ['tenemos', 'tuviéramos', 'tendremos', 'tuvimos'],
      correctIndex: 1,
    },
    {
      id: 'pl-es-8',
      level: 'B2',
      question: '¿Qué conector introduce un contraste formal?',
      options: ['Sin embargo', 'Por lo tanto', 'Además', 'Es decir'],
      correctIndex: 0,
    },
    {
      id: 'pl-es-9',
      level: 'C1',
      question: 'Elige el sentido preciso de «imprescindible»:',
      options: [
        'Absolutamente necesario',
        'Totalmente opcional',
        'Fácil de olvidar',
        'Poco frecuente',
      ],
      correctIndex: 0,
    },
    {
      id: 'pl-es-10',
      level: 'C1',
      question: 'Completa: «Aun cuando ___ dificultades, el equipo mantuvo la calidad.»',
      options: ['hubiera', 'habrá', 'hay', 'habría'],
      correctIndex: 0,
    },
    {
      id: 'pl-es-11',
      level: 'C2',
      question: 'Selecciona la frase más natural en registro ejecutivo:',
      options: [
        'Conviene matizar esa afirmación a la luz de los datos recientes.',
        'Hay que poner más pequeño esa idea para los números.',
        'Necesitamos hacer corto la frase porque sí.',
        'Es mejor no decir nada sobre lo que pasó.',
      ],
      correctIndex: 0,
    },
    {
      id: 'pl-es-12',
      level: 'C2',
      question: '¿Qué significa «captar cada matiz»?',
      options: [
        'Percibir las diferencias sutiles del lenguaje',
        'Repetir exactamente las mismas palabras',
        'Hablar muy rápido sin pausas',
        'Traducir palabra por palabra',
      ],
      correctIndex: 0,
    },
  ],
  it: [
    {
      id: 'pl-it-1',
      level: 'A1',
      question: 'Completa: «Buongiorno, ___ un cappuccino e un cornetto.»',
      options: ['vorrei', 'sono', 'ho', 'vado'],
      correctIndex: 0,
    },
    {
      id: 'pl-it-2',
      level: 'A1',
      question: 'Scegli la forma corretta: «Mi ___ molto le città d’arte.»',
      options: ['piace', 'piacciono', 'piaci', 'piacere'],
      correctIndex: 1,
    },
    {
      id: 'pl-it-3',
      level: 'A2',
      question: 'Completa senza articolo davanti a familiare singolare: «___ sorella lavora a Bologna.»',
      options: ['La mia', 'Mia', 'Le mia', 'Una mia di'],
      correctIndex: 1,
    },
    {
      id: 'pl-it-4',
      level: 'A2',
      question: 'Completa al passato prossimo: «Ieri sera ___ cenato in centro.»',
      options: ['siamo', 'abbiamo', 'eravamo', 'stiamo'],
      correctIndex: 1,
    },
    {
      id: 'pl-it-5',
      level: 'B1',
      question: 'Completa con l’imperativo di cortesia: «Vada sempre dritto e poi ___ a sinistra.»',
      options: ['gira', 'giri', 'girando', 'girato'],
      correctIndex: 1,
    },
    {
      id: 'pl-it-6',
      level: 'B1',
      question: 'Scegli il pronome corretto: «Ecco la chiave; ___ prenda pure.»',
      options: ['la', 'lo', 'li', 'le'],
      correctIndex: 0,
    },
    {
      id: 'pl-it-7',
      level: 'B2',
      question: 'Completa col congiuntivo: «Spero che voi ___ un soggiorno piacevole.»',
      options: ['avete', 'abbiate', 'avrete', 'aveste'],
      correctIndex: 1,
    },
    {
      id: 'pl-it-8',
      level: 'B2',
      question: 'Completa il periodo ipotetico: «Se avessi più tempo, ___ tutta la Sicilia.»',
      options: ['visiterò', 'visiterei', 'visito', 'abbia visitato'],
      correctIndex: 1,
    },
    {
      id: 'pl-it-9',
      level: 'C1',
      question: 'Quale espressione introduce un’obiezione elegante?',
      options: [
        'Tuttavia, occorre considerare un altro aspetto.',
        'Perciò è tutto finito subito.',
        'Quindi non importa niente.',
        'Insomma, basta così.',
      ],
      correctIndex: 0,
    },
    {
      id: 'pl-it-10',
      level: 'C1',
      question: 'Completa: «Benché la situazione ___ complessa, abbiamo trovato un accordo.»',
      options: ['è', 'fosse', 'sarà', 'era'],
      correctIndex: 1,
    },
    {
      id: 'pl-it-11',
      level: 'C2',
      question: 'Scegli la frase di registro formale impeccabile:',
      options: [
        'Qualora dovessero sorgere imprevisti, non esiti a contattarci.',
        'Se capita qualche casino, ci chiami al volo.',
        'Quando viene un problema, forse vediamo dopo.',
        'Se avremo problemi, non diremo nulla.',
      ],
      correctIndex: 0,
    },
    {
      id: 'pl-it-12',
      level: 'C2',
      question: 'Che cosa significa «cogliere ogni sfumatura»?',
      options: [
        'Comprendere anche le distinzioni più sottili',
        'Scegliere solo parole brevi',
        'Evitare le frasi lunghe',
        'Ripetere lo stesso concetto',
      ],
      correctIndex: 0,
    },
  ],
  de: [
    {
      id: 'pl-de-1',
      level: 'A1',
      question: 'Ergänzen Sie: „Guten Morgen, ich ___ bitte einen Kaffee.“',
      options: ['möchte', 'bist', 'sind', 'haben'],
      correctIndex: 0,
    },
    {
      id: 'pl-de-2',
      level: 'A1',
      question: 'Wählen Sie den richtigen Akkusativ: „Ich kaufe ___ roten Apfel.“',
      options: ['ein', 'einer', 'einen', 'einem'],
      correctIndex: 2,
    },
    {
      id: 'pl-de-3',
      level: 'A2',
      question: 'Trennbares Verb: „Ich stehe jeden Morgen um sieben Uhr ___.“',
      options: ['auf', 'ein', 'an', 'mit'],
      correctIndex: 0,
    },
    {
      id: 'pl-de-4',
      level: 'A2',
      question: 'Nebensatz mit „weil“: „Wir bleiben drinnen, weil es heute stark ___.“',
      options: ['regnet', 'regnen', 'geregnet', 'regnete nicht'],
      correctIndex: 0,
    },
    {
      id: 'pl-de-5',
      level: 'B1',
      question: 'Ergänzen Sie die Dativ-Präposition: „Ich fahre ___ dem Schnellzug nach Berlin.“',
      options: ['für', 'mit', 'ohne', 'gegen'],
      correctIndex: 1,
    },
    {
      id: 'pl-de-6',
      level: 'B1',
      question: 'Welche Wortstellung ist im Hauptsatz korrekt?',
      options: [
        'Morgen fahren wir nach Köln.',
        'Morgen wir fahren nach Köln.',
        'Fahren morgen wir nach Köln.',
        'Wir morgen fahren nach Köln.',
      ],
      correctIndex: 0,
    },
    {
      id: 'pl-de-7',
      level: 'B2',
      question: 'Konjunktiv II: „Wenn ich mehr Zeit hätte, ___ ich länger bleiben.“',
      options: ['werde', 'würde', 'will', 'bin'],
      correctIndex: 1,
    },
    {
      id: 'pl-de-8',
      level: 'B2',
      question: 'Wählen Sie das passende Relativpronomen: „Das Hotel, in ___ wir übernachtet haben, war ruhig.“',
      options: ['der', 'das', 'dem', 'den'],
      correctIndex: 2,
    },
    {
      id: 'pl-de-9',
      level: 'C1',
      question: 'Welcher Ausdruck passt in eine formelle Beschwerdeantwort?',
      options: [
        'Wir bedauern die entstandenen Unannehmlichkeiten aufrichtig.',
        'Das ist halt Pech gewesen.',
        'Da können wir auch nichts machen.',
        'Warten Sie einfach bis morgen.',
      ],
      correctIndex: 0,
    },
    {
      id: 'pl-de-10',
      level: 'C1',
      question: 'Ergänzen Sie: „Ungeachtet ___ schwierigen Lage blieb das Team zuversichtlich.“',
      options: ['der', 'die', 'dem', 'den'],
      correctIndex: 0,
    },
    {
      id: 'pl-de-11',
      level: 'C2',
      question: 'Welche Formulierung zeigt gehobenen Stil (Nominalstil)?',
      options: [
        'Angesichts der aktuellen Entwicklungen bedarf es einer raschen Entscheidung.',
        'Weil jetzt alles anders ist, machen wir schnell was.',
        'Wir tun das, weil es eben so kommt.',
        'Man muss halt sehen, was passiert.',
      ],
      correctIndex: 0,
    },
    {
      id: 'pl-de-12',
      level: 'C2',
      question: 'Was bedeutet „etwas auf den Punkt bringen“?',
      options: [
        'Das Wesentliche präzise und klar ausdrücken',
        'Ein Gespräch unnötig in die Länge ziehen',
        'Einen wichtigen Termin absagen',
        'Sich unklar und vage äußern',
      ],
      correctIndex: 0,
    },
  ],
  zh: [
    {
      id: 'pl-zh-1',
      level: 'A1',
      question: '选择正确的礼貌点餐表达：“Hello, I would like a cup of hot tea.”',
      options: [
        '你好，我想要一杯热茶。',
        '再见，我喝水不茶。',
        '谢谢，我是热茶。',
        '请问，茶是你的名字吗？',
      ],
      correctIndex: 0,
    },
    {
      id: 'pl-zh-2',
      level: 'A1',
      question: '选择正确的量词：“一位客人” / “两___咖啡”',
      options: ['本', '杯', '条', '张'],
      correctIndex: 1,
    },
    {
      id: 'pl-zh-3',
      level: 'A2',
      question: '选择正确的语序（时间+地点+动作）：',
      options: [
        '我每天早上在公园散步。',
        '我散步在公园每天早上。',
        '在公园我散步每天早上。',
        '早上散步我每天在公园。',
      ],
      correctIndex: 0,
    },
    {
      id: 'pl-zh-4',
      level: 'A2',
      question: '填空：“火车今天早上八点___出发。” (8:30)',
      options: ['半', '分', '天', '号'],
      correctIndex: 0,
    },
    {
      id: 'pl-zh-5',
      level: 'B1',
      question: '选择最自然的表达：“虽然今天下雨，___我们还是去参观博物馆。”',
      options: ['但是', '因为', '所以', '如果'],
      correctIndex: 0,
    },
    {
      id: 'pl-zh-6',
      level: 'B1',
      question: '选择正确的“把”字句：',
      options: [
        '请把护照递给我看一下。',
        '请护照把递给我看一下。',
        '把请我看一下护照。',
        '护照请递把我看一下。',
      ],
      correctIndex: 0,
    },
    {
      id: 'pl-zh-7',
      level: 'B2',
      question: '在酒店服务中，向客人致歉最得体的表达是：',
      options: [
        '非常抱歉给您带来不便，我立刻为您解决。',
        '这不是我们的错，你自己看吧。',
        '随便吧，等明天再说。',
        '不要生气，这很正常。',
      ],
      correctIndex: 0,
    },
    {
      id: 'pl-zh-8',
      level: 'B2',
      question: '填空：“不仅服务周到，___环境也非常安静。”',
      options: ['而且', '不过', '既然', '除非'],
      correctIndex: 0,
    },
    {
      id: 'pl-zh-9',
      level: 'C1',
      question: '选择最贴切的书面语：“这份报告的数据非常___，很有说服力。”',
      options: ['详实', '随便', '模糊', '零散'],
      correctIndex: 0,
    },
    {
      id: 'pl-zh-10',
      level: 'C1',
      question: '“未雨绸缪”在职场沟通中通常指：',
      options: [
        '提前做好充分准备以防问题发生',
        '遇到大雨时取消所有行程',
        '事情结束后再做总结',
        '只关注眼前的短期利益',
      ],
      correctIndex: 0,
    },
    {
      id: 'pl-zh-11',
      level: 'C2',
      question: '选择最地道的高级商务表达：',
      options: [
        '鉴于双方长期的互信合作，我们愿就细节进一步磋商。',
        '因为我们以前认识，所以现在随便聊聊细节。',
        '既然大家都在，那就快点说完算了。',
        '不管怎样，先把合同签了再想办法。',
      ],
      correctIndex: 0,
    },
    {
      id: 'pl-zh-12',
      level: 'C2',
      question: '“言简意赅”最准确的意思是：',
      options: [
        '语言简练而意思完备深刻',
        '话很多但没有重点',
        '故意隐藏真实的观点',
        '只用口语而不用书面语',
      ],
      correctIndex: 0,
    },
  ],
};

export function evaluatePlacementLevel(
  questions: PlacementQuestion[],
  answers: Record<number, number>
): { level: PlacementCEFR; correct: number; total: number; score: number } {
  let correct = 0;
  questions.forEach((q, idx) => {
    if (answers[idx] === q.correctIndex) correct++;
  });
  const total = questions.length;
  const score = Math.round((correct / Math.max(1, total)) * 100);

  let level: PlacementCEFR = 'A1';
  if (correct >= 11) level = 'C2';
  else if (correct >= 9) level = 'C1';
  else if (correct >= 7) level = 'B2';
  else if (correct >= 5) level = 'B1';
  else if (correct >= 3) level = 'A2';
  else level = 'A1';

  return { level, correct, total, score };
}

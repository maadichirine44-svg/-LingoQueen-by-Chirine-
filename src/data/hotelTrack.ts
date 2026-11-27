import { HotelLesson, LanguageId } from '../types';

export interface AlgeriaStarClassification {
  stars: 5 | 4 | 3 | 2 | 1;
  labelEn: string;
  labelAr: string;
  descriptionEn: string;
  descriptionAr: string;
}

export interface AlgeriaEstablishmentType {
  id: string;
  term: string;
  arabic: string;
  english: string;
  descriptionEn: string;
  descriptionAr: string;
}

export const ALGERIA_HOTEL_CLASSIFICATIONS: AlgeriaStarClassification[] = [
  {
    stars: 5,
    labelEn: 'Hotel 5 Stars',
    labelAr: 'فندق 5 نجوم',
    descriptionEn: 'Luxury international standard with suites, 24/7 concierge, fine dining, spa, and multilingual reception.',
    descriptionAr: 'تصنيف فندقي فاخر بمعايير دولية يضم أجنحة، خدمة استقبال وكونسيرج على مدار الساعة، ومطاعم راقية.',
  },
  {
    stars: 4,
    labelEn: 'Hotel 4 Stars',
    labelAr: 'فندق 4 نجوم',
    descriptionEn: 'Upper-upscale comfort offering full breakfast buffet, room service, business lounges, and attentive staff.',
    descriptionAr: 'فندق عالي الجودة يوفر بوفيه إفطار متكامل، خدمة الغرف، قاعات أعمال، وطاقم استقبال متمرس.',
  },
  {
    stars: 3,
    labelEn: 'Hotel 3 Stars',
    labelAr: 'فندق 3 نجوم',
    descriptionEn: 'Mid-scale full-service hotel with private en-suite rooms, daily housekeeping, and dining area.',
    descriptionAr: 'فندق متوسط المستوى يقدم غرفاً مريحة بحمام خاص، خدمة تنظيف يومية، ومطعماً للنزلاء.',
  },
  {
    stars: 2,
    labelEn: 'Hotel 2 Stars',
    labelAr: 'فندق نجمتان',
    descriptionEn: 'Practical, clean, and welcoming lodging ideal for short city stays and domestic travelers.',
    descriptionAr: 'إقامة فندقية عملية ونظيفة مناسبة للإقامات القصيرة والرحلات السياحية والمهنية.',
  },
  {
    stars: 1,
    labelEn: 'Hotel 1 Star',
    labelAr: 'فندق نجمة واحدة',
    descriptionEn: 'Essential, budget-friendly accommodation providing clean rooms, front-desk check-in, and core amenities.',
    descriptionAr: 'إقامة فندقية اقتصادية توفر المرافق الأساسية وغرفاً نظيفة مع خدمة الاستقبال.',
  },
];

export const ALGERIA_ESTABLISHMENT_TYPES: AlgeriaEstablishmentType[] = [
  {
    id: 'hotel',
    term: 'Hotel',
    arabic: 'فندق',
    english: 'Hotel (1 to 5 Stars)',
    descriptionEn: 'Classified urban or resort property in Algeria rated from 1 star to 5 stars.',
    descriptionAr: 'مؤسسة فندقية مصنفة في الجزائر من نجمة واحدة إلى خمس نجوم.',
  },
  {
    id: 'motel',
    term: 'Motel',
    arabic: 'نُزُل',
    english: 'Motel',
    descriptionEn: 'Roadside accommodation designed for travelers with direct parking and convenient access.',
    descriptionAr: 'مرفق إيواء على المحاور الطرقية مخصص للمسافرين مع مواقف سيارات ميسّرة.',
  },
  {
    id: 'hostel',
    term: 'Hostel',
    arabic: 'بيت شباب',
    english: 'Youth Hostel',
    descriptionEn: 'Sociable, affordable lodging for students, youth travelers, and cultural exchange groups.',
    descriptionAr: 'إقامة اقتصادية مخصصة للشباب والطلبة ومجموعات التبادل السياحي والثقافي.',
  },
  {
    id: 'residence',
    term: 'Résidence Hôtelière',
    arabic: 'إقامة فندقية',
    english: 'Hotel Residence',
    descriptionEn: 'Furnished hotel apartments and studios with kitchenettes and hotel reception services.',
    descriptionAr: 'شقق واستوديوهات فندقية مفروشة ومجهزة بمطبخ صغير مع خدمات الاستقبال والتنظيف.',
  },
  {
    id: 'village',
    term: 'Village Touristique',
    arabic: 'قرية سياحية',
    english: 'Tourist Village',
    descriptionEn: 'Coastal or oasis holiday complex featuring bungalows, dining, and family recreation in Algeria.',
    descriptionAr: 'مركب سياحي ساحلي أو صحراوي يضم وحدات إقامة ومرافق ترفيهية وخدمات الضيافة العائلية في الجزائر.',
  },
];

interface HotelBlueprint {
  id: number;
  category: HotelLesson['category'];
  title: string;
  scenario: string;
  isCV?: boolean;
  isInterview?: boolean;
  phrases: Record<
    LanguageId,
    Array<{ target: string; english: string; arabic: string }>
  >;
  dialogue: Array<{
    speaker: string;
    en: string;
    ar: string;
    fr: string;
    es: string;
    it: string;
    zh: string;
    de: string;
  }>;
  quizQuestion: string;
  quizOptions: string[];
  quizCorrect: number;
  quizExplanation: string;
}

const HOTEL_THEMES: Array<{
  category: HotelLesson['category'];
  titles: string[];
  phrases: Array<{
    en: string;
    ar: string;
    fr: string;
    es: string;
    it: string;
    zh: string;
    de: string;
  }>;
  dialogue: HotelBlueprint['dialogue'];
  quizQuestion: string;
  quizOptions: string[];
  quizCorrect: number;
  quizExplanation: string;
}> = [
  // 1. CHECK-IN (Ordered #1)
  {
    category: 'Check-in',
    titles: [
      '1. Warm Hotel Check-in & Reservation Welcome',
      'Passport Verification & Registration Card',
      'Explaining Breakfast Hours, Wi-Fi & Amenities',
      'Handling Early Arrival & Luggage Storage',
      'Suite Escort & Personalized Welcome Note',
    ],
    phrases: [
      {
        en: 'Welcome to our hotel, may I have your reservation name and passport?',
        ar: 'مرحباً بكم في فندقنا، هل لي باسم الحجز وجواز السفر من فضلكم؟',
        fr: 'Bienvenue dans notre hôtel, puis-je avoir votre nom de réservation et votre passeport ?',
        es: 'Bienvenido a nuestro hotel, ¿me indica el nombre de su reserva y su pasaporte?',
        it: 'Benvenuto nel nostro hotel, posso avere il nome della prenotazione e il passaporto?',
        zh: '欢迎光临我们酒店，请问您的预订姓名和护照可以给我看一下吗？',
        de: 'Herzlich willkommen in unserem Hotel, darf ich Ihren Reservierungsnamen und Ihren Reisepass haben?',
      },
      {
        en: 'Here is your room keycard; your room is on the fourth floor.',
        ar: 'تفضل بطاقة الغرفة؛ غرفتكم في الطابق الرابع.',
        fr: 'Voici votre carte d’accès ; votre chambre est au quatrième étage.',
        es: 'Aquí tiene su tarjeta de acceso; su habitación está en el cuarto piso.',
        it: 'Ecco la sua tessera; la sua camera è al quarto piano.',
        zh: '这是您的房卡，您的房间在四楼。',
        de: 'Hier ist Ihre Zimmerkarte; Ihr Zimmer befindet sich im vierten Stock.',
      },
      {
        en: 'The elevator is to your left, and our bellhop will bring up your luggage.',
        ar: 'المصعد على يساركم، وسيحمل موظف الأمتعة حقائبكم إلى الغرفة.',
        fr: 'L’ascenseur est sur votre gauche et notre bagagiste montera vos valises.',
        es: 'El ascensor está a su izquierda y nuestro botones subirá su equipaje.',
        it: 'L’ascensore è alla sua sinistra e il nostro facchino porterà su i bagagli.',
        zh: '电梯在您的左手边，行李员会把您的行李送到房间。',
        de: 'Der Aufzug befindet sich links und unser Gepäckträger bringt Ihre Koffer nach oben.',
      },
    ],
    dialogue: [
      {
        speaker: 'Receptionist',
        en: 'Good afternoon, and welcome to our hotel! Do you have a reservation with us?',
        ar: 'مساء الخير وأهلاً بكم في فندقنا! هل لديكم حجز مسبق لدينا؟',
        fr: 'Bonjour et bienvenue dans notre hôtel ! Avez-vous une réservation ?',
        es: '¡Buenas tardes y bienvenido a nuestro hotel! ¿Tiene una reserva?',
        it: 'Buon pomeriggio e benvenuto nel nostro hotel! Ha una prenotazione?',
        zh: '下午好，欢迎光临我们酒店！请问您有预订吗？',
        de: 'Guten Tag und herzlich willkommen in unserem Hotel! Haben Sie eine Reservierung?',
      },
      {
        speaker: 'Guest',
        en: 'Yes, under Amira Mansouri—a double room for three nights.',
        ar: 'نعم، باسم أميرة منصوري؛ غرفة مزدوجة لثلاث ليالٍ.',
        fr: 'Oui, au nom d’Amira Mansouri : une chambre double pour trois nuits.',
        es: 'Sí, a nombre de Amira Mansouri: una habitación doble para tres noches.',
        it: 'Sì, a nome di Amira Mansouri: una camera doppia per tre notti.',
        zh: '是的，预订人是阿米拉·曼苏里，三晚双人间。',
        de: 'Ja, auf den Namen Amira Mansouri — ein Doppelzimmer für drei Nächte.',
      },
      {
        speaker: 'Receptionist',
        en: 'May I see your ID or passport, please? Your room 408 is ready with Wi-Fi and breakfast included.',
        ar: 'هل يمكنني الاطلاع على بطاقة الهوية أو جواز السفر من فضلكِ؟ الغرفة 408 جاهزة وتشمل الإنترنت والإفطار.',
        fr: 'Puis-je voir votre pièce d’identité ou passeport ? Votre chambre 408 est prête avec Wi-Fi et petit déjeuner inclus.',
        es: '¿Me permite su documento o pasaporte? Su habitación 408 está lista con wifi y desayuno incluidos.',
        it: 'Posso vedere il documento o il passaporto? La camera 408 è pronta con Wi-Fi e colazione inclusi.',
        zh: '请出示您的身份证或护照好吗？408房间已准备好，包含无线网络和早餐。',
        de: 'Darf ich bitte Ihren Ausweis oder Reisepass sehen? Ihr Zimmer 408 ist bezugsfertig, inklusive WLAN und Frühstück.',
      },
      {
        speaker: 'Guest',
        en: 'Thank you very much! What time is breakfast served tomorrow morning?',
        ar: 'شكراً جزيلاً! في أي ساعة يُقدّم الإفطار صباح الغد؟',
        fr: 'Merci beaucoup ! À quelle heure est servi le petit déjeuner demain matin ?',
        es: '¡Muchas gracias! ¿A qué hora se sirve el desayuno mañana por la mañana?',
        it: 'Grazie mille! A che ora viene servita la colazione domani mattina?',
        zh: '非常感谢！请问明天早上几点供应早餐？',
        de: 'Vielen Dank! Wann wird morgen früh das Frühstück serviert?',
      },
      {
        speaker: 'Receptionist',
        en: 'Breakfast is served from seven to ten thirty in the main dining hall. Enjoy your stay!',
        ar: 'يُقدّم الإفطار من السابعة حتى العاشرة والنصف في قاعة الطعام الرئيسية. إقامة طيبة!',
        fr: 'Le petit déjeuner est servi de sept heures à dix heures trente dans la salle principale. Excellent séjour !',
        es: 'El desayuno se sirve de siete a diez y media en el comedor principal. ¡Feliz estancia!',
        it: 'La colazione è servita dalle sette alle dieci e mezza nella sala principale. Buon soggiorno!',
        zh: '早餐时间为七点至十点半，在一楼主餐厅享用。祝您入住愉快！',
        de: 'Das Frühstück wird von sieben bis zehn Uhr dreißig im Hauptspeisesaal serviert. Angenehmen Aufenthalt!',
      },
    ],
    quizQuestion: 'What is the most polished first step during a hotel check-in?',
    quizOptions: [
      'Greet warmly, confirm the reservation name, and verify ID or passport politely',
      'Hand over the keycard immediately without confirming dates or guest name',
      'Ask the guest to wait outside until evening',
      'Skip explaining breakfast hours and Wi-Fi access',
    ],
    quizCorrect: 0,
    quizExplanation: 'A warm welcome, reservation verification, and clear orientation set an exemplary standard.',
  },
  // 2. ROOM SERVICE (Ordered #2)
  {
    category: 'Room Service',
    titles: [
      '2. Ordering In-Room Dining & Preferences',
      'Confirming Dietary Allergies & Cooking Style',
      'Providing Accurate Delivery Times & Tray Setup',
      'Polite Knock & In-Room Table Presentation',
      'Requesting Fresh Towels, Pillows & Housekeeping',
    ],
    phrases: [
      {
        en: 'Good evening, Room Service speaking. How may I assist you tonight?',
        ar: 'مساء الخير، خدمة الغرف معكم. كيف يمكنني خدمتكم الليلة؟',
        fr: 'Bonsoir, service d’étage à l’appareil. Comment puis-je vous aider ce soir ?',
        es: 'Buenas noches, servicio a la habitación. ¿En qué puedo ayudarle esta noche?',
        it: 'Buonasera, servizio in camera. Come posso aiutarla questa sera?',
        zh: '晚上好，客房服务部。请问今晚有什么可以为您效劳？',
        de: 'Guten Abend, Zimmerservice am Apparat. Wie darf ich Ihnen heute Abend helfen?',
      },
      {
        en: 'Do you have any food allergies or dietary preferences we should note?',
        ar: 'هل لديكم أي حساسية غذائية أو تفضيلات خاصة يجب تدوينها؟',
        fr: 'Avez-vous des allergies alimentaires ou des préférences à signaler ?',
        es: '¿Tiene alguna alergia alimentaria o preferencia que debamos anotar?',
        it: 'Ha allergie alimentari o preferenze dietetiche da segnalare?',
        zh: '请问您有食物过敏或忌口需要厨房特别注意吗？',
        de: 'Haben Sie Lebensmittelallergien oder besondere Wünsche, die wir vermerken sollen?',
      },
      {
        en: 'Your order and extra towels will arrive in approximately twenty minutes.',
        ar: 'سيصل طلبكم والمناشف الإضافية خلال عشرين دقيقة تقريباً.',
        fr: 'Votre commande et les serviettes supplémentaires arriveront dans environ vingt minutes.',
        es: 'Su pedido y las toallas adicionales llegarán en unos veinte minutos.',
        it: 'Il suo ordine e gli asciugamani extra arriveranno tra circa venti minuti.',
        zh: '您的餐点和额外毛巾大约二十分钟后送到。',
        de: 'Ihre Bestellung und die zusätzlichen Handtücher treffen in etwa zwanzig Minuten ein.',
      },
    ],
    dialogue: [
      {
        speaker: 'Staff',
        en: 'Good evening, Room Service speaking. How may I help you?',
        ar: 'مساء الخير، خدمة الغرف معكم. كيف يمكنني مساعدتكم؟',
        fr: 'Bonsoir, service d’étage. Comment puis-je vous aider ?',
        es: 'Buenas noches, servicio a la habitación. ¿Cómo puedo ayudarle?',
        it: 'Buonasera, servizio in camera. Come posso aiutarla?',
        zh: '晚上好，客房服务部。请问有什么需要？',
        de: 'Guten Abend, Zimmerservice. Wie kann ich Ihnen helfen?',
      },
      {
        speaker: 'Guest',
        en: 'Hello, I am in room 704. Could I order grilled chicken with steamed vegetables and mint tea?',
        ar: 'مرحباً، أنا في الغرفة 704. هل يمكنني طلب دجاج مشوي مع خضار مطهوة على البخار وشاي بالنعناع؟',
        fr: 'Bonjour, je suis en chambre 704. Puis-je commander du poulet grillé avec des légumes vapeur et un thé à la menthe ?',
        es: 'Hola, estoy en la habitación 704. ¿Puedo pedir pollo a la plancha con verduras al vapor y té de menta?',
        it: 'Salve, sono nella camera 704. Posso ordinare pollo alla griglia con verdure al vapore e tè alla menta?',
        zh: '您好，我是704房间的客人。可以点一份烤鸡配蒸蔬菜和薄荷茶吗？',
        de: 'Hallo, ich bin in Zimmer 704. Könnte ich gegrilltes Hähnchen mit gedünstetem Gemüse und Minztee bestellen?',
      },
      {
        speaker: 'Staff',
        en: 'Certainly! Are there any allergies we should inform the chef about, and would you also like still or sparkling water?',
        ar: 'بالتأكيد! هل توجد أي حساسية غذائية لنخبر الطاهي بها، وهل تفضلون ماءً عادياً أم فواراً؟',
        fr: 'Bien sûr ! Avez-vous des allergies à signaler au chef, et souhaitez-vous de l’eau plate ou gazeuse ?',
        es: '¡Por supuesto! ¿Debemos avisar al chef de alguna alergia y prefiere agua sin gas o con gas?',
        it: 'Certamente! Ci sono allergie da segnalare allo chef e preferisce acqua naturale o frizzante?',
        zh: '好的！需要通知厨师任何过敏食材吗？另外需要配矿泉水还是气泡水？',
        de: 'Sehr gern! Sollen wir dem Koch Allergien mitteilen und wünschen Sie stilles oder sprudelndes Wasser?',
      },
      {
        speaker: 'Guest',
        en: 'No allergies, and still water please. Also, could we receive two extra bath towels?',
        ar: 'لا توجد حساسية، وماء عادياً من فضلكم. هل يمكننا أيضاً الحصول على منشفتي استحمام إضافيتين؟',
        fr: 'Aucune allergie, et de l’eau plate s’il vous plaît. Pouvons-nous aussi avoir deux serviettes supplémentaires ?',
        es: 'Ninguna alergia, y agua sin gas por favor. ¿También podríamos recibir dos toallas de baño adicionales?',
        it: 'Nessuna allergia, e acqua naturale per favore. Potremmo avere anche due asciugamani in più?',
        zh: '没有过敏，请配矿泉水。另外还能再送两条浴巾吗？',
        de: 'Keine Allergien und bitte stilles Wasser. Könnten wir außerdem zwei zusätzliche Badetücher bekommen?',
      },
      {
        speaker: 'Staff',
        en: 'With pleasure. Your meal and fresh towels will be delivered to room 704 in twenty minutes.',
        ar: 'بكل سرور. ستصلكم الوجبة والمناشف النظيفة إلى الغرفة 704 خلال عشرين دقيقة.',
        fr: 'Avec plaisir. Votre repas et vos serviettes propres arriveront en chambre 704 dans vingt minutes.',
        es: 'Con mucho gusto. Su comida y las toallas limpias llegarán a la habitación 704 en veinte minutos.',
        it: 'Con piacere. Il pasto e gli asciugamani freschi arriveranno in camera 704 tra venti minuti.',
        zh: '没问题，您的餐食和干净毛巾将在二十分钟内送到704房间。',
        de: 'Sehr gern. Ihr Essen und frische Handtücher werden in zwanzig Minuten in Zimmer 704 geliefert.',
      },
    ],
    quizQuestion: 'Before ending a room service order call, which three details must you confirm?',
    quizOptions: [
      'Room number, food allergies/preferences, and estimated delivery time',
      'Passport number, flight number, and hometown',
      'Only the drink choice without the room number',
      'Nothing—just hang up quickly',
    ],
    quizCorrect: 0,
    quizExplanation: 'Confirming room number, dietary needs, and clear delivery time prevents delays and safety errors.',
  },
  // 3. BREAKFAST (Ordered #3)
  {
    category: 'Breakfast',
    titles: [
      '3. Welcoming Guests to the Breakfast Buffet',
      'Taking Hot Beverage & Egg Preferences',
      'Explaining Local & Continental Breakfast Stations',
      'Handling Halal, Vegetarian & Gluten-Free Requests',
    ],
    phrases: [
      {
        en: 'Good morning! May I have your room number and seat you near the terrace?',
        ar: 'صباح الخير! هل لي برقم غرفتكم ومرافقتكم إلى طاولة قرب الشرفة؟',
        fr: 'Bonjour ! Puis-je avoir votre numéro de chambre et vous installer près de la terrasse ?',
        es: '¡Buenos días! ¿Me indica su número de habitación para sentarlos cerca de la terraza?',
        it: 'Buongiorno! Posso avere il numero di camera e accompagnarla vicino alla terrazza?',
        zh: '早上好！请问您的房号是多少？我为您安排靠近露台的座位好吗？',
        de: 'Guten Morgen! Darf ich Ihre Zimmernummer haben und Sie an einem Tisch nahe der Terrasse platzieren?',
      },
      {
        en: 'Would you prefer freshly brewed coffee, mint tea, or orange juice this morning?',
        ar: 'هل تفضلون القهوة الطازجة أم الشاي بالنعناع أم عصير البرتقال هذا الصباح؟',
        fr: 'Préférez-vous un café fraîchement préparé, un thé à la menthe ou un jus d’orange ce matin ?',
        es: '¿Prefiere café recién hecho, té de menta o jugo de naranja esta mañana?',
        it: 'Preferisce caffè fresco, tè alla menta o spremuta d’arancia stamattina?',
        zh: '今天早上您想喝现煮咖啡、薄荷茶还是鲜榨橙汁？',
        de: 'Möchten Sie heute Morgen frisch gebrühten Kaffee, Minztee oder Orangensaft?',
      },
      {
        en: 'How would you like your eggs prepared—scrambled, poached, or as an omelet?',
        ar: 'كيف تفضلون تحضير البيض—مخفوقاً أم مسلوقاً أم عجة؟',
        fr: 'Comment souhaitez-vous vos œufs : brouillés, pochés ou en omelette ?',
        es: '¿Cómo prefiere los huevos: revueltos, escalfados o en tortilla?',
        it: 'Come preferisce le uova: strapazzate, in camicia o in frittata?',
        zh: '请问您的鸡蛋喜欢怎么做法：炒蛋、水波蛋还是煎蛋卷？',
        de: 'Wie möchten Sie Ihre Eier zubereitet — als Rührei, pochiert oder als Omelett?',
      },
    ],
    dialogue: [
      {
        speaker: 'Host',
        en: 'Good morning and welcome to breakfast! May I ask for your room number?',
        ar: 'صباح الخير وأهلاً بكم في قاعة الإفطار! هل لي برقم غرفتكم من فضلكم؟',
        fr: 'Bonjour et bienvenue au petit déjeuner ! Puis-je avoir votre numéro de chambre ?',
        es: '¡Buenos días y bienvenidos al desayuno! ¿Me indica su número de habitación?',
        it: 'Buongiorno e benvenuti a colazione! Posso chiedere il numero della vostra camera?',
        zh: '早上好，欢迎享用早餐！请问您的房号是？',
        de: 'Guten Morgen und herzlich willkommen zum Frühstück! Darf ich nach Ihrer Zimmernummer fragen?',
      },
      {
        speaker: 'Guest',
        en: 'Good morning! Room 408 for two people. Is breakfast included in our booking?',
        ar: 'صباح الخير! الغرفة 408 لشخصين. هل الإفطار مشمول في حجزنا؟',
        fr: 'Bonjour ! Chambre 408 pour deux personnes. Le petit déjeuner est-il inclus dans notre réservation ?',
        es: '¡Buenos días! Habitación 408 para dos personas. ¿El desayuno está incluido en nuestra reserva?',
        it: 'Buongiorno! Camera 408 per due persone. La colazione è inclusa nella prenotazione?',
        zh: '早上好！408房两位客人。请问早餐包含在预订里吗？',
        de: 'Guten Morgen! Zimmer 408 für zwei Personen. Ist das Frühstück in unserer Buchung enthalten?',
      },
      {
        speaker: 'Host',
        en: 'Yes, it is completely included! Please follow me to this quiet table by the window. Coffee or tea?',
        ar: 'نعم، مشمول بالكامل! تفضلوا بمرافقتي إلى هذه الطاولة الهادئة بجانب النافذة. هل تفضلون القهوة أم الشاي؟',
        fr: 'Oui, il est entièrement inclus ! Suivez-moi vers cette table calme près de la fenêtre. Café ou thé ?',
        es: '¡Sí, está totalmente incluido! Síganme a esta mesa tranquila junto a la ventana. ¿Café o té?',
        it: 'Sì, è interamente inclusa! Mi segua a questo tavolo tranquillo vicino alla finestra. Caffè o tè?',
        zh: '是的，完全包含在内！请跟我到窗边这桌安静的位置。您喝咖啡还是茶？',
        de: 'Ja, es ist vollständig inbegriffen! Bitte folgen Sie mir an diesen ruhigen Tisch am Fenster. Kaffee oder Tee?',
      },
      {
        speaker: 'Guest',
        en: 'Two cappuccinos and fresh orange juice, please. Where can we find warm pastries and honey?',
        ar: 'كوبان من الكابتشينو وعصير برتقال طازج من فضلكم. أين نجد المعجنات الدافئة والعسل؟',
        fr: 'Deux cappuccinos et du jus d’orange frais, s’il vous plaît. Où se trouvent les viennoiseries chaudes et le miel ?',
        es: 'Dos capuchinos y jugo de naranja natural, por favor. ¿Dónde están los bollos calientes y la miel?',
        it: 'Due cappuccini e spremuta d’arancia fresca, per favore. Dove troviamo i cornetti caldi e il miele?',
        zh: '请来两杯卡布奇诺和鲜橙汁。请问热酥饼和蜂蜜在哪里？',
        de: 'Zwei Cappuccinos und frischen Orangensaft, bitte. Wo finden wir warmes Gebäck und Honig?',
      },
      {
        speaker: 'Host',
        en: 'Right at the bakery station behind the fruit counter, and the chef also prepares fresh omelets to order.',
        ar: 'مباشرة في ركن المخبوزات خلف طاولة الفواكه، كما يحضّر الطاهي العجة الطازجة حسب الطلب.',
        fr: 'Juste au stand boulangerie derrière le buffet de fruits, et le chef prépare aussi des omelettes à la demande.',
        es: 'Justo en la estación de panadería detrás de la fruta, y el chef también prepara tortillas al gusto.',
        it: 'Proprio all’angolo panetteria dietro la frutta fresca, e lo chef prepara anche omelette su ordinazione.',
        zh: '就在水果台后面的烘焙区，厨师还可以现场为您制作煎蛋卷。',
        de: 'Direkt an der Bäckerei-Station hinter der Obsttheke, und unser Koch bereitet auch frische Omeletts auf Wunsch zu.',
      },
    ],
    quizQuestion: 'When seating guests at breakfast, what should the host confirm first?',
    quizOptions: [
      'Room number, breakfast inclusion, seating comfort, and morning beverage choice',
      'Only their passport expiration date',
      'Tell them to find any empty chair on their own without greeting',
      'Ask them to pay before seeing the buffet',
    ],
    quizCorrect: 0,
    quizExplanation: 'Verifying the room number smoothly while offering warm seating and drink service creates a gracious morning start.',
  },
  // 4. CHECK-OUT (Ordered #4)
  {
    category: 'Check-out',
    titles: [
      '4. Smooth Morning Check-out & Stay Feedback',
      'Reviewing Itemized Folio & Local Taxes',
      'Resolving Minibar or Laundry Questions Politely',
      'Late Check-out, Luggage Storage & Airport Transfer',
    ],
    phrases: [
      {
        en: 'How was your stay with us? May I review your final bill with you?',
        ar: 'كيف كانت إقامتكم معنا؟ هل يمكنني مراجعة الفاتورة النهائية معكم؟',
        fr: 'Comment s’est passé votre séjour ? Puis-je vérifier votre facture finale avec vous ?',
        es: '¿Cómo fue su estancia? ¿Me permite revisar su factura final con usted?',
        it: 'Com’è andato il soggiorno? Posso controllare il conto finale insieme a lei?',
        zh: '您在这里住得愉快吗？我为您核对一下最终账单好吗？',
        de: 'Wie war Ihr Aufenthalt bei uns? Darf ich die Endabrechnung mit Ihnen durchgehen?',
      },
      {
        en: 'We can gladly store your luggage until your evening flight.',
        ar: 'يسعدنا حفظ أمتعتكم حتى موعد رحلتكم المسائية.',
        fr: 'Nous pouvons volontiers garder vos bagages jusqu’à votre vol du soir.',
        es: 'Con mucho gusto guardamos su equipaje hasta su vuelo de la tarde.',
        it: 'Possiamo custodire volentieri i bagagli fino al volo serale.',
        zh: '我们很乐意为您寄存行李直到傍晚航班。',
        de: 'Wir bewahren Ihr Gepäck sehr gern bis zu Ihrem Abendflug auf.',
      },
      {
        en: 'Would you like us to arrange a taxi or airport shuttle?',
        ar: 'هل ترغبون في أن نرتب لكم سيارة أجرة أو خدمة نقل إلى المطار؟',
        fr: 'Souhaitez-vous que nous organisions un taxi ou une navette pour l’aéroport ?',
        es: '¿Desea que le organicemos un taxi o traslado al aeropuerto?',
        it: 'Desidera che organizziamo un taxi o una navetta per l’aeroporto?',
        zh: '需要我们为您安排出租车或机场接送车吗？',
        de: 'Möchten Sie, dass wir ein Taxi oder einen Flughafentransfer für Sie bestellen?',
      },
    ],
    dialogue: [
      {
        speaker: 'Guest',
        en: 'Good morning, I would like to check out of room 408, please.',
        ar: 'صباح الخير، أريد تسجيل المغادرة من الغرفة 408 من فضلكم.',
        fr: 'Bonjour, je souhaite libérer la chambre 408, s’il vous plaît.',
        es: 'Buenos días, quisiera hacer el check-out de la habitación 408, por favor.',
        it: 'Buongiorno, vorrei effettuare il check-out dalla camera 408, per favore.',
        zh: '早上好，我要办理408房间的退房手续。',
        de: 'Guten Morgen, ich möchte bitte aus Zimmer 408 auschecken.',
      },
      {
        speaker: 'Receptionist',
        en: 'Certainly! I hope you enjoyed your stay. Here is your itemized invoice—did you use the minibar this morning?',
        ar: 'بكل سرور! آمل أن تكونوا قد استمتعتم بإقامتكم. إليكم الفاتورة المفصلة—هل استخدمتم الميني بار هذا الصباح؟',
        fr: 'Bien sûr ! J’espère que vous avez apprécié votre séjour. Voici votre facture détaillée ; avez-vous utilisé le minibar ce matin ?',
        es: '¡Por supuesto! Espero que hayan disfrutado su estancia. Aquí tiene su factura detallada; ¿usaron el minibar esta mañana?',
        it: 'Certamente! Spero che il soggiorno sia stato piacevole. Ecco il conto dettagliato; ha usato il minibar stamattina?',
        zh: '好的！希望您入住愉快。这是您的消费明细，请问今天早上使用过迷你吧吗？',
        de: 'Sehr gern! Ich hoffe, Sie hatten einen angenehmen Aufenthalt. Hier ist Ihre detaillierte Rechnung — haben Sie heute die Minibar genutzt?',
      },
      {
        speaker: 'Guest',
        en: 'Just one bottle of sparkling water. Everything else looks accurate. Can I pay by card?',
        ar: 'فقط زجاجة ماء فوار واحدة. كل شيء آخر صحيح. هل يمكنني الدفع بالبطاقة؟',
        fr: 'Juste une bouteille d’eau gazeuse. Tout le reste est exact. Puis-je payer par carte ?',
        es: 'Solo una botella de agua con gas. Todo lo demás está correcto. ¿Puedo pagar con tarjeta?',
        it: 'Solo una bottiglia d’acqua frizzante. Tutto il resto è esatto. Posso pagare con la carta?',
        zh: '只喝了一瓶气泡水，其他费用都准确。可以刷卡吗？',
        de: 'Nur eine Flasche Sprudelwasser. Alles andere stimmt. Kann ich mit Karte zahlen?',
      },
      {
        speaker: 'Receptionist',
        en: 'Yes, of course. Here is your printed receipt. Would you like a taxi to the airport or luggage storage?',
        ar: 'نعم بالتأكيد. تفضلوا إيصال الدفع المطبوع. هل تحتاجون إلى سيارة أجرة للمطار أم حفظ الأمتعة؟',
        fr: 'Oui, bien entendu. Voici votre reçu imprimé. Souhaitez-vous un taxi pour l’aéroport ou la consigne à bagages ?',
        es: 'Sí, claro. Aquí tiene su recibo impreso. ¿Necesita un taxi al aeropuerto o guardar el equipaje?',
        it: 'Sì, certamente. Ecco la ricevuta stampata. Desidera un taxi per l’aeroporto o il deposito bagagli?',
        zh: '当然可以。这是您的打印收据。您需要去机场的出租车还是行李寄存服务？',
        de: 'Ja, natürlich. Hier ist Ihre gedruckte Quittung. Möchten Sie ein Taxi zum Flughafen oder eine Gepäckaufbewahrung?',
      },
      {
        speaker: 'Guest',
        en: 'Yes, a taxi in ten minutes would be wonderful. Thank you for everything!',
        ar: 'نعم، سيارة أجرة بعد عشر دقائق ستكون رائعة. شكراً على كل شيء!',
        fr: 'Oui, un taxi dans dix minutes serait parfait. Merci pour tout !',
        es: 'Sí, un taxi en diez minutos sería maravilloso. ¡Gracias por todo!',
        it: 'Sì, un taxi tra dieci minuti sarebbe perfetto. Grazie di tutto!',
        zh: '好的，十分钟后安排一辆出租车就太棒了。非常感谢您的款待！',
        de: 'Ja, ein Taxi in zehn Minuten wäre wunderbar. Vielen Dank für alles!',
      },
    ],
    quizQuestion: 'When a guest questions a minibar charge at check-out, what is best practice?',
    quizOptions: [
      'Listen calmly, apologize for any confusion, and verify or adjust transparently',
      'Insist the computer system cannot make errors',
      'Refuse to provide an itemized receipt',
      'Ask the guest to return next month',
    ],
    quizCorrect: 0,
    quizExplanation: 'Calm transparency and swift verification preserve guest goodwill at departure.',
  },
  // 5. BOOKING
  {
    category: 'Booking',
    titles: [
      'Checking Room Availability & Seasonal Rates',
      'Explaining Cancellation Policies Clearly',
      'Upgrading Guests & Special Occasion Notes',
      'Modifying Dates & Group Reservations',
    ],
    phrases: [
      {
        en: 'We have a sea-view junior suite available for those exact dates.',
        ar: 'لدينا جناح جونيور مطل على البحر متاح لتلك التواريخ تحديداً.',
        fr: 'Nous avons une suite junior vue mer disponible pour ces dates exactes.',
        es: 'Tenemos una junior suite con vista al mar disponible para esas fechas.',
        it: 'Abbiamo una junior suite vista mare disponibile per quelle date.',
        zh: '那些日期我们刚好有一间海景小套房。',
        de: 'Für genau diese Daten haben wir eine Junior-Suite mit Meerblick frei.',
      },
      {
        en: 'Free cancellation is available up to forty-eight hours before arrival.',
        ar: 'الإلغاء المجاني متاح حتى 48 ساعة قبل الوصول.',
        fr: 'L’annulation gratuite est possible jusqu’à quarante-huit heures avant l’arrivée.',
        es: 'La cancelación gratuita está disponible hasta cuarenta y ocho horas antes.',
        it: 'La cancellazione gratuita è possibile fino a quarantotto ore prima.',
        zh: '入住前四十八小时可免费取消。',
        de: 'Kostenlose Stornierung ist bis zu achtundvierzig Stunden vor Anreise möglich.',
      },
    ],
    dialogue: [
      {
        speaker: 'Guest',
        en: 'Hi, I would like to book two connecting rooms from May 12th to May 15th.',
        ar: 'مرحباً، أود حجز غرفتين متصلتين من 12 إلى 15 مايو.',
        fr: 'Bonjour, je souhaite réserver deux chambres communicantes du 12 au 15 mai.',
        es: 'Hola, quisiera reservar dos habitaciones comunicadas del 12 al 15 de mayo.',
        it: 'Salve, vorrei prenotare due camere comunicanti dal 12 al 15 maggio.',
        zh: '您好，我想预订5月12日至15日两间连通房。',
        de: 'Hallo, ich möchte zwei Zimmer mit Verbindungstür vom 12. bis 15. Mai buchen.',
      },
      {
        speaker: 'Agent',
        en: 'I would be happy to help with that! Both connecting rooms include breakfast and flexible cancellation.',
        ar: 'يسعدني مساعدتكم في ذلك! كلتا الغرفتين تشملان الإفطار وإمكانية الإلغاء المرن.',
        fr: 'Avec plaisir ! Les deux chambres communicantes incluent le petit déjeuner et l’annulation flexible.',
        es: '¡Con gusto! Ambas habitaciones incluyen desayuno y cancelación flexible.',
        it: 'Certamente! Entrambe le camere includono colazione e cancellazione flessibile.',
        zh: '没问题！两间连通房都含早餐且支持灵活取消。',
        de: 'Sehr gern! Beide Zimmer beinhalten Frühstück und flexible Stornierung.',
      },
    ],
    quizQuestion: 'Why should reservation agents always repeat dates, room type, and cancellation policy?',
    quizOptions: [
      'To prevent misunderstandings and ensure full transparency before payment',
      'To lengthen the conversation unnecessarily',
      'To avoid sending a written confirmation email',
      'Because the booking system deletes dates automatically',
    ],
    quizCorrect: 0,
    quizExplanation: 'Confirming key reservation terms verbally prevents disputes and builds trust.',
  },
  // 6. ANGRY CUSTOMER
  {
    category: 'Angry Customer',
    titles: [
      'Active Listening & Empathy Statements',
      'Handling Noise Complaints at Midnight',
      'Recovering from Housekeeping Oversights',
      'Executive Follow-Up & Service Recovery',
    ],
    phrases: [
      {
        en: 'I completely understand your frustration, and I sincerely apologize.',
        ar: 'أتفهم تماماً انزعاجكم، وأعتذر بصدق عن ذلك.',
        fr: 'Je comprends parfaitement votre frustration et je vous présente nos sincères excuses.',
        es: 'Comprendo perfectamente su molestia y le pido sinceras disculpas.',
        it: 'Capisco perfettamente il suo disappunto e mi scuso sinceramente.',
        zh: '我完全理解您的不满，谨致以诚挚的歉意。',
        de: 'Ich verstehe Ihren Ärger vollkommen und entschuldige mich aufrichtig.',
      },
      {
        en: 'Let me resolve this immediately by moving you to a quiet suite.',
        ar: 'دعوني أحل هذا فوراً بنقلكم إلى جناح هادئ.',
        fr: 'Permettez-moi de résoudre cela tout de suite en vous installant dans une suite calme.',
        es: 'Permítame resolverlo de inmediato trasladándolo a una suite tranquila.',
        it: 'Mi lasci risolvere subito trasferendola in una suite silenziosa.',
        zh: '请让我立即为您安排更换到安静的套房。',
        de: 'Lassen Sie mich das sofort lösen, indem ich Ihnen eine ruhige Suite gebe.',
      },
    ],
    dialogue: [
      {
        speaker: 'Guest',
        en: 'Excuse me, the air conditioning in my room is really loud, and I cannot sleep!',
        ar: 'معذرةً، مكيف الهواء في غرفتي مزعج للغاية ولا أستطيع النوم!',
        fr: 'Excusez-moi, la climatisation dans ma chambre est très bruyante et je n’arrive pas à dormir !',
        es: 'Disculpe, ¡el aire acondicionado de mi habitación hace mucho ruido y no puedo dormir!',
        it: 'Mi scusi, l’aria condizionata in camera è molto rumorosa e non riesco a dormire!',
        zh: '打扰一下，我房间的空调噪音很大，完全无法入睡！',
        de: 'Entschuldigen Sie, die Klimaanlage in meinem Zimmer ist sehr laut und ich kann nicht schlafen!',
      },
      {
        speaker: 'Manager',
        en: 'I am truly sorry for the inconvenience. I have prepared a quiet corner suite for you right away.',
        ar: 'أعتذر بصدق عن هذا الإزعاج. لقد جهزت لكم جناحاً هادئاً الآن فوراً.',
        fr: 'Je suis sincèrement désolé pour ce désagrément. Je vous ai préparé une suite calme dès maintenant.',
        es: 'Lamento muchísimo las molestias. Ya le preparé una suite tranquila en este mismo momento.',
        it: 'Mi scuso sinceramente per il disagio. Ho già preparato per lei una suite silenziosa.',
        zh: '非常抱歉给您带来不便，我已为您准备好一间安静的转角套房。',
        de: 'Es tut mir aufrichtig leid für die Unannehmlichkeit. Ich habe sofort eine ruhige Eck-Suite für Sie vorbereitet.',
      },
    ],
    quizQuestion: 'In hospitality de-escalation (L.E.A.R.N.), what should come FIRST when a guest is upset?',
    quizOptions: [
      'Listen attentively without interrupting, then Empathize and Apologize',
      'Defend hotel policy immediately before the guest finishes speaking',
      'Blame another department for the issue',
      'Walk away until the guest calms down',
    ],
    quizCorrect: 0,
    quizExplanation: 'Listening without interrupting and validating the guest’s feelings immediately lowers tension.',
  },
  // 7. PHONE
  {
    category: 'Phone',
    titles: [
      'Answering Within 3 Rings with Warmth',
      'Spelling Guest Names Clearly',
      'Placing Callers on Hold Politely',
      'Warm Call Transfers & Callbacks',
    ],
    phrases: [
      {
        en: 'Grand Palace Hotel, Clara speaking, how may I assist you?',
        ar: 'فندق غراند بالاس، معكم كلارا، كيف يمكنني مساعدتكم؟',
        fr: 'Hôtel Grand Palace, Clara à l’appareil, comment puis-je vous aider ?',
        es: 'Hotel Grand Palace, le atiende Clara, ¿en qué puedo ayudarle?',
        it: 'Grand Palace Hotel, parla Clara, come posso assisterla?',
        zh: '大皇宫酒店，我是克拉拉，请问有什么可以帮您？',
        de: 'Grand Palace Hotel, Clara am Apparat, wie kann ich Ihnen helfen?',
      },
      {
        en: 'May I place you on a brief hold for one minute while I check?',
        ar: 'هل تسمحون لي بوضعكم على الانتظار لدقيقة واحدة ريثما أتحقق؟',
        fr: 'Puis-je vous faire patienter un court instant pendant que je vérifie ?',
        es: '¿Me permite ponerlo en espera un breve momento mientras verifico?',
        it: 'Posso metterla in attesa un minuto mentre controllo?',
        zh: '请您稍等一分钟，我帮您核实一下可以吗？',
        de: 'Darf ich Sie kurz für eine Minute in die Warteschleife legen, während ich nachsehe?',
      },
    ],
    dialogue: [
      {
        speaker: 'Caller',
        en: 'Hello, could you put me through to the Spa Reception, please?',
        ar: 'مرحباً، هل يمكنكم تحويلي إلى استقبال السبا من فضلكم؟',
        fr: 'Bonjour, pourriez-vous me passer la réception du Spa ?',
        es: 'Hola, ¿podría comunicarme con la recepción del Spa?',
        it: 'Salve, potrebbe passarmi la reception della Spa?',
        zh: '您好，能帮我转接水疗中心前台吗？',
        de: 'Hallo, könnten Sie mich mit dem Spa-Empfang verbinden?',
      },
      {
        speaker: 'Operator',
        en: 'Of course, Mrs. Laurent. Please hold for just a moment while I connect you.',
        ar: 'بكل سرور، سيدة لوران. تفضلي بالانتظار لحظة فقط ريثما أحوّل المكالمة.',
        fr: 'Avec plaisir, Madame Laurent. Ne quittez pas un instant.',
        es: 'Con mucho gusto, señora Laurent. Un momento por favor.',
        it: 'Con piacere, signora Laurent. Resti in linea un attimo.',
        zh: '好的，劳伦特女士，请稍等片刻。',
        de: 'Sehr gern, Frau Laurent. Bitte bleiben Sie kurz in der Leitung.',
      },
    ],
    quizQuestion: 'Before placing a hotel caller on hold, you must always:',
    quizOptions: [
      'Ask permission and wait for their confirmation before pressing hold',
      'Press hold immediately mid-sentence',
      'Transfer to a random extension',
      'Hang up and ask them to call back',
    ],
    quizCorrect: 0,
    quizExplanation: 'Always ask permission and wait for confirmation before putting any guest on hold.',
  },
  // 8. EMAIL
  {
    category: 'Email',
    titles: [
      'Writing Polished Reservation Confirmations',
      'Responding Professionally to Guest Inquiries',
      'Handling Group Quotes & Conference Requests',
      'Apology & Service Recovery Follow-Up Emails',
    ],
    phrases: [
      {
        en: 'Thank you for choosing our hotel; we look forward to welcoming you.',
        ar: 'شكراً لاختياركم فندقنا؛ نتطلع بشوق لاستقبالكم.',
        fr: 'Merci d’avoir choisi notre hôtel ; nous avons hâte de vous accueillir.',
        es: 'Gracias por elegir nuestro hotel; será un placer recibirle.',
        it: 'Grazie per aver scelto il nostro hotel; non vediamo l’ora di accoglierla.',
        zh: '感谢您选择下榻我们酒店，期待您的光临。',
        de: 'Vielen Dank für Ihre Wahl unseres Hotels; wir freuen uns darauf, Sie zu begrüßen.',
      },
      {
        en: 'Please find attached your updated confirmation and airport transfer guide.',
        ar: 'تجدون مرفقاً تأكيد الحجز المحدّث ودليل النقل من المطار.',
        fr: 'Veuillez trouver ci-joint votre confirmation mise à jour et le guide d’arrivée.',
        es: 'Adjunto encontrará su confirmación actualizada y la guía del aeropuerto.',
        it: 'In allegato trova la conferma aggiornata e la guida dall’aeroporto.',
        zh: '随信附上更新后的预订确认单和机场交通指南。',
        de: 'Anbei erhalten Sie Ihre aktualisierte Bestätigung sowie den Flughafentransfer-Leitfaden.',
      },
    ],
    dialogue: [
      {
        speaker: 'Reservations',
        en: 'Dear Mr. Martin, thank you for reaching out regarding our conference suite.',
        ar: 'عزيزي السيد مارتن، شكراً لاستفساركم بشأن جناح المؤتمرات لدينا.',
        fr: 'Cher Monsieur Martin, merci pour votre demande concernant notre suite conférence.',
        es: 'Estimado Sr. Martin, gracias por su consulta sobre nuestra suite de conferencias.',
        it: 'Gentile Signor Martin, grazie per la sua richiesta relativa alla suite conferenze.',
        zh: '尊敬的马丁先生，感谢您咨询我们的会议套房。',
        de: 'Sehr geehrter Herr Martin, vielen Dank für Ihre Anfrage zu unserer Konferenz-Suite.',
      },
      {
        speaker: 'Guest',
        en: 'Thank you for the quick reply and the clear breakdown of the rates.',
        ar: 'شكراً على الرد السريع وتفصيل الأسعار الواضح.',
        fr: 'Merci pour votre réponse rapide et le détail clair des tarifs.',
        es: 'Gracias por la pronta respuesta y el desglose claro de tarifas.',
        it: 'Grazie per la risposta rapida e il dettaglio chiaro delle tariffe.',
        zh: '感谢您迅速的回复和清晰的报价明细。',
        de: 'Vielen Dank für die schnelle Antwort und die klare Preisübersicht.',
      },
    ],
    quizQuestion: 'Which closing is most appropriate for a 5-star hotel reservation email?',
    quizOptions: [
      'Warm regards, / Cordialement, [Full Name], Front Office Team',
      'See ya soon!!',
      'Sent from my phone',
      'No closing needed',
    ],
    quizCorrect: 0,
    quizExplanation: 'A courteous sign-off with your full name and department maintains executive hospitality tone.',
  },
  // 9. TOURISM
  {
    category: 'Tourism',
    titles: [
      'Curating Local Walking & Museum Routes',
      'Booking Private Chauffeurs & City Tours',
      'Recommending Authentic Dining & Dietary Options',
      'Algeria Heritage & Coastal Concierge Recommendations',
    ],
    phrases: [
      {
        en: 'I highly recommend visiting the historic Casbah and seaside promenade before sunset.',
        ar: 'أوصي بشدة بزيارة القصبة التاريخية والواجهة البحرية قبل الغروب.',
        fr: 'Je vous recommande vivement de visiter la Casbah historique et la promenade maritime avant le coucher du soleil.',
        es: 'Le recomiendo visitar la Casbah histórica y el paseo marítimo antes del atardecer.',
        it: 'Le consiglio vivamente di visitare la storica Casbah e il lungomare prima del tramonto.',
        zh: '我强烈建议您在日落前游览历史悠久的古城卡斯巴和海滨大道。',
        de: 'Ich empfehle Ihnen wärmstens, die historische Kasbah und die Uferpromenade vor Sonnenuntergang zu besuchen.',
      },
      {
        en: 'Shall I reserve museum tickets and a licensed guide for tomorrow morning?',
        ar: 'هل أحجز لكم تذاكر المتحف ومرشداً سياحياً معتمداً لغدٍ صباحاً؟',
        fr: 'Puis-je vous réserver des billets de musée et un guide agréé pour demain matin ?',
        es: '¿Le reservo entradas al museo y un guía autorizado para mañana por la mañana?',
        it: 'Posso prenotarle i biglietti per il museo e una guida autorizzata per domani mattina?',
        zh: '需要我帮您预订明早的博物馆门票和专业导游吗？',
        de: 'Soll ich Ihnen für morgen früh Museumstickets und einen lizenzierten Reiseführer reservieren?',
      },
    ],
    dialogue: [
      {
        speaker: 'Concierge',
        en: 'Good morning! Are you interested in historic landmarks or coastal views in Algeria today?',
        ar: 'صباح الخير! هل ترغبون اليوم في زيارة المعالم التاريخية أم الاستمتاع بالإطلالات الساحلية في الجزائر؟',
        fr: 'Bonjour ! Souhaitez-vous découvrir des monuments historiques ou des vues côtières en Algérie aujourd’hui ?',
        es: '¡Buenos días! ¿Le interesan los monumentos históricos o las vistas costeras en Argelia hoy?',
        it: 'Buongiorno! Preferisce visitare monumenti storici o ammirare la costa algerina oggi?',
        zh: '早上好！今天您想在阿尔及利亚游览历史古迹还是欣赏海岸风光？',
        de: 'Guten Morgen! Möchten Sie heute historische Denkmäler oder die Küstenlandschaft in Algerien erkunden?',
      },
      {
        speaker: 'Guest',
        en: 'Both sounds lovely! And could you recommend a quiet, family-friendly restaurant for dinner?',
        ar: 'كلاهما رائع! وهل يمكنكم ترشيح مطعم عائلي هادئ للعشاء؟',
        fr: 'Les deux semblent parfaits ! Pourriez-vous aussi conseiller un restaurant familial calme pour le dîner ?',
        es: '¡Ambos suenan encantadores! ¿Podría recomendar un restaurante familiar tranquilo para cenar?',
        it: 'Entrambi sembrano splendidi! Potrebbe consigliarci un ristorante familiare tranquillo per cena?',
        zh: '两个都很棒！另外能推荐一家安静的家庭餐厅用晚餐吗？',
        de: 'Beides klingt wunderbar! Und könnten Sie ein ruhiges Familienrestaurant fürs Abendessen empfehlen?',
      },
    ],
    quizQuestion: 'What makes a concierge recommendation truly memorable?',
    quizOptions: [
      'Tailoring suggestions to the guest’s interests, timing, and offering to arrange bookings',
      'Handing over an unmarked city brochure without speaking',
      'Recommending only the most expensive venue regardless of taste',
      'Telling the guest to search online',
    ],
    quizCorrect: 0,
    quizExplanation: 'Personalized tailoring plus proactive booking turns information into luxury hospitality.',
  },
];

// Build 38 regular hotel lessons + Lesson 39 (CV) + Lesson 40 (Job Interview) = 40 lessons
const generatedLessons: HotelLesson[] = [];
let lessonCounter = 1;

for (const theme of HOTEL_THEMES) {
  for (const title of theme.titles) {
    const id = lessonCounter++;
    const phrases = theme.phrases.map((p) => ({
      target: p.en,
      english: p.en,
      arabic: p.ar,
    }));

    generatedLessons.push({
      id,
      category: theme.category,
      title,
      scenario: `Lesson ${id} · ${theme.category}: Master authentic hotel communication for "${title}".`,
      scenarioAr: `الدرس ${id} · ${theme.category}: إتقان مهارات التواصل الفندقي الاحترافي لموضوع «${title}».`,
      phrases,
      dialogue: theme.dialogue.map((d) => ({
        speaker: d.speaker,
        text: d.en,
        english: d.en,
        arabic: d.ar,
      })),
      quiz: [
        {
          id: `hotel-${id}-q1`,
          question: theme.quizQuestion,
          options: theme.quizOptions,
          correctIndex: theme.quizCorrect,
          explanation: theme.quizExplanation,
        },
        {
          id: `hotel-${id}-q2`,
          question: `In "${title}", which tone is expected in international hospitality?`,
          options: [
            'Warm, clear, solution-focused, and respectful',
            'Abrupt and overly informal',
            'Silent without confirmation',
            'Defensive when guests ask questions',
          ],
          correctIndex: 0,
          explanation: 'Warmth, clarity, and proactive problem-solving define luxury hotel standards.',
        },
      ],
    });
  }
}

export function getLocalizedHotelContent(lessonId: number, langId: LanguageId) {
  let cursor = 1;
  for (const theme of HOTEL_THEMES) {
    for (const _title of theme.titles) {
      if (cursor === lessonId) {
        return {
          phrases: theme.phrases.map((p) => ({
            target: p[langId],
            english: p.en,
            arabic: p.ar,
          })),
          dialogue: theme.dialogue.map((d) => ({
            speaker: d.speaker,
            text: d[langId],
            english: d.en,
            arabic: d.ar,
          })),
        };
      }
      cursor++;
    }
  }
  return null;
}

// Lesson 39: Fillable Hospitality CV + Correction + Score
generatedLessons.push({
  id: 39,
  category: 'CV Builder',
  title: 'Fillable Hospitality CV + Correction & Score',
  scenario:
    'Complete your structured hotel CV below. Submit it for grammar correction, HR polish, and a CV Score /100.',
  scenarioAr: 'أكملي سيرتكِ الذاتية الفندقية أدناه للحصول على تصحيح لغوي فوري وتقييم من 100.',
  isCV: true,
  phrases: [
    {
      target: 'Dedicated multilingual Front Desk Specialist with 3+ years of guest relations experience.',
      english: 'Dedicated multilingual Front Desk Specialist with 3+ years of guest relations experience.',
      arabic: 'أخصائية استقبال متعددة اللغات بخبرة تزيد عن 3 سنوات في علاقات الضيوف.',
    },
    {
      target: 'Resolved VIP guest inquiries with a 98% satisfaction rating.',
      english: 'Resolved VIP guest inquiries with a 98% satisfaction rating.',
      arabic: 'معالجة طلبات كبار الشخصيات بنسبة رضا بلغت 98%.',
    },
  ],
  dialogue: [],
  quiz: [],
});

// Lesson 40: Real Job Interview Role-Play + Score
generatedLessons.push({
  id: 40,
  category: 'Job Interview',
  title: 'Real Hotel Job Interview Role-Play + Score',
  scenario:
    'Step into a live 5-question interview with the General Manager of a 5-Star Hotel in Algeria. Speak or type your answers to receive feedback and a Hiring Score /100.',
  scenarioAr: 'خوضي مقابلة عمل حقيقية من 5 أسئلة مع المدير العام لفندق 5 نجوم، واحصلي على تقييم فوري من 100.',
  isInterview: true,
  phrases: [
    {
      target: 'Tell me about a time you turned an unhappy hotel guest into a loyal advocate.',
      english: 'Tell me about a time you turned an unhappy hotel guest into a loyal advocate.',
      arabic: 'حدّثيني عن موقف حوّلتِ فيه ضيفاً مستاءً إلى عميل دائم وممتن.',
    },
    {
      target: 'How do you handle three simultaneous check-ins while the phone is ringing?',
      english: 'How do you handle three simultaneous check-ins while the phone is ringing?',
      arabic: 'كيف تتعاملين مع ثلاثة ضيوف لتسجيل الوصول في وقت واحد بينما يرن الهاتف؟',
    },
  ],
  dialogue: [],
  quiz: [],
});

export const HOTEL_LESSONS: HotelLesson[] = generatedLessons;

export const INTERVIEW_QUESTIONS: Record<LanguageId, string[]> = {
  en: [
    'Welcome! Tell me briefly about yourself and why you want to join our 5-star hotel team.',
    'A VIP guest arrives two hours early and their suite is not ready yet. How do you handle this?',
    'Describe a time you calmed down an angry guest or solved a difficult complaint.',
    'How do you prioritize tasks when two guests wait at the desk and the phone rings?',
    'Which languages do you speak, and how would you welcome an international family today?',
  ],
  fr: [
    'Bienvenue ! Présentez-vous brièvement et expliquez pourquoi vous souhaitez rejoindre notre hôtel 5 étoiles.',
    'Un client VIP arrive deux heures en avance et sa suite n’est pas encore prête. Comment réagissez-vous ?',
    'Racontez un moment où vous avez apaisé un client mécontent avec professionnalisme.',
    'Comment gérez-vous vos priorités si deux clients attendent à la réception et le téléphone sonne ?',
    'Quelles langues parlez-vous et comment accueillez-vous une famille internationale ?',
  ],
  es: [
    '¡Bienvenido! Hábleme brevemente de usted y por qué desea unirse a nuestro hotel 5 estrellas.',
    'Un huésped VIP llega dos horas antes y su suite aún no está lista. ¿Cómo lo maneja?',
    'Describa una ocasión en que calmó a un cliente molesto con empatía.',
    '¿Cómo organiza sus prioridades si hay fila en recepción y suena el teléfono?',
    '¿Qué idiomas domina y cómo daría la bienvenida a una familia internacional?',
  ],
  it: [
    'Benvenuto! Si presenti brevemente e ci dica perché desidera lavorare nel nostro hotel a 5 stelle.',
    'Un ospite VIP arriva con due ore di anticipo e la suite non è ancora pronta. Come gestisce la situazione?',
    'Racconti un episodio in cui ha risolto il reclamo di un ospite insoddisfatto.',
    'Come gestisce le priorità quando ci sono ospiti in attesa e squilla il telefono?',
    'Quali lingue parla e come accoglierebbe oggi una famiglia internazionale?',
  ],
  zh: [
    '欢迎参加面试！请简要介绍自己，以及为什么想加入我们五星级酒店团队。',
    '如果一位贵宾提前两小时到达，而套房尚未准备好，您会如何处理？',
    '请分享一次您用耐心和同理心化解客人不满的经历。',
    '当前台有两位客人等候且电话同时响起时，您如何安排优先级？',
    '您掌握哪些语言？会如何热情迎接远道而来的国际家庭？',
  ],
  de: [
    'Willkommen! Stellen Sie sich kurz vor und erklären Sie, warum Sie in unserem 5-Sterne-Hotel arbeiten möchten.',
    'Ein VIP-Gast kommt zwei Stunden zu früh und die Suite ist noch nicht fertig. Wie reagieren Sie?',
    'Beschreiben Sie eine Situation, in der Sie einen verärgerten Gast beruhigt haben.',
    'Wie setzen Sie Prioritäten, wenn zwei Gäste warten und gleichzeitig das Telefon klingelt?',
    'Welche Sprachen sprechen Sie und wie begrüßen Sie heute eine internationale Familie?',
  ],
};

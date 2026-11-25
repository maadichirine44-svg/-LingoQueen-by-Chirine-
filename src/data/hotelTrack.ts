import { HotelLesson, LanguageId } from '../types';

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
  {
    category: 'Check-in',
    titles: [
      'Warm 5-Star Reception Welcome',
      'Passport Verification & Registration Card',
      'Explaining Breakfast, Spa & Wi-Fi',
      'Handling Early Arrival & Luggage Storage',
      'VIP Suite Escort & Welcome Amenity',
    ],
    phrases: [
      {
        en: 'Welcome to our hotel, may I have your reservation name?',
        ar: 'مرحباً بكم في فندقنا، هل لي باسم الحجز من فضلك؟',
        fr: 'Bienvenue dans notre hôtel, puis-je avoir votre nom de réservation ?',
        es: 'Bienvenido a nuestro hotel, ¿me indica el nombre de su reserva?',
        it: 'Benvenuto nel nostro hotel, posso avere il nome della prenotazione?',
        zh: '欢迎光临我们酒店，请问您的预订姓名是？',
        de: 'Herzlich willkommen in unserem Hotel, darf ich Ihren Reservierungsnamen haben?',
      },
      {
        en: 'Here is your keycard; your suite is on the fourth floor.',
        ar: 'تفضل بطاقة الغرفة؛ جناحكم في الطابق الرابع.',
        fr: 'Voici votre carte d’accès ; votre suite est au quatrième étage.',
        es: 'Aquí tiene su tarjeta; su suite está en el cuarto piso.',
        it: 'Ecco la sua tessera; la sua suite è al quarto piano.',
        zh: '这是您的房卡，您的套房在四楼。',
        de: 'Hier ist Ihre Zimmerkarte; Ihre Suite befindet sich im vierten Stock.',
      },
      {
        en: 'Breakfast is served daily from seven to ten thirty.',
        ar: 'يُقدم الفطور يومياً من السابعة حتى العاشرة والنصف.',
        fr: 'Le petit déjeuner est servi tous les jours de sept heures à dix heures trente.',
        es: 'El desayuno se sirve todos los días de siete a diez y media.',
        it: 'La colazione è servita ogni giorno dalle sette alle dieci e mezza.',
        zh: '早餐每天七点至十点半供应。',
        de: 'Das Frühstück wird täglich von sieben bis zehn Uhr dreißig serviert.',
      },
    ],
    dialogue: [
      {
        speaker: 'Receptionist',
        en: 'Good afternoon and welcome! Do you have a reservation under your name?',
        ar: 'مساء الخير وأهلاً بكم! هل لديكم حجز باسمكم؟',
        fr: 'Bonjour et bienvenue ! Avez-vous une réservation à votre nom ?',
        es: '¡Buenas tardes y bienvenido! ¿Tiene una reserva a su nombre?',
        it: 'Buon pomeriggio e benvenuto! Ha una prenotazione a suo nome?',
        zh: '下午好，欢迎光临！请问您有预订吗？',
        de: 'Guten Tag und herzlich willkommen! Haben Sie eine Reservierung?',
      },
      {
        speaker: 'Guest',
        en: 'Yes, a deluxe double room for three nights.',
        ar: 'نعم، غرفة مزدوجة فاخرة لثلاث ليالٍ.',
        fr: 'Oui, une chambre double de luxe pour trois nuits.',
        es: 'Sí, una habitación doble de lujo para tres noches.',
        it: 'Sì, una camera doppia deluxe per tre notti.',
        zh: '是的，预订了三晚豪华双人间。',
        de: 'Ja, ein Deluxe-Doppelzimmer für drei Nächte.',
      },
      {
        speaker: 'Receptionist',
        en: 'Confirmed! Our bellhop will bring your luggage straight to room 408.',
        ar: 'تم التأكيد! سيحمل موظف الأمتعة حقائبكم مباشرة إلى الغرفة 408.',
        fr: 'Confirmé ! Notre bagagiste portera vos valises directement en chambre 408.',
        es: '¡Confirmado! Nuestro botones llevará su equipaje directo a la habitación 408.',
        it: 'Confermato! Il nostro facchino porterà i bagagli direttamente in camera 408.',
        zh: '已确认！行李员会直接把您的行李送到408房间。',
        de: 'Bestätigt! Unser Gepäckträger bringt Ihre Koffer direkt in Zimmer 408.',
      },
    ],
    quizQuestion: 'What is the most polished first step during a luxury hotel check-in?',
    quizOptions: [
      'Greet warmly with eye contact, confirm the reservation name, and verify ID politely',
      'Hand over the keycard immediately without confirming the stay dates',
      'Ask the guest to wait outside until afternoon',
      'Skip explaining breakfast hours and Wi-Fi access',
    ],
    quizCorrect: 0,
    quizExplanation: 'A warm greeting, clear confirmation of stay details, and polite ID verification set a 5-star tone.',
  },
  {
    category: 'Check-out',
    titles: [
      'Smooth Morning Check-Out & Stay Feedback',
      'Reviewing Itemized Folio & City Tax',
      'Resolving Minibar or Laundry Discrepancies',
      'Arranging Late Check-Out & Airport Transfer',
      'Fond Farewell & Loyalty Invitation',
    ],
    phrases: [
      {
        en: 'How was your stay with us? May I review your final bill with you?',
        ar: 'كيف كانت إقامتكم معنا؟ هل يمكنني مراجعة الفاتورة النهائية معكم؟',
        fr: 'Comment s’est passé votre séjour ? Puis-je vérifier votre facture finale avec vous ?',
        es: '¿Cómo fue su estancia? ¿Me permite revisar su factura final con usted?',
        it: 'Com’è andato il soggiorno? Posso controllare il conto finale insieme a lei?',
        zh: '您在这里住得愉快吗？我为您核对一下账单好吗？',
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
        en: 'Would you like a taxi or private limousine to the airport?',
        ar: 'هل ترغبون بسيارة أجرة أم سيارة خاصة إلى المطار؟',
        fr: 'Souhaitez-vous un taxi ou une voiture privée pour l’aéroport ?',
        es: '¿Desea un taxi o un traslado privado al aeropuerto?',
        it: 'Desidera un taxi o un’auto privata per l’aeroporto?',
        zh: '您需要预订出租车还是专车去机场？',
        de: 'Möchten Sie ein Taxi oder einen privaten Transfer zum Flughafen?',
      },
    ],
    dialogue: [
      {
        speaker: 'Guest',
        en: 'Good morning, I am checking out of room 512.',
        ar: 'صباح الخير، أريد تسجيل المغادرة من الغرفة 512.',
        fr: 'Bonjour, je libère la chambre 512.',
        es: 'Buenos días, hago el check-out de la habitación 512.',
        it: 'Buongiorno, faccio il check-out dalla camera 512.',
        zh: '早上好，我要办理512房间的退房。',
        de: 'Guten Morgen, ich möchte aus Zimmer 512 auschecken.',
      },
      {
        speaker: 'Receptionist',
        en: 'Thank you! Here is your itemized invoice—did you use the minibar this morning?',
        ar: 'شكراً لكم! إليكم الفاتورة المفصلة—هل استخدمتم الميني بار هذا الصباح؟',
        fr: 'Merci ! Voici votre facture détaillée ; avez-vous utilisé le minibar ce matin ?',
        es: '¡Gracias! Aquí tiene su factura detallada; ¿usó el minibar esta mañana?',
        it: 'Grazie! Ecco il conto dettagliato; ha usato il minibar stamattina?',
        zh: '谢谢！这是您的消费清单，请问今天早上您使用过迷你吧吗？',
        de: 'Danke! Hier ist Ihre detaillierte Rechnung — haben Sie heute die Minibar genutzt?',
      },
      {
        speaker: 'Guest',
        en: 'Just one sparkling water. Everything else looks accurate.',
        ar: 'فقط زجاجة ماء فوار واحدة. كل شيء آخر صحيح.',
        fr: 'Juste une eau gazeuse. Tout le reste est exact.',
        es: 'Solo un agua con gas. Todo lo demás está correcto.',
        it: 'Solo un’acqua frizzante. Tutto il resto è esatto.',
        zh: '只喝了一瓶气泡水，其他费用都准确。',
        de: 'Nur ein Mineralwasser. Alles andere stimmt genau.',
      },
    ],
    quizQuestion: 'When a guest questions a minibar charge at check-out, what is best practice?',
    quizOptions: [
      'Listen calmly, apologize for any confusion, and verify or adjust transparently',
      'Insist the system cannot be wrong and refuse to check',
      'Tell the guest to email accounting next week',
      'Charge double while investigating',
    ],
    quizCorrect: 0,
    quizExplanation: 'Calm transparency and swift verification preserve guest goodwill at the final touchpoint.',
  },
  {
    category: 'Booking',
    titles: [
      'Checking Room Availability & Seasonal Rates',
      'Explaining Cancellation Policies Clearly',
      'Upgrading Guests & Special Occasion Notes',
      'Modifying Dates & Group Reservations',
      'Confirming Deposit & Guarantee Details',
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
      {
        en: 'Shall I note your anniversary celebration on the reservation?',
        ar: 'هل أسجل ملاحظة عن احتفالكم بالذكرى السنوية في الحجز؟',
        fr: 'Puis-je noter votre anniversaire de mariage sur la réservation ?',
        es: '¿Anoto la celebración de su aniversario en la reserva?',
        it: 'Posso segnare la celebrazione del vostro anniversario nella prenotazione?',
        zh: '需要我在预订中备注您的周年纪念日吗？',
        de: 'Soll ich Ihren Jahrestag in der Reservierung vermerken?',
      },
    ],
    dialogue: [
      {
        speaker: 'Guest',
        en: 'I would like to book two connecting rooms for May 12 to 15.',
        ar: 'أود حجز غرفتين متصلتين من 12 إلى 15 مايو.',
        fr: 'Je souhaite réserver deux chambres communicantes du 12 au 15 mai.',
        es: 'Quisiera reservar dos habitaciones comunicadas del 12 al 15 de mayo.',
        it: 'Vorrei prenotare due camere comunicanti dal 12 al 15 maggio.',
        zh: '我想预订5月12日至15日两间连通房。',
        de: 'Ich möchte zwei Zimmer mit Verbindungstür vom 12. bis 15. Mai buchen.',
      },
      {
        speaker: 'Agent',
        en: 'Certainly! Both connecting rooms include breakfast and flexible cancellation.',
        ar: 'بالتأكيد! كلتا الغرفتين المتصلتين تشملان الفطور وإلغاءً مرناً.',
        fr: 'Bien sûr ! Les deux chambres communicantes incluent le petit déjeuner et l’annulation flexible.',
        es: '¡Por supuesto! Ambas habitaciones incluyen desayuno y cancelación flexible.',
        it: 'Certamente! Entrambe le camere includono colazione e cancellazione flessibile.',
        zh: '没问题！两间连通房都含早餐且支持灵活取消。',
        de: 'Sehr gern! Beide Zimmer beinhalten Frühstück und flexible Stornierung.',
      },
    ],
    quizQuestion: 'Why should reservation agents always repeat dates, room type, and cancellation policy?',
    quizOptions: [
      'To prevent misunderstandings and ensure full transparency before payment',
      'Because the booking software deletes the notes otherwise',
      'To lengthen the conversation unnecessarily',
      'To avoid sending a confirmation email',
    ],
    quizCorrect: 0,
    quizExplanation: 'Confirming key reservation terms verbally prevents disputes and builds trust.',
  },
  {
    category: 'Room Service',
    titles: [
      'Taking Accurate In-Room Dining Orders',
      'Confirming Dietary Allergies & Preferences',
      'Estimating Delivery Time & Tray Setup',
      'Polite Knock & In-Suite Table Presentation',
      'Late-Night Menu Recommendations',
    ],
    phrases: [
      {
        en: 'Good evening, Room Service speaking. How may I delight you tonight?',
        ar: 'مساء الخير، خدمة الغرف معكم. كيف يمكنني خدمتكم الليلة؟',
        fr: 'Bonsoir, service d’étage. Que puis-je vous préparer ce soir ?',
        es: 'Buenas noches, servicio a la habitación. ¿Qué desea ordenar hoy?',
        it: 'Buonasera, servizio in camera. Come posso servirla questa sera?',
        zh: '晚上好，客房送餐部。请问今晚需要什么餐点？',
        de: 'Guten Abend, Zimmerservice. Womit darf ich Sie heute verwöhnen?',
      },
      {
        en: 'Do you or your guests have any food allergies we should note?',
        ar: 'هل لديكم أي حساسية غذائية يجب أن ننتبه لها؟',
        fr: 'Avez-vous des allergies alimentaires que nous devons noter ?',
        es: '¿Tiene alguna alergia alimentaria que debamos tener en cuenta?',
        it: 'Ha allergie alimentari che dobbiamo segnalare allo chef?',
        zh: '请问您有任何食物过敏需要厨房注意吗？',
        de: 'Haben Sie Lebensmittelallergien, die wir beachten sollten?',
      },
      {
        en: 'Your order will arrive in approximately twenty-five minutes.',
        ar: 'سيصل طلبكم خلال خمس وعشرين دقيقة تقريباً.',
        fr: 'Votre commande arrivera dans environ vingt-cinq minutes.',
        es: 'Su pedido llegará en aproximadamente veinticinco minutos.',
        it: 'Il suo ordine arriverà tra circa venticinque minuti.',
        zh: '您的餐点大约二十五分钟后送达。',
        de: 'Ihre Bestellung trifft in etwa fünfundzwanzig Minuten ein.',
      },
    ],
    dialogue: [
      {
        speaker: 'Guest',
        en: 'Could we order grilled salmon and chamomile tea to suite 704?',
        ar: 'هل يمكننا طلب سلمون مشوي وشاي بابونج إلى الجناح 704؟',
        fr: 'Pouvons-nous commander du saumon grillé et une tisane en suite 704 ?',
        es: '¿Podemos pedir salmón a la plancha y té de manzanilla a la suite 704?',
        it: 'Possiamo ordinare salmone alla griglia e camomilla nella suite 704?',
        zh: '能帮704套房送一份烤三文鱼和洋甘菊茶吗？',
        de: 'Können wir gegrillten Lachs und Kamillentee in Suite 704 bestellen?',
      },
      {
        speaker: 'Staff',
        en: 'Right away! Would you like lemon on the side, and any allergies to note?',
        ar: 'حالا! هل تفضلون الليمون جانباً، وهل توجد أي حساسية غذائية؟',
        fr: 'Tout de suite ! Souhaitez-vous du citron à part, et avez-vous des allergies ?',
        es: '¡Enseguida! ¿Desea limón aparte y tiene alguna alergia?',
        it: 'Subito! Desidera il limone a parte e ha qualche allergia?',
        zh: '马上为您准备！需要另配柠檬吗？请问有过敏食材吗？',
        de: 'Sofort! Möchten Sie Zitrone dazu und gibt es Allergien?',
      },
    ],
    quizQuestion: 'Before ending a room service order call, which three details must you confirm?',
    quizOptions: [
      'Room number, allergies/preferences, and estimated delivery time',
      'Passport number, flight number, and shoe size',
      'Only the total price without the room number',
      'Whether the guest prefers paper towels',
    ],
    quizCorrect: 0,
    quizExplanation: 'Confirming room number, dietary needs, and clear delivery time prevents delays and safety errors.',
  },
  {
    category: 'Angry Customer',
    titles: [
      'Active Listening & Empathy Statements',
      'Handling Noise Complaints at Midnight',
      'Recovering from Housekeeping Oversights',
      'Room Downgrade or Missing View Resolution',
      'Executive Follow-Up & Turning Critics into Fans',
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
      {
        en: 'May I check back with you in thirty minutes to ensure everything is perfect?',
        ar: 'هل يمكنني الاطمئنان عليكم بعد ثلاثين دقيقة للتأكد من أن كل شيء مثالي؟',
        fr: 'Puis-je reprendre contact dans trente minutes pour vérifier que tout est parfait ?',
        es: '¿Puedo volver a comunicarme en treinta minutos para asegurar que todo esté perfecto?',
        it: 'Posso ricontattarla tra trenta minuti per assicurarmi che tutto sia perfetto?',
        zh: '三十分钟后我再回访确认一切满意，可以吗？',
        de: 'Darf ich mich in dreißig Minuten erkundigen, ob alles zu Ihrer Zufriedenheit ist?',
      },
    ],
    dialogue: [
      {
        speaker: 'Guest',
        en: 'The air conditioning in my room is loud and I cannot sleep!',
        ar: 'مكيف الهواء في غرفتي مزعج ولا أستطيع النوم!',
        fr: 'La climatisation dans ma chambre est bruyante et je n’arrive pas à dormir !',
        es: '¡El aire acondicionado de mi habitación hace mucho ruido y no puedo dormir!',
        it: 'L’aria condizionata in camera è rumorosa e non riesco a dormire!',
        zh: '我房间的空调噪音很大，完全睡不着！',
        de: 'Die Klimaanlage in meinem Zimmer ist laut und ich kann nicht schlafen!',
      },
      {
        speaker: 'Manager',
        en: 'I am truly sorry for that inconvenience. I have prepared a quiet corner suite for you right now.',
        ar: 'أنا آسف حقاً لهذا الإزعاج. لقد جهزت لكم جناحاً هادئاً في الزاوية الآن فوراً.',
        fr: 'Je suis vraiment désolé pour ce désagrément. Je vous ai préparé une suite calme dès maintenant.',
        es: 'Lamento mucho las molestias. Ya le preparé una suite tranquila en este mismo momento.',
        it: 'Mi dispiace davvero per il disagio. Ho già preparato per lei una suite silenziosa.',
        zh: '非常抱歉给您带来不便，我已为您准备好一间安静的转角套房。',
        de: 'Das tut mir aufrichtig leid. Ich habe sofort eine ruhige Eck-Suite für Sie vorbereitet.',
      },
    ],
    quizQuestion: 'In hospitality de-escalation (L.E.A.R.N.), what should come FIRST when a guest is angry?',
    quizOptions: [
      'Listen attentively without interrupting, then Empathize and Apologize',
      'Defend hotel policy immediately before the guest finishes speaking',
      'Blame another department for the issue',
      'Walk away until the guest calms down',
    ],
    quizCorrect: 0,
    quizExplanation: 'Listening without interrupting and validating the guest’s feelings immediately lowers tension.',
  },
  {
    category: 'Phone',
    titles: [
      'Answering Within 3 Rings with a Smile',
      'Spelling Names with Phonetic Clarity',
      'Placing Callers on Hold Politely',
      'Warm Call Transfers Between Departments',
      'Taking Accurate Messages & Callbacks',
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
        ar: 'هل تسمح لي بوضعك على الانتظار لدقيقة واحدة ريثما أتحقق؟',
        fr: 'Puis-je vous faire patienter un court instant pendant que je vérifie ?',
        es: '¿Me permite ponerlo en espera un breve momento mientras verifico?',
        it: 'Posso metterla in attesa un minuto mentre controllo?',
        zh: '请您稍等一分钟，我帮您核实一下可以吗？',
        de: 'Darf ich Sie kurz für eine Minute in die Warteschleife legen, während ich nachsehe?',
      },
      {
        en: 'I am transferring you directly to our Concierge Desk.',
        ar: 'أحولك الآن مباشرة إلى مكتب الكونسيرج.',
        fr: 'Je vous transfère directement vers notre conciergerie.',
        es: 'Lo transfiero directamente con nuestro departamento de conserjería.',
        it: 'La trasferisco direttamente al nostro banco Concierge.',
        zh: '我现在为您转接礼宾部。',
        de: 'Ich verbinde Sie direkt mit unserem Concierge-Team.',
      },
    ],
    dialogue: [
      {
        speaker: 'Caller',
        en: 'Hello, could you connect me to the Spa Reception?',
        ar: 'مرحباً، هل يمكنك توصيلي باستقبال السبا؟',
        fr: 'Bonjour, pourriez-vous me passer la réception du Spa ?',
        es: 'Hola, ¿podría comunicarme con la recepción del Spa?',
        it: 'Salve, potrebbe passarmi la reception della Spa?',
        zh: '您好，能帮我转接水疗中心前台吗？',
        de: 'Hallo, könnten Sie mich mit dem Spa-Empfang verbinden?',
      },
      {
        speaker: 'Operator',
        en: 'With pleasure, Mrs. Laurent. Please hold for just a moment.',
        ar: 'بكل سرور، سيدة لوران. تفضلي بالانتظار لحظة فقط.',
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
    quizExplanation: 'Always ask permission ("May I place you on a brief hold?") and wait for "Yes" before muting.',
  },
  {
    category: 'Email',
    titles: [
      'Writing Polished Reservation Confirmations',
      'Responding Professionally to Guest Inquiries',
      'Handling Group Quotes & Event Proposals',
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
        en: 'Please find attached your updated confirmation and airport guide.',
        ar: 'تجدون مرفقاً تأكيد الحجز المحدث ودليل النقل من المطار.',
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
        en: 'Dear Mr. Martin, thank you for your inquiry regarding our conference suite.',
        ar: 'عزيزي السيد مارتن، شكراً لاستفساركم بشأن جناح المؤتمرات لدينا.',
        fr: 'Cher Monsieur Martin, merci pour votre demande concernant notre suite conférence.',
        es: 'Estimado Sr. Martin, gracias por su consulta sobre nuestra suite de conferencias.',
        it: 'Gentile Signor Martin, grazie per la sua richiesta relativa alla suite conferenze.',
        zh: '尊敬的马丁先生，感谢您咨询我们的会议套房。',
        de: 'Sehr geehrter Herr Martin, vielen Dank für Ihre Anfrage zu unserer Konferenz-Suite.',
      },
      {
        speaker: 'Guest',
        en: 'Thank you for the prompt reply and clear pricing breakdown.',
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
    quizExplanation: 'A courteous sign-off with your full name and department maintains executive luxury tone.',
  },
  {
    category: 'Tourism',
    titles: [
      'Curating Local Walking & Museum Routes',
      'Booking Private Chauffeurs & City Tours',
      'Recommending Authentic Dining & Dietary Options',
      'Cultural Etiquette, Tickets & Hidden Gems',
    ],
    phrases: [
      {
        en: 'I highly recommend visiting the Old Quarter at sunset for panoramic views.',
        ar: 'أوصي بشدة بزيارة الحي القديم عند الغروب للاستمتاع بالإطلالات البانورامية.',
        fr: 'Je vous recommande vivement de visiter la vieille ville au coucher du soleil.',
        es: 'Le recomiendo visitar el casco antiguo al atardecer para disfrutar las vistas.',
        it: 'Le consiglio vivamente di visitare il centro storico al tramonto per il panorama.',
        zh: '我强烈推荐您在日落时分游览老城区，景色非常壮观。',
        de: 'Ich empfehle Ihnen wärmstens, die Altstadt bei Sonnenuntergang zu besuchen.',
      },
      {
        en: 'Shall I reserve skip-the-line museum tickets for tomorrow morning?',
        ar: 'هل أحجز لكم تذاكر متحف بدون انتظار لغدٍ صباحاً؟',
        fr: 'Puis-je vous réserver des billets coupe-file pour le musée demain matin ?',
        es: '¿Le reservo entradas sin fila para el museo mañana por la mañana?',
        it: 'Posso prenotarle i biglietti salta-fila per il museo domani mattina?',
        zh: '需要我帮您预订明早免排队的博物馆门票吗？',
        de: 'Soll ich Ihnen für morgen früh Schnelleinlass-Tickets fürs Museum reservieren?',
      },
    ],
    dialogue: [
      {
        speaker: 'Concierge',
        en: 'Good morning! Are you looking for historic sights or hidden cafés today?',
        ar: 'صباح الخير! هل تبحثون اليوم عن معالم تاريخية أم مقاهٍ هادئة؟',
        fr: 'Bonjour ! Cherchez-vous des sites historiques ou des cafés cachés aujourd’hui ?',
        es: '¡Buenos días! ¿Busca sitios históricos o cafés con encanto hoy?',
        it: 'Buongiorno! Cerca monumenti storici o caffè nascosti oggi?',
        zh: '早上好！您今天想游览历史古迹还是特色咖啡馆？',
        de: 'Guten Morgen! Suchen Sie heute historische Sehenswürdigkeiten oder versteckte Cafés?',
      },
      {
        speaker: 'Guest',
        en: 'Both! And a quiet family restaurant for dinner.',
        ar: 'كلاهما! ومطعم عائلي هادئ للعشاء.',
        fr: 'Les deux ! Et un restaurant familial calme pour le dîner.',
        es: '¡Ambos! Y un restaurante familiar tranquilo para cenar.',
        it: 'Entrambi! E un ristorante familiare tranquillo per cena.',
        zh: '都想去！另外晚上想找一家安静的家庭餐厅。',
        de: 'Beides! Und ein ruhiges Familienrestaurant fürs Abendessen.',
      },
    ],
    quizQuestion: 'What makes a concierge recommendation truly memorable?',
    quizOptions: [
      'Tailoring suggestions to the guest’s interests, timing, and offering to book tickets',
      'Handing over an unmarked city brochure without speaking',
      'Recommending only the most expensive venue regardless of taste',
      'Telling the guest to search online',
    ],
    quizCorrect: 0,
    quizExplanation: 'Personalized tailoring plus proactive booking turns information into luxury service.',
  },
];

// Build 38 regular hotel lessons + Lesson 39 (CV) + Lesson 40 (Job Interview) = 40 lessons
const generatedLessons: HotelLesson[] = [];
let lessonCounter = 1;

for (const theme of HOTEL_THEMES) {
  for (const title of theme.titles) {
    const id = lessonCounter++;
    const phrases = theme.phrases.map((p) => ({
      target: p.en, // dynamically swapped per active language in component via helper
      english: p.en,
      arabic: p.ar,
    }));

    generatedLessons.push({
      id,
      category: theme.category,
      title,
      scenario: `Lesson ${id} · ${theme.category}: Master real 5-star hospitality communication for "${title}".`,
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

// Also export localized phrase lookup by lesson category + language
export function getLocalizedHotelContent(lessonId: number, langId: LanguageId) {
  // Find which theme block this lesson belongs to
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
    'Complete your structured luxury hotel CV below. Submit it for real grammar correction, HR polish, and a CV Score /100.',
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
    'Step into a live 5-question interview with the General Manager of Grand Palace Hotel. Speak or type your answers to receive feedback and a Hiring Score /100.',
  isInterview: true,
  phrases: [
    {
      target: 'Tell me about a time you turned an unhappy hotel guest into a loyal advocate.',
      english: 'Tell me about a time you turned an unhappy hotel guest into a loyal advocate.',
      arabic: 'حدثيني عن موقف حولتِ فيه ضيفاً مستاءً إلى عميل دائم وممتن.',
    },
    {
      target: 'How do you handle three simultaneous check-ins while the phone is ringing?',
      english: 'How do you handle three simultaneous check-ins while the phone is ringing?',
      arabic: 'كيف تتعاملين مع ثلاثة ضيوف لتسجيل الدخول في وقت واحد بينما يرن الهاتف؟',
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

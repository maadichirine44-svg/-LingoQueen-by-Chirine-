import React, { useState } from 'react';
import { CheckCircle2, FileText, Mail, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { LegalPageId, UILanguage } from '../types';
import { LingoQueenLogo } from './BrandArt';

interface LegalPagesViewProps {
  activePage: LegalPageId;
  uiLang: UILanguage;
  onSelectPage: (page: LegalPageId) => void;
}

export const LegalPagesView: React.FC<LegalPagesViewProps> = ({
  activePage,
  uiLang,
  onSelectPage,
}) => {
  const isAr = uiLang === 'ar';
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const tabs: Array<{ id: LegalPageId; labelEn: string; labelAr: string }> = [
    { id: 'about', labelEn: 'About Us', labelAr: 'من نحن' },
    { id: 'privacy', labelEn: 'Privacy Policy', labelAr: 'سياسة الخصوصية' },
    { id: 'contact', labelEn: 'Contact Us', labelAr: 'اتصل بنا' },
    { id: 'terms', labelEn: 'Terms', labelAr: 'الشروط والأحكام' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectPage(tab.id)}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activePage === tab.id
                ? 'bg-gradient-to-r from-pink-600 to-purple-700 text-white shadow-sm'
                : 'bg-white border border-pink-100 text-purple-950 hover:border-pink-300'
            }`}
          >
            {isAr ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>

      {activePage === 'about' && (
        <article className="rounded-2xl bg-white border border-pink-100 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-4">
            <LingoQueenLogo size={64} compact />
            <div>
              <div className="text-xs font-bold text-pink-700">
                {isAr ? 'من نحن · LingoQueen من تصميم شيرين' : 'About Us · LingoQueen by Chirine'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
                {isAr
                  ? 'أكاديمية ملكية لتعلّم 6 لغات عالمية ومسار الفندقة'
                  : 'A Royal Academy for 6 World Languages & Hospitality Excellence'}
              </h1>
            </div>
          </div>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            {isAr
              ? 'تأسست منصة LingoQueen بإشراف شيرين لتقديم تجربة تعليمية متكاملة تجمع بين الصرامة الأكاديمية والبساطة التفاعلية. يغطي المنهج 300 درس متدرج عبر مستويات الإطار الأوروبي (A1–C2) باللغات الفرنسية، الإنجليزية، الإسبانية، الإيطالية، الصينية، والألمانية، مع ترجمة عربية فصحى دقيقة في كل خطوة.'
              : 'LingoQueen by Chirine is an educational academy designed to unite structured CEFR mastery (A1–C2) with practical real-world fluency across French, English, Spanish, Italian, Chinese, and German—supported everywhere by clear Modern Standard Arabic (Fusha) translations.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="rounded-xl bg-pink-50/60 border border-pink-100 p-4 space-y-1">
              <Sparkles className="w-5 h-5 text-pink-600" />
              <h3 className="font-bold text-purple-950 text-sm">
                {isAr ? '300 درس + قصص وألعاب' : '300 Lessons + Stories & Games'}
              </h3>
              <p className="text-xs text-slate-600">
                {isAr
                  ? 'مفردات، قواعد، محادثة، حوارات واقعية، استماع، كتابة، قصص ممتعة وألعاب تفاعلية.'
                  : 'Vocabulary, grammar, speaking, realistic dialogues, listening, stories, and interactive games.'}
              </p>
            </div>
            <div className="rounded-xl bg-purple-50/60 border border-purple-100 p-4 space-y-1">
              <ShieldCheck className="w-5 h-5 text-purple-700" />
              <h3 className="font-bold text-purple-950 text-sm">
                {isAr ? 'مسار الفندقة والسياحة في الجزائر' : 'Hospitality & Algeria Hotel Track'}
              </h3>
              <p className="text-xs text-slate-600">
                {isAr
                  ? 'حوارات الاستقبال وخدمة الغرف والإفطار والمغادرة، إضافة إلى تصنيف الفنادق في الجزائر والسيرة الذاتية.'
                  : 'Ordered dialogues for Check-in, Room Service, Breakfast, and Check-out plus Algeria star classification.'}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50/60 border border-amber-200 p-4 space-y-1">
              <FileText className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-purple-950 text-sm">
                {isAr ? 'تعليم متاح دون اتصال' : 'Offline-Ready PWA'}
              </h3>
              <p className="text-xs text-slate-600">
                {isAr
                  ? 'ثبّتي التطبيق على هاتفكِ أو حاسوبكِ وتابعي الدراسة وحفظ النقاط والشهادات بسلاسة.'
                  : 'Download LingoQueen directly to your device and keep studying with local progress saving.'}
              </p>
            </div>
          </div>
        </article>
      )}

      {activePage === 'privacy' && (
        <article className="rounded-2xl bg-white border border-pink-100 p-6 sm:p-8 shadow-sm space-y-4">
          <h1 className="text-2xl font-extrabold text-purple-950">
            {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </h1>
          <p className="text-xs text-slate-500">
            {isAr ? 'آخر تحديث: 2026' : 'Last updated: 2026'}
          </p>
          <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <p>
              {isAr
                ? 'تحترم منصة LingoQueen خصوصية المتعلمين والمتعلمات. تُحفظ بيانات الملف الشخصي (الاسم، الصورة الرمزية، نتائج الدروس، النقاط، والأوسمة) محلياً داخل متصفحكِ عبر التخزين المحلي (localStorage) ولا تُباع أو تُشارك مع أي طرف ثالث.'
                : 'LingoQueen respects your privacy. Your profile details (name, chosen photo, lesson scores, XP points, and certificates) are stored locally inside your browser storage (localStorage) and are never sold to third parties.'}
            </p>
            <p>
              {isAr
                ? 'يُستخدم إذن الميكروفون حصرياً أثناء تدريبات النطق داخل المتصفح لتقييم أدائكِ الصوتي ولا يتم رفع التسجيلات الصوتية إلى خوادم خارجية.'
                : 'Microphone access is used strictly during optional voice pronunciation exercises in your browser; raw audio recordings remain on your device.'}
            </p>
            <p>
              {isAr
                ? 'عند استخدام المعلمة الذكية لونا أو تقييم الكتابة عبر الإنترنت، تُرسل النصوص المدخلة فقط إلى واجهة المعالجة لإرجاع التصحيح التعليمي.'
                : 'When you choose to submit writing or tutor messages while online, only the text you type is sent to generate educational feedback.'}
            </p>
          </div>
        </article>
      )}

      {activePage === 'contact' && (
        <article className="rounded-2xl bg-white border border-pink-100 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-pink-600" />
            <div>
              <h1 className="text-2xl font-extrabold text-purple-950">
                {isAr ? 'اتصل بنا' : 'Contact Us'}
              </h1>
              <p className="text-xs text-slate-600">
                {isAr
                  ? 'نرحب باستفساراتكم، مقترحاتكم التعليمية، وطلبات الشراكة الإعلانية.'
                  : 'Questions, curriculum suggestions, or partner inquiries—send a note to the LingoQueen team.'}
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-emerald-950 text-sm">
                  {isAr ? 'تم استلام رسالتكِ بنجاح!' : 'Message Received!'}
                </div>
                <p className="text-xs text-emerald-800">
                  {isAr
                    ? 'شكراً لتواصلكِ مع فريق LingoQueen من تصميم شيرين. سنرد عليكِ في أقرب وقت.'
                    : 'Thank you for reaching out to LingoQueen by Chirine. Our team will respond shortly.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setContactMessage('');
                  }}
                  className="mt-2 text-xs font-bold text-emerald-900 underline cursor-pointer"
                >
                  {isAr ? 'إرسال رسالة أخرى' : 'Send another message'}
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;
                setSubmitted(true);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isAr ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <input
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder={isAr ? 'أدخلي اسمكِ' : 'Your name'}
                    className="w-full min-h-[44px] rounded-xl border border-pink-200 px-3.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input
                    required
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full min-h-[44px] rounded-xl border border-pink-200 px-3.5 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isAr ? 'الرسالة' : 'Message'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={isAr ? 'اكتبي رسالتكِ هنا...' : 'How can we help you?'}
                  className="w-full rounded-xl border border-pink-200 p-3.5 text-sm"
                />
              </div>
              <button
                type="submit"
                className="min-h-[44px] inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 text-sm font-bold text-white shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isAr ? 'إرسال الرسالة' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </article>
      )}

      {activePage === 'terms' && (
        <article className="rounded-2xl bg-white border border-pink-100 p-6 sm:p-8 shadow-sm space-y-4">
          <h1 className="text-2xl font-extrabold text-purple-950">
            {isAr ? 'الشروط والأحكام' : 'Terms of Service'}
          </h1>
          <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <p>
              {isAr
                ? 'جميع الدروس، القصص، الألعاب التعليمية، وتصنيفات مسار الفندقة في تطبيق LingoQueen مخصصة للاستخدام التعليمي والتدريبي الشخصي.'
                : 'All lessons, stories, educational games, and hospitality modules within LingoQueen are provided for personal learning and professional training.'}
            </p>
            <p>
              {isAr
                ? 'تُمنح الشهادات الملكية والأوسمة بناءً على اجتياز الاختبارات داخل المنصة، ويُحتفظ للمنصة بحق تحديث المناهج وتحسين الدروس دوريّاً لضمان الجودة اللغوية.'
                : 'Royal certificates and milestone badges reflect in-app assessment completion. Curriculum modules and interactive features may be refined periodically to ensure linguistic accuracy.'}
            </p>
            <p>
              {isAr
                ? 'يُرجى استخدام التطبيق بمسؤولية واحترام حقوق الملكية الفكرية الخاصة بعلامة LingoQueen من تصميم شيرين.'
                : 'Please respect the intellectual property and educational materials created for LingoQueen by Chirine.'}
            </p>
          </div>
        </article>
      )}
    </div>
  );
};

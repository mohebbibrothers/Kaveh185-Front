import Image from "next/image";
import { Girih } from "@/shared/ui/Ornament";
import type { Martyr } from "@/shared/api/landing";

/**
 * نوار شهدا — «زیرنویسِ تصویری» بالای فوتر.
 *
 * ── خواستهٔ کاربر ────────────────────────────────────────────────────────
 * «تصویر گِرد + عنوان زیرش، کاملاً پویا جابه‌جا شود و رد شود، حالتی مثل
 * زیرنویس.» یعنی یک نوارِ افقی که آرام حرکت می‌کند و آدم‌ها/عنوان‌ها از
 * کنار هم می‌گذرند — نه یک گرید ایستا.
 *
 * ── چطور ساخته شد ────────────────────────────────────────────────────────
 * • **مارکیِ بی‌درز**: فهرست دو بار رندر می‌شود و کل ریل به اندازهٔ ۵۰٪
 *   عرضش جابه‌جا می‌شود. در نقطهٔ پایان، نسخهٔ دوم دقیقاً جای نسخهٔ اول
 *   است ⇒ حلقه هیچ «پرش» ندارد (ایراد رایجِ مارکی‌های ساده).
 * • **سرعت با تعداد تنظیم می‌شود**: `--marquee-duration` از تعداد آیتم‌ها
 *   حساب می‌شود (`n × ۶` ثانیه) تا با ۳ شهید نوار تند نباشد و با ۲۰
 *   شهید کند نباشد.
 * • **مکث روی هاور/فوکوس**: کاربر می‌تواند یک چهره را بخواند؛ در حالت
 *   لمسی، نوار آرام است و کسی چیزی را «از دست نمی‌دهد».
 * • **احترام به تنظیمات**: با `prefers-reduced-motion` انیمیشن خاموش
 *   می‌شود و نوار به یک ردیفِ اسکرول‌پذیر افقی تبدیل می‌شود (اسکرول با
 *   لمت/چرخ) — محتوا همیشه در دسترس است، فقط حرکت ندارد.
 * • **دو لبهٔ محو**: ماسکِ گرادیانی در دو طرف، تا آیتم‌ها «از داخلِ نوار
 *   بیایند» و لبهٔ برنده دیده نشود.
 *
 * ── چرا این‌جا (بالای فوتر)؟ ─────────────────────────────────────────────
 * درخواست کاربر بود. از نظر روایی هم درست است: صفحه با «مسابقه» شروع
 * می‌شود و با «یادِ شهیدان» تمام می‌شود — همان قوسی که نام «کاوه ۱۸۵»
 * از آن آمده.
 *
 * ── اصل صداقت ────────────────────────────────────────────────────────────
 * هیچ شهیدی در کد نیست. اگر ادمین چیزی آپلود نکرده باشد (`items` خالی)،
 * کل بخش رندر نمی‌شود؛ نه تصویرِ جعلی، نه عنوانِ ساختگی.
 */
export function MartyrsMarquee({ items }: { items: Martyr[] }) {
  if (items.length === 0) return null;
  const duration = `${Math.max(28, items.length * 6)}s`;
  /**
   * ⚠️ دو ایراد در نسخهٔ قبل که فقط در عکسِ واقعی دیده می‌شد:
   *
   * ۱) **تکرارِ چشم‌آزار.** ریل همیشه دو (و گاهی سه) نسخه از فهرست را
   *    پشتِ‌سرهم می‌چید. با دادهٔ نمونهٔ تک‌نفره، نتیجه یک ردیفِ
   *    «شهید محمود کاوه / شهید محمود کاوه / شهید محمود کاوه» بود — هم
   *    بدشکل، هم دروغِ دیداری (۳ نفر در ذهنِ بیننده).
   * ۲) **حلقهٔ ناقص.** حرکت `translateX(50%)` فقط وقتی بی‌درز است که
   *    عرضِ یک نسخه از صفحه بیشتر باشد؛ وگرنه انتهای ریل خالی می‌ماند.
   *
   * پس دو حالتِ صریح داریم:
   * • **کمتر از ۶ شهید** ⇒ نوار حرکت نمی‌کند؛ یک ردیفِ وسط‌چین و ثابت.
   *   هیچ محتوایی تکرار نمی‌شود و هیچ ادعای اضافه‌ای ساخته نمی‌شود.
   * • **۶ شهید یا بیشتر** ⇒ دو نسخه + حرکتِ پیوستهٔ بی‌درز (عرضِ یک
   *   نسخه با ۶ کارتِ ۱۳۲پیکسلی از ۸۰۰px می‌گذرد و هر نمایشگری را پر
   *   می‌کند).
   */
  const animated = items.length >= 6;
  const lane = animated ? [...items, ...items] : items;

  const card = (m: Martyr, i: number) => (
    <li
      key={`${m.id}-${i}`}
      className="group flex w-[110px] shrink-0 flex-col items-center gap-1.5 sm:w-[132px]"
    >
      <span className="from-gold/70 to-gold/25 relative grid size-[58px] place-items-center rounded-full bg-gradient-to-b p-[2px] transition-transform duration-300 group-hover:scale-[1.06] sm:size-[68px]">
        <span className="bg-surface ring-border/60 relative size-full overflow-hidden rounded-full ring-1">
          <Image
            src={m.image_url}
            alt={m.alt}
            fill
            sizes="72px"
            className="object-cover object-[center_20%] grayscale-[35%] transition-[filter,transform] duration-500 group-hover:scale-105 group-hover:grayscale-0"
          />
        </span>
      </span>
      <span className="text-text line-clamp-1 w-full text-center text-[10.5px] leading-5 font-extrabold">
        {m.title}
      </span>
      {m.subtitle ? (
        <span className="text-text-subtle -mt-1 line-clamp-1 w-full text-center text-[9px] leading-4">
          {m.subtitle}
        </span>
      ) : null}
    </li>
  );

  return (
    <section aria-labelledby="martyrs-title" className="border-border bg-surface-2/50 border-t">
      <div className="mx-auto w-full max-w-6xl px-4 pt-5 pb-6 sm:px-6">
        <div className="mb-3 flex items-center justify-center gap-2">
          <span
            className="from-gold/50 h-px w-8 bg-gradient-to-l to-transparent"
            aria-hidden="true"
          />
          <h2
            id="martyrs-title"
            className="text-text-subtle flex items-center gap-1.5 text-[11px] font-extrabold"
          >
            <span className="text-gold-strong" aria-hidden="true">
              <Girih size={9} />
            </span>
            یادِ شهیدان — به نامِ کاوه ۱۸۵
          </h2>
          <span
            className="from-gold/50 h-px w-8 bg-gradient-to-r to-transparent"
            aria-hidden="true"
          />
        </div>

        <div
          className="k185-marquee relative overflow-hidden"
          style={
            // ماسکِ دو طرف فقط در حالتِ متحرک معنا دارد: آیتم‌ها «از داخلِ
            // نوار» می‌آیند و لبهٔ برنده دیده نمی‌شود. در حالتِ ثابت، ماسک
            // فقط چهره‌های کناری را بی‌دلیل محو می‌کرد.
            animated
              ? {
                  maskImage:
                    "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                }
              : undefined
          }
        >
          <ul
            className={
              animated
                ? "k185-marquee-track flex w-max items-start gap-3 motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center sm:gap-4"
                : "flex w-full flex-wrap justify-center gap-3 sm:gap-4"
            }
            style={{ ["--marquee-duration" as string]: duration }}
          >
            {lane.map((m, i) => card(m, i))}
          </ul>
        </div>
      </div>
    </section>
  );
}

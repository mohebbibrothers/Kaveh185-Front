import { SITE } from "@/shared/config/site";
import { useBootstrap } from "@/shared/api/use-bootstrap";

/**
 * کانال رسمی — **فقط یک آیکونِ سه‌بعدیِ بله**، بی‌هیچ باکس، بی‌هیچ کارت.
 *
 * ── نکتهٔ ۴ کاربر (دورِ ۱۷، تصویرِ ۴) ─────────────────────────────────────
 * «هنوز اون باکسِ کانالِ رسمی در فوتر هست؛ قرار شد باکس رو برداری و فقط
 * آیکونِ بله با استایلِ سه‌بعدی و پویانماییِ جذاب باشه؛ تهش زیرش بنویسی
 * خبرگزاری میدان نامجو؛ فقط یه تیترِ «کانال رسمی» باشه، زیرش آیکونِ بله،
 * و زیرِ آیکون نوشتهٔ خبرگزاری میدان نامجو — کلیک روی آیکون ⇒ کانال.
 * اگر رنگِ آیکون با تمِ روز/شب یکپارچه شود بهتر است.»
 *
 * ── چیدمانِ تازه: عمودی، وسط‌چین، بدونِ هیچ سطحی ──────────────────────────
 *   تیترِ «کانال رسمی»  (با خطِ طلاییِ کوچک، مثلِ بقیهٔ تیترهای فوتر)
 *        ⟐ آیکونِ سه‌بعدی (لینک)
 *   «خبرگزاری میدان نامجو»  (زیرِ آیکون، بخشی از همان لینک)
 *
 * هیچ `border`، هیچ `bg`، هیچ `rounded-2xl`ی در کار نیست؛ در هاور فقط
 * خودِ آیکون واکنش می‌دهد. این تفاوتِ اصلی با نسخهٔ قبل است که یک کارتِ
 * دراز با نام و کد و فلش بود.
 *
 * ── سه‌بعدی‌شدن، بدونِ تصویرِ اضافه ───────────────────────────────────────
 * آیکون از فایلِ خودِ کاربر (`image-45`) به **دو ماسکِ آلفا** تبدیل شده:
 *   • `bale-body.png` — بدنهٔ حباب (با سوراخِ تیک)
 *   • `bale-tick.png` — خودِ تیک
 * بدنه گرادیانِ گنبدی + سایهٔ داخلیِ بالا/پایین + حلقهٔ طلایی + بازتاب
 * می‌گیرد؛ تیک سفیدِ مات با سایهٔ کوچک زیرش روی سطح می‌نشیند.
 * رنگ **از توکن** می‌آید (`verde-deep` / `on-verde`)، پس در تمِ روز بدنهٔ
 * زمردیِ عمیق با تیکِ کرم و در تمِ شب بدنهٔ روشن‌تر با تیکِ روشن دارد —
 * همان «یکپارچگی با تم» که خواسته شد، بی‌آنکه یک تصویرِ دوم بسازیم.
 *
 * ── پویانمایی ────────────────────────────────────────────────────────────
 * شناوریِ آرامِ بی‌وقفه، دو حلقهٔ پالسِ پله‌ای، و در هاور/فوکوس:
 * «کلیکِ» تیک (۰٫۸۶→۱٫۱→۱)، روشن‌شدنِ حلقهٔ طلایی، بزرگ‌شدنِ ۴٪ و یک
 * عبورِ درخششِ مورب. همه با `transform`/`opacity` ⇒ بی‌هیچ layout.
 *
 * ⚠️ فقط یک کانال رسمی وجود دارد؛ لینکِ مرده بدتر از نبودِ لینک است.
 */
export function ChannelCard() {
  /**
   * ── همگام‌سازی با بک‌اند (نکتهٔ ۶، دورِ ۱۷) ────────────────────────────
   * آدرس و نامِ کانال پیش‌تر فقط از `SITE` (پیکربندیِ ساخت) می‌آمد؛ اگر
   * مدیرِ سامانه در پنل، کانالِ رسمی را عوض می‌کرد، فوتر همچنان به کانالِ
   * قدیمی اشاره می‌کرد. `bootstrap` همان فهرستِ `communication_channels`
   * را می‌دهد (همان منبعی که صفحهٔ اول و فرمِ ثبت‌نام استفاده می‌کنند).
   *
   * سه احتیاط:
   *   • تا داده نرسیده یا اگر خطا داد، `SITE` می‌مانَد ⇒ هرگز لینکِ خالی.
   *   • اگر بک‌اند کانالِ غیرِبله بدهد (`platform` دیگر)، آیکونِ سه‌بعدیِ
   *     بله گم‌کننده است؛ پس فقط وقتی از بک‌اند می‌خوانیم که پلتفرم همان
   *     بله باشد، وگرنه به پیکربندیِ ساخت برمی‌گردیم.
   *   • `url` باید با `https://` شروع شود؛ وگرنه لینکِ نسبیِ ناخواسته
   *     می‌سازیم. اعتبارسنجی همین‌جا، نه در لایهٔ شبکه.
   */
  const boot = useBootstrap();
  const live = boot.phase === "ready" ? boot.data.exam_status.communication_channels[0] : undefined;
  const liveOk =
    live !== undefined &&
    live.url.startsWith("https://") &&
    (live.platform === "bale" || live.platform === "بله") &&
    live.title.trim().length > 0;
  /**
   * نامِ نمایشی: بک‌اند معمولاً عنوانی بلند و توضیحی می‌فرستد
   * («خبرگزاری میدان نامجو — کانال رسمی حوزهٔ ۱۸۵ شهید کاوه در بله»). زیرِ
   * آیکون فقط «خبرگزاری میدان نامجو» جا می‌شود؛ پس بخشِ پیش از «—» را
   * برمی‌داریم و اگر باز هم بلند بود، به نامِ پیکربندی برمی‌گردیم. این‌طور
   * هر دو خواسته حفظ می‌شود: هم‌گامی با بک‌اند در آدرس، هم ظاهرِ تمیز.
   */
  const liveName = liveOk ? (live.title.split(/[—–|]/)[0]?.trim() ?? "") : "";
  const channel = liveOk
    ? {
        url: live.url,
        name: liveName.length > 0 && liveName.length <= 28 ? liveName : SITE.channel.name,
        platform: SITE.channel.platform,
      }
    : SITE.channel;

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="text-on-band flex items-center gap-2 text-[11.5px] font-extrabold tracking-wide">
        <span aria-hidden="true" className="bg-band-accent/70 h-3 w-[2px] rounded-full" />
        کانال رسمی
        <span aria-hidden="true" className="bg-band-accent/70 h-3 w-[2px] rounded-full" />
      </span>

      <a
        href={channel.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`کانال رسمی ${channel.name} در پیام‌رسان ${channel.platform} — باز شدن در پنجرهٔ تازه`}
        className="k185-bale group -m-1 flex min-h-[44px] flex-col items-center justify-center gap-2 rounded-2xl p-1 outline-offset-4"
      >
        <span className="relative grid size-[56px] place-items-center sm:size-[60px]">
          {/* پالس‌های پشتِ آیکون */}
          <span
            aria-hidden="true"
            className="k185-bale-ring border-verde/45 absolute inset-1.5 rounded-full border"
          />
          <span
            aria-hidden="true"
            className="k185-bale-ring k185-bale-ring-2 border-verde/30 absolute inset-1.5 rounded-full border"
          />
          {/* سایهٔ تماسِ زیرِ کره — «شناوری» را باورپذیر می‌کند. دو لایه:
              سایهٔ پهنِ نرم + هستهٔ تیره‌ترِ نزدیک؛ اندازه‌اش با شناوری
              هماهنگ است (بالا می‌رود ⇒ سایه کوچک‌تر و روشن‌تر). */}
          <span
            aria-hidden="true"
            className="bg-stage/25 absolute -bottom-1.5 h-2.5 w-10 rounded-[50%] blur-[6px]"
          />
          <span
            aria-hidden="true"
            className="bg-stage/20 absolute -bottom-0.5 h-1.5 w-6 rounded-[50%] blur-[3px]"
          />

          <span className="k185-bale-body relative grid size-[46px] place-items-center rounded-full sm:size-[50px]">
            {/* بازتابِ سطح */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(80%_60%_at_28%_16%,oklch(100%_0_0/0.42),transparent_58%)]"
            />
            {/* درخششِ موربِ هاور */}
            <span
              aria-hidden="true"
              className="k185-bale-sheen pointer-events-none absolute inset-0 overflow-hidden rounded-full"
            >
              <span className="absolute inset-y-0 -left-1/2 w-1/3 bg-[linear-gradient(90deg,transparent,oklch(100%_0_0/0.55),transparent)]" />
            </span>

            {/* تیکِ برجسته — دو لایه: سایهٔ زیرین + تیکِ روشن */}
            <span className="k185-bale-tick relative grid size-[27px] place-items-center sm:size-[29px]">
              <span
                aria-hidden="true"
                className="k185-bale-mask absolute inset-0 translate-y-[1.5px] bg-[oklch(0%_0_0/0.3)] blur-[1px]"
                style={MASK}
              />
              <span
                aria-hidden="true"
                className="k185-bale-mask bg-on-verde absolute inset-0"
                style={MASK}
              />
            </span>
          </span>
        </span>

        {/* نام — زیرِ آیکون، داخلِ همان لینک (ناحیهٔ لمسِ بزرگ‌تر) */}
        {/* یک‌خطی بمانَد (عنوانِ دو‌خطی در فوتر بد دیده می‌شد)؛ اگر جایی
            واقعاً تنگ شد، `text-balance` شکستِ متعادل می‌دهد نه شکستِ بدقواره. */}
        <span className="text-on-band-muted group-hover:text-on-band text-[11px] leading-tight font-bold text-balance whitespace-nowrap transition-colors">
          {channel.name}
        </span>
      </a>
    </div>
  );
}

/** ماسکِ مشترکِ تیک — یک شیء، دو مصرف (سایه و خودِ تیک). */
const MASK = {
  maskImage: "url(/img/bale-tick.png)",
  WebkitMaskImage: "url(/img/bale-tick.png)",
} as const;

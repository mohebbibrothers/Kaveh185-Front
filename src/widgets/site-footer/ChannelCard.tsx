import { SITE } from "@/shared/config/site";
import { useBootstrap } from "@/shared/api/use-bootstrap";

/**
 * کانالِ رسمی — **تیتر + آیکونِ سه‌بعدی + نام**، بی‌هیچ باکس/کارت.
 *
 * ── نکتهٔ ۴ دورِ ۱۷ و نکتهٔ ۲ دورِ ۱۸ ─────────────────────────────────────
 * کاربر خواست باکسِ «کانال رسمی» کامل برود، فقط آیکون بمانَد و زیرش نام
 * بیاید و کلیک ⇒ کانالِ بله. در دورِ ۱۸ یک قدم جلوتر رفت:
 *
 *   ۱) **آیکون عوض شد.** پیش از این از تصویرِ `image-45` (بدنهٔ گِرد با تیکِ
 *      سفید) استفاده می‌شد؛ فرمِ درخواستیِ کاربر (`image-52`) یک حبابِ
 *      گفتگو با گوشهٔ تاشده و تیکِ برجسته است. همان تصویر به دو **ماسکِ
 *      آلفا** تبدیل شد: `bale-mark.png` (بدنه) و `bale-check.png` (تیک).
 *      چون ماسک است، رنگِ آیکون کاملاً از توکن‌های سایت می‌آید و در تمِ
 *      روز/شب خودکار عوض می‌شود — همان «یکپارچگی با تم» که خواسته شد.
 *
 *   ۲) **سه‌بعدی‌شدن:** بدنه گرادیانِ گنبدیِ زمردی + بازتابِ شعاعیِ بالا-چپ
 *      + نورِ لبهٔ بالا + **نورِ بازتابیِ لبهٔ پایین** + سایهٔ داخلیِ پایین +
 *      حلقهٔ طلایی + دو سایهٔ تماس زیرِ آیکون. تیک دو لایه است: یک سایهٔ
 *      نرم زیر و یک تیکِ کرمِ روشن روی سطح، تا «حکاکی‌شده» دیده شود.
 *
 *   ۳) **پویانمایی:** شناوریِ آرام، دو حلقهٔ پالسِ پله‌ای، و در هاور/فوکوس:
 *      «کلیکِ» تیک، بزرگ‌شدنِ ۴٪، روشن‌شدنِ حلقهٔ طلایی و یک عبورِ
 *      درخششِ مورب. همه با `transform`/`opacity` ⇒ صفر layout. با
 *      `prefers-reduced-motion` همه خاموش می‌شوند.
 *
 *   ۴) **هم‌گامی با بک‌اند:** آدرس/نام از `bootstrap` خوانده می‌شود (همان
 *      منبعی که صفحهٔ اول و فرمِ ثبت‌نام استفاده می‌کنند) با اعتبارسنجیِ
 *      `https` و پلتفرم؛ در نبودِ داده، پیکربندیِ ساخت می‌مانَد تا هرگز
 *      لینکِ خالی یا مرده ساخته نشود.
 *
 * ⚠️ فقط یک کانال رسمی وجود دارد؛ لینکِ مرده بدتر از نبودِ لینک است.
 */
export function ChannelCard({ compact = false }: { compact?: boolean }) {
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
    <div className={`flex flex-col items-center gap-2 text-center ${compact ? "" : ""}`}>
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
        className="k185-bale group -m-1 flex min-h-[44px] flex-col items-center justify-center gap-1.5 rounded-2xl p-1 outline-offset-4"
      >
        <span className="relative grid size-[56px] place-items-center sm:size-[60px]">
          {/* پالس‌های پشتِ آیکون — همان شکلِ حباب، بی‌آنکه کارتی بسازند */}
          <span
            aria-hidden="true"
            className="k185-bale-glow absolute inset-1 rounded-full opacity-70 blur-md"
          />

          {/* ── خودِ آیکون: حبابِ گفتگو با تیکِ برجسته، سه‌بعدی ─────────────
              بدنهٔ حباب از ماسکِ آلفای تصویرِ کاربر (`bale-mark.png`) می‌آید
              و روی آن گرادیانِ گنبدی + بازتابِ شعاعی + حلقهٔ طلایی و سایهٔ
              تماس با `filter: drop-shadow` می‌نشیند — `box-shadow` روی عنصرِ
              ماسک‌دار دیده نمی‌شود، ولی `drop-shadow` دقیقاً شکلِ ماسک را
              دنبال می‌کند. تیک هم لایهٔ دومِ ماسک است. */}
          <span className="k185-bale-icon relative block size-[46px] sm:size-[50px]">
            {/* هالهٔ طلاییِ نرم پشتِ آیکون */}
            <span
              aria-hidden="true"
              className="k185-bale-mark bg-gold/35 absolute inset-0 scale-[1.06] blur-[3px]"
            />
            {/* بدنهٔ سه‌بعدی */}
            <span aria-hidden="true" className="k185-bale-mark k185-bale-face absolute inset-0" />
            {/* بازتابِ شیشه‌ایِ بالای حباب */}
            <span
              aria-hidden="true"
              className="k185-bale-mark absolute inset-0 bg-[radial-gradient(72%_54%_at_32%_14%,oklch(100%_0_0/0.55),transparent_62%)]"
            />
            {/* عبورِ درخششِ هاور */}
            <span aria-hidden="true" className="k185-bale-sheen absolute inset-0 overflow-hidden">
              <span className="k185-bale-mark absolute inset-0 bg-[linear-gradient(100deg,transparent_38%,oklch(100%_0_0/0.75)_50%,transparent_62%)] bg-[length:300%_100%]" />
            </span>
            {/* تیک — کرمِ روشن با سایهٔ نرم، «حکاکی‌شده» روی سطح */}
            <span
              aria-hidden="true"
              className="k185-bale-check absolute inset-0 translate-y-[1.5px] bg-[oklch(12%_0.03_160/0.35)] blur-[1px]"
            />
            <span aria-hidden="true" className="k185-bale-check bg-on-verde absolute inset-0" />
          </span>
        </span>

        {/* نام — زیرِ آیکون، داخلِ همان لینک (ناحیهٔ لمسِ بزرگ‌تر) */}
        <span className="text-on-band-muted group-hover:text-on-band text-[11px] leading-tight font-bold text-balance whitespace-nowrap transition-colors">
          {channel.name}
        </span>
      </a>
    </div>
  );
}

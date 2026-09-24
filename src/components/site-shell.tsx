"use client";
import Link from "next/link";
import { isSharePreview } from "@/lib/share-preview";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, useEffect } from "react";
import { ArrowUpRight, Menu, X, Globe, Plus, ShieldCheck } from "lucide-react";
import type { Localized } from "@/lib/content";
type Locale = "en" | "zh";
const Context = createContext({
  locale: "en" as Locale,
  t: (en: string, zh: string) => en,
  l: (v: Localized) => v.en,
});
export const useLanguage = () => useContext(Context);
export function SiteShell({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => {
    const value = document.cookie
      .split("; ")
      .find((v) => v.startsWith("care_language="))
      ?.split("=")[1];
    if (value === "zh") setLocale("zh");
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    setOpen(false);
  }, [locale, path]);
  const t = (en: string, zh: string) => (locale === "en" ? en : zh);
  const l = (v: Localized) => v[locale];
  const nav = [
    ["/why-china", "Why China", "为何选择中国"],
    ["/hospitals", "Hospitals", "医院"],
    ["/doctors", "Specialists", "专家"],
    ["/treatments", "Treatments", "诊疗方向"],
    ["/patient-journey", "Your Journey", "患者流程"],
  ];
  return (
    <Context.Provider value={{ locale, t, l }}>
      {isSharePreview && (
        <div className="bg-ink text-white text-center text-xs px-5 py-2">
          {t(
            "Reference demo · Fictional examples · Medical uploads are not enabled",
            "参考演示 · 使用虚构示例 · 暂不开放医疗资料上传",
          )}
        </div>
      )}
      <div className="bg-[#f0f5f7] text-[#527083] text-[11px] tracking-wide py-2">
        <div className="wrap flex justify-between gap-4">
          <span>
            {t(
              "A clearer path to medical care in China",
              "让来华就医更清晰、更安心",
            )}
          </span>
          <Link href="/privacy" className="flex gap-1.5 items-center">
            <ShieldCheck size={12} />
            {t("Your privacy comes first", "您的隐私至关重要")}
          </Link>
        </div>
      </div>
      <header className="bg-white/95 sticky top-0 z-40 border-b border-slate-100 backdrop-blur-md">
        <div className="wrap h-21 flex items-center justify-between gap-5">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="size-10 rounded-full bg-[#123f59] flex items-center justify-center text-white">
              <Plus size={28} strokeWidth={1.6} />
            </span>
            <span>
              <strong className="block text-[25px] font-semibold tracking-[-1px] leading-7">
                China<span className="text-[#557c85]">Care</span>
              </strong>
              <span className="hidden sm:block text-[8px] uppercase tracking-[2px]">
                International Patient Services
              </span>
            </span>
          </Link>
          <nav className="hidden xl:flex gap-6 text-[13px] font-medium">
            {nav.map(([url, en, zh]) => (
              <Link
                className={
                  path.startsWith(url)
                    ? "text-[#36787b]"
                    : "hover:text-[#36787b]"
                }
                key={url}
                href={url}
              >
                {t(en, zh)}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <button
              aria-label="Switch language"
              className="text-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              onClick={() => {
                const next = locale === "en" ? "zh" : "en";
                setLocale(next);
                document.cookie = `care_language=${next};path=/;max-age=31536000;SameSite=Lax`;
              }}
            >
              <Globe size={14} />
              <span className={locale === "en" ? "font-bold" : ""}>EN</span>
              <span className="text-slate-300">|</span>
              <span className={locale === "zh" ? "font-bold" : ""}>中文</span>
            </button>
            <Link
              href="/dashboard"
              className="hidden md:block text-xs font-medium"
            >
              {t("Patient Portal", "患者入口")}
            </Link>
            <Link
              href="/dashboard/cases/new"
              className="btn small hidden lg:inline-flex"
            >
              {t("Get a Medical Review", "申请病历评估")}
              <ArrowUpRight size={14} />
            </Link>
            <button
              className="xl:hidden"
              aria-label="Toggle navigation"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="wrap pb-6 flex flex-col gap-4 xl:hidden">
            {nav.map(([url, en, zh]) => (
              <Link key={url} href={url}>
                {t(en, zh)}
              </Link>
            ))}
            <Link href="/dashboard">{t("Patient Portal", "患者入口")}</Link>
            <Link href="/contact">{t("Contact", "联系我们")}</Link>
          </nav>
        )}
      </header>
      <main>{children}</main>
      <footer className="bg-[#102f42] text-white pt-16 pb-7">
        <div className="wrap">
          <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 pb-12">
            <div>
              <Link href="/" className="text-3xl font-semibold tracking-tight">
                ✚ ChinaCare
              </Link>
              <p className="text-sm text-slate-300 max-w-64 mt-4 leading-7">
                {t(
                  "Connecting you with care. Supporting you at every step.",
                  "连接医疗资源，陪伴就医旅程的每一步。",
                )}
              </p>
            </div>
            {[
              [
                ["/about", "About us", "关于我们"],
                ["/why-china", "Why China", "为何选择中国"],
                ["/hospitals", "Hospitals", "医院"],
              ],
              [
                ["/doctors", "Specialists", "专家"],
                ["/treatments", "Treatments", "诊疗方向"],
                ["/patient-journey", "Patient journey", "患者流程"],
                ["/care-planning", "Before you travel", "来华前评估"],
                ["/services", "Services & costs", "服务与费用"],
                ["/patient-stories", "Patient stories", "患者旅程示例"],
              ],
              [
                ["/privacy", "Privacy & Security", "隐私与安全"],
                ["/terms", "Terms of Service", "服务条款"],
                ["/contact", "Contact us", "联系我们"],
              ],
            ].map((links, i) => (
              <div key={i} className="flex flex-col gap-4 text-sm">
                <span className="text-[10px] uppercase tracking-[2px] text-slate-400">
                  {
                    [
                      t("Discover", "了解"),
                      t("Your care", "您的医疗"),
                      t("Here to help", "提供帮助"),
                    ][i]
                  }
                </span>
                {links.map(([url, en, zh]) => (
                  <Link key={url} href={url} className="hover:text-[#a9d6d3]">
                    {t(en, zh)}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 leading-6 border-t border-white/10 pt-7">
            {t(
              "This platform provides international patient coordination and information services. It does not provide medical diagnosis or medical treatment. All medical decisions are made by licensed medical institutions and physicians.",
              "本平台提供国际患者协调与信息服务，不提供医疗诊断或治疗。所有医疗决策均由持牌医疗机构及医师作出。",
            )}
          </p>
          <div className="flex justify-between text-[10px] text-slate-400 mt-6">
            <span>
              © {new Date().getFullYear()} ChinaCare ·{" "}
              {t("Demonstration platform", "演示平台")}
            </span>
            <Link href="/admin">{t("Coordinator access", "协调员入口")} ↗</Link>
          </div>
        </div>
      </footer>
    </Context.Provider>
  );
}

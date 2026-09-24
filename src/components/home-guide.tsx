"use client";

import Link from "next/link";
import { publicPath } from "@/lib/share-preview";
import {
  ArrowRight,
  Building2,
  FileCheck,
  Handshake,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "./site-shell";
import {
  RecordsFirst,
  SuitabilityAndMatching,
  ResponsibilitiesAndCosts,
} from "./coordination-sections";

export function HomeGuide() {
  const { t } = useLanguage();
  const groups = [
    {
      title: t("Explore medical resources", "了解医疗资源"),
      copy: t(
        "Find the institutions and specialties you want to understand.",
        "按医院、专家和诊疗方向，了解适合您的医疗资源。",
      ),
      Icon: Building2,
      links: [
        ["/why-china", t("Why consider China", "为什么考虑中国医疗")],
        ["/hospitals", t("Hospital directory", "查看医院")],
        ["/doctors", t("Specialist directory", "查看专家")],
        ["/treatments", t("Treatment directions", "查看诊疗方向")],
      ],
    },
    {
      title: t("Before you decide", "来华前，先了解与评估"),
      copy: t(
        "Start with records and medical review, then decide whether to travel.",
        "先提交病历、获得医疗评估，再决定是否出行。",
      ),
      Icon: FileCheck,
      links: [
        [
          "/care-planning",
          t("Records-first assessment process", "病历提交与评估流程"),
        ],
        [
          "/care-planning#suitability",
          t("Is treatment in China right for me?", "来华医疗是否适合我"),
        ],
        [
          "/care-planning#matching",
          t("How resources are matched", "如何匹配医院与专家"),
        ],
      ],
    },
    {
      title: t("Services & costs", "服务与费用"),
      copy: t(
        "Understand responsibilities, costs and support throughout your journey.",
        "明确各方职责、费用构成和全程协调支持。",
      ),
      Icon: Handshake,
      links: [
        ["/services", t("Who does what", "平台、医院与患者的职责")],
        ["/services#costs", t("Understand the costs", "了解费用构成")],
        [
          "/patient-journey",
          t("Your complete patient journey", "查看完整就医流程"),
        ],
        [
          "/patient-journey#support",
          t(
            "Arrival, family & follow-up support",
            "抵达、家属、恢复与随访支持",
          ),
        ],
      ],
    },
    {
      title: t("Confidence & support", "安心了解，放心开始"),
      copy: t(
        "See an example journey and learn how your information is protected.",
        "通过示意旅程了解体验，确认隐私保护与联系渠道。",
      ),
      Icon: ShieldCheck,
      links: [
        [
          "/patient-stories",
          t("Illustrative patient journey", "查看患者旅程示例"),
        ],
        ["/privacy", t("Privacy & patient consent", "隐私保护与患者授权")],
        ["/contact", t("Contact & questions", "联系咨询")],
      ],
    },
  ];
  return (
    <>
      <section className="wrap py-10 md:py-12">
        <div className="rounded-xl border border-[#d4e2e4] bg-[#f0f5f3] p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <div className="flex-1">
            <p className="eyebrow mb-3">
              {t("Your first step", "从这一步开始")}
            </p>
            <h2 className="serif text-2xl md:text-3xl">
              {t(
                "Start with your records. Decide after review.",
                "先提交病历，再决定是否来华。",
              )}
            </h2>
            <p className="muted mt-3">
              {t(
                "Medical review → Plan & estimated costs → Your decision → Travel",
                "医疗评估 → 方案与预估费用 → 患者决定 → 安排行程",
              )}
            </p>
          </div>
          <Link href="/dashboard/cases/new" className="btn shrink-0">
            {t("Explore the application", "查看申请流程")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <section className="wrap pb-14 md:pb-20" aria-labelledby="home-topics">
        <p className="eyebrow mb-3">
          {t("Explore at your own pace", "按您的需要，逐项了解")}
        </p>
        <h2 id="home-topics" className="section-title">
          {t("What would you like to know?", "您想先了解什么？")}
        </h2>
        <p className="muted mt-4 mb-8">
          {t(
            "Choose a topic to see the details.",
            "选择您关心的主题，点击查看详细内容。",
          )}
        </p>
        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {groups.map(({ title, copy, Icon, links }, i) => (
            <article key={title} className="card p-6 md:p-8">
              <div className="flex items-center justify-between mb-5">
                <Icon size={27} strokeWidth={1.4} className="text-[#54817d]" />
                <span className="eyebrow">0{i + 1}</span>
              </div>
              <h3 className="serif text-2xl">{title}</h3>
              <p className="muted mt-3 mb-5">{copy}</p>
              <nav aria-label={title} className="divide-y divide-[#e5ebed]">
                {links.map(([href, label]) => (
                  <a
                    key={href}
                    href={publicPath(href)}
                    className="group flex items-center justify-between gap-4 py-3.5 text-sm font-medium hover:text-accent"
                  >
                    <span>{label}</span>
                    <ArrowRight
                      size={16}
                      className="shrink-0 text-[#54817d] group-hover:translate-x-1 transition-transform motion-reduce:transform-none"
                    />
                  </a>
                ))}
              </nav>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export function CareGuidePage({
  page,
}: {
  page: "care-planning" | "services";
}) {
  const { t } = useLanguage();
  return (
    <>
      <div className="wrap pt-8">
        <Link
          href="/"
          className="inline-flex items-center min-h-11 text-sm text-[#547d82] hover:underline"
        >
          {t("← Back to home", "← 返回首页")}
        </Link>
        <h1 className="serif text-4xl md:text-5xl mt-5 mb-8">
          {page === "care-planning"
            ? t("Before you decide to travel", "来华前的了解与评估")
            : t("Services, responsibilities & costs", "服务、职责与费用")}
        </h1>
        <nav
          aria-label={t("On this page", "本页目录")}
          className="flex flex-wrap gap-3 pb-8"
        >
          {(page === "care-planning"
            ? [
                ["#records", "Assessment process", "病历评估流程"],
                ["#suitability", "Suitability", "来华适宜性"],
                ["#matching", "Resource matching", "资源匹配"],
              ]
            : [
                ["#responsibilities", "Responsibilities", "各方职责"],
                ["#costs", "Cost categories", "费用构成"],
                [
                  "/patient-journey#support",
                  "Practical support",
                  "全程协调支持",
                ],
              ]
          ).map(([href, en, zh]) => (
            <a
              key={href}
              href={publicPath(href)}
              className="btn secondary small"
            >
              {t(en, zh)}
            </a>
          ))}
        </nav>
      </div>
      {page === "care-planning" ? (
        <>
          <RecordsFirst />
          <SuitabilityAndMatching />
        </>
      ) : (
        <ResponsibilitiesAndCosts />
      )}
      <div className="wrap pb-12">
        <Link href="/" className="btn secondary">
          {t("Explore other topics", "返回首页查看其他主题")}
          <ArrowRight size={16} />
        </Link>
      </div>
    </>
  );
}

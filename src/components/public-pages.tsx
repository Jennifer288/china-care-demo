"use client";
import Link from "next/link";
import {
  ResponsibilitiesAndCosts,
  JourneySupport,
  PrivacyDetails,
} from "./coordination-sections";
import Image from "next/image";
import { HomeGuide } from "./home-guide";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  HeartPulse,
  Brain,
  Bone,
  Activity,
  ScanLine,
  Leaf,
  Stethoscope,
  Check,
  MapPin,
  Globe,
  LockKeyhole,
  FileCheck,
  Users,
  Building2,
  Search,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  hospitals,
  doctors,
  specialties,
  journey,
  journeyDetails,
  advantages,
  heroPhoto,
  type Localized,
} from "@/lib/content";
import { useLanguage } from "./site-shell";
const icons = [
  HeartPulse,
  Activity,
  Brain,
  Bone,
  Stethoscope,
  ScanLine,
  Leaf,
  ShieldCheck,
];
function Photo({
  src,
  alt,
  priority = false,
  style = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  style?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      priority={priority}
      className={`object-cover ${style}`}
      unoptimized
    />
  );
}
export function CTA() {
  const { t } = useLanguage();
  return (
    <section className="bg-[#eef4f4] py-16">
      <div className="wrap flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <p className="eyebrow mb-4">
            {t("Your next step, made simpler", "让下一步更简单")}
          </p>
          <h2 className="section-title">
            {t(
              "You don’t have to navigate this alone.",
              "来华就医，不必独自摸索。",
            )}
          </h2>
          <p className="muted mt-4">
            {t(
              "Share your records. Let’s find a clear path forward, together.",
              "提交病历，与我们一起梳理清晰的就医路径。",
            )}
          </p>
        </div>
        <Link href="/dashboard/cases/new" className="btn shrink-0">
          {t("Get a Medical Review", "申请病历评估")}
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </section>
  );
}
function Heading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h1 className="section-title md:text-[52px]">{title}</h1>
      {copy && <p className="muted mt-5 max-w-xl">{copy}</p>}
    </div>
  );
}
function SectionHead({
  small,
  title,
  href,
  label,
}: {
  small: string;
  title: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="flex justify-between items-end gap-5 mb-10">
      <div>
        <p className="eyebrow mb-3">{small}</p>
        <h2 className="section-title">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="text-xs font-semibold flex items-center gap-2 shrink-0"
        >
          {label}
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}
export function HospitalCard({
  hospital: h,
}: {
  hospital: (typeof hospitals)[number];
}) {
  const { t, l } = useLanguage();
  return (
    <article className="card">
      <Link href={`/hospitals/${h.id}`} className="relative block h-52">
        <Photo
          src={h.image}
          alt={t("Illustrative hospital architecture", "医院建筑示意图片")}
        />
        <span className="absolute bottom-3 left-3 rounded bg-white/95 px-2 py-1 text-[9px] tracking-wide">
          {t("ILLUSTRATIVE IMAGE", "示意图片")}
        </span>
      </Link>
      <div className="p-6">
        <p className="text-xs text-[#65818c] flex items-center gap-1.5 mb-3">
          <MapPin size={12} />
          {l(h.city)}, {t("China", "中国")}
        </p>
        <h3 className="text-lg leading-6 font-semibold min-h-12">
          <Link href={`/hospitals/${h.id}`}>{l(h.name)}</Link>
        </h3>
        <p className="text-[10px] text-slate-500 mt-3">
          {t(
            "Tertiary hospital · Classification to be verified",
            "三级医院 · 等级信息待核实",
          )}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {h.specialties.map((s) => (
            <span className="tag" key={s.id}>
              {l(s.name)}
            </span>
          ))}
        </div>
        <div className="border-t border-slate-100 mt-5 pt-4 flex justify-between items-center">
          <span className="text-[9px] text-slate-500">
            {t("Demo / Public Information", "演示 / 公开信息")}
          </span>
          <Link
            href={`/hospitals/${h.id}`}
            aria-label={`${t("View hospital", "查看医院")} ${l(h.name)}`}
            className="rounded-full border border-slate-200 p-2"
          >
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
function DoctorCard({ doctor: d }: { doctor: (typeof doctors)[number] }) {
  const { t, l } = useLanguage();
  return (
    <article className="card">
      <Link
        href={`/doctors/${d.id}`}
        className="relative block h-60 bg-[#edf3f3]"
      >
        <Photo
          src={d.image}
          alt={t(
            "Stock portrait, not the fictional specialist",
            "素材肖像，非虚构专家本人",
          )}
        />
        <span className="absolute top-3 left-3 tag bg-white">
          {t("FICTIONAL DEMO PROFILE", "虚构演示人物")}
        </span>
      </Link>
      <div className="p-5">
        <p className="eyebrow text-[9px] mb-2">{l(d.specialty.name)}</p>
        <h3 className="text-xl font-semibold">{l(d.name)}</h3>
        <p className="muted text-xs">{l(d.title)}</p>
        <p className="text-xs mt-2 min-h-8">{l(d.hospital.name)}</p>
        <p className="text-[11px] text-slate-500 mt-3 flex gap-1 items-center">
          <Globe size={12} />
          {l(d.languages)}
        </p>
        <Link
          href={`/doctors/${d.id}`}
          className="text-xs flex justify-between border-t border-slate-100 pt-4 mt-4"
        >
          {t("View profile", "查看资料")}
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </article>
  );
}
function StrengthGrid() {
  const { l, t } = useLanguage();
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        ...specialties.filter(
          (s) => !["traditional-medicine", "health-screening"].includes(s.id),
        ),
        ...specialties.filter((s) =>
          ["traditional-medicine", "health-screening"].includes(s.id),
        ),
      ].map((s) => {
        const i = specialties.indexOf(s);
        const Icon = icons[i] || Stethoscope;
        return (
          <Link
            className="card p-6 group"
            href={`/treatments/${s.id}`}
            key={s.id}
          >
            <Icon size={28} strokeWidth={1.3} className="text-[#427b80] mb-7" />
            <h3 className="font-semibold mb-2">{l(s.name)}</h3>
            <p className="muted text-xs leading-6 min-h-12">
              {l(s.description)}
            </p>
            <span className="mt-5 flex justify-between items-center text-[11px]">
              {t("Explore care", "了解详情")}
              <ArrowUpRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
export function Home() {
  const { t } = useLanguage();
  return (
    <>
      <section className="bg-[#f3f6f5] overflow-hidden">
        <div className="wrap grid lg:grid-cols-[1.04fr_1fr] min-h-[600px] items-center gap-10 py-12 lg:py-16">
          <div className="fade-in py-5 lg:pr-5">
            <p className="eyebrow flex items-center gap-2 mb-6">
              <span className="w-6 h-px bg-[#789797]" />
              {t("Expert care. Human connection.", "专业医疗，以人为本。")}
            </p>
            <h1 className="serif text-[46px] sm:text-[58px] lg:text-[66px] leading-[1.04] tracking-[-2px]">
              {t("World-Class", "优质医疗，")}
              <br />
              {t("Medical Care", "在中国")}
              <br />
              <span className="text-[#547d82]">
                {t("in China", "开启安心旅程")}
              </span>
              <span className="text-[#c79b70]">.</span>
            </h1>
            <p className="text-[#637987] leading-7 text-sm md:text-[15px] max-w-[420px] mt-6">
              {t(
                "Access leading hospitals, experienced specialists and personalized medical coordination in China.",
                "了解中国优质医院与经验丰富的专家，获得个性化医疗协调服务。",
              )}
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/dashboard/cases/new" className="btn">
                {t("Get a Medical Review", "申请病历评估")}
                <ArrowUpRight size={16} />
              </Link>
              <Link href="/hospitals" className="btn secondary">
                {t("Explore Hospitals", "探索医院")}
                <ArrowRight size={16} />
              </Link>
            </div>
            <p className="flex items-center gap-2 text-[10px] text-[#6b8288] mt-6">
              <LockKeyhole size={12} />
              {t(
                "Private by design. Always guided by your consent.",
                "尊重隐私，每一步均以您的授权为前提。",
              )}
            </p>
          </div>
          <div className="relative h-[390px] sm:h-[460px] lg:h-[500px] mb-7 lg:mb-0">
            <div className="absolute inset-0 rounded-t-[120px] rounded-b-xl overflow-hidden">
              <Photo
                src={heroPhoto}
                priority
                alt={t(
                  "Illustrative modern operating room",
                  "现代手术室示意图片",
                )}
              />
              <div className="absolute inset-0 bg-[#173f50]/10" />
            </div>
            <span className="absolute top-6 right-5 rounded-full bg-white/90 px-3 py-2 text-[9px] tracking-wide">
              {t("CARE WITHOUT BORDERS", "医疗无界 · 关怀同行")}
            </span>
            <div className="absolute -bottom-6 -left-3 sm:-left-7 bg-white rounded-xl shadow-lg shadow-slate-900/5 px-6 py-5 max-w-[310px] flex gap-4 items-center">
              <span className="rounded-full p-3 bg-[#ecf4f2] text-[#548078]">
                <Users size={24} strokeWidth={1.4} />
              </span>
              <div>
                <p className="text-sm font-semibold">
                  {t("A person by your side", "专人协调，全程相伴")}
                </p>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-5">
                  {t(
                    "From your first question to your follow-up care.",
                    "从首次咨询到后续随访。",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="border-b border-[#e5ebed]">
        <div className="wrap grid grid-cols-2 lg:grid-cols-4 py-7 gap-6">
          {[
            [Building2, t("Leading Tertiary Hospitals", "优质三级医院")],
            [
              Stethoscope,
              t("Experienced Medical Specialists", "经验丰富的医疗专家"),
            ],
            [ScanLine, t("Advanced Medical Technology", "先进医疗技术")],
            [Users, t("Personalized Patient Support", "个性化患者支持")],
          ].map(([Icon, label], i) => {
            const I = Icon as typeof Building2;
            return (
              <div
                key={i}
                className="flex gap-3 items-center text-[11px] font-medium"
              >
                <I
                  size={22}
                  strokeWidth={1.3}
                  className="text-[#649092] shrink-0"
                />
                {label as string}
              </div>
            );
          })}
        </div>
      </div>
      <HomeGuide />
    </>
  );
}
export function Directory({
  kind,
}: {
  kind: "hospitals" | "doctors" | "treatments";
}) {
  const { t, l } = useLanguage();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const labels = {
    hospitals: [
      t("Hospital directory", "医院目录"),
      t("Find a place for your care.", "寻找适合您的医疗机构。"),
    ],
    doctors: [
      t("Specialist directory", "专家目录"),
      t("Expertise, with a human face.", "专业医疗，以人为本。"),
    ],
    treatments: [
      t("Treatment directions", "诊疗方向"),
      t("Start with what matters to you.", "从您最关心的问题开始。"),
    ],
  };
  const label = labels[kind];
  return (
    <>
      <div className="bg-[#f3f6f5] py-16">
        <div className="wrap">
          <Heading
            eyebrow={label[0]}
            title={label[1]}
            copy={t(
              "Explore your options. A coordinator can help you understand the next steps based on your existing medical records.",
              "了解您的选择。协调员可根据您现有的病历，帮助您梳理下一步。",
            )}
          />
        </div>
      </div>
      <section className="section wrap">
        <div className="notice mb-8 text-xs">
          {t(
            "Demo directory. Hospital profiles use illustrative information; specialists are fictional, with stock portraits. No partnership, credentials or availability are implied.",
            "演示目录：医院资料为展示用途；所有专家均为虚构人物，照片为素材。不表示合作关系、真实资历或接诊承诺。",
          )}
        </div>
        {kind === "treatments" ? (
          <StrengthGrid />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <label className="relative flex-1">
                <Search
                  size={17}
                  className="absolute top-3.5 left-4 text-slate-400"
                />
                <input
                  className="input pl-11"
                  aria-label={t("Search directory", "搜索目录")}
                  placeholder={t(
                    "Search by name, city or specialty…",
                    "搜索名称、城市或专科…",
                  )}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                aria-label={t("Filter specialty", "筛选专科")}
                className="input sm:w-60"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">{t("All specialties", "全部专科")}</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {l(s.name)}
                  </option>
                ))}
              </select>
            </div>
            <div
              className={`grid sm:grid-cols-2 ${kind === "hospitals" ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-6`}
            >
              {kind === "hospitals"
                ? hospitals
                    .filter(
                      (h) =>
                        `${l(h.name)} ${l(h.city)} ${h.specialties.map((s) => l(s.name)).join(" ")}`
                          .toLowerCase()
                          .includes(query.toLowerCase()) &&
                        (filter === "all" ||
                          h.specialties.some((s) => s.id === filter)),
                    )
                    .map((h) => <HospitalCard key={h.id} hospital={h} />)
                : doctors
                    .filter(
                      (d) =>
                        `${l(d.name)} ${l(d.specialty.name)} ${l(d.hospital.name)}`
                          .toLowerCase()
                          .includes(query.toLowerCase()) &&
                        (filter === "all" || d.specialty.id === filter),
                    )
                    .map((d) => <DoctorCard key={d.id} doctor={d} />)}
            </div>
            <p className="muted text-xs mt-8">
              {t(
                "Can’t find a match? Clear your filters or contact our team.",
                "没有找到匹配结果？请清除筛选条件或联系团队。",
              )}
            </p>
          </>
        )}
      </section>
      <CTA />
    </>
  );
}
export function Detail({
  kind,
  id,
}: {
  kind: "hospitals" | "doctors" | "treatments";
  id: string;
}) {
  const { t, l } = useLanguage();
  const h = hospitals.find((h) => h.id === id),
    d = doctors.find((d) => d.id === id),
    s = specialties.find((s) => s.id === id);
  const entity = kind === "hospitals" ? h : kind === "doctors" ? d : s;
  if (!entity) return null;
  const title = l(entity.name);
  return (
    <>
      <section className="bg-[#f3f6f5] py-14">
        <div className="wrap">
          <Link
            href={`/${kind}`}
            className="text-xs flex items-center gap-2 mb-7"
          >
            ← {t("Back to directory", "返回目录")}
          </Link>
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 items-center">
            <Heading
              eyebrow={t("Explore your care options", "探索您的医疗选择")}
              title={title}
              copy={
                kind === "hospitals"
                  ? l(h!.description)
                  : kind === "doctors"
                    ? t(
                        "A fictional specialist profile for demonstrating the patient experience. No credentials, clinical history or real professional affiliation are asserted.",
                        "用于演示患者体验的虚构专家资料，不代表真实资历、临床经历或执业关系。",
                      )
                    : l(s!.description)
              }
            />
            {kind !== "treatments" && (
              <div className="relative h-64 rounded-xl overflow-hidden">
                <Photo
                  src={kind === "hospitals" ? h!.image : d!.image}
                  alt={t("Illustrative stock image", "示意素材图片")}
                />
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="section wrap grid lg:grid-cols-[1fr_300px] gap-14">
        <div className="space-y-10">
          <div className="notice text-xs">
            {t(
              "Demo / Public Information · Details require verification before making any medical or travel decision.",
              "演示 / 公开信息 · 作出医疗或旅行决定前，需核实所有信息。",
            )}
          </div>
          {kind === "hospitals" ? (
            <>
              <DetailBlock
                title={t("Hospital overview", "医院概况")}
                text={l(h!.description)}
              />
              <DetailBlock
                title={t(
                  "Key departments & medical strengths",
                  "重点科室与医疗方向",
                )}
                text={h!.specialties.map((s) => l(s.name)).join(" · ")}
              />
              <DetailBlock
                title={t("Facilities", "医疗设施")}
                text={t(
                  "Imaging, inpatient facilities and procedure availability must be confirmed with the hospital. This demo does not verify equipment or accreditation.",
                  "影像检查、住院设施及手术服务需向医院确认。本演示不对设备或认证作核实声明。",
                )}
              />
              <DetailBlock
                title={t("International patient services", "国际患者服务")}
                text={t(
                  "Ask about language support, appointment requirements, interpretation and medical record translation before arranging travel.",
                  "出行前请确认语言支持、预约要求、口译和病历翻译安排。",
                )}
              />
              <DetailBlock
                title={t("Location", "位置")}
                text={`${l(h!.city)}, ${t("China · Confirm the exact campus and arrival instructions with the hospital.", "中国 · 请向医院确认具体院区及到院指引。")}`}
              />
              <DetailBlock
                title={t(
                  "Why International Patients May Consider This Hospital",
                  "国际患者为何可能考虑这家医院",
                )}
                text={t(
                  "Consider whether its relevant departments, clinical experience, facilities, language support and appointment schedule meet your needs. These demo details require institutional verification and do not imply a partnership.",
                  "可了解其相关科室、临床经验、设施、语言支持和预约安排是否符合需求。演示信息需经机构核实，不代表合作关系。",
                )}
              />
              <DetailBlock
                title={t("Typical Patient Journey", "典型就医流程")}
                text={t(
                  "Submit records → Case preparation → Hospital / specialist review → Feasibility, plan and estimated costs → Your decision → Visa and travel → Hospital care and follow-up coordination.",
                  "提交病历 → 病历整理 → 医院 / 专家评估 → 可行性、方案及预估费用 → 患者决定 → 签证与出行 → 医院诊疗与随访协调。",
                )}
              />
              <h2 className="section-title">
                {t("Specialists · Demo", "专家 · 演示")}
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {doctors
                  .filter((d) => d.hospital.id === id)
                  .map((d) => (
                    <DoctorCard key={d.id} doctor={d} />
                  ))}
              </div>
            </>
          ) : kind === "doctors" ? (
            <>
              {[
                [
                  t("Title & department", "职称与科室"),
                  `${l(d!.title)} · ${l(d!.specialty.name)}`,
                ],
                [
                  t("Clinical Focus", "临床关注方向"),
                  l(d!.specialty.description),
                ],
                [
                  t("Professional Background", "专业背景"),
                  t(
                    "Fictional profile. Verified professional experience will be added only after institutional confirmation.",
                    "虚构人物资料。经机构确认后方可录入真实工作经历。",
                  ),
                ],
                [
                  t("Education", "教育背景"),
                  t(
                    "Not provided in this demonstration. No qualifications are claimed.",
                    "演示中未提供，不声明任何真实资质。",
                  ),
                ],
                [
                  t("Relevant Conditions", "相关疾病方向"),
                  l(d!.specialty.condition),
                ],
                [
                  t("Procedures", "诊疗技术与手术"),
                  t(
                    "No individual procedure expertise is verified in this fictional profile. Procedure scope must be confirmed with the physician and hospital.",
                    "本虚构资料不声明任何已核实的个人手术专长，诊疗技术范围须向医生与医院确认。",
                  ),
                ],
                [t("Languages", "工作语言"), l(d!.languages)],
              ].map(([title, text]) => (
                <DetailBlock key={title} title={title} text={text} />
              ))}
              <HospitalCard hospital={d!.hospital} />
            </>
          ) : (
            <>
              <DetailBlock
                title={t("Condition overview", "疾病方向概览")}
                text={t(
                  `This pathway helps patients explore hospital assessment for ${s!.condition.en.toLowerCase()}. Suitability and treatment decisions require evaluation by a licensed physician.`,
                  `${s!.condition.zh}方向帮助患者了解医院评估路径。是否适合及具体治疗决策，需由持牌医师评估。`,
                )}
              />
              <DetailBlock
                title={t("Why patients consider China", "患者为何考虑中国")}
                text={t(
                  "Patients may consider specialist expertise, available facilities and estimated costs. Access and timing depend on the institution and the individual case. No outcome is guaranteed.",
                  "患者可能考虑专科经验、医疗设施及预估费用。就医安排与时间取决于机构及个体情况，不作疗效保证。",
                )}
              />
              <h2 className="section-title">
                {t("Relevant hospitals", "相关医院")}
              </h2>
              {!hospitals.some((h) =>
                h.specialties.some((x) => x.id === id),
              ) && (
                <p className="notice text-xs">
                  {t(
                    "No specialty-specific hospital mapping has been verified for this direction. The following are general directory examples, not confirmed providers of this treatment.",
                    "此方向尚无已核实的专科医院映射。以下仅为一般目录示例，不代表已确认提供该项诊疗。",
                  )}
                </p>
              )}
              <div className="grid sm:grid-cols-2 gap-5">
                {hospitals
                  .filter((h) => h.specialties.some((x) => x.id === id))
                  .slice(0, 2)
                  .concat(hospitals.slice(0, 2))
                  .slice(0, 2)
                  .map((h) => (
                    <HospitalCard key={h.id} hospital={h} />
                  ))}
              </div>
              <h2 className="section-title">
                {t("Relevant specialists · Demo", "相关专家 · 演示")}
              </h2>
              {!doctors.some((d) => d.specialty.id === id) && (
                <p className="muted">
                  {t(
                    "Specialist profiles for this direction are awaiting verified information. You can still explore the case-review process.",
                    "此方向的专家资料待核实后补充，您仍可了解病例评估流程。",
                  )}
                </p>
              )}
              <div className="grid sm:grid-cols-2 gap-5">
                {doctors
                  .filter((d) => d.specialty.id === id)
                  .map((d) => (
                    <DoctorCard key={d.id} doctor={d} />
                  ))}
              </div>
              <DetailBlock
                title={t("Typical patient journey", "典型患者流程")}
                text={t(
                  "Records → coordinator review → hospital assessment → proposed plan and estimate → your decision → independently arranged travel → hospital care and follow-up.",
                  "提交资料 → 协调员审核 → 医院评估 → 建议方案与预估费用 → 患者决定 → 自行安排出行 → 到院诊疗及随访。",
                )}
              />
              <Link href="/patient-journey" className="btn secondary">
                {t("View all steps", "查看全部流程")}
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
        <aside>
          <div className="card p-7 sticky top-28">
            <ShieldCheck className="text-[#4d807b] mb-5" size={30} />
            <h2 className="serif text-2xl">
              {t("Have medical records?", "已有病历资料？")}
            </h2>
            <p className="muted mt-4 mb-6">
              {t(
                "Share your case for coordinated review. Your information is shared only with your authorization.",
                "提交病例申请协调审核。资料仅在您授权的范围内使用。",
              )}
            </p>
            <Link className="btn w-full" href="/dashboard/cases/new">
              {t("Submit your case", "提交病例")}
              <ArrowUpRight size={16} />
            </Link>
            <p className="text-[10px] text-slate-500 mt-4">
              {t(
                "Coordination services. No online diagnosis.",
                "医疗协调服务，不提供在线诊断。",
              )}
            </p>
          </div>
        </aside>
      </section>
      <CTA />
    </>
  );
}
function DetailBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <p className="muted">{text}</p>
    </div>
  );
}
export function Information({ page }: { page: string }) {
  const { t, l } = useLanguage();
  if (page === "why-china")
    return (
      <>
        <section className="section wrap">
          <Heading
            eyebrow={t("Make an informed choice", "了解信息，慎重选择")}
            title={t(
              "Why consider medical care in China?",
              "为什么考虑到中国就医？",
            )}
            copy={t(
              "A different destination can open new possibilities. The right decision starts with your needs, independent advice and clear information.",
              "不同的就医目的地可能带来更多选择。合适的决定始于您的需求、独立专业意见和清晰的信息。",
            )}
          />
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {advantages.map(([title, desc], i) => (
              <div className="card p-7" key={i}>
                <span className="eyebrow">0{i + 1}</span>
                <h2 className="serif text-2xl mt-5 mb-4">{l(title)}</h2>
                <p className="muted">{l(desc)}</p>
              </div>
            ))}
          </div>
        </section>
        <CTA />
      </>
    );
  if (page === "patient-journey")
    return (
      <>
        <section className="section wrap">
          <Heading
            eyebrow={t("Your medical journey", "您的医疗旅程")}
            title={t(
              "From the first question\nto the next chapter.",
              "从首次咨询，到下一段旅程。",
            )}
            copy={t(
              "A transparent process, with space for your questions and your decisions at every stage.",
              "每个阶段都清晰透明，为您的疑问和决定留出空间。",
            )}
          />
          <div className="grid lg:grid-cols-[1fr_350px] gap-12 mt-14">
            <ol>
              {journey.map((step, i) => (
                <li key={i} className="flex gap-6 pb-9 relative">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[#edf3f3] text-[#4f7e7f] flex items-center justify-center text-xs">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="pt-1">
                    <h2 className="text-lg font-semibold">{l(step)}</h2>
                    <p className="muted text-xs mt-2">{l(journeyDetails[i])}</p>
                  </div>
                </li>
              ))}
            </ol>
            <aside className="notice h-fit sticky top-28">
              <h2 className="font-semibold mb-3">
                {t("Travel is your decision", "出行由您决定")}
              </h2>
              <p className="text-sm leading-7">
                {t(
                  "Patients arrange their own visas according to official Chinese visa requirements. Relevant hospital documents may be provided when available and applicable. Confirm medical suitability and your decision before arranging travel.",
                  "患者根据中国官方签证要求自行办理签证。医院相关材料仅在可提供且适用时提供。确认医疗适宜性并自主决定后，再安排出行。",
                )}
              </p>
            </aside>
          </div>
        </section>
        <JourneySupport />
        <ResponsibilitiesAndCosts />
        <CTA />
      </>
    );
  const privacy = page === "privacy",
    terms = page === "terms";
  return (
    <section className="section wrap max-w-4xl">
      <Heading
        eyebrow={
          privacy
            ? t("Privacy & Security", "隐私与安全")
            : terms
              ? t("Terms of Service", "服务条款")
              : t("About ChinaCare", "关于 ChinaCare")
        }
        title={
          privacy
            ? t(
                "Your medical information belongs to you.",
                "您的医疗信息属于您。",
              )
            : terms
              ? t(
                  "Clear expectations. Respectful care.",
                  "明确服务边界，尊重患者。",
                )
              : t(
                  "Making care in China more accessible.",
                  "让来华就医更清晰、可及。",
                )
        }
      />
      <div className="space-y-9 mt-12">
        {(privacy
          ? [
              [
                t("Patient consent", "患者授权"),
                t(
                  "Registration consent is separate from medical processing consent. Your draft is not available to coordinators. Submission records your authorization, version and acceptance time.",
                  "注册同意与医疗信息处理授权独立。协调员不可查看草稿。提交时记录您的授权、版本与同意时间。",
                ),
              ],
              [
                t("Private storage & controlled access", "私有存储与受控访问"),
                t(
                  "The connected service uses a private storage bucket and owner-based database policies. Authenticated file endpoints verify access on every request. Authorized coordinators may access submitted cases.",
                  "连接正式服务后，使用私有存储桶及基于所有权的数据库策略。文件接口在每次请求时验证权限，授权协调员可以查看已提交病例。",
                ),
              ],
              [
                t("Encryption & confidentiality", "加密与保密"),
                t(
                  "Production deployment requires HTTPS and a storage provider with encryption at rest configured. Medical details are excluded from browser localStorage, analytics and application logs.",
                  "正式部署需启用 HTTPS，并配置具备静态加密的存储服务商。医疗信息不会保存到浏览器 localStorage、分析工具或应用日志。",
                ),
              ],
              [
                t("Patient control & retention", "患者控制与数据保留"),
                t(
                  "You can view and download your files and delete files while a case is a draft. For submitted records, contact the team to request access, correction or deletion. Full account export and deletion workflows are planned, not automated in this version. Retention terms must be finalized before real patient use.",
                  "您可查看、下载文件，并删除草稿中的文件。已提交资料的查阅、更正或删除需联系团队申请。本版尚无完整账号导出和自动删除流程。正式使用前须明确保留期限。",
                ),
              ],
              [
                t("Local demo limitations", "本地演示限制"),
                t(
                  "Without a configured backend, records remain temporarily in server memory and disappear on restart. Use synthetic data only. The demo is not a clinical service or production medical data system.",
                  "未配置后端时，资料临时保存在服务端内存，重启后清空。仅可使用虚构测试资料。演示不构成临床服务或正式医疗数据系统。",
                ),
              ],
            ]
          : terms
            ? [
                [
                  t("Coordination only", "仅提供协调服务"),
                  t(
                    "We provide information and coordination, not medical advice, diagnosis or treatment. Licensed institutions and physicians are responsible for all medical decisions.",
                    "我们提供信息与协调，不提供医疗建议、诊断或治疗。所有医疗决策由持牌机构和医师负责。",
                  ),
                ],
                [
                  t("Demonstration data", "演示资料"),
                  t(
                    "Hospital profiles are illustrative and do not establish partnerships. All specialist identities are fictional. Images are stock photography. Verify details independently before making decisions.",
                    "医院资料为演示用途，不代表合作关系。所有专家身份均为虚构，图片为素材。作决定前请独立核实。",
                  ),
                ],
                [
                  t("Costs and travel", "费用与出行"),
                  t(
                    "Costs and timelines depend on assessment and availability. No outcome, admission or visa is guaranteed. Patients independently arrange visas and travel.",
                    "费用与时间取决于评估和接诊情况，不保证疗效、收治或签证。签证和出行由患者自行安排。",
                  ),
                ],
                [
                  t("Before public launch", "正式发布前"),
                  t(
                    "This demonstration does not establish a paid service contract. The operator identity, contact details, retention terms, legal policies and clinical partners must be confirmed before accepting real patients.",
                    "此演示不构成付费服务合同。接收真实患者前须确认运营主体、联系方式、数据保留条款、法律政策及医疗合作方。",
                  ),
                ],
              ]
            : [
                [
                  t("A clearer path to care", "更清晰的就医路径"),
                  t(
                    "ChinaCare is a demonstration of an international patient coordination platform. We help explain the process of finding hospitals, organizing records and communicating with a human coordinator.",
                    "ChinaCare 是国际患者医疗协调平台的演示版本，帮助患者了解医院选择、病历整理及与人工协调员沟通的流程。",
                  ),
                ],
                [
                  t("Our approach", "我们的原则"),
                  t(
                    "Trust, transparency, privacy and patient support. You stay in control; qualified medical professionals make the clinical decisions.",
                    "信任、透明、隐私与患者支持。您掌控自己的决定，临床决策由合格医疗专业人员作出。",
                  ),
                ],
              ]
        ).map(([title, text]) => (
          <DetailBlock key={title} title={title} text={text} />
        ))}
        {privacy && <PrivacyDetails />}
        <Link href="/contact" className="btn">
          {t("Contact our team", "联系团队")}
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

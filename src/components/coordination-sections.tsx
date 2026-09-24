"use client";
import Link from "next/link";
import { ArrowRight, FileText, ShieldCheck } from "lucide-react";
import { useLanguage } from "./site-shell";
import { tx, type Localized } from "@/lib/content";

const steps = [
  tx("Submit Medical Records", "提交病历"),
  tx("Case Preparation", "病历整理"),
  tx("Hospital / Specialist Review", "医院 / 专家评估"),
  tx("Treatment Feasibility", "治疗可行性评估"),
  tx("Plan & Estimated Cost", "方案与预估费用"),
  tx("Patient Decision", "患者自主决定"),
  tx("Travel to China", "安排来华行程"),
];
function Intro({ title, copy }: { title: Localized; copy: Localized }) {
  const { l } = useLanguage();
  return (
    <div className="max-w-3xl mb-9">
      <h2 className="section-title">{l(title)}</h2>
      <p className="muted mt-5">{l(copy)}</p>
    </div>
  );
}
function Items({ items }: { items: Localized[] }) {
  const { l } = useLanguage();
  return (
    <ul className="space-y-3 text-sm leading-6">
      {items.map((item) => (
        <li className="flex gap-3" key={item.en}>
          <span className="text-[#54817d] shrink-0">·</span>
          <span>{l(item)}</span>
        </li>
      ))}
    </ul>
  );
}
export function RecordsFirst() {
  const { t, l } = useLanguage();
  return (
    <section id="records" className="section bg-[#f0f5f3]">
      <div className="wrap">
        <p className="eyebrow mb-4">
          {t("Before you plan your trip", "规划行程之前")}
        </p>
        <Intro
          title={tx(
            "Start With Your Medical Records",
            "先提交病历，再决定是否来华",
          )}
          copy={tx(
            "Before planning your medical trip, submit your medical information for review. A hospital or specialist assesses whether further care in China may be appropriate. You decide whether to proceed after reviewing the plan, timing and estimated costs.",
            "在规划医疗行程前，先提交资料供医院或专家评估是否适合进一步来华诊疗。了解方案、时间安排和预估费用后，再由您自主决定是否继续。",
          )}
        />
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {steps.map((step, i) => (
            <li
              className="rounded-xl bg-white border border-[#dfe8eb] p-5"
              key={step.en}
            >
              <span className="eyebrow">0{i + 1}</span>
              <h3 className="font-semibold text-sm mt-3">{l(step)}</h3>
            </li>
          ))}
        </ol>
        <Link className="btn" href="/dashboard/cases/new">
          {t("Submit Medical Records", "提交病历")}
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
export function SuitabilityAndMatching() {
  const { t } = useLanguage();
  return (
    <section id="suitability" className="section wrap">
      <Intro
        title={tx("Is Treatment in China Right for Me?", "来华医疗适合我吗？")}
        copy={tx(
          "Cross-border care is a personal decision. It may be worth exploring for planned care, but it is not appropriate for everyone.",
          "跨境就医是一项个人决策。计划性诊疗可以作为了解方向，但并非所有患者都适合。",
        )}
      />
      <div className="grid md:grid-cols-2 gap-6">
        <article className="card p-6 md:p-8">
          <h3 className="serif text-2xl mb-5">
            {t("You may wish to explore", "可以考虑了解")}
          </h3>
          <Items
            items={[
              tx("Complex medical conditions", "复杂疾病的诊疗选择"),
              tx("Another specialist opinion", "寻求另一位专家的意见"),
              tx(
                "Comparing international treatment options",
                "比较国际诊疗选择",
              ),
              tx("Experienced specialists", "寻找具有相关经验的专家"),
              tx("Planned elective treatment", "计划性的非急诊治疗"),
              tx("Access to large tertiary hospitals", "了解大型三级医院资源"),
            ]}
          />
        </article>
        <article className="card p-6 md:p-8">
          <h3 className="serif text-2xl mb-5">
            {t("May not be appropriate", "可能不适合的情况")}
          </h3>
          <Items
            items={[
              tx(
                "Immediate emergency treatment is required",
                "需要立即接受急救治疗",
              ),
              tx(
                "The patient is medically unstable for travel",
                "病情不稳定，不适合旅行",
              ),
              tx(
                "International travel may create significant medical risk",
                "国际旅行可能带来显著医疗风险",
              ),
              tx("The required treatment is not available", "所需治疗无法提供"),
            ]}
          />
        </article>
      </div>
      <p className="notice mt-6">
        {t(
          "Final medical suitability and treatment decisions are determined by licensed physicians and medical institutions.",
          "最终医疗适宜性及治疗决策由持牌医师和医疗机构确定。",
        )}
      </p>
      <div id="matching" className="mt-14 border-t border-[#dfe8eb] pt-12">
        <Intro
          title={tx("How We Match Medical Resources", "我们如何匹配医疗资源")}
          copy={tx(
            "Medical resource matching is based on the patient's clinical needs, not simply hospital fame or rankings. The treating institution confirms clinical suitability and availability.",
            "医疗资源匹配以患者的临床需求为依据，不仅看医院名气或排名。临床适宜性与接诊能力由医疗机构确认。",
          )}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
          {[
            tx("Clinical specialty", "临床专科"),
            tx("Patient condition", "患者病情"),
            tx("Relevant case experience", "相关病例经验"),
            tx("Treatment capability", "诊疗能力"),
            tx("Hospital facilities", "医院设施"),
            tx("Physician availability", "医生接诊安排"),
            tx("International patient support", "国际患者支持"),
            tx("Language support", "语言支持"),
            tx("Expected treatment schedule", "预计诊疗时间"),
            tx("Patient needs", "患者自身需求"),
          ].map((x) => (
            <p key={x.en} className="text-sm border-b border-[#e5ebee] pb-3">
              {t(x.en, x.zh)}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
const roles = [
  [
    tx("Our Platform", "我们的平台"),
    [
      tx(
        "Medical case coordination · Medical record organization",
        "病例协调 · 病历整理",
      ),
      tx(
        "Translation coordination · Hospital communication",
        "翻译协调 · 医院沟通",
      ),
      tx(
        "Appointment coordination · Pre-arrival preparation",
        "预约协调 · 行前准备",
      ),
      tx("Arrival coordination · Hospital navigation", "抵达协调 · 医院引导"),
      tx(
        "Medical interpretation coordination · Family support",
        "医疗口译协调 · 家属支持",
      ),
      tx(
        "Recovery coordination · Follow-up coordination",
        "康复阶段协调 · 随访协调",
      ),
    ],
  ],
  [
    tx("Hospitals & Doctors", "医院与医生"),
    [
      tx("Medical diagnosis · Treatment decisions", "医疗诊断 · 治疗决策"),
      tx("Treatment plans · Surgery", "治疗方案 · 手术"),
      tx("Medication · Hospitalization", "用药 · 住院"),
      tx("Clinical care · Discharge decisions", "临床照护 · 出院决定"),
    ],
  ],
  [
    tx("Patient", "患者"),
    [
      tx("Providing accurate medical information", "提供准确的医疗信息"),
      tx(
        "Making final treatment decisions",
        "在医生指导下自主选择是否接受治疗",
      ),
      tx("Visa application · Travel documents", "签证申请 · 旅行证件"),
      tx("Following physician instructions", "遵循医生指导"),
      tx("Providing required personal information", "提供所需个人信息"),
    ],
  ],
] satisfies [Localized, Localized[]][];
const costs = [
  [
    tx("Medical Costs", "医疗费用"),
    [
      tx("Consultations · Examinations", "门诊咨询 · 检查"),
      tx("Hospitalization · Surgery", "住院 · 手术"),
      tx("Treatment · Medication", "治疗 · 药物"),
      tx("Other medical services", "其他医疗服务"),
    ],
  ],
  [
    tx("Coordination Service Fee", "协调服务费用"),
    [
      tx(
        "Medical record organization · Translation coordination",
        "病历整理 · 翻译协调",
      ),
      tx(
        "Hospital communication · Appointment coordination",
        "医院沟通 · 预约协调",
      ),
      tx("Medical interpretation · Arrival support", "医疗口译 · 抵达支持"),
      tx("Hospital navigation · Family assistance", "医院引导 · 家属协助"),
      tx(
        "Recovery coordination · Follow-up coordination",
        "康复阶段协调 · 随访协调",
      ),
    ],
  ],
  [
    tx("Optional Third-Party Costs", "可选第三方费用"),
    [
      tx("Hotel · Transportation", "酒店 · 交通"),
      tx("Recovery accommodation", "恢复期间住宿"),
      tx("Tourism · Other external services", "旅游 · 其他外部服务"),
    ],
  ],
] satisfies [Localized, Localized[]][];
export function ResponsibilitiesAndCosts() {
  const { l } = useLanguage();
  return (
    <section id="responsibilities" className="section bg-[#f7f9f9]">
      <div className="wrap">
        <Intro
          title={tx("What We Do", "各方的职责")}
          copy={tx(
            "We are a medical coordination platform. Diagnosis and medical care are provided by hospitals and licensed professionals; the patient stays in control of their choices.",
            "我们是医疗协调服务平台。诊断与医疗服务由医院和持牌专业人员提供，患者始终保有选择权。",
          )}
        />
        <div className="grid lg:grid-cols-3 gap-5">
          {roles.map(([title, items]) => (
            <article key={title.en} className="card p-6 md:p-8">
              <h3 className="serif text-2xl mb-6">{l(title)}</h3>
              <Items items={items} />
            </article>
          ))}
        </div>
        <div id="costs" className="mt-16">
          <Intro
            title={tx("Transparent Costs", "清晰了解费用构成")}
            copy={tx(
              "Before you decide, request an estimated breakdown of the services you need. These are separate cost categories; amounts depend on the medical assessment, institution, service scope and third-party arrangements.",
              "决定前，可了解所需服务的预估费用明细。以下是不同费用类别，金额取决于医疗评估、机构、服务范围及第三方安排。",
            )}
          />
        </div>
        <div className="grid lg:grid-cols-3 gap-5">
          {costs.map(([title, items], i) => (
            <article key={title.en} className="card p-6 md:p-8">
              <p className="eyebrow mb-3">0{i + 1}</p>
              <h3 className="serif text-2xl mb-6">{l(title)}</h3>
              <Items items={items} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
export function JourneySupport({ compact = false }: { compact?: boolean }) {
  const { t, l } = useLanguage();
  const cards: [Localized, Localized[]][] = [
    [
      tx("Arrival in China", "抵达中国"),
      [
        tx(
          "Airport pickup coordination · Accommodation check-in assistance",
          "机场接送协调 · 住宿入住协助",
        ),
        tx(
          "Local transportation guidance · Communication support",
          "本地交通指引 · 沟通支持",
        ),
        tx(
          "Hospital registration · Hospital navigation",
          "医院挂号 · 就诊引导",
        ),
        tx(
          "Medical interpretation coordination · Appointment coordination · Inpatient coordination",
          "医疗口译协调 · 预约协调 · 住院事务协调",
        ),
      ],
    ],
    [
      tx("Support for Family Members", "同行家属支持"),
      [
        tx(
          "Accommodation coordination · Transportation assistance",
          "住宿协调 · 交通协助",
        ),
        tx(
          "Hospital navigation · Communication support",
          "医院引导 · 沟通支持",
        ),
        tx(
          "Daily life information · Translation assistance · Local city guidance",
          "日常生活信息 · 翻译协助 · 本地城市指引",
        ),
        tx("Support during long hospitalization", "长期住院期间的家属事务支持"),
      ],
    ],
    [
      tx("Recovery After Discharge", "出院后的恢复阶段"),
      [
        tx(
          "Discharge coordination · Follow-up appointment coordination",
          "出院协调 · 复诊预约协调",
        ),
        tx(
          "Recovery accommodation coordination · Transportation assistance",
          "恢复期间住宿协调 · 交通协助",
        ),
        tx("Communication with the medical institution", "与医疗机构沟通"),
        tx(
          "Medical document organization · Follow-up preparation",
          "医疗文档整理 · 随访准备",
        ),
      ],
    ],
    [
      tx("After You Return Home", "回国后的随访支持"),
      [
        tx(
          "Medical document organization · Discharge summary coordination · Translation coordination",
          "医疗文档整理 · 出院小结协调 · 翻译协调",
        ),
        tx(
          "Follow-up appointment scheduling · Hospital communication",
          "随访预约安排 · 与中国医疗机构沟通",
        ),
        tx(
          "Remote follow-up coordination · Future visit coordination",
          "远程随访协调 · 后续就诊协调",
        ),
        tx("Patient feedback", "患者反馈"),
      ],
    ],
  ];
  return (
    <section id="support" className="section wrap">
      <Intro
        title={tx(
          "Support Beyond Your Hospital Visit",
          "就诊之外，同样有人协助",
        )}
        copy={tx(
          "Practical support for you and your family, from arrival through recovery and returning home. All medical advice, medication and recovery plans come from your doctors and hospital.",
          "从抵达、恢复到回国，为您与家属提供事务支持。所有医疗建议、用药与康复方案均由医生和医院提供。",
        )}
      />
      <div className="grid md:grid-cols-2 gap-6">
        {(compact ? cards.slice(1, 3) : cards).map(([title, items]) => (
          <article key={title.en} className="card p-6 md:p-8">
            <h3 className="serif text-2xl mb-5">{l(title)}</h3>
            <Items items={items} />
          </article>
        ))}
      </div>
      {compact ? (
        <Link href="/patient-journey" className="btn secondary mt-7">
          {t("Explore arrival and follow-up support", "了解抵达与回国后的支持")}
          <ArrowRight size={16} />
        </Link>
      ) : (
        <div className="notice mt-8 p-6 md:p-8">
          <h3 className="serif text-2xl mb-4">
            {t("Optional China Experience", "可选的中国文化体验")}
          </h3>
          <p className="text-sm leading-7">
            {t(
              "Jinan · Qufu · Mount Tai · Qingdao. Any tourism or recreational activity after treatment should only take place when medically appropriate and after physician approval. Tourism is not part of medical treatment. If arranged, formal tourism services should be provided by qualified third-party providers; our role is coordination.",
              "济南 · 曲阜 · 泰山 · 青岛。治疗后的任何旅游或休闲活动，只能在身体状况适宜且获得医生许可后进行。旅游不属于医疗治疗。若安排正式旅游服务，应由具备资质的第三方服务商提供，平台负责协调。",
            )}
          </p>
        </div>
      )}
    </section>
  );
}
export function StoryTeaser() {
  const { t } = useLanguage();
  return (
    <section className="section bg-[#f0f5f3]">
      <div className="wrap grid md:grid-cols-[1fr_auto] items-center gap-8">
        <div>
          <p className="eyebrow mb-4">
            {t("Patient Stories · Illustrative Example", "患者旅程 · 示意案例")}
          </p>
          <h2 className="section-title">
            {t(
              "See how the journey could unfold.",
              "了解一次就医旅程如何展开。",
            )}
          </h2>
          <p className="muted mt-5 max-w-2xl">
            {t(
              "An example of a patient from Mongolia exploring cardiovascular care. This is a demonstration, not a real patient story or a treatment outcome.",
              "以蒙古国患者了解心血管诊疗为背景的示意流程。这是演示，不是真实患者经历或治疗效果展示。",
            )}
          </p>
        </div>
        <Link href="/patient-stories" className="btn">
          {t("Explore the example", "查看示意旅程")}
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
export function PatientStories() {
  const { t, l } = useLanguage();
  const story = [
    [
      tx("Initial Inquiry", "首次咨询"),
      tx(
        "Learn about the coordination process and information needed.",
        "了解协调流程及所需信息。",
      ),
    ],
    [
      tx("Medical Records Submitted", "提交病历"),
      tx(
        "Share existing reports with separate patient consent; the team organizes the case.",
        "通过独立患者授权提交已有报告，由团队整理病例。",
      ),
    ],
    [
      tx("Hospital Review", "医院评估"),
      tx(
        "A hospital or specialist reviews the records and considers suitability; additional information may be requested.",
        "医院或专家审核资料、评估适宜性，必要时要求补充信息。",
      ),
    ],
    [
      tx("Treatment Planning", "诊疗规划"),
      tx(
        "The institution provides next-step information, timing and estimated costs. The patient decides whether to proceed.",
        "医疗机构提供下一步信息、时间和预估费用，由患者自主决定是否继续。",
      ),
    ],
    [
      tx("Travel", "安排出行"),
      tx(
        "After deciding to proceed, the patient arranges their own visa and travel. Hospital documents may be available where applicable.",
        "决定继续后，患者自行安排签证与出行。医院相关材料仅在可提供且适用时提供。",
      ),
    ],
    [
      tx("Hospital Care", "医院诊疗"),
      tx(
        "The hospital provides clinical care. The platform coordinates appointments, interpretation and navigation.",
        "医院提供临床诊疗，平台协调预约、口译和就诊引导。",
      ),
    ],
    [
      tx("Recovery", "恢复阶段"),
      tx(
        "Physicians direct recovery and discharge. Practical coordination may include accommodation, transport and follow-up preparation.",
        "恢复与出院由医生指导。事务协调可包括住宿、交通及随访准备。",
      ),
    ],
    [
      tx("Return Home", "回国"),
      tx(
        "Organize discharge documents and translations as needed, following physician guidance on travel.",
        "按需整理出院资料与翻译，遵循医生的出行指导。",
      ),
    ],
    [
      tx("Follow-up", "后续随访"),
      tx(
        "Coordinate communication and follow-up with the institution; medical advice remains with the treating team.",
        "协调与医疗机构沟通及随访，医疗建议仍由接诊团队提供。",
      ),
    ],
  ];
  return (
    <>
      <section className="section wrap max-w-5xl">
        <p className="eyebrow mb-4">{t("Patient Stories", "患者旅程")}</p>
        <h1 className="section-title">
          {t("Illustrative Patient Journey", "患者就医旅程示例")}
        </h1>
        <div className="notice flex items-start gap-3 my-8">
          <FileText className="shrink-0" />
          <div>
            <strong>
              {t("Illustrative Example", "示意案例 · 非真实患者")}
            </strong>
            <p>
              {t(
                "This fictional journey explains the process only. It contains no real patient, testimonial, photograph or claimed treatment result. Real stories will require patient authorization.",
                "本虚构旅程仅用于解释流程，不包含真实患者、评价、患者照片或治疗结果。真实案例须取得患者授权后方可发布。",
              )}
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          <p>{t("Country: Mongolia", "国家：蒙古国")}</p>
          <p>
            {t("Medical Need: Cardiovascular Care", "医疗需求：心血管诊疗")}
          </p>
        </div>
        <ol className="space-y-5">
          {story.map(([title, copy], i) => (
            <li key={title.en} className="card p-6 flex gap-5">
              <span className="eyebrow shrink-0 pt-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="font-semibold">{l(title)}</h2>
                <p className="muted mt-2">{l(copy)}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link className="btn mt-8" href="/dashboard/cases/new">
          {t("Explore submitting your records", "了解病历提交流程")}
          <ArrowRight size={16} />
        </Link>
      </section>
    </>
  );
}
export function PrivacyDetails() {
  const { t } = useLanguage();
  return (
    <div className="notice mt-10">
      <ShieldCheck className="mb-4" />
      <h2 className="text-xl serif mb-3">
        {t("Private access, with your authorization", "在您的授权下，私密访问")}
      </h2>
      <p className="text-sm leading-7">
        {t(
          "The connected service uses a private medical-records bucket, Row Level Security and role-based access. Versioned consent records control coordination access. Files are delivered through authenticated endpoints, not permanent public URLs. Signed URLs, if introduced, must be short-lived. Medical records are not stored in localStorage or sent to analytics. The local demo stores synthetic records only in server memory.",
          "连接正式服务后使用私有病历存储、行级安全策略（RLS）和角色权限控制，并记录授权版本。文件通过鉴权接口提供，不生成永久公开链接；若后续引入签名链接，应设置短有效期。病历不会存入 localStorage 或发送给分析服务。本地演示仅在服务端内存保存虚构测试资料。",
        )}
      </p>
      <p className="text-sm leading-7 mt-4">
        {t(
          "Patient data deletion and account deletion are requests requiring verified identity and retention review. Automated account deletion is not available in this demo. The contact form is a demonstration until a real support channel is connected; do not include medical records there.",
          "患者数据删除及账户删除需提出请求、核实身份并审核保留要求。本演示尚未提供自动销户。联系表单在接入真实支持渠道前仅用于演示，请勿在其中填写病历。",
        )}
      </p>
      <Link href="/contact" className="underline inline-block mt-4">
        {t("Contact and data-request information", "联系与数据请求说明")}
      </Link>
    </div>
  );
}

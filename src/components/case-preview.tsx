"use client";

import Link from "next/link";
import { isSharePreview } from "@/lib/share-preview";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  FileText,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { useLanguage } from "./site-shell";

type PreviewProps = { fields: string[][] };

/** Public walkthrough: only fixed fictional data, no file inputs or API mutations. */
export function CasePreview({ fields }: PreviewProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [sampleAdded, setSampleAdded] = useState(false);
  const steps = [
    t("Patient information", "患者信息"),
    t("Upload records", "上传病历"),
    t("Review & consent", "确认与授权"),
  ];
  const samples: Record<string, string> = {
    full_name: t("Alex Sample · Fictional patient", "示例患者 · 虚构人物"),
    date_of_birth: "1990-01-01",
    gender: t("Prefer not to say", "不便透露"),
    nationality: t("Sample nationality", "示例国籍"),
    current_country: t("Sample country", "示例居住国家"),
    main_condition: t(
      "Request a specialist review of existing records",
      "希望对现有病历进行专科评估",
    ),
    diagnosis: t(
      "As documented in the existing medical report",
      "以现有医疗报告记载为准",
    ),
    symptoms: t(
      "Describe symptoms and when they started",
      "说明症状及开始时间",
    ),
    duration: t("As recorded by the patient", "按实际情况说明持续时间"),
    previous_surgeries: t(
      "List previous procedures, if any",
      "填写既往手术（如有）",
    ),
    preferred_goal: t("Second Opinion", "第二诊疗意见"),
    previous_treatment: t(
      "List prior care, if any",
      "填写既往接受的治疗（如有）",
    ),
    medication: t("List current medicines, if any", "填写当前用药（如有）"),
    allergies: t("List known allergies, if any", "填写已知过敏史（如有）"),
  };
  const sampleFile = (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
      <FileText className="shrink-0 text-[#54817d]" size={24} />
      <div className="min-w-0">
        <p className="text-sm font-medium break-all">
          sample-medical-report.pdf
        </p>
        <p className="muted text-xs">
          {t(
            "Medical report · Example only · Not uploaded",
            "医疗报告 · 仅为示例 · 未实际上传",
          )}
        </p>
      </div>
    </div>
  );
  function changeStep(next: number) {
    setStep(next);
  }
  return (
    <section className="bg-[#f5f7f8] py-10 md:py-14">
      <div className="wrap max-w-5xl">
        <div className="notice flex items-start gap-3 mb-8">
          <Eye size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              {t("Explore the process — no login needed", "免登录查看申请流程")}
            </p>
            <p className="text-xs mt-1">
              {isSharePreview
                ? t(
                    "This public walkthrough uses fictional examples only. Nothing is saved or submitted; registration and real uploads are not available in this version.",
                    "公开参考版仅使用虚构示例，不会保存或提交资料，此版本不开放注册或真实上传。",
                  )
                : t(
                    "This walkthrough uses fictional examples. Nothing is saved or submitted. Log in when you are ready to use your own records.",
                    "以下使用虚构示例展示流程，不会保存或提交资料。准备使用自己的病历时，再登录即可。",
                  )}
            </p>
          </div>
        </div>
        <p className="eyebrow mb-3">
          {t("Medical review · Process preview", "病历评估 · 流程预览")}
        </p>
        <h1 className="section-title">
          {t("See what happens, step by step.", "先了解流程，再安心开始。")}
        </h1>
        <nav
          aria-label={t("Application preview steps", "申请流程预览步骤")}
          className="grid grid-cols-3 gap-2 sm:gap-4 my-8"
        >
          {steps.map((label, index) => (
            <button
              key={label}
              aria-current={step === index ? "step" : undefined}
              onClick={() => changeStep(index)}
              className={`text-left rounded-lg border p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs sm:text-sm ${step === index ? "bg-ink border-ink text-white" : "bg-white border-slate-200 text-ink hover:bg-[#edf4f4]"}`}
            >
              <span className="opacity-60">0{index + 1}</span>
              {label}
            </button>
          ))}
        </nav>
        <div className="card p-6 sm:p-8" aria-live="polite">
          <p className="eyebrow mb-3">
            {t(`Step ${step + 1} of 3`, `第 ${step + 1} 步，共 3 步`)}
          </p>
          <h2 className="text-2xl serif mb-3">{steps[step]}</h2>
          {step === 0 && (
            <>
              <p className="muted mb-7">
                {t(
                  "First, share basic information and what your existing records say. Below is a read-only example of the form you will complete after logging in.",
                  "首先填写基本信息及现有病历情况。下方为只读示例，登录后即可填写自己的资料。",
                )}
              </p>
              {[fields.slice(0, 5), fields.slice(5)].map((group, index) => (
                <div
                  key={index}
                  className={index ? "mt-8 border-t border-slate-100 pt-7" : ""}
                >
                  <h3 className="font-semibold mb-5">
                    {index === 0
                      ? t("Basic information", "基本信息")
                      : t("Medical information", "医疗信息")}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-5">
                    {group.map(([name, en, zh]) => (
                      <label key={name} className="field">
                        {t(en, zh)}
                        <input
                          className="input bg-[#f8fafb] text-slate-500"
                          readOnly
                          value={samples[name]}
                          aria-description={t(
                            "Read-only fictional example",
                            "只读虚构示例",
                          )}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
          {step === 1 && (
            <>
              <p className="muted mb-6">
                {t(
                  "Next, add existing reports and choose a category such as medical report, lab test, CT, MRI or pathology.",
                  "随后添加已有报告，并选择医疗报告、化验、CT、MRI 或病理等文件分类。",
                )}
              </p>
              <div className="rounded-lg border border-dashed border-[#a7c0c3] bg-[#f6faf9] p-8 text-center">
                <UploadCloud
                  size={32}
                  className="mx-auto mb-4 text-[#52817d]"
                />
                <p className="text-sm mb-2">
                  {t(
                    "PDF, JPG, PNG, DICOM ZIP, DOC / DOCX",
                    "支持 PDF、JPG、PNG、DICOM ZIP、DOC / DOCX",
                  )}
                </p>
                <p className="muted text-xs mb-5">
                  {t(
                    "Up to 20 MB per file · 10 files per case",
                    "每文件最多 20 MB · 每病例最多 10 个文件",
                  )}
                </p>
                <button
                  className="btn secondary"
                  onClick={() => setSampleAdded(!sampleAdded)}
                >
                  {sampleAdded
                    ? t("Remove example file", "移除示例文件")
                    : t("Try adding an example file", "体验添加示例文件")}
                </button>
                <p className="text-[11px] text-slate-500 mt-4">
                  {t(
                    "No local file is selected or uploaded in this preview.",
                    "预览不会选择或上传您电脑中的文件。",
                  )}
                </p>
              </div>
              {sampleAdded && <div className="mt-5">{sampleFile}</div>}
              <p className="muted text-xs mt-5">
                {t(
                  "After logging in, you can preview PDF and image files, download records, or delete files from your draft.",
                  "登录后，可预览 PDF 和图片、下载资料，以及删除草稿中的文件。",
                )}
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <p className="muted mb-6">
                {t(
                  "Check your details and files before giving a separate authorization for medical coordination.",
                  "核对基本信息、医疗情况与文件列表，再单独授权医疗协调。",
                )}
              </p>
              <dl className="grid sm:grid-cols-2 gap-5 mb-6">
                {fields.map(([name, en, zh]) => (
                  <div key={name}>
                    <dt className="text-xs text-slate-500 mb-1">{t(en, zh)}</dt>
                    <dd className="text-sm leading-6">{samples[name]}</dd>
                  </div>
                ))}
              </dl>
              {sampleFile}
              <div className="notice mt-6">
                <div className="flex gap-2 items-center font-semibold mb-3">
                  <ShieldCheck size={19} />
                  {t(
                    "Consent for Medical Record Processing",
                    "医疗资料处理授权",
                  )}
                </div>
                <p className="text-sm leading-7">
                  {t(
                    "I authorize the platform to process my medical information for the purpose of medical coordination and communication with selected medical institutions.",
                    "我授权平台为医疗协调及与选定医疗机构沟通的目的，处理我的医疗信息。",
                  )}
                </p>
                <p className="text-xs mt-4">
                  {t(
                    "This is a preview of the consent text, not an authorization. After submission, your case enters coordinator review; this is not an online diagnosis.",
                    "此处仅展示授权文本，不构成实际授权。正式提交后进入协调员审核，不进行在线诊断。",
                  )}
                </p>
              </div>
              {isSharePreview ? (
                <div className="notice mt-7">
                  <p>
                    {t(
                      "You have reached the end of the demonstration. No case has been created or submitted.",
                      "您已查看完整演示流程，没有创建或提交任何真实病例。",
                    )}
                  </p>
                  <Link href="/" className="btn secondary mt-4">
                    {t("Back to home", "返回首页")}
                  </Link>
                </div>
              ) : (
                <div className="mt-7">
                  <h3 className="font-semibold mb-2">
                    {t("Ready to start your own case?", "准备开始自己的申请？")}
                  </h3>
                  <p className="muted text-xs mb-4">
                    {t(
                      "Create an account or log in to enter your information and securely upload records.",
                      "注册或登录后，即可填写自己的资料并安全上传病历。",
                    )}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/register" className="btn">
                      {t("Create account", "注册账号")}
                    </Link>
                    <Link href="/login" className="btn secondary">
                      {t("Log in to start", "登录后开始")}
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="mt-6 flex justify-between gap-3">
          <button
            className="btn secondary"
            disabled={step === 0}
            onClick={() => changeStep(step - 1)}
          >
            <ArrowLeft size={15} />
            {t("Previous step", "上一步")}
          </button>
          {step < 2 ? (
            <button className="btn" onClick={() => changeStep(step + 1)}>
              {t("Next step", "下一步")}
              <ArrowRight size={15} />
            </button>
          ) : (
            <button className="btn secondary" onClick={() => changeStep(0)}>
              {t("View from the beginning", "重新查看流程")}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

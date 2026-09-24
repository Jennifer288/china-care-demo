"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, type FormEvent } from "react";
import {
  ArrowRight,
  Plus,
  FileText,
  ShieldCheck,
  UploadCloud,
  Trash2,
  Download,
  Eye,
  CheckCircle2,
  LogOut,
  LayoutDashboard,
  FolderOpen,
  LockKeyhole,
  ChevronRight,
} from "lucide-react";
import type { User, MedicalCase, MedicalFile } from "@/lib/types";
import {
  CONSENT_VERSION,
  categories,
  categoryZh,
  statuses,
  preferredGoals,
  preferredGoalZh,
  MAX_FILE_SIZE,
} from "@/lib/security";
import { useLanguage } from "./site-shell";
import { api, Feedback } from "./forms";
import { CasePreview } from "./case-preview";
import { fieldList } from "@/lib/case-fields";

const statusZh = [
  "草稿",
  "病历已提交",
  "病历整理",
  "需要补充资料",
  "待医院评估",
  "医院审核",
  "方案已就绪",
  "患者决定",
  "行程已确认",
  "已在中国",
  "治疗已结束",
  "随访",
  "已关闭",
  "审核中",
  "已完成",
];
export function Status({ value }: { value: string }) {
  const { t } = useLanguage();
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-medium ${value === "Draft" ? "bg-slate-100 text-slate-600" : "bg-[#e7f3ee] text-[#397864]"}`}
    >
      {t(
        value,
        statusZh[statuses.indexOf(value as (typeof statuses)[number])] || value,
      )}
    </span>
  );
}
export function PatientPortal({
  page,
  id,
}: {
  page: "dashboard" | "new" | "case" | "admin";
  id?: string;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null),
    [mode, setMode] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    api("session")
      .then((d) => {
        if (live) {
          setUser(d.user);
          setMode(d.mode);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (live) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      live = false;
    };
  }, []);
  if (loading)
    return (
      <div className="wrap py-24" role="status">
        {t("Opening your private workspace…", "正在打开私密工作台…")}
      </div>
    );
  if (!user && page === "new") return <CasePreview fields={fieldList} />;
  if (!user)
    return (
      <section className="wrap py-24 max-w-2xl">
        <LockKeyhole size={36} className="mb-6 text-[#55807d]" />
        <h1 className="section-title">
          {t(
            "Your records deserve a private space.",
            "您的病历，需要私密空间。",
          )}
        </h1>
        <p className="muted mt-5 mb-8">
          {t(
            "Create an account or log in before uploading medical records.",
            "请先注册或登录，再上传医疗资料。",
          )}
        </p>
        <div className="flex gap-3">
          <Link href="/login" className="btn">
            {t("Log in", "登录")}
          </Link>
          <Link href="/register" className="btn secondary">
            {t("Create account", "注册账号")}
          </Link>
        </div>
        {page === "admin" && mode === "demo" && (
          <button
            className="btn secondary mt-6"
            onClick={async () => {
              await api("auth/demo-admin", { method: "POST", body: "{}" });
              location.reload();
            }}
          >
            {t("Open local demo coordinator account", "打开本地演示协调员账号")}
          </button>
        )}
        <Feedback error={error} />
      </section>
    );
  if (page === "admin" && !user.admin)
    return (
      <section className="wrap py-24">
        <h1 className="section-title">
          {t("Coordinator access only", "仅限协调员访问")}
        </h1>
        <p className="muted mt-5">
          {t(
            "Your patient account cannot access this workspace.",
            "您的患者账号无权访问此工作台。",
          )}
        </p>
        {mode === "demo" && (
          <button
            className="btn mt-6"
            onClick={async () => {
              await api("auth/demo-admin", { method: "POST", body: "{}" });
              location.reload();
            }}
          >
            {t("Switch to local demo coordinator", "切换为本地演示协调员")}
          </button>
        )}
      </section>
    );
  return (
    <div className="bg-[#f5f7f8] min-h-[70vh]">
      <div className="wrap py-8">
        {mode === "demo" && (
          <div className="notice mb-7 text-xs flex gap-3">
            <ShieldCheck size={19} className="shrink-0" />
            <span>
              {t(
                "Local demo · Use synthetic records only. Data is held temporarily in server memory, disappears on restart, and is not sent to any hospital.",
                "本地演示 · 仅使用虚构测试资料。数据临时保存在服务端内存，重启清空，不会发送给医院。",
              )}
            </span>
          </div>
        )}
        <div className="grid lg:grid-cols-[200px_1fr] gap-9">
          <aside>
            <p className="eyebrow mb-6">
              {t("Patient workspace", "患者工作台")}
            </p>
            <nav className="flex lg:flex-col gap-2 text-xs">
              <Link
                href="/dashboard"
                className="flex gap-2 items-center rounded-md px-3 py-3 bg-white"
              >
                <LayoutDashboard size={16} />
                {t("My medical journey", "我的医疗旅程")}
              </Link>
              <Link
                href="/dashboard/cases/new"
                className="flex gap-2 items-center px-3 py-3"
              >
                <Plus size={16} />
                {t("New case", "新建病例")}
              </Link>
              {user.admin && (
                <Link
                  href="/admin"
                  className="flex gap-2 items-center px-3 py-3"
                >
                  <FolderOpen size={16} />
                  {t("Coordinator", "协调员")}
                </Link>
              )}
              <button
                className="flex gap-2 items-center px-3 py-3 text-slate-500"
                onClick={async () => {
                  await api("auth/logout", { method: "POST", body: "{}" });
                  router.push("/login");
                  router.refresh();
                }}
              >
                <LogOut size={15} />
                {t("Log out", "退出")}
              </button>
            </nav>
            <div className="hidden lg:block border-t border-slate-200 mt-10 pt-6">
              <ShieldCheck size={22} className="text-[#638a83]" />
              <p className="text-[11px] text-slate-500 leading-6 mt-3">
                {t(
                  "Your records are yours. Your consent guides every next step.",
                  "您的病历属于您。每一步均遵循您的授权。",
                )}
              </p>
            </div>
          </aside>
          <div className="min-w-0 pb-12">
            {page === "new" ? (
              <NewCase user={user} />
            ) : page === "case" ? (
              <CaseView id={id!} admin={user.admin} mode={mode} />
            ) : (
              <CaseList user={user} admin={page === "admin"} mode={mode} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function CaseList({
  user,
  admin,
  mode,
}: {
  user: User;
  admin: boolean;
  mode: string;
}) {
  const { t } = useLanguage();
  const [cases, setCases] = useState<MedicalCase[] | null>(null),
    [error, setError] = useState(""),
    [filter, setFilter] = useState("all"),
    [query, setQuery] = useState("");
  useEffect(() => {
    api(`cases${admin ? "?admin=true" : ""}`)
      .then((d) => setCases(d.cases))
      .catch((e) => setError(e.message));
  }, [admin]);
  return (
    <>
      <p className="eyebrow mb-3">
        {admin
          ? t("Coordination workspace", "协调员工作台")
          : t("My medical journey", "我的医疗旅程")}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="serif text-4xl">
          {admin
            ? t("Patient cases", "患者病例")
            : t(
                `Welcome, ${user.full_name.split(" ")[0]}.`,
                `欢迎，${user.full_name}。`,
              )}
        </h1>
        {!admin && (
          <Link href="/dashboard/cases/new" className="btn small">
            <Plus size={15} />
            {t("Start a new case", "新建病例")}
          </Link>
        )}
      </div>
      <p className="muted mt-4">
        {t(
          "Follow service progress and keep your records in one place. Statuses describe coordination, not a diagnosis.",
          "查看服务进展并集中管理资料。状态表示协调进展，不代表诊断。",
        )}
      </p>
      <div className="grid sm:grid-cols-3 gap-4 my-8">
        {[
          [t("Total cases", "全部病例"), cases?.length ?? "—"],
          [
            t("Drafts", "草稿"),
            cases?.filter((c) => c.status === "Draft").length ?? "—",
          ],
          [
            t("Submitted for review", "已提交审核"),
            cases?.filter((c) => c.status !== "Draft").length ?? "—",
          ],
        ].map(([label, count]) => (
          <div className="card p-5" key={label}>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-3xl serif mt-2">{count}</p>
          </div>
        ))}
      </div>
      {admin && (
        <div className="flex gap-3 mb-5">
          <input
            className="input"
            aria-label="Search cases"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Search patient or condition", "搜索患者或病情")}
          />
          <select
            className="input max-w-52"
            aria-label="Filter case status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">{t("All statuses", "全部状态")}</option>
            {statuses.map((s, i) => (
              <option key={s} value={s}>
                {t(s, statusZh[i])}
              </option>
            ))}
          </select>
        </div>
      )}
      <Feedback error={error} />
      {cases === null && !error ? (
        <p role="status">{t("Loading cases…", "正在加载病例…")}</p>
      ) : cases?.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto w-fit bg-[#eff5f4] p-4 rounded-full mb-5">
            <FileText size={28} strokeWidth={1.3} />
          </div>
          <h2 className="text-xl font-semibold">
            {t("A clear next step starts here.", "从这里，迈出清晰的下一步。")}
          </h2>
          <p className="muted max-w-md mx-auto my-4">
            {admin
              ? t(
                  "Submitted cases will appear here after the patient authorizes review.",
                  "患者授权并提交后，病例将出现在此。",
                )
              : t(
                  "You haven’t submitted a case yet. Prepare your existing records and tell us what support you need.",
                  "您尚未提交病例。请准备现有病历，并告诉我们您需要哪些支持。",
                )}
          </p>
          {!admin && (
            <Link href="/dashboard/cases/new" className="btn mt-3">
              {t("Submit medical records", "提交病历")}
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {cases
            ?.filter(
              (c) =>
                (filter === "all" || c.status === filter) &&
                `${c.full_name} ${c.main_condition}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
            )
            .map((c) => (
              <Link
                className="card flex flex-wrap gap-5 items-center p-6"
                key={c.id}
                href={`/dashboard/cases/${c.id}`}
              >
                <div className="bg-[#f0f5f5] p-3 rounded-md">
                  <FileText size={22} />
                </div>
                <div className="flex-1 min-w-40">
                  <p className="font-semibold text-sm">{c.main_condition}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {admin ? `${c.full_name} · ${c.current_country} · ` : ""}
                    {t("Case", "病例")} {c.id.slice(0, 8)} ·{" "}
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] mt-2 text-slate-500">
                    {c.files.length} {t("files", "个文件")}
                    {c.submitted_at
                      ? ` · ${t("Submitted", "提交于")} ${new Date(c.submitted_at).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <Status value={c.status} />
                <ChevronRight size={18} />
              </Link>
            ))}
        </div>
      )}
    </>
  );
}
function NewCase({ user }: { user: User }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api("cases", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      });
      router.push(`/dashboard/cases/${data.case.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <p className="eyebrow mb-3">{t("Start your case", "创建您的病例")}</p>
      <h1 className="serif text-4xl">
        {t("Submit medical records", "提交病历")}
      </h1>
      <Steps current={0} />
      <p className="notice text-xs mb-7">
        {t(
          "Share information from your existing records. This form does not diagnose or recommend treatment. Your draft stays private until you give separate consent to submit.",
          "请根据现有病历填写。本表单不进行诊断或推荐治疗。单独授权并提交前，草稿保持私密。",
        )}
      </p>
      <form onSubmit={submit} className="space-y-7">
        <div className="card p-7">
          <h2 className="text-lg font-semibold mb-6">
            {t("Basic information", "基本信息")}
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {fieldList.slice(0, 5).map(([name, en, zh]) => (
              <label className="field" key={name}>
                {t(en, zh)}
                {name === "gender" ? (
                  <select className="input" name={name}>
                    <option value="not-specified">
                      {t("Prefer not to say", "不便透露")}
                    </option>
                    <option value="female">{t("Female", "女")}</option>
                    <option value="male">{t("Male", "男")}</option>
                    <option value="other">{t("Other", "其他")}</option>
                  </select>
                ) : (
                  <input
                    className="input"
                    name={name}
                    type={name === "date_of_birth" ? "date" : "text"}
                    max={
                      name === "date_of_birth"
                        ? new Date().toISOString().slice(0, 10)
                        : undefined
                    }
                    defaultValue={
                      name === "full_name"
                        ? user.full_name
                        : name === "current_country"
                          ? user.country
                          : ""
                    }
                    required
                    maxLength={150}
                  />
                )}
              </label>
            ))}
          </div>
        </div>
        <div className="card p-7">
          <h2 className="text-lg font-semibold mb-6">
            {t("Medical information", "医疗信息")}
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {fieldList.slice(5).map(([name, en, zh]) => (
              <label key={name} className="field">
                {t(en, zh)}
                {name === "preferred_goal" ? (
                  <select className="input" name={name} defaultValue="">
                    <option value="">
                      {t("Select if known", "请选择（可选）")}
                    </option>
                    {preferredGoals.map((goal, i) => (
                      <option key={goal} value={goal}>
                        {t(goal, preferredGoalZh[i])}
                      </option>
                    ))}
                  </select>
                ) : name === "main_condition" ? (
                  <input
                    className="input"
                    name={name}
                    required
                    maxLength={500}
                  />
                ) : (
                  <textarea
                    className="input"
                    rows={3}
                    name={name}
                    maxLength={4000}
                    placeholder={t(
                      "If known; otherwise leave blank",
                      "如已知请填写，否则留空",
                    )}
                  />
                )}
              </label>
            ))}
          </div>
        </div>
        <Feedback error={error} />
        <div className="flex justify-end">
          <button className="btn" disabled={busy}>
            {busy
              ? t("Saving draft…", "正在保存…")
              : t("Save draft & add files", "保存草稿并添加文件")}
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </>
  );
}
function Steps({ current }: { current: number }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-wrap gap-6 text-[11px] my-8">
      {[
        t("Patient information", "患者信息"),
        t("Upload records", "上传病历"),
        t("Review & consent", "确认与授权"),
      ].map((s, i) => (
        <div
          key={s}
          className={`flex gap-2 items-center ${i <= current ? "text-[#3d7b76]" : "text-slate-400"}`}
        >
          <span
            className={`rounded-full size-6 flex items-center justify-center border ${i === current ? "bg-[#337577] text-white border-[#337577]" : ""}`}
          >
            {i < current ? <CheckCircle2 size={14} /> : i + 1}
          </span>
          {s}
        </div>
      ))}
    </div>
  );
}
function Files({
  files,
  draft,
  onRefresh,
}: {
  files: MedicalFile[];
  draft: boolean;
  onRefresh: () => Promise<void>;
}) {
  const { t } = useLanguage();
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState("");
  return (
    <>
      <div className="space-y-3">
        {files.length === 0 ? (
          <p className="muted text-xs py-5">
            {t("No files added yet.", "尚未添加文件。")}
          </p>
        ) : (
          files.map((f) => (
            <div
              key={f.id}
              className="border border-slate-200 rounded-lg p-4 flex flex-wrap items-center gap-3"
            >
              <FileText size={23} className="text-slate-400" />
              <div className="flex-1 min-w-32">
                <p className="text-sm font-medium break-all">{f.file_name}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {t(
                    f.category,
                    categoryZh[categories.indexOf(f.category)] || f.category,
                  )}{" "}
                  · {(f.file_size / 1024).toFixed(1)} KB ·{" "}
                  {new Date(f.created_at).toLocaleDateString()} ·{" "}
                  {f.pending_delete
                    ? t(
                        "Deletion pending — retry Delete",
                        "删除待完成，请重试删除",
                      )
                    : t("Uploaded", "已上传")}
                </p>
              </div>
              <div className="flex gap-3">
                {["application/pdf", "image/jpeg", "image/png"].includes(
                  f.file_type,
                ) && (
                  <a
                    href={`/api/files/${f.id}?preview=1`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t("Preview", "预览")} ${f.file_name}`}
                  >
                    <Eye size={16} />
                  </a>
                )}
                <a
                  href={`/api/files/${f.id}`}
                  aria-label={`${t("Download", "下载")} ${f.file_name}`}
                >
                  <Download size={16} />
                </a>
                {draft && (
                  <button
                    disabled={deleting === f.id}
                    aria-label={`${t("Delete", "删除")} ${f.file_name}`}
                    onClick={async () => {
                      setDeleting(f.id);
                      setError("");
                      try {
                        await api(`files/${f.id}`, { method: "DELETE" });
                        await onRefresh();
                      } catch (e) {
                        setError((e as Error).message);
                      } finally {
                        setDeleting("");
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <Feedback error={error} />
      <p className="text-[10px] text-slate-500 mt-3">
        {t(
          "PDF and images can be previewed. Other formats are available as downloads.",
          "PDF 和图片支持预览，其他格式可下载查看。",
        )}
      </p>
    </>
  );
}
function CaseView({
  id,
  admin,
  mode,
}: {
  id: string;
  admin: boolean;
  mode: string;
}) {
  const { t } = useLanguage();
  const [c, setCase] = useState<MedicalCase | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [review, setReview] = useState(false),
    [consent, setConsent] = useState(false),
    [category, setCategory] = useState(categories[0]);
  const refresh = useCallback(async () => {
    const d = await api(`cases/${id}`);
    setCase(d.case);
  }, [id]);
  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, [refresh]);
  async function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError("");
    const data = new FormData(form);
    const file = data.get("file") as File;
    if (file.size > MAX_FILE_SIZE) {
      setError(t("Maximum file size is 20 MB.", "文件最大 20 MB。"));
      setBusy(false);
      return;
    }
    try {
      await api(`cases/${id}/files`, { method: "POST", body: data });
      await refresh();
      form.reset();
      setMessage(
        t("File uploaded to your private draft.", "文件已上传至私密草稿。"),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    setBusy(true);
    setError("");
    try {
      await api(`cases/${id}/submit`, {
        method: "POST",
        body: JSON.stringify({ consent, version: CONSENT_VERSION }),
      });
      await refresh();
      setMessage(
        mode === "demo"
          ? t(
              "Demo case submitted. No hospital was contacted.",
              "演示病例已提交，未联系任何医院。",
            )
          : t(
              "Your case has been securely submitted. Our medical coordination team will review your information and contact you if additional information is required.",
              "您的病例已安全提交。医疗协调团队将审核资料，必要时联系您补充信息。",
            ),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!c)
    return (
      <Feedback error={error} message={t("Loading case…", "正在加载病例…")} />
    );
  const draft = c.status === "Draft";
  return (
    <>
      <Link href={admin ? "/admin" : "/dashboard"} className="text-xs">
        ← {t("Back to cases", "返回病例列表")}
      </Link>
      <div className="flex justify-between items-start gap-4 mt-6">
        <div>
          <p className="eyebrow mb-3">
            {t("Case", "病例")} {c.id.slice(0, 8)}
          </p>
          <h1 className="serif text-4xl">
            {draft
              ? t("Your medical records", "您的医疗资料")
              : c.main_condition}
          </h1>
        </div>
        <Status value={c.status} />
      </div>
      {draft ? (
        <Steps current={review ? 2 : 1} />
      ) : (
        <div className="notice my-7 flex gap-3">
          <CheckCircle2 size={20} className="shrink-0" />
          <span>
            {t(
              "Your case is part of a coordination process. The service status is not a medical diagnosis.",
              "您的病例正在医疗协调流程中，服务状态不代表医疗诊断。",
            )}
          </span>
        </div>
      )}
      <div className="space-y-6">
        <Feedback error={error} message={message} />
        {draft && !review && (
          <form onSubmit={upload} className="card p-7">
            <h2 className="text-lg font-semibold mb-2">
              {t("Upload files", "上传文件")}
            </h2>
            <p className="muted text-xs mb-5">
              {t(
                "PDF, JPG, PNG, DICOM ZIP, DOC / DOCX · Up to 20 MB per file · 10 files per case",
                "PDF、JPG、PNG、DICOM ZIP、DOC / DOCX · 每文件最多 20 MB · 每病例最多 10 个文件",
              )}
            </p>
            <label className="field mb-5">
              {t("Document category", "文件分类")}
              <select
                name="category"
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((v, i) => (
                  <option value={v} key={v}>
                    {t(v, categoryZh[i])}
                  </option>
                ))}
              </select>
            </label>
            <label className="border border-dashed border-[#a7c0c3] bg-[#f6faf9] rounded-lg p-8 flex flex-col gap-4 items-center">
              <UploadCloud size={30} className="text-[#52817d]" />
              <span className="text-sm">
                {t("Choose a medical record", "选择一份医疗资料")}
              </span>
              <input
                aria-label={t("Choose file", "选择文件")}
                type="file"
                name="file"
                accept=".pdf,.jpg,.jpeg,.png,.zip,.doc,.docx"
                required
                className="text-xs max-w-full file:mr-3 file:rounded file:border-0 file:bg-[#e0ebea] file:px-4 file:py-2"
              />
            </label>
            <button
              disabled={busy || c.files.length >= 10}
              className="btn mt-5"
            >
              {busy
                ? t("Uploading…", "正在上传…")
                : t("Upload to private draft", "上传至私密草稿")}
            </button>
          </form>
        )}
        <div className="card p-7">
          <h2 className="text-lg font-semibold mb-5">
            {t("Medical files", "医疗文件")}{" "}
            <span className="text-slate-400 text-sm">({c.files.length})</span>
          </h2>
          <Files files={c.files} draft={draft && !review} onRefresh={refresh} />
        </div>
        {(!draft || review) && (
          <div className="card p-7">
            <h2 className="text-lg font-semibold mb-6">
              {t("Review your case", "确认您的病例")}
            </h2>
            <dl className="grid sm:grid-cols-2 gap-6">
              {fieldList.map(([name, en, zh]) => (
                <div key={name}>
                  <dt className="text-xs text-slate-500 mb-2">{t(en, zh)}</dt>
                  <dd className="text-sm break-words whitespace-pre-wrap">
                    {name === "gender"
                      ? {
                          "not-specified": t("Prefer not to say", "不便透露"),
                          female: t("Female", "女"),
                          male: t("Male", "男"),
                          other: t("Other", "其他"),
                        }[c.gender] || c.gender
                      : name === "preferred_goal" && c.preferred_goal
                        ? t(
                            c.preferred_goal,
                            preferredGoalZh[
                              preferredGoals.indexOf(
                                c.preferred_goal as (typeof preferredGoals)[number],
                              )
                            ] || c.preferred_goal,
                          )
                        : String(c[name as keyof MedicalCase] || "—")}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        {draft &&
          (review ? (
            <div className="card p-7">
              <ShieldCheck className="text-[#56877f] mb-4" />
              <h2 className="text-lg font-semibold mb-4">
                {t("Consent for Medical Record Processing", "医疗资料处理授权")}
              </h2>
              <label className="flex gap-3 text-sm leading-7">
                <input
                  className="mt-2 shrink-0 self-start accent-[#337577]"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  {t(
                    "I authorize the platform to process my medical information for the purpose of medical coordination and communication with selected medical institutions.",
                    "我授权平台为医疗协调及与选定医疗机构沟通的目的，处理我的医疗信息。",
                  )}
                </span>
              </label>
              <p className="text-[10px] text-slate-500 mt-4">
                {t("Consent version", "授权版本")}: {CONSENT_VERSION} ·{" "}
                <Link href="/privacy" target="_blank" className="underline">
                  {t("Privacy & Security", "隐私与安全")}
                </Link>
              </p>
              <div className="flex justify-between gap-3 mt-7">
                <button
                  className="btn secondary"
                  onClick={() => setReview(false)}
                >
                  {t("Back to files", "返回文件")}
                </button>
                <button
                  className="btn"
                  disabled={!consent || busy}
                  onClick={submit}
                >
                  {busy
                    ? t("Submitting…", "正在提交…")
                    : t("Submit case", "提交病例")}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                disabled={!c.files.length || busy}
                className="btn"
                onClick={() => {
                  setReview(true);
                  setMessage("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {t("Review & give consent", "确认资料并授权")}
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        {admin && !draft && <AdminControls c={c} refresh={refresh} />}
      </div>
    </>
  );
}
function AdminControls({
  c,
  refresh,
}: {
  c: MedicalCase;
  refresh: () => Promise<void>;
}) {
  const { t } = useLanguage();
  const [status, setStatus] = useState(c.status),
    [notes, setNotes] = useState(c.coordinator_notes || ""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  return (
    <form
      className="card p-7 space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await api(`cases/${c.id}/admin`, {
            method: "PATCH",
            body: JSON.stringify({ status, notes }),
          });
          await refresh();
          setMessage(t("Coordination status saved.", "协调状态已保存。"));
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2 className="text-lg font-semibold">
        {t("Coordinator workspace", "协调员工作区")}
      </h2>
      <p className="muted text-xs">
        {t(
          "Record service arrangements only. Do not enter a final diagnosis. Clinical decisions belong to the treating institution.",
          "仅记录服务安排，不填写最终诊断。临床决策由接诊机构作出。",
        )}
      </p>
      <label className="field">
        {t("Case status", "病例状态")}
        <select
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statuses
            .filter((s) => s !== "Draft")
            .map((s) => (
              <option value={s} key={s}>
                {t(s, statusZh[statuses.indexOf(s)])}
              </option>
            ))}
        </select>
      </label>
      <label className="field">
        {t("Coordinator notes (internal)", "协调员备注（内部）")}
        <textarea
          className="input"
          rows={5}
          maxLength={4000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      <Feedback error={error} message={message} />
      <button className="btn" disabled={busy}>
        {t("Save coordination update", "保存协调进展")}
      </button>
    </form>
  );
}

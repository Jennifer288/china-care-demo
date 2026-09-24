"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import {
  ArrowRight,
  ShieldCheck,
  LockKeyhole,
  Mail,
  Phone,
  MessageCircle,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { useLanguage } from "./site-shell";
export async function api(path: string, options?: RequestInit) {
  const res = await fetch(`/api/${path}`, {
    ...options,
    cache: "no-store",
    headers:
      options?.body instanceof FormData
        ? options.headers
        : { "Content-Type": "application/json", ...options?.headers },
  });
  const data = await res.json();
  if (!res.ok) throw Error(data.error || "Request failed.");
  return data;
}
export function Feedback({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  return error ? (
    <div
      role="alert"
      className="rounded-md border border-red-200 bg-red-50 text-red-800 text-sm p-4"
    >
      {error}
    </div>
  ) : message ? (
    <div role="status" className="notice">
      {message}
    </div>
  ) : null;
}
export function SubmitButton({
  busy,
  children,
}: {
  busy: boolean;
  children: React.ReactNode;
}) {
  return (
    <button disabled={busy} type="submit" className="btn w-full">
      {busy ? <LoaderCircle size={17} className="animate-spin" /> : children}
      {!busy && <ArrowRight size={16} />}
    </button>
  );
}
export function AuthForm({
  mode,
}: {
  mode: "login" | "register" | "forgot-password" | "reset-password";
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const register = mode === "register",
    reset = mode === "forgot-password",
    newPassword = mode === "reset-password";
  useEffect(() => {
    if (new URLSearchParams(location.search).get("error"))
      setError(
        t(
          "The confirmation link is invalid or expired. Please try again.",
          "确认链接无效或已过期，请重试。",
        ),
      );
  }, [t]);
  const title = register
    ? t("Your journey starts here.", "您的旅程，从这里开始。")
    : reset
      ? t("Let’s get you back in.", "找回您的账号。")
      : newPassword
        ? t("Choose a new password.", "设置新密码。")
        : t("Welcome back.", "欢迎回来。");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const form = new FormData(e.currentTarget);
    const b = Object.fromEntries(form);
    try {
      const data = await api(
        `auth/${register ? "register" : reset ? "reset" : newPassword ? "password" : "login"}`,
        {
          method: "POST",
          body: JSON.stringify({ ...b, terms: form.get("terms") === "on" }),
        },
      );
      if (reset || newPassword || data.confirmation) setMessage(data.message);
      else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="bg-[#f3f6f5] py-16">
      <div className="wrap grid lg:grid-cols-2 items-center gap-16 max-w-5xl">
        <div>
          <p className="eyebrow mb-5">
            {t("Your private patient portal", "您的私密患者入口")}
          </p>
          <h1 className="serif text-5xl leading-tight">{title}</h1>
          <p className="muted mt-6">
            {t(
              "One place for your medical records, your coordination requests and your next steps.",
              "在一个入口管理病历、医疗协调申请与后续步骤。",
            )}
          </p>
          <div className="mt-9 space-y-5">
            {[
              t(
                "Your information stays under your control",
                "您的信息由您掌控",
              ),
              t(
                "Separate consent before submitting a case",
                "提交病例前单独授权",
              ),
              t(
                "A human coordinator, not an automated diagnosis",
                "由人工协调，不进行自动诊断",
              ),
            ].map((s) => (
              <div key={s} className="text-sm flex items-center gap-3">
                <ShieldCheck size={18} className="text-[#54877e]" />
                {s}
              </div>
            ))}
          </div>
        </div>
        <div className="card p-7 sm:p-9">
          <h2 className="text-2xl font-semibold mb-2">
            {register
              ? t("Create an account", "创建账号")
              : reset
                ? t("Forgot password", "忘记密码")
                : newPassword
                  ? t("Reset password", "重置密码")
                  : t("Log in", "登录")}
          </h2>
          <p className="muted text-xs mb-7">
            {t(
              "Use synthetic information when trying the local demo.",
              "体验本地演示时请使用虚构测试信息。",
            )}
          </p>
          <form className="space-y-5" onSubmit={submit}>
            {register && (
              <label className="field">
                {t("Full name", "姓名")}
                <input
                  className="input"
                  name="full_name"
                  autoComplete="name"
                  required
                  maxLength={100}
                />
              </label>
            )}
            {!newPassword && (
              <label className="field">
                {t("Email address", "电子邮箱")}
                <input
                  className="input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </label>
            )}
            {!reset && (
              <label className="field">
                {t("Password", "密码")}
                <input
                  className="input"
                  name="password"
                  type="password"
                  minLength={10}
                  maxLength={128}
                  autoComplete={
                    register || newPassword
                      ? "new-password"
                      : "current-password"
                  }
                  required
                />
                <span className="text-[10px] font-normal text-slate-500">
                  {t("At least 10 characters", "至少 10 个字符")}
                </span>
              </label>
            )}
            {register && (
              <>
                <label className="field">
                  {t("Country / Region", "国家 / 地区")}
                  <input
                    className="input"
                    name="country"
                    autoComplete="country-name"
                    required
                  />
                </label>
                <label className="field">
                  {t("Preferred language", "首选语言")}
                  <select className="input" name="preferred_language">
                    <option value="en">English</option>
                    <option value="zh">中文</option>
                  </select>
                </label>
                <label className="flex items-start gap-3 text-xs leading-6">
                  <input
                    type="checkbox"
                    name="terms"
                    required
                    className="mt-1.5 accent-[#337577]"
                  />
                  <span>
                    {t("I agree to the", "我同意")}{" "}
                    <Link href="/terms" target="_blank" className="underline">
                      {t("Terms of Service", "服务条款")}
                    </Link>{" "}
                    {t("and", "及")}{" "}
                    <Link href="/privacy" target="_blank" className="underline">
                      {t("Privacy Policy", "隐私政策")}
                    </Link>
                    .
                  </span>
                </label>
              </>
            )}
            <Feedback error={error} message={message} />
            <SubmitButton busy={busy}>
              {register
                ? t("Create account", "注册账号")
                : reset
                  ? t("Send recovery email", "发送恢复邮件")
                  : newPassword
                    ? t("Save new password", "保存新密码")
                    : t("Log in securely", "安全登录")}
            </SubmitButton>
          </form>
          <div className="text-xs text-center mt-6 space-y-4">
            {mode === "login" && (
              <p>
                <Link href="/forgot-password" className="text-[#4e7b80]">
                  {t("Forgot your password?", "忘记密码？")}
                </Link>
              </p>
            )}
            <p>
              {register
                ? t("Already have an account?", "已有账号？")
                : t("New to ChinaCare?", "首次使用 ChinaCare？")}{" "}
              <Link
                className="underline font-semibold"
                href={register ? "/login" : "/register"}
              >
                {register
                  ? t("Log in", "登录")
                  : t("Create an account", "创建账号")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
export function Contact() {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const f = new FormData(form);
      const d = await api("contact", {
        method: "POST",
        body: JSON.stringify({
          ...Object.fromEntries(f),
          consent: f.get("consent") === "on",
        }),
      });
      setMessage(d.message);
      form.reset();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="section wrap grid lg:grid-cols-2 gap-16">
      <div>
        <p className="eyebrow mb-4">
          {t("We’re here to help", "我们愿意提供帮助")}
        </p>
        <h1 className="section-title text-5xl">
          {t("Start with a conversation.", "从一次沟通开始。")}
        </h1>
        <p className="muted mt-6 max-w-md">
          {t(
            "Contact the international patient team with questions about the process. Please use the private patient portal for medical records.",
            "如有就医流程问题，请联系国际患者团队。医疗资料请通过私密患者入口提交。",
          )}
        </p>
        <div className="mt-10 space-y-6">
          {[
            [Mail, "Email"],
            [Phone, "WhatsApp"],
            [MessageCircle, "WeChat"],
          ].map(([Icon, label], i) => {
            const I = Icon as typeof Mail;
            return (
              <div className="flex items-center gap-4" key={i}>
                <span className="rounded-lg bg-[#eff5f4] p-3">
                  <I size={20} />
                </span>
                <div>
                  <p className="text-sm font-medium">{label as string}</p>
                  <p className="muted text-xs">
                    {t(
                      "Contact details to be confirmed · Placeholder",
                      "联系方式待确认 · 占位信息",
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="notice mt-10">
          {t(
            "This is not an emergency service. For urgent medical help, contact local emergency services.",
            "本平台不提供急救服务。如需紧急医疗帮助，请联系当地急救机构。",
          )}
        </div>
      </div>
      <form onSubmit={submit} className="card p-7 space-y-5">
        <h2 className="text-xl font-semibold">
          {t("Contact International Patient Team", "联系国际患者团队")}
        </h2>
        {[
          ["name", t("Name", "姓名"), "text"],
          ["email", t("Email", "邮箱"), "email"],
          ["country", t("Country", "国家"), "text"],
          [
            "phone",
            t("WhatsApp / Phone (optional)", "WhatsApp / 电话（选填）"),
            "tel",
          ],
        ].map(([name, label, type]) => (
          <label className="field" key={name}>
            {label}
            <input
              className="input"
              name={name}
              type={type}
              required={name !== "phone"}
              maxLength={name === "email" ? 254 : 100}
            />
          </label>
        ))}
        <label className="field">
          {t("Message", "留言")}
          <textarea
            className="input"
            name="message"
            rows={5}
            minLength={10}
            maxLength={4000}
            required
            placeholder={t(
              "Tell us how we can help. Do not include medical details here.",
              "请描述您的服务需求，不要在此填写病历详情。",
            )}
          />
        </label>
        <label className="text-xs flex gap-3 leading-6">
          <input type="checkbox" name="consent" required />
          {t(
            "I agree to be contacted about this inquiry and to the Privacy Policy.",
            "我同意团队就此次咨询联系我，并同意隐私政策。",
          )}
        </label>
        <Feedback error={error} message={message} />
        <SubmitButton busy={busy}>{t("Send inquiry", "发送咨询")}</SubmitButton>
      </form>
    </section>
  );
}

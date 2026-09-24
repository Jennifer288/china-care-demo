"use client";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { useLanguage } from "./site-shell";
export function ShareNotice() {
  const { t } = useLanguage();
  return (
    <section className="section wrap max-w-3xl">
      <ShieldCheck className="text-accent mb-6" size={32} />
      <p className="eyebrow mb-4">
        {t("Public demonstration", "公开参考演示")}
      </p>
      <h1 className="section-title">
        {t("Explore the experience.", "先了解体验与流程。")}
      </h1>
      <p className="muted mt-6">
        {t(
          "This shared version is for reference. Account registration, medical uploads, private dashboards and message submission are not enabled. You can browse all public pages and try the application walkthrough using fictional examples. No medical information is collected here.",
          "此分享版本用于浏览参考，暂不开放账号注册、医疗资料上传、私密工作台或咨询提交。您可查看所有公开页面，并通过虚构示例体验申请流程。此处不收集医疗资料。",
        )}
      </p>
      <div className="flex flex-wrap gap-3 mt-8">
        <Link href="/dashboard/cases/new" className="btn">
          {t("View application walkthrough", "查看申请流程")}
          <ArrowRight size={16} />
        </Link>
        <Link href="/" className="btn secondary">
          {t("Back to home", "返回首页")}
        </Link>
      </div>
    </section>
  );
}

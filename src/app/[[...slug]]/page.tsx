import { CareGuidePage } from "@/components/home-guide";
import { PatientStories } from "@/components/coordination-sections";
import { notFound } from "next/navigation";
import {
  Home,
  Directory,
  Detail,
  Information,
} from "@/components/public-pages";
import { AuthForm, Contact } from "@/components/forms";
import { isSharePreview } from "@/lib/share-preview";
import { ShareNotice } from "@/components/share-notice";
import { CasePreview } from "@/components/case-preview";
import { fieldList } from "@/lib/case-fields";
import { PatientPortal } from "@/components/patient-portal";
import { hospitals, doctors, specialties } from "@/lib/content";
export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const [first, second, third] = slug;
  if (!first) return <Home />;
  if (isSharePreview) {
    if (slug.join("/") === "dashboard/cases/new")
      return <CasePreview fields={fieldList} />;
    if (
      [
        "login",
        "register",
        "forgot-password",
        "reset-password",
        "contact",
        "dashboard",
        "admin",
      ].includes(first)
    )
      return <ShareNotice />;
  }
  if (
    ["hospitals", "doctors", "treatments"].includes(first) &&
    slug.length <= 2
  ) {
    const kind = first as "hospitals" | "doctors" | "treatments";
    if (!second) return <Directory kind={kind} />;
    const data =
      kind === "hospitals"
        ? hospitals
        : kind === "doctors"
          ? doctors
          : specialties;
    if (!data.some((d) => d.id === second)) notFound();
    return <Detail kind={kind} id={second} />;
  }
  if (slug.length === 1) {
    if (first === "care-planning" || first === "services")
      return <CareGuidePage page={first} />;
    if (first === "patient-stories") return <PatientStories />;
    if (
      ["why-china", "patient-journey", "privacy", "terms", "about"].includes(
        first,
      )
    )
      return <Information page={first} />;
    if (
      ["login", "register", "forgot-password", "reset-password"].includes(first)
    )
      return (
        <AuthForm
          mode={
            first as "login" | "register" | "forgot-password" | "reset-password"
          }
        />
      );
    if (first === "contact") return <Contact />;
    if (first === "admin") return <PatientPortal page="admin" />;
    if (first === "dashboard") return <PatientPortal page="dashboard" />;
  }
  if (first === "dashboard" && second === "cases" && third && slug.length === 3)
    return <PatientPortal page={third === "new" ? "new" : "case"} id={third} />;
  notFound();
}

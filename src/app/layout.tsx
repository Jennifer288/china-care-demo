import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
export const metadata: Metadata = {
  title: {
    default: "ChinaCare | A clearer path to medical care in China",
    template: "%s | ChinaCare",
  },
  description:
    "Explore hospitals, specialists and personalized international patient coordination in China. An English and Chinese demonstration platform.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}

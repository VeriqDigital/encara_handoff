import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import "./globals.css";
import CinematicBackground from "@/components/layout/CinematicBackground";

const title = "ENCARA | Film / Fashion / Footy";
export const metadata: Metadata = {
  title: { default: title, template: "%s | ENCARA" },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  robots: { index: false, follow: false },
  openGraph: {
    title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: { card: "summary", title, description: siteConfig.description },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CinematicBackground>{children}</CinematicBackground>
      </body>
    </html>
  );
}

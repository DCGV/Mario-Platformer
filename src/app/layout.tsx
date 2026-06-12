import type { Metadata } from "next";
import { ConsentBanner } from "@/components/shared/ConsentBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vela Health — GLP-1 Benefits Hub",
  description:
    "The rewards-and-perks ecosystem for GLP-1 patients. Curated, condition-specific benefits that keep you on therapy and reward your progress.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FAFAFA]">
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}

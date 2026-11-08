import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Letmithink",
  description:
    "Acak topik bicara, pasang tantangan penyampaian, dan latih ketepatan waktu presentasi langsung di peramban.",
  icons: {
    icon: "/icon-letmithink.webp",
    shortcut: "/icon-letmithink.webp",
    apple: "/icon-letmithink.webp",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.className} min-h-screen bg-canvas text-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

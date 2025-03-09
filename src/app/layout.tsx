import Navbar from "@/components/global/navbar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "TeamSyncApp | Real-time Team Collaboration",
  description:
    "TeamSync is a real-time collaboration platform featuring instant messaging, video calls, and team rooms. Connect and collaborate with your team seamlessly.",
  keywords:
    "team collaboration, video calls, chat app, real-time messaging, team communication",
  authors: [{ name: "Fatan Aminullah" }],
  openGraph: {
    title: "TeamSyncApp | Real-time Team Collaboration",
    description:
      "Connect and collaborate with your team through instant messaging and video calls.",
    type: "website",
    images: [`${process.env.SITE_URL}/richlink.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "TeamSyncApp | Real-time Team Collaboration",
    description:
      "Connect and collaborate with your team through instant messaging and video calls.",
    images: [`${process.env.SITE_URL}/richlink.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="apple-mobile-web-app-title" content="TeamSync" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="light" attribute="class">
          <Navbar />
          <main className="mt-20">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}

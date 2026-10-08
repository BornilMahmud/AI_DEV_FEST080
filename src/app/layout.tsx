import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "upay Sentinel | AI Fraud & Scam Intelligence Platform",
  description:
    "Next-generation AI-powered Trust & Risk Intelligence platform for digital financial services. Built for the DIU CPC × upay AI Hackathon 2026.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="antialiased font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

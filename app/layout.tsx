import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// Redaction 35 (SIL OFL, see app/fonts/OFL-Redaction.txt): the "dither serif" payoff line.
const redaction = localFont({
  src: "./fonts/Redaction_35-Regular.woff2",
  variable: "--font-redaction",
});

export const metadata: Metadata = {
  title: "Next.js Boilerplate · DollarDeploy",
  description: "A minimal Next.js 16 starter, deployed to a server you own with DollarDeploy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${redaction.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import "./globals.css";
import { Archivo } from "next/font/google";
import type { Metadata } from "next";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Community Hub",
  description:
    "Welcome to Community Hub – a place for collaboration, discovery, and connection. Stay tuned for more updates!",
  openGraph: {
    title: "Community Hub",
    description:
      "Welcome to Community Hub – a place for collaboration, discovery, and connection. Stay tuned for more updates!",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Community Hub",
    description:
      "Welcome to Community Hub – a place for collaboration, discovery, and connection. Stay tuned for more updates!",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={archivo.variable}>
      <body>{children}</body>
    </html>
  );
}

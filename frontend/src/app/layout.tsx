import type { Metadata } from "next";
import { Golos_Text } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/providers/ToastProvider";

const golosText = Golos_Text({
  variable: "--font-golos-text",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zendoc - Infrastructure Management",
  description: "Manage your servers, virtual machines, services, and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${golosText.variable} antialiased`}>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Cổng Ứng Tuyển ATS",
  description: "Hệ thống tuyển dụng tự động hóa thông minh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased bg-gray-50">
        <Navbar />
        <main>{children}</main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
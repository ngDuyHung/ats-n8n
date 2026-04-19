import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">
        {/* Biến {children} chính là nội dung của file page.tsx sẽ được chèn vào đây */}
        {children}
      </body>
    </html>
  );
}
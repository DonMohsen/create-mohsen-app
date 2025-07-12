import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Create Mohsen App",
  description: "Enjoy the flexibility of Create Mohsen App cli",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Create Don Mohsen App",
  description: "Enjoy the flexibility of Don Mohsen Cli",
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

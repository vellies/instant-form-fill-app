import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VR Instant Fill",
  description: "API server for the VR Instant Fill extension",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

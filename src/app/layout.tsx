import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import { Toast } from "@/components/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Chat",
  description: "A minimal chat app",
  viewport: "width=device-width, initial-scale=1",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Toast />
          {children}
        </Providers>
      </body>
    </html>
  );
}

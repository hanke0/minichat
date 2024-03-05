import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import { Toast } from "@/components/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Chat",
  description: "A minimal chat app",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Note! If you do not add suppressHydrationWarning to your <html> you will
    // get warnings because next-themes updates that element. This property only
    // applies one level deep, so it won't block hydration warnings on other elements.
    <html suppressHydrationWarning>
      <body>
        <Providers>
          <Toast />
          {children}
        </Providers>
      </body>
    </html>
  );
}

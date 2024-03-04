import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from 'next-themes'

export const metadata: Metadata = {
  title: "Mini Chat",
  description: "A minimal chat app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

import { Noto_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ['400', '500', '600', '700', '900'],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata = {
  title: "Sony Training Wiki",
  description: "Hệ thống cố vấn AI phân tích máy ảnh và ống kính Sony",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="vi" suppressHydrationWarning>
        <body
          className={`${notoSans.variable} ${jetbrainsMono.variable} antialiased`}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

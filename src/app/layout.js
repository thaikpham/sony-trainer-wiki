import { Noto_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["vietnamese"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata = {
  title: "Sony Training Wiki",
  description: "Knowledge hub for Alpha experts.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="vi">
        <body
          className={`${notoSans.variable} ${jetbrainsMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

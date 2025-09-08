import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import AntdProvider from "@/provider/antd-provider";
import QueryProvider from "@/provider/query-provider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Rebuildr admin",
  description: "Portal för Rebuild administratörer",
};

const RootLayout = async ({ children }: PropsWithChildren) => {
  return (
    <html lang="sv">
      <body className={` ${inter.variable} antialiased`}>
        <main>
          <QueryProvider>
            <AntdProvider>{children}</AntdProvider>
          </QueryProvider>
        </main>
      </body>
    </html>
  );
};

export default RootLayout;

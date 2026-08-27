import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sagar Electricals Billing",
  description: "Simple Billing Software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[var(--color-surface)] print:bg-white text-[var(--color-text-primary)] print:text-black antialiased`}>
        <div className="flex h-screen print:h-auto print:block overflow-hidden print:overflow-visible">
          <Sidebar />
          <div className="flex-1 flex flex-col h-screen print:h-auto print:block overflow-hidden print:overflow-visible bg-[var(--color-surface)] print:bg-white">
            <header className="bg-white border-b border-[var(--color-border)] px-8 py-5 flex justify-between items-center shrink-0 sticky top-0 z-10 shadow-sm print:hidden">
              <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
                Dashboard
              </h1>
              <div className="text-sm font-semibold text-[var(--color-text-secondary)] bg-slate-100 px-3 py-1 rounded-full">
                {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </header>
            <main className="flex-1 overflow-auto p-8 print:p-0 print:overflow-visible">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

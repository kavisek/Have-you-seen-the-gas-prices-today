import { Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Fab from "@/components/Fab";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata = {
  title: "ExportMinMaxer",
  description: "Find export requirements and permits for any product",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${plusJakarta.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-surface text-on-surface font-sans">
        <Navbar />
        <Sidebar />
        <main className="min-h-[calc(100dvh-5rem)] pt-20 lg:ml-80 lg:pt-24 px-6 lg:px-10 pb-20 lg:pb-12">
          {children}
        </main>
        <Fab />
      </body>
    </html>
  );
}

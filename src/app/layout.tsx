import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "KeyMaster",
  description: "How type can you fast?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body
          className={`font-dancing scrollbar-hide`}
        >
         <ThemeProvider>
          <Navbar/>
           {children}
          </ThemeProvider>
        </body>
    </html>
  );
}

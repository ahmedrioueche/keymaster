import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "KeyMaster",
  description: "How fast can you type?",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-dancing`}>
        <ThemeProvider>
          <UserProvider>
            <Navbar />
            {children}
            <Footer/>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

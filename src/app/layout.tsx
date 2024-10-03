import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext"; // Import UserProvider
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
      <body className={`font-dancing`}>
        <ThemeProvider>
          <UserProvider>
            <Navbar />
            {children}
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

"use client";
import localFont from "next/font/local";
import { usePathname } from "next/navigation";
import "./globals.css";
import Header from "./header";

// Importing custom fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Define the routes where the header should not be displayed
  const noHeaderRoutes = [
    "/login",
    "/signup",
    "/register",
    "/verify",
    "/set-password",
    "/forgotPassword",
  ];

  const showHeader = !noHeaderRoutes.includes(pathname);

  return (
    <html lang="en">
      {/* <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head> */}
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {showHeader && <Header />}
        {children}
      </body>
    </html>
  );
}

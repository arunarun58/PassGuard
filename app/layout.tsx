import { type Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DashboardPage from "@/pages/dashboard/page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PassGuard – Secure Your Passwords",
  description: "Military-grade password management with PassGuard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      {/* Add suppressHydrationWarning and let next-themes handle class */}
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class" // applies class="dark" or class="light" to <html>
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SignedOut>
              {/* Global Header */}
              <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center h-16">
                    <a href="/" className="text-xl font-semibold text-gray-800">
                      PassGuard
                    </a>

                    <div className="flex items-center space-x-4">
                      <SignInButton>
                        <button className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton>
                        <button className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition">
                          Sign Up
                        </button>
                      </SignUpButton>
                    </div>
                  </div>
                </div>
              </header>

              <main>{children}</main>
            </SignedOut>

            <SignedIn>
              <DashboardPage />
            </SignedIn>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

import { Plus_Jakarta_Sans, Lexend, Caveat, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { CompareProvider } from "@/components/CompareProvider";
import { Toaster } from "react-hot-toast";

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const displayFont = Lexend({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const scriptFont = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "BharatBizMart";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — B2B Marketplace & Business Directory`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Find verified manufacturers, suppliers, wholesalers and service providers. Post buying requirements, get quotations, and grow your business B2B.",
  openGraph: {
    type: "website",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${bodyFont.variable} ${displayFont.variable} ${scriptFont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <AuthProvider>
          <CompareProvider>
            {children}
            <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
          </CompareProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

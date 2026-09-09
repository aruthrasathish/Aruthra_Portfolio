import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";

// Self-hosted at build time: removes the render-blocking round trip to
// fonts.googleapis.com and the layout shift that came with it.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const description =
  "Software Engineer working across backend and distributed systems and applied AI/ML. AI/ML Research Assistant at American University, M.S. Information Systems at George Mason University.";

export const metadata = {
  title: {
    default: "Aruthra's Portfolio",
    template: "%s | Aruthra Sathish Kumar",
  },
  description,
  keywords: [
    "Software Engineer",
    "Backend Engineer",
    "Distributed Systems",
    "AI/ML Engineer",
    "Machine Learning Engineer",
    "RAG Systems",
    "Kafka",
    "Kubernetes",
    "PyTorch",
  ],
  authors: [{ name: "Aruthra Sathish Kumar" }],
  openGraph: {
    type: "profile",
    title: "Aruthra Sathish Kumar | Software Engineer - Backend & Applied AI/ML",
    description,
    siteName: "Aruthra Sathish Kumar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aruthra Sathish Kumar | Software Engineer",
    description,
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0f" },
    { media: "(prefers-color-scheme: light)", color: "#F4F5FB" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Relaunched Academy — Log in or Sign Up",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // next-themes writes the resolved class onto <html> from a blocking script
    // in the document head, so the server's HTML and the hydrated tree
    // legitimately disagree on that one attribute. suppressHydrationWarning
    // confines the exception to <html> instead of silencing real mismatches
    // deeper in the tree.
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Cream paper grain, light mode only (see `.paper` in globals.css).
              Fixed and pointer-events: none, so it sits under the z-1 content
              without intercepting anything. */}
          <div className="paper" aria-hidden="true" />
          {children}
          <ThemeToggle />
          <Toaster
            position="bottom-center"
            duration={3200}
            offset={20}
            mobileOffset={16}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
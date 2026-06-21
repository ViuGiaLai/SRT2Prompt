import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "SRT2Prompt",
  description:
    "Turn SRT files and scripts into scene prompts, thumbnail prompts, titles, descriptions, hashtags, and keywords."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var saved = window.localStorage.getItem('srt2prompt-theme');
                var light = saved === 'light';
                document.documentElement.classList.toggle('theme-light', light);
              } catch (e) {}
            })();
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}

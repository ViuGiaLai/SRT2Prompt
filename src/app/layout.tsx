import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SRT2Prompt",
    template: "%s | SRT2Prompt"
  },
  description:
    "Turn SRT files and scripts into scene prompts, thumbnail prompts, titles, descriptions, hashtags, and keywords.",
  applicationName: "SRT2Prompt",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  icons: {
    icon: [{ url: "/icon.ico", type: "image/x-icon" }],
    shortcut: "/icon.ico",
    apple: "/icon.ico"
  },
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="theme-bootstrap"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=window.localStorage.getItem('srt2prompt-theme');document.documentElement.classList.toggle('theme-light',s==='light')}catch(e){}})()`
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

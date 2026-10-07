import type { Metadata, Viewport } from "next";
import "@fontsource/patrick-hand/400.css";
import "@fontsource/ibm-plex-mono/400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rephrase",
  description:
    "Type it the way you'd say it to a friend. Rephrase turns it into something you can send at work.",
};

export const viewport: Viewport = {
  themeColor: "#ece6dc",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

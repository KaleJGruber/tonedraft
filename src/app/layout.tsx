"use client";

import { Providers } from "./providers";

export const metadata = {
  title: "ToneDraft",
  description: "Write in your true voice.",
  icons: {
    icon: "/tonedraft-logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

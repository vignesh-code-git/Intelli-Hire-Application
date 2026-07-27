import "./globals.css";

export const metadata = {
  title: "Intelli Hire - AI Job Portal & CV Optimizer",
  description: "Optimize your resume and discover AI-matched job openings.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  // Draw under the notch/home indicator so the header and bottom tab bar can
  // paint edge-to-edge; the CSS uses env(safe-area-inset-*) to stay clear.
  viewportFit: "cover",
  // Shrink the layout viewport when the on-screen keyboard opens so the chat
  // composer stays visible instead of being covered.
  interactiveWidget: "resizes-content",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}

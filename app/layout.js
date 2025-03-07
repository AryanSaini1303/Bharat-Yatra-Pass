import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";

export const metadata = {
  title: "Bharat Yatra Pass",
  description:
    "BharatYatraPass – Book tickets effortlessly for India's iconic monuments with a secure and seamless experience. Digital tickets, QR verification, and hassle-free travel, all in one place!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}

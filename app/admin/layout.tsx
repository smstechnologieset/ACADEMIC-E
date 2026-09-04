import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal | Academic Excellence",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

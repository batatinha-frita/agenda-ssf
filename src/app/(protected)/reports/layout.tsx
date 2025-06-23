import { ReactNode } from "react";

interface ReportsLayoutProps {
  children: ReactNode;
}

export default function ReportsLayout({ children }: ReportsLayoutProps) {
  return <div className="space-y-6">{children}</div>;
}

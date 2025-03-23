import { ReactNode } from "react";
import AdminLayout from "./AdminLayout";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title = "Dashboard" }: DashboardLayoutProps) {
  return (
    <AdminLayout title={title}>
      {children}
    </AdminLayout>
  );
} 
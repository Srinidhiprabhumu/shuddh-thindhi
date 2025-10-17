import { useAdminAuthStore } from "@/lib/store";
import { Redirect } from "wouter";

interface AdminRouteProps {
  component: React.ComponentType;
}

export function AdminRoute({ component: Component }: AdminRouteProps) {
  const { isAuthenticated } = useAdminAuthStore();

  if (!isAuthenticated) {
    return <Redirect to="/admin/login" />;
  }

  return <Component />;
}

import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AdminLayoutProps {
  title: string;
  accent: string;
  children: ReactNode;
  loading?: boolean;
  headerAction?: ReactNode;
  maxWidth?: string;
}

const AdminLayout = ({
  title,
  accent,
  children,
  loading = false,
  headerAction,
  maxWidth = "max-w-5xl",
}: AdminLayoutProps) => {
  const { loading: authLoading } = useAuth();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className={`container mx-auto px-4 ${maxWidth}`}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl text-foreground tracking-wide">
            {title} <span className="gold-accent">{accent}</span>
          </h1>
          {headerAction}
        </div>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;

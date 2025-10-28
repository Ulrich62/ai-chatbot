import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { InstallBanner } from "@/components/install-banner";
import { BetaIndicator } from "@/components/beta-indicator";

export const experimental_ppr = true;

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <InstallBanner debug={process.env.NODE_ENV === "development"} />
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
      <BetaIndicator variant="floating" />
    </SidebarProvider>
  );
}

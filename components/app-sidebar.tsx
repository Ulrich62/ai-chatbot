"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

import { PlusIcon } from "@/components/icons";
import { SidebarHistory } from "@/components/sidebar-history";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useMessages } from "@/hooks/use-messages";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppSidebar() {
  const { clearMessages } = useMessages();

  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  const handleNewChat = () => {
    setOpenMobile(false);
    clearMessages();
    router.push("/");
    router.refresh();
  };

  const handleLogoClick = () => {
    setOpenMobile(false);
    clearMessages();
    router.push("/");
    router.refresh();
  };

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <button
              type="button"
              onClick={handleLogoClick}
              className="flex flex-row gap-3 items-center"
            >
              <Image
                src="/images/logo.png"
                alt="My Binhas"
                width={120}
                height={32}
                className="px-2 rounded-md"
              />
            </button>
            {isMobile ? (
              <Button
                variant="ghost"
                type="button"
                className="p-2 h-fit"
                onClick={handleNewChat}
              >
                <PlusIcon />
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    type="button"
                    className="p-2 h-fit"
                    onClick={handleNewChat}
                  >
                    <PlusIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="end">
                  Nouvelle conversation
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUserNav />
      </SidebarFooter>
    </Sidebar>
  );
}

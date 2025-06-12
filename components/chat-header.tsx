"use client";

import { useRouter } from "next/navigation";
import { useWindowSize } from "usehooks-ts";
import { useIsMobile } from "@/hooks/use-mobile";

import { SidebarToggle } from "@/components/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "./icons";
import { useSidebar } from "./ui/sidebar";
import { memo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function PureChatHeader() {
  const router = useRouter();
  const { open } = useSidebar();
  const isMobile = useIsMobile();
  const { width: windowWidth } = useWindowSize();

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />

      {(!open || windowWidth < 768) &&
        (isMobile ? (
          <Button
            variant="outline"
            className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
            onClick={() => {
              router.push("/");
              router.refresh();
            }}
          >
            <PlusIcon />
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="outline"
                className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
                onClick={() => {
                  router.push("/");
                  router.refresh();
                }}
              >
                <PlusIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Nouvelle conversation</TooltipContent>
          </Tooltip>
        ))}
    </header>
  );
}
export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return true;
});

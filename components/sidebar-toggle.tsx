import type { ComponentProps } from "react";

import { type SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { SidebarLeftIcon } from "./icons";
import { Button } from "./ui/button";

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <Button
            data-testid="sidebar-toggle-button"
            onClick={toggleSidebar}
            variant="outline"
            className="md:px-2 md:h-fit"
          >
            <SidebarLeftIcon size={16} />
          </Button>
        </div>
      </TooltipTrigger>
      <TooltipContent align="start">Basculer la barre latérale</TooltipContent>
    </Tooltip>
  );
}

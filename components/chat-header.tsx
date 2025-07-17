"use client";

import { useRouter } from "next/navigation";
import { useWindowSize } from "usehooks-ts";
import { useIsMobile } from "@/hooks/use-mobile";

import { SidebarToggle } from "@/components/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "./icons";
import { useSidebar } from "./ui/sidebar";
import { memo, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import Link from "next/link";
import { IoHelpOutline } from "react-icons/io5";

const helpLinks = [
  {
    href: "https://bgds.typeform.com/RetoursMyBinhas",
    label: "Signaler un problème",
  },
];

function PureChatHeader() {
  const router = useRouter();
  const { open } = useSidebar();
  const isMobile = useIsMobile();
  const { width: windowWidth } = useWindowSize();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleHelpLinkClick = () => {
    setIsHelpOpen(false);
  };

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />

      {(!open || windowWidth < 768) && (
        <div className="flex items-center gap-2 ml-auto">
          {isMobile && (
            <Popover open={isHelpOpen} onOpenChange={setIsHelpOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Aide"
                  className="w-8 h-10"
                >
                  <IoHelpOutline size={24} />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="px-2 py-0 w-fit bg-white rounded-2xl shadow-xl border-none"
              >
                <div className="flex flex-col gap-4 p-4">
                  {helpLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-normal text-gray-700 hover:text-blue-900 hover:underline focus:outline-none focus:text-blue-900 focus:underline transition-colors"
                      onClick={handleHelpLinkClick}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {isMobile ? (
            <Button
              variant="outline"
              className="px-2"
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
                  className="md:px-2 px-2 md:h-fit"
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
          )}
        </div>
      )}
    </header>
  );
}
export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return true;
});

"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { IoHelpOutline } from "react-icons/io5";

const helpLinks = [
  {
    href: "https://bgds.typeform.com/RetoursMyBinhas",
    label: "Signaler un problème",
  },
];

export default function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // Ne pas afficher le bouton flottant en version mobile
  if (isMobile) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Aide"
          className="fixed bottom-16 left-4 z-50 size-12 rounded-full bg-blue-900 text-white shadow-lg hover:bg-blue-800 focus:bg-blue-800 data-[state=open]:bg-blue-800 border-none"
        >
          <IoHelpOutline size={32} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="px-2 py-0 w-fit bg-white rounded-2xl shadow-xl border-none"
      >
        <div className="flex flex-col gap-4 p-6">
          {helpLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-normal text-gray-700 hover:text-blue-900 hover:underline focus:outline-none focus:text-blue-900 focus:underline transition-colors"
              onClick={handleLinkClick}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

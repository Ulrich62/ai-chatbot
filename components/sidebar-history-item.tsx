import { useMessages } from "@/hooks/use-messages";
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import Link from "next/link";
import { memo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Chat } from "@/types";

type ChatProps = {
  chat: Chat;
  isActive: boolean;
  setOpenMobile: (open: boolean) => void;
};

const PureChatItem = ({ chat, isActive, setOpenMobile }: ChatProps) => {
  const { clearMessages } = useMessages();
  const isMobile = useIsMobile();

  const handleItemClick = () => {
    clearMessages();
    if (isMobile) setOpenMobile(false);
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={`/chat/${chat.id}`} onClick={handleItemClick}>
          <span>{chat.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  return true;
});

import { SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';
import Link from 'next/link';
import { memo } from 'react';

type ChatProps = {
  chat: Chat;
  isActive: boolean;
  setOpenMobile: (open: boolean) => void;
};

const PureChatItem = ({ chat, isActive, setOpenMobile }: ChatProps) => {
  const handleItemClick = () => {
    setOpenMobile(false);
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

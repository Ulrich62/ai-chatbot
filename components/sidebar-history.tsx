"use client";

import { useParams } from "next/navigation";
import type { User } from "next-auth";
import { motion } from "framer-motion";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChatItem } from "./sidebar-history-item";
import { groupChatsByDate } from "@/utils/groupChatsByDate";
import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { random } from "lodash";
import { useChat } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";

export function SidebarHistory() {
  const { setOpenMobile } = useSidebar();
  const { id } = useParams();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { user } = useAuth();

  const {
    chats,
    isLoading,
    isFetchingNextPage,
    hasReachedEnd,
    hasEmptyChatHistory,
    needsManualLoad,
    handleLoadMore,
  } = useChat({
    enabled: !!user,
    search: debouncedSearch,
  });

  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            Connectez-vous pour enregistrer et revoir vos conversations
            précédentes!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (hasEmptyChatHistory) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2 mt-4">
            Toutes vos conversations apparaîtront ici une fois que vous
            commencerai à discuter!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  const groupedChats = groupChatsByDate(chats);

  return (
    <>
      <div className="px-2 py-1 text-xs text-sidebar-foreground/50 flex flex-row gap-2 items-center sticky top-0 bg-sidebar-background z-10">
        <Input
          placeholder="Rechercher une conversation"
          className="text-black"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {isLoading ? (
        <SidebarGroup>
          <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
            Aujourd&apos;hui
          </div>
          <SidebarGroupContent>
            <div className="flex flex-col">
              {[44, 32, 28, 64, 52].map((item) => (
                <Skeleton key={item} />
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      ) : (
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <div className="flex flex-col gap-6">
                {groupedChats.today.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                      Aujourd&apos;hui
                    </div>
                    {groupedChats.today.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === id}
                        setOpenMobile={setOpenMobile}
                      />
                    ))}
                  </div>
                )}

                {groupedChats.yesterday.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                      Hier
                    </div>
                    {groupedChats.yesterday.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === id}
                        setOpenMobile={setOpenMobile}
                      />
                    ))}
                  </div>
                )}

                {groupedChats.lastWeek.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                      Derniers 7 jours
                    </div>
                    {groupedChats.lastWeek.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === id}
                        setOpenMobile={setOpenMobile}
                      />
                    ))}
                  </div>
                )}

                {groupedChats.lastMonth.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                      Derniers 30 jours
                    </div>
                    {groupedChats.lastMonth.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === id}
                        setOpenMobile={setOpenMobile}
                      />
                    ))}
                  </div>
                )}

                {groupedChats.older.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                      Plus anciens
                    </div>
                    {groupedChats.older.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === id}
                        setOpenMobile={setOpenMobile}
                      />
                    ))}
                  </div>
                )}
              </div>
            </SidebarMenu>

            {/* Infinite scroll trigger - only when there's enough content */}
            {!needsManualLoad && (
              <motion.div onViewportEnter={handleLoadMore} className="h-1" />
            )}

            {/* Loading/End states */}
            {hasReachedEnd ? (
              <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2 mt-8">
                Vous avez atteint la fin de votre historique de conversations.
              </div>
            ) : (
              isFetchingNextPage &&
              [44, 32, 28, 64, 52].map((item) => <Skeleton key={item} />)
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  );
}

const Skeleton = () => {
  const [width, setWidth] = useState("100%"); // fallback for SSR

  useEffect(() => {
    setWidth(`${random(0, 100, true)}%`);
  }, []);

  return (
    <div className="rounded-md h-8 flex gap-2 px-2 items-center">
      <div
        className="h-4 rounded-md flex-1 max-w-[--skeleton-width] bg-sidebar-accent-foreground/10"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  );
};

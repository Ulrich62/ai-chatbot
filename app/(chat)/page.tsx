import { Chat } from "@/components/chat";

const initialMessages = [
  {
    id: "1",
    content: "Hello, how are you?",
    role: "user",
  },
];

export default function Page() {
  return <Chat id="1" initialMessages={initialMessages} />;
}

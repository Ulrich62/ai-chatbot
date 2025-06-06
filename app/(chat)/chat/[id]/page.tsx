import { Chat } from '@/components/chat';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  console.log('render chat');

  return <Chat id={id} />;
}

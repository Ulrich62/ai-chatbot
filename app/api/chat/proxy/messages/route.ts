import type { NextRequest } from 'next/server';
import { proxyForward } from '@/lib/proxyForward';
import env from '@/utils/env';

const BACKEND_URL = `${env.RAG_API_BASE_URL}/messages/chat`;

export async function GET(req: NextRequest) {
  // On forwarde l'ID du chat dans l'URL
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return new Response('Missing chat id', { status: 400 });
  return proxyForward(req, `${BACKEND_URL}/${id}`);
}

export async function POST(req: NextRequest) {
      // On forwarde l'ID du chat dans l'URL
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return new Response('Missing chat id', { status: 400 });
  return proxyForward(req, `${BACKEND_URL}/${id}`);
}
import type { NextRequest } from 'next/server';
import { proxyForward } from '@/lib/proxyForward';
import env from '@/utils/env';

const BACKEND_URL = `${env.RAG_API_BASE_URL}/messages/chat`;
const SSE_BACKEND_URL = `${env.RAG_API_BASE_URL}/sse/messages/chat`;

export async function GET(req: NextRequest) {
  try {
    // On forwarde l'ID du chat dans l'URL
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return new Response('Missing chat id', { status: 400 });
    
    const response = await proxyForward(req, `${BACKEND_URL}/${id}`);
    
    // Handle authentication errors gracefully
    if (response.status === 401 || response.status === 403) {
      return new Response('Authentication required', { status: 401 });
    }
    
    return response;
  } catch (error) {
    console.error('[MESSAGES PROXY] Unexpected error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // On forwarde l'ID du chat dans l'URL
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return new Response('Missing chat id', { status: 400 });
    
    const response = await proxyForward(req, `${SSE_BACKEND_URL}/${id}`);
    
    // Handle authentication errors gracefully
    if (response.status === 401 || response.status === 403) {
      return new Response('Authentication required', { status: 401 });
    }
    
    return response;
  } catch (error) {
    console.error('[MESSAGES PROXY] Unexpected POST error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

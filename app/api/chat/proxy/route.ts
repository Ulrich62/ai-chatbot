import type { NextRequest } from 'next/server';
import { proxyForward } from '@/lib/proxyForward';
import env from '@/utils/env';

const BACKEND_URL = `${env.RAG_API_BASE_URL}/chats`;

export async function GET(req: NextRequest) {
  return proxyForward(req, BACKEND_URL);
}
export async function POST(req: NextRequest) {
  return proxyForward(req, BACKEND_URL);
}
export async function PUT(req: NextRequest) {
  return proxyForward(req, BACKEND_URL);
}
export async function DELETE(req: NextRequest) {
  return proxyForward(req, BACKEND_URL);
} 
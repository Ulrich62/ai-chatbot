import { type NextRequest, NextResponse } from 'next/server';
import { isTokenExpired } from '@/utils/jwt-decoder';

const RAG_API_BASE = process.env.NEXT_PUBLIC_RAG_API_BASE_URL;

async function refreshTokenIfNeeded(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('token')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  if (!token || !refreshToken) return token || null;

  // Si le token est expiré, tenter un refresh
  if (isTokenExpired(token)) {
    try {
      const refreshResponse = await fetch(`${req.nextUrl.origin}/api/auth/refresh`, {
        method: 'GET',
        headers: { 
          'Cookie': req.headers.get('cookie') || ''
        },
      });
      
      if (refreshResponse.ok) {
        const newCookies = refreshResponse.headers.getSetCookie();
        const newTokenCookie = newCookies.find(cookie => cookie.startsWith('token='));
        
        if (newTokenCookie) {
          return newTokenCookie.split(';')[0].split('=')[1];
        }
      }
    } catch (error) {
      console.error('[CHAT_API] Erreur lors du refresh:', error);
    }
  }

  return token;
}

export async function GET(req: NextRequest) {
  try {
    const token = await refreshTokenIfNeeded(req);
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    // Construire l'URL avec les query params
    const url = new URL(req.url);
    const search = url.search;
    const targetUrl = `${RAG_API_BASE}/chats${search}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`[CHAT_API] Échec de récupération des chats: ${response.status} ${response.statusText}`);
      return NextResponse.json({ error: 'Erreur lors de la récupération des chats' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('[CHAT_API] Erreur inattendue:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await refreshTokenIfNeeded(req);
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const body = await req.text();
    const targetUrl = `${RAG_API_BASE}/sse/chats`;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body
    });

    if (!response.ok) {
      console.warn(`[CHAT_API] Échec de création du chat: ${response.status} ${response.statusText}`);
      return NextResponse.json({ error: 'Erreur lors de la création du chat' }, { status: response.status });
    }

    // Pour les requêtes SSE, retourner la réponse directement
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('[CHAT_API] Erreur inattendue:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

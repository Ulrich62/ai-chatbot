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
      console.error('[MESSAGES_API] Erreur lors du refresh:', error);
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

    // Récupérer l'ID du chat et les paramètres de pagination depuis les query params
    const url = new URL(req.url);
    const chatId = url.searchParams.get('id');
    
    if (!chatId) {
      return NextResponse.json({ error: 'ID du chat manquant' }, { status: 400 });
    }

    // Construire l'URL avec les paramètres de pagination
    const searchParams = new URLSearchParams();
    if (url.searchParams.get('limit')) {
      searchParams.set('limit', url.searchParams.get('limit')!);
    }
    if (url.searchParams.get('start_id')) {
      searchParams.set('start_id', url.searchParams.get('start_id')!);
    }
    
    const queryString = searchParams.toString();
    const targetUrl = `${RAG_API_BASE}/messages/chat/${chatId}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`[MESSAGES_API] Échec de récupération des messages: ${response.status} ${response.statusText}`);
      return NextResponse.json({ error: 'Erreur lors de la récupération des messages' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('[MESSAGES_API] Erreur inattendue:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await refreshTokenIfNeeded(req);
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    // Récupérer l'ID du chat depuis les query params
    const url = new URL(req.url);
    const chatId = url.searchParams.get('id');
    
    if (!chatId) {
      return NextResponse.json({ error: 'ID du chat manquant' }, { status: 400 });
    }

    const body = await req.text();
    const targetUrl = `${RAG_API_BASE}/sse/messages/chat/${chatId}`;

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
      console.warn(`[MESSAGES_API] Échec d'envoi du message: ${response.status} ${response.statusText}`);
      return NextResponse.json({ error: 'Erreur lors de l\'envoi du message' }, { status: response.status });
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
    console.error('[MESSAGES_API] Erreur inattendue:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

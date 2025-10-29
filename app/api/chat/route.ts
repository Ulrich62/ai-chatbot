import { type NextRequest, NextResponse } from 'next/server';
import { isTokenExpired } from '@/utils/jwt-decoder';

// Configuration des APIs
const BGDS_API_BASE = process.env.NEXT_PUBLIC_BGDS_API_BASE_URL;
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

// GET /api/chat - Appel direct BGDS (réplique de get_user_chats)
export async function GET(req: NextRequest) {
  try {
    const token = await refreshTokenIfNeeded(req);
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    // Récupérer les paramètres de pagination et filtres
    const url = new URL(req.url);
    const limit = url.searchParams.get('limit');
    const start_id = url.searchParams.get('start_id');
    const search = url.searchParams.get('search');

    // Construire les paramètres pour l'API BGDS
    const searchParams = new URLSearchParams();
    if (limit) searchParams.set('limit', limit);
    if (start_id) searchParams.set('start_id', start_id);
    if (search) searchParams.set('search', search);
    
    const queryString = searchParams.toString();
    const targetUrl = `${BGDS_API_BASE}/ia_assistant/chats${queryString ? `?${queryString}` : ''}`;

    // Appel direct à l'API BGDS (réplique de external_chat_service.get_chats)
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
    
    // Transformer la réponse pour correspondre au format attendu par le frontend
    const transformedData = {
      items: data.chats.map((chat: any) => ({
        id: chat.id,
        uuid: chat.uuid,
        title: chat.title,
        created: chat.created
      })),
      has_more: data.has_more
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('[CHAT_API] Erreur inattendue:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// POST /api/chat - Proxy vers l'API de production
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

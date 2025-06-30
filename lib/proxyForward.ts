import { type NextRequest, NextResponse } from 'next/server';

export async function proxyForward(req: NextRequest, targetUrl: string) {
  const token = req.cookies.get('token')?.value;
  console.log('token', token);
  const headers = new Headers(req.headers);
  console.log('headers', headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  // Supprimer les headers qui ne doivent pas être forwardés
  headers.delete('host');
  headers.delete('connection');
  headers.delete('content-length');

  console.log('headers after', headers);
  let body: BodyInit | undefined = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.text();
  }

  // Ajout des query params de la requête entrante à l'URL cible
  const url = new URL(req.url);
  const search = url.search; // inclut ?page=...&limit=... si présents
  const fullTargetUrl = targetUrl + search;

  // Check if this is an SSE request and handle it differently
  const acceptHeader = req.headers.get('accept');
  if (acceptHeader?.includes('text/event-stream')) {
    // For SSE requests, return the fetch response directly without intercepting
    return fetch(fullTargetUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
    });
  }

  const backendRes = await fetch(fullTargetUrl, {
    method: req.method,
    headers,
    body,
    redirect: 'manual',
  });

  // Forwarder le body tel quel (json ou texte)
  const resBody = await backendRes.text();
  const response = new NextResponse(resBody, {
    status: backendRes.status,
  });
  // Forwarder les headers importants
  backendRes.headers.forEach((value, key) => {
    if (key === 'content-type') {
      response.headers.set(key, value);
    }
  });
  return response;
}

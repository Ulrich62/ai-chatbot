import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Récupérer le token depuis les cookies
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    // Appel à l'API externe pour récupérer les infos utilisateur
    const apiRes = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_BASE_URL}/getUserInfos`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!apiRes.ok) {
      console.warn(`[USER_INFO] Échec de récupération des infos utilisateur: ${apiRes.status} ${apiRes.statusText}`);
      return NextResponse.json({ error: 'Erreur lors de la récupération des informations utilisateur' }, { status: 401 });
    }

    const userData = await apiRes.json();
    
    // Adapter au format attendu par l'application
    const user = {
      uuid: userData.uuid,
      email: userData.email,
      label: userData.label || `${userData.fname} ${userData.name}`,
      fname: userData.fname || '',
      name: userData.name || '',
      id: userData.id,
      role: userData.role,
      specialities: userData.specialities,
      companies: userData.companies,
    };

    return NextResponse.json({ user });

  } catch (err) {
    console.error('[USER_INFO] Erreur inattendue:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

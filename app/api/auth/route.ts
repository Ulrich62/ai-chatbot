import { NextRequest, NextResponse } from 'next/server';
import { decodeJWT } from '@/utils/jwt-decoder';

export async function GET(req: NextRequest) {
  // Récupérer le token depuis les cookies
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
  }

  // Décoder le token
  const decoded = decodeJWT(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  // Extraire les infos utilisateur de la structure imbriquée
  const userData = decoded?.data?.user;
  if (!userData) {
    return NextResponse.json({ error: 'Utilisateur non trouvé dans le token' }, { status: 401 });
  }

  // Adapter au type User attendu
  const user = {
    uuid: userData.uuid,
    email: userData.email,
    label: userData.label,
    fname: userData.fname || '',
    name: userData.name || '',
  };

  // Retourner les infos utilisateur
  return NextResponse.json({ user });
} 
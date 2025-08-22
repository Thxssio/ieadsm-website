import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/server';

export const dynamic = 'force-dynamic';

// A função GET recebe o objeto 'request' como parâmetro
export async function GET(request) {
  try {
    // Lendo o cookie diretamente do cabeçalho da requisição para evitar o erro
    const cookieHeader = request.headers.get('cookie');
    let sessionCookie = '';

    if (cookieHeader) {
      const cookies = cookieHeader.split('; ');
      const sessionCookieString = cookies.find(c => c.startsWith('session='));
      if (sessionCookieString) {
        sessionCookie = sessionCookieString.split('=')[1];
      }
    }
    
    const user = await getCurrentUser(sessionCookie);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

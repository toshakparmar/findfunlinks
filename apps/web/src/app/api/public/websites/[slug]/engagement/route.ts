import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookie = request.headers.get('cookie') || '';
  const forwardedFor = request.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/websites/${encodeURIComponent(slug)}/engagement`,
      {
        headers: {
          'Content-Type': 'application/json',
          cookie,
          'x-forwarded-for': forwardedFor,
        },
        cache: 'no-store',
      },
    );

    if (res.ok) {
      const data = await res.json();
      const payload = data && typeof data === 'object' && 'data' in data ? data.data : data;
      const response = NextResponse.json(payload, { status: res.status });

      const setCookie = res.headers.get('set-cookie');
      if (setCookie) {
        response.headers.set('set-cookie', setCookie);
      }

      return response;
    }
    throw new Error(`API returned status ${res.status}`);
  } catch (_error: any) {
    // Fallback engagement - return null starCount so client preserves its real count
    return NextResponse.json({ starCount: null, starred: false }, { status: 200 });
  }
}

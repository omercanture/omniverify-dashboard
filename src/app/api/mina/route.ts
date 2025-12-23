import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // En güncel Minascan GraphQL şemasına göre sorgu
  const query = `
    query {
      transactions(
        query: { to: "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v" },
        limit: 10,
        sortBy: DATETIME_DESC
      ) {
        hash
        dateTime
        memo
        status
      }
    }
  `;

  try {
    const response = await fetch('https://api.minascan.io/node/devnet/v1/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      next: { revalidate: 0 } // Cache'i tamamen devre dışı bırak
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Minascan API Hatası:", error);
    return NextResponse.json({ error: 'Minascan bağlantı hatası' }, { status: 500 });
  }
}
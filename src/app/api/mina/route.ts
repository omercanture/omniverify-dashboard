import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";

  // Hem zkapps hem de düz ödemeleri (transactions) tek seferde isteyen hibrit sorgu
  const query = `
    query {
      zkapps(query: { zkappAddress: "${zkAppAddress}" }, limit: 5, sortBy: BLOCKHEIGHT_DESC) {
        hash
        dateTime
        status
        zkappCommand { memo }
      }
      transactions(query: { to: "${zkAppAddress}" }, limit: 5, sortBy: DATETIME_DESC) {
        hash
        dateTime
        status
        memo
      }
    }
  `;

  try {
    const response = await fetch('https://api.minascan.io/node/devnet/v1/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Minascan bağlantı hatası' }, { status: 500 });
  }
}
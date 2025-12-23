// src/app/api/mina/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const query = `
    query {
      transactions(
        query: { to: "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v" },
        limit: 20,
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
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Veri çekilemedi' }, { status: 500 });
  }
}
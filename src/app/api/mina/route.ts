import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
  const query = `
    query {
      transactions(
        limit: 100, 
        query: { 
          OR: [
            { to: "${zkAppAddress}" },
            { from: "${zkAppAddress}" }
          ]
        }
      ) {
        hash
        from
        to
        memo
        dateTime
        status
      }
    }
  `;

  try {
    const response = await fetch('https://api.minascan.io/devnet/v1/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ data: { transactions: [] } });
  }
}
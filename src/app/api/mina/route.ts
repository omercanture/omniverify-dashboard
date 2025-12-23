import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
  // En sade ve hata payı en düşük sorgu
  const query = `
    query {
      transactions(
        limit: 50, 
        sortBy: DATETIME_DESC, 
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
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (!result.data || !result.data.transactions) {
      return NextResponse.json({ data: { transactions: [] } });
    }
    
    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json({ data: { transactions: [] } });
  }
}
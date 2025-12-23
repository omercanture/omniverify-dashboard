import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
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
        from
        to
        memo
        hash
        dateTime
        status
      }
    }
  `;

  try {
    // EN GÜNCEL DEVNET ENDPOINT: devnet.api.minascan.io/node/graphql
    const response = await fetch('https://devnet.api.minascan.io/node/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - Path might have changed`);
    }

    const result = await response.json();

    return NextResponse.json({
      debug: {
        status: response.status,
        count: result.data?.transactions?.length || 0,
        source: "MinaScan Devnet Node"
      },
      data: {
        transactions: result.data?.transactions || []
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "ENDPOINT_CONNECTION_FAILED", 
      message: error.message,
      target: "devnet.api.minascan.io"
    });
  }
}
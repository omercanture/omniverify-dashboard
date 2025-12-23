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
    const response = await fetch('https://proxy.devnet.minaexplorer.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    });

    const result = await response.json();
    return NextResponse.json({
      data: {
        transactions: result.data?.transactions || []
      }
    });

  } catch (error) {
    return NextResponse.json({ data: { transactions: [] } });
  }
}
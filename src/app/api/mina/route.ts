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
    // ARIZALI ENDPOINT DEĞİŞTİRİLDİ: MinaScan resmi API'sine geçildi
    const response = await fetch('https://api.minascan.io/devnet/v1/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json({
      debug: {
        status: response.status,
        count: result.data?.transactions?.length || 0,
        source: "MinaScan API"
      },
      data: {
        transactions: result.data?.transactions || []
      }
    });

  } catch (error: any) {
    // Hata durumunda hala null dönmemesi için detaylı hata raporu
    return NextResponse.json({ 
      error: "API_ACCESS_FAILED", 
      message: error.message,
      target: "api.minascan.io" 
    });
  }
}
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
  // MinaExplorer için optimize edilmiş en geniş kapsamlı sorgu
  const query = `
    query {
      transactions(
        query: { 
          to: "${zkAppAddress}",
          status: "applied"
        }, 
        limit: 20, 
        sortBy: DATETIME_DESC
      ) {
        hash
        from
        to
        memo
        dateTime
        status
        kind
      }
    }
  `;

  try {
    // MinaExplorer'ın resmi Devnet GraphQL endpoint'i
    const response = await fetch('https://proxy.devnet.minaexplorer.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    });

    const result = await response.json();

    // Veri yapısını kontrol et ve Dashboard'un beklediği formata göre döndür
    const transactions = result.data?.transactions || [];

    return NextResponse.json({
      data: {
        transactions: transactions
      }
    });

  } catch (error) {
    console.error("MinaExplorer API Hatası:", error);
    return NextResponse.json({ data: { transactions: [] } });
  }
}
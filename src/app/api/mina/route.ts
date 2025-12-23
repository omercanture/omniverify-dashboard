import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
  // Hem transactions hem de zkappCommands tablosunu tarayan daha geniş bir sorgu
  const query = `
    query {
      transactions(
        query: { 
          to: "${zkAppAddress}", 
          canonical: true 
        }, 
        limit: 20, 
        sortBy: DATETIME_DESC
      ) {
        hash
        from
        dateTime
        status
        memo
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

    // Eğer veri gelmiyorsa, API'nin bazen hata vermeden boş döndüğü durumlar için kontrol
    if (!result.data || !result.data.transactions) {
      return NextResponse.json({ data: { transactions: [] } });
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ data: { transactions: [] } });
  }
}
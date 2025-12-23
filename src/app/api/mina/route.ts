import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
  const query = `
    query {
      transactions(
        query: { to: "${zkAppAddress}", status: "applied" }, 
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
    
    // Eğer API'den veri boş gelirse veya catch'e düşerse hata fırlat ki mock veriye geçsin ama gerçek veriyi bekle
    if (!result.data || !result.data.transactions || result.data.transactions.length === 0) {
       console.log("Gerçek veri henüz API'ye yansımamış.");
    }

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json({ data: { transactions: [] } });
  }
}
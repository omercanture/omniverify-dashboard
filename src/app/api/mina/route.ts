import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
  // MinaExplorer / Minascan'in en temel ödeme sorgusu
  const query = `
    query {
      payments(
        query: { receiver: "${zkAppAddress}" }, 
        limit: 20, 
        sortBy: DATETIME_DESC
      ) {
        hash
        from
        to: receiver
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
      cache: 'no-store' // Vercel'in önbelleğe almasını engeller
    });

    const result = await response.json();
    
    // API 'payments' olarak döndüğü için Dashboard'a 'transactions' olarak çeviriyoruz
    const payments = result.data?.payments || [];

    return NextResponse.json({
      data: {
        transactions: payments
      }
    });

  } catch (error) {
    console.error("Critical API Error:", error);
    return NextResponse.json({ data: { transactions: [] } });
  }
}
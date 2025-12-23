import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
  // Account bazlı sorgu: Bu hesapla ilgili her şeyi getirir.
  const query = `
    query MyQuery {
      account(publicKey: "${zkAppAddress}") {
        transactions(limit: 20) {
          hash
          from
          to
          memo
          dateTime
          status
        }
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

    // Veri yapısı burada account -> transactions şeklinde geliyor
    const transactions = result.data?.account?.transactions || [];
    
    return NextResponse.json({
      data: {
        transactions: transactions
      }
    });

  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ data: { transactions: [] } });
  }
}
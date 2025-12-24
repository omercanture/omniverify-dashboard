import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
  // Account üzerinden çekmek, transactions tablosunda arama yapmaktan çok daha hızlı ve kesindir.
  const query = `
    query {
      account(publicKey: "${zkAppAddress}") {
        transactions(limit: 50) {
          from
          to
          memo
          hash
          dateTime
          status
        }
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
    
    // Account altındaki işlemleri alıyoruz
    const transactions = result?.data?.account?.transactions || [];

    return NextResponse.json({
      data: {
        transactions: transactions
      }
    });

  } catch (error) {
    return NextResponse.json({ data: { transactions: [] } });
  }
}
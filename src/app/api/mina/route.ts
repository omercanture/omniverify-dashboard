import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
  // Dokümandaki account/transactions mantığına göre oluşturulan REST URL
  const url = `https://api.minaexplorer.com/accounts/${zkAppAddress}/transactions`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    const result = await response.json();

    // MinaExplorer REST API genellikle direkt bir liste veya { transactions: [] } döner
    const transactions = Array.isArray(result) ? result : (result.transactions || []);

    return NextResponse.json({
      data: {
        transactions: transactions.map((tx: any) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          memo: tx.memo || "",
          dateTime: tx.dateTime || tx.timestamp,
          status: tx.status === 'applied' ? 'applied' : 'pending'
        }))
      }
    });

  } catch (error) {
    console.error("MinaExplorer REST Error:", error);
    return NextResponse.json({ data: { transactions: [] } });
  }
}
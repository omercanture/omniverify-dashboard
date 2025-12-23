import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
  // En sağlam sorgu: Tablo ismini 'transactions' yapıp, 
  // filtreyi sadece 'to' (alıcı) üzerinden kuruyoruz.
  const query = `
    query {
      transactions(
        limit: 50, 
        sortBy: DATETIME_DESC, 
        query: { to: "${zkAppAddress}" }
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
    // Önce MinaExplorer'ı deniyoruz (genellikle daha stabildir)
    const response = await fetch('https://proxy.devnet.minaexplorer.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    });

    const result = await response.json();
    const txs = result.data?.transactions || [];

    return NextResponse.json({
      data: {
        transactions: txs
      }
    });

  } catch (error) {
    console.error("Fetch hatası:", error);
    return NextResponse.json({ data: { transactions: [] } });
  }
}
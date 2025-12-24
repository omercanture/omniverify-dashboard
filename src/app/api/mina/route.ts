import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
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
        zkappTransactions(limit: 50) {
          hash
          memo
          dateTime
          failureReason
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
    
    // DİKKAT: Hiyerarşiyi account üzerinden alıyoruz
    const accountData = result?.data?.account;
    const regularTxs = accountData?.transactions || [];
    const zkappTxs = accountData?.zkappTransactions || [];

    // İki listeyi birleştiriyoruz (Hangi tabloda olursa olsun veriyi yakalamak için)
    const allTxs = [...regularTxs, ...zkappTxs].map((tx: any) => ({
      hash: tx.hash,
      from: tx.from || zkAppAddress, // zkApp tx'lerde from bazen farklı hiyerarşidedir
      to: tx.to || zkAppAddress,
      memo: tx.memo || "",
      dateTime: tx.dateTime,
      status: tx.failureReason ? 'failed' : 'applied'
    }));

    // Dashboard'un beklediği formatta döndür
    return NextResponse.json({
      data: {
        transactions: allTxs
      }
    });

  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ data: { transactions: [] } });
  }
}
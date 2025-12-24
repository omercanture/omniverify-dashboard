import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  const apiKey = "nRFZ3N2QIFPLosXdW37KvvEnJ7evef";

  // Global son işlemleri çeken endpoint (Bu endpoint genellikle en stabil olanıdır)
  const url = `https://api.blockberry.one/mina-devnet/v1/transactions?page=0&size=100&orderBy=DESC&sortBy=AGE`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'accept': 'application/json',
        'x-api-key': apiKey 
      },
      cache: 'no-store'
    });

    const textData = await response.text();
    if (!textData) return NextResponse.json({ data: { transactions: [] } });

    const result = JSON.parse(textData);
    const allTxs = result.content || [];

    // Gelen 100 işlem içinden senin adresinle ilgili olanları ayıkla
    // Hem alıcı (to) hem gönderici (from) kontrolü yapıyoruz
    const myTxs = allTxs.filter((tx: any) => 
      (tx.to && tx.to.toLowerCase() === zkAppAddress.toLowerCase()) || 
      (tx.from && tx.from.toLowerCase() === zkAppAddress.toLowerCase())
    );

    const formatted = myTxs.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      memo: tx.memo || "OmniVerify Proof",
      dateTime: tx.timestamp,
      status: tx.status?.toLowerCase() === 'applied' ? 'applied' : 'failed'
    }));

    return NextResponse.json({
      data: {
        transactions: formatted,
        debug: { 
          totalProcessed: allTxs.length, 
          matchCount: formatted.length 
        }
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      data: { transactions: [] }, 
      error: error.message 
    });
  }
}
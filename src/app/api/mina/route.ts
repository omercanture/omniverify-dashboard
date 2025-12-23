import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
  // Blockberry API URL - Senin cüzdan adresinle
  const url = `https://api.blockberry.one/mina-devnet/v1/accounts/${zkAppAddress}/txs?page=0&size=20&orderBy=DESC&sortBy=AGE&direction=ALL`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'accept': 'application/json',
        // Ücretsiz bir key alıp buraya koyman gerekebilir: https://dashboard.blockberry.one/
        // 'x-api-key': 'nRFZ3N2QIFPLosXdW37KvvEnJ7evef' 
      },
      cache: 'no-store'
    });

    const result = await response.json();

    // Blockberry veri yapısını Dashboard'a uyumlu hale getiriyoruz
    // Veri bazen result.content içinde bazen direkt result olarak gelir
    const txList = result.content || (Array.isArray(result) ? result : []);

    const formatted = txList.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      memo: tx.memo || "",
      dateTime: tx.timestamp ? new Date(tx.timestamp).toISOString() : new Date().toISOString(),
      status: 'applied'
    }));

    return NextResponse.json({
      data: {
        transactions: formatted
      }
    });

  } catch (error) {
    console.error("Blockberry Error:", error);
    return NextResponse.json({ data: { transactions: [] } });
  }
}
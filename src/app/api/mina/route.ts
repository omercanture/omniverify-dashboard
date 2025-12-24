import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  const apiKey = "nRFZ3N2QIFPLosXdW37KvvEnJ7evef";

  // Blockberry'nin "Account Transactions" endpoint'i (Tüm tipleri kapsar)
  const url = `https://api.blockberry.one/mina-devnet/v1/accounts/${zkAppAddress}/txs?page=0&size=50&orderBy=DESC&sortBy=AGE&direction=ALL`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'accept': 'application/json',
        'x-api-key': apiKey 
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`Blockberry Error: ${response.status}`);
    }

    const result = await response.json();
    
    // Blockberry veriyi 'content' dizisi içinde döner
    const txs = result.content || [];

    // Eğer 'txs' hala boş gelirse, bu adres sadece 'Actions' üretiyordur.
    // Bu durumda Actions endpoint'ini de deneyebiliriz (opsiyonel ama txs genelde yeterlidir)

    const formatted = txs.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from || "Internal",
      to: tx.to || zkAppAddress,
      memo: tx.memo || "ZK Proof",
      dateTime: tx.timestamp || new Date().toISOString(),
      status: (tx.status === 'applied' || tx.status === 'SUCCESS') ? 'applied' : 'failed'
    }));

    return NextResponse.json({
      data: {
        transactions: formatted,
        debug: { count: formatted.length, source: "Blockberry REST" }
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      data: { transactions: [] }, 
      error: error.message 
    });
  }
}
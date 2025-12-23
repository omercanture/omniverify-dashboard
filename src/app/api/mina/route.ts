import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  const apiKey = "nRFZ3N2QIFPLosXdW37KvvEnJ7evef";

  // Blockberry REST API URL
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
      const errData = await response.text();
      return NextResponse.json({ error: "BLOCKBERRY_REJECTED", details: errData });
    }

    const result = await response.json();
    
    // Blockberry 'content' dizisi içinde verileri döner
    const txs = result.content || [];

    // Dashboard'un beklediği formata dönüştürme
    const formatted = txs.map((tx: any) => ({
      from: tx.from,
      to: tx.to,
      memo: tx.memo || "",
      hash: tx.hash,
      dateTime: tx.timestamp, // Blockberry timestamp döner
      status: (tx.status === 'applied' || tx.status === 'SUCCESS') ? 'applied' : 'pending'
    }));

    return NextResponse.json({
      debug: {
        source: "Blockberry REST",
        count: formatted.length
      },
      data: {
        transactions: formatted
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "REST_FETCH_FAILED", 
      message: error.message 
    });
  }
}
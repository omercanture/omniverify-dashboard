import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  const apiKey = "nRFZ3N2QIFPLosXdW37KvvEnJ7evef";

  // Önce zkApp'ler için en yaygın veri noktası olan ACTIONS endpointini deneyelim
  const url = `https://api.blockberry.one/mina-devnet/v1/zkapps/${zkAppAddress}/actions`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'accept': 'application/json',
        'x-api-key': apiKey 
      },
      cache: 'no-store'
    });

    // Boş yanıt kontrolü
    const textData = await response.text();
    if (!textData || textData.trim().length === 0) {
      return NextResponse.json({ data: { transactions: [] }, debug: "Empty response from API" });
    }

    const result = JSON.parse(textData);
    
    // Actions gelirse onları işleyelim, gelmezse Transactions'a bakalım
    const content = result.content || result || [];

    const formatted = Array.isArray(content) ? content.map((item: any) => ({
      hash: item.transactionHash || item.hash || "Action_Internal",
      from: item.from || "zkApp",
      to: item.to || zkAppAddress,
      memo: item.memo || "OmniVerify Proof",
      dateTime: item.timestamp || new Date().toISOString(),
      status: 'applied'
    })) : [];

    return NextResponse.json({
      data: {
        transactions: formatted,
        debug: { count: formatted.length, source: "Blockberry Actions" }
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      data: { transactions: [] }, 
      error: error.message,
      hint: "Check if the address has Actions/Events on Minascan"
    });
  }
}
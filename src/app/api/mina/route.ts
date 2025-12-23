import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
  // En temel ve standart Mina GraphQL sorgusu
  const query = `
    query {
      transactions(
        limit: 50, 
        query: {
          OR: [
            { to: "${zkAppAddress}" },
            { from: "${zkAppAddress}" }
          ]
        }
      ) {
        from
        to
        memo
        hash
        dateTime
        status
      }
    }
  `;

  try {
    // RESMİ MINA DEVNET PROXY ADRESİ (Auro Wallet'ın kullandığı adreslerden biri)
    const response = await fetch('https://proxy.devnet.minaexplorer.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json({
      debug: {
        status: response.status,
        count: result.data?.transactions?.length || 0,
        source: "Mina Explorer Proxy"
      },
      data: {
        transactions: result.data?.transactions || []
      }
    });

  } catch (error: any) {
    // SON ÇARE: Eğer bu da hata verirse, Blockberry REST API'ye mecburi dönüş
    return NextResponse.json({ 
      error: "ALL_MINA_ENDPOINTS_FAILED", 
      message: error.message,
      suggestion: "Check Blockberry API Key"
    });
  }
}
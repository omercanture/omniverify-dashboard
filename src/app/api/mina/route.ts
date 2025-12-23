import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Bu senin Noter (zkApp) adresin. Kanıtlar bu adrese 'to' olarak gönderiliyor.
  const NOTARY_ADDRESS = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
  // Sadece bu NOTER adresine gelen (to) işlemleri çekiyoruz. 
  // Gönderen (from) kim olursa olsun tüm kanıtları listeler.
  const query = `
    query {
      transactions(
        limit: 50, 
        sortBy: DATETIME_DESC, 
        query: {
          to: "${NOTARY_ADDRESS}",
          status: "applied"
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
    const response = await fetch('https://proxy.devnet.minaexplorer.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    });

    const result = await response.json();
    
    // API'den gelen ham veriyi transactions anahtarı altında döndürüyoruz
    return NextResponse.json({
      data: {
        transactions: result.data?.transactions || []
      }
    });

  } catch (error) {
    console.error("Mina API Error:", error);
    return NextResponse.json({ data: { transactions: [] } });
  }
}
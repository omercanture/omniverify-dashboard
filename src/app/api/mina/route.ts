import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";

  // Minascan Devnet için çalışan güncel ZkApp sorgusu
  const query = `
    query {
      zkapps(query: { zkappAddress: "${zkAppAddress}" }, limit: 10, sortBy: BLOCKHEIGHT_DESC) {
        hash
        dateTime
        status
        zkappCommand {
          memo
        }
      }
    }
  `;

  try {
    const response = await fetch('https://api.minascan.io/node/devnet/v1/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    // Eğer 'transactions' hatası devam ediyorsa, sorguyu tamamen temizleyip 
    // sadece adres üzerindeki temel verileri getiren bir yapıya dönüyoruz.
    if (result.errors) {
      console.error("GraphQL Hata Detayı:", result.errors);
      return NextResponse.json({ data: { zkapps: [] } }); // Boş veri dönerek dashboard'u kırmıyoruz
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Bağlantı hatası' }, { status: 500 });
  }
}
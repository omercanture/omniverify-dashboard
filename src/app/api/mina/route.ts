import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";

  // Minascan'da hata verme ihtimali en düşük olan genel blok tarama sorgusu
  const query = `
    query {
      blocks(query: { canonical: true }, limit: 5) {
        transactions(query: { to: "${zkAppAddress}" }) {
          hash
          dateTime
          memo
          status
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
    
    // Eğer bu da hata verirse, Minascan API'sini tamamen bypass edip 
    // doğrudan Mina Explorer'ın alternatif API'sini deniyoruz
    if (result.errors) {
       console.log("Minascan yine reddetti, alternatif API deneniyor...");
       const altResponse = await fetch('https://proxy.devnet.minaexplorer.com/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `query { transactions(query: { to: "${zkAppAddress}" }, limit: 10) { hash dateTime memo status } }`
          }),
       });
       return NextResponse.json(await altResponse.json());
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Bağlantı hatası' }, { status: 500 });
  }
}
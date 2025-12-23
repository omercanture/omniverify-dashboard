import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";

  // Minascan'ın en garantili ve güncel sorgu yapısı
  const query = `
    query getZkAppTxs {
      zkapps(query: { zkappAddress: "${zkAppAddress}" }, limit: 10, sortBy: BLOCKHEIGHT_DESC) {
        hash
        blockHeight
        dateTime
        zkappCommand {
          memo
        }
        status
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
    
    // Eğer zkapps boş gelirse, alternatif olarak ödemeleri çekmeyi deneyen bir fallback yapısı
    if (result.errors || !result.data?.zkapps?.length) {
       const fallbackQuery = `
         query getPayments {
           transactions(query: { to: "${zkAppAddress}" }, limit: 10, sortBy: DATETIME_DESC) {
             hash
             dateTime
             memo
             status
           }
         }
       `;
       const fbResponse = await fetch('https://api.minascan.io/node/devnet/v1/graphql', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ query: fallbackQuery }),
       });
       return NextResponse.json(await fbResponse.json());
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Minascan bağlantı hatası' }, { status: 500 });
  }
}
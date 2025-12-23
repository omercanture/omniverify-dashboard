import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
  // 1. Plan: Minascan Hibrit Sorgu
  const minascanQuery = `
    query {
      zkapps(query: { zkappAddress: "${zkAppAddress}" }, limit: 5, sortBy: BLOCKHEIGHT_DESC) {
        hash
        dateTime
        status
        zkappCommand { memo }
      }
      transactions(query: { to: "${zkAppAddress}" }, limit: 5, sortBy: DATETIME_DESC) {
        hash
        dateTime
        status
        memo
      }
    }
  `;

  // 2. Plan (Fallback): Mina Explorer Genel Sorgu
  const explorerQuery = `
    query {
      transactions(query: { to: "${zkAppAddress}" }, limit: 10) {
        hash
        dateTime
        memo
        status
      }
    }
  `;

  try {
    // Önce Minascan'ı dene
    console.log("Minascan deneniyor...");
    const response = await fetch('https://api.minascan.io/node/devnet/v1/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: minascanQuery }),
    });

    const result = await response.json();
    
    // Eğer Minascan hata verirse Explorer'a geç
    if (result.errors) {
      throw new Error("Minascan Hatası");
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.log("Yedek plana geçiliyor: Mina Explorer...");
    try {
      const altResponse = await fetch('https://proxy.devnet.minaexplorer.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: explorerQuery }),
      });
      
      const altResult = await altResponse.json();
      return NextResponse.json(altResult);
    } catch (altError) {
      return NextResponse.json({ error: 'Her iki sağlayıcıya da ulaşılamadı' }, { status: 500 });
    }
  }
}
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
  // Dökümandaki resmi GraphQL şemasına göre oluşturulan sorgu
  const query = `
    query {
      transactions(
        limit: 25, 
        sortBy: DATETIME_DESC, 
        query: {
          canonical: true,
          OR: [
            { to: "${zkAppAddress}" },
            { from: "${zkAppAddress}" }
          ],
          # Varsayılan boş memo değerine eşit olmayanları getir (Dökümandaki değer)
          memo_ne: "E4YM2vTHhWEg66xpj52JErHUBU4pZ1yageL4TVDDpTTSsv8mK6YaH"
        }
      ) {
        fee
        from
        to
        nonce
        amount
        memo
        hash
        kind
        dateTime
        failureReason
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

    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      return NextResponse.json({ data: { transactions: [] } });
    }

    return NextResponse.json({
      data: {
        transactions: result.data?.transactions || []
      }
    });

  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ data: { transactions: [] } });
  }
}
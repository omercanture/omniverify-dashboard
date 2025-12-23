import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
  // En geniş sorgu: Filtreleri sildik, sadece adrese göre çekiyoruz
  const query = `
    query {
      transactions(
        limit: 50, 
        sortBy: DATETIME_DESC, 
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
        kind
      }
    }
  `;

  try {
    // Önce MinaExplorer Proxy'sini deniyoruz
    const response = await fetch('https://proxy.devnet.minaexplorer.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    });

    const result = await response.json();

    // --- DEBUG: Vercel Console'da görünecek ---
    console.log("=== API DEBUG START ===");
    console.log("Status:", response.status);
    console.log("Data Count:", result.data?.transactions?.length || 0);
    console.log("Full Result:", JSON.stringify(result, null, 2));
    console.log("=== API DEBUG END ===");

    // Eğer veri hala gelmiyorsa, hata mesajını da tarayıcıya gönderelim
    return NextResponse.json({
      debug: {
        status: response.status,
        count: result.data?.transactions?.length || 0,
        raw: result // Ham veriyi direkt tarayıcıda gör
      },
      data: {
        transactions: result.data?.transactions || []
      }
    });

  } catch (error: any) {
    console.error("Critical Fetch Error:", error);
    return NextResponse.json({ error: error.message, stack: error.stack });
  }
}
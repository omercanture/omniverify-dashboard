import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
  // Blockberry API URL (Dökümandaki gibi)
  const url = `https://api.blockberry.one/mina-devnet/v1/accounts/${zkAppAddress}/txs?page=0&size=20&orderBy=DESC&sortBy=AGE&direction=ALL`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'accept': 'application/json',
        // Eğer bir API Key aldıysan buraya eklemelisin:
        // 'x-api-key': 'SENIN_API_KEYIN' 
      },
      next: { revalidate: 0 } // Next.js önbelleğini devre dışı bırak
    });

    const result = await response.json();

    // Blockberry genellikle bir 'content' dizisi veya doğrudan bir dizi döner.
    // Dökümana göre dönen veriyi Dashboard formatına (hash, from, memo, dateTime) çeviriyoruz.
    const rawTransactions = result.content || result || [];

    const formattedTransactions = rawTransactions.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      memo: tx.memo || "",
      // Blockberry 'timestamp' veya 'age' dönebilir, ISO formatına çevirelim
      dateTime: tx.timestamp ? new Date(tx.timestamp).toISOString() : new Date().toISOString(),
      status: tx.status?.toLowerCase() === 'applied' || tx.status === 'SUCCESS' ? 'applied' : 'pending'
    }));

    return NextResponse.json({
      data: {
        transactions: formattedTransactions
      }
    });

  } catch (error) {
    console.error("Blockberry API Error:", error);
    return NextResponse.json({ data: { transactions: [] } });
  }
}
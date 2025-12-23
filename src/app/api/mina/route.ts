import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
  // Sorguya 'from' alanını ekledik ki kişisel kasayı (Personal Vault) doldurabilelim
  const query = `
    query {
      transactions(query: { to: "${zkAppAddress}" }, limit: 20, sortBy: DATETIME_DESC) {
        hash
        from
        dateTime
        status
        memo
      }
    }
  `;

  try {
    const response = await fetch('https://api.minascan.io/devnet/v1/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result.errors) {
       console.error("GraphQL hatası:", result.errors);
       return NextResponse.json({ data: { transactions: [] } });
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error("Bağlantı hatası:", error);
    
    // Hata durumunda dönecek örnek veriye de 'from' ekledik
    // Buradaki 'from' adresi senin test adresinle değiştirilebilir
    return NextResponse.json({ 
      data: { 
        transactions: [
          {
            hash: "5Jtm6WDJM4_Sample_Hash",
            from: "B62qrp_Sample_Sender_Address", 
            dateTime: new Date().toISOString(),
            status: "applied",
            memo: "Twitter_Verified_Sample"
          }
        ] 
      } 
    });
  }
}
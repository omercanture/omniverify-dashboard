import { NextResponse } from 'next/server';
import https from 'https';

export const dynamic = 'force-dynamic';

export async function GET() {
  const zkAppAddress = "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v";
  
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
      }
    }
  `;

  // Sertifika hatalarını görmezden gelmek için özel ajan
  const agent = new https.Agent({
    rejectUnauthorized: false
  });

  try {
    const response = await fetch('https://proxy.devnet.minaexplorer.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      // @ts-ignore
      agent: agent, 
      cache: 'no-store'
    });

    const result = await response.json();
    
    return NextResponse.json({
      data: {
        transactions: result.data?.transactions || []
      }
    });

  } catch (error: any) {
    // Eğer fetch agent'ı desteklemiyorsa (Next.js fetch bazen kısıtlıdır), 
    // standart https request'e düşüyoruz.
    return new Promise((resolve) => {
      const req = https.request(
        'https://proxy.devnet.minaexplorer.com/graphql',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          agent: agent
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            const parsed = JSON.parse(data);
            resolve(NextResponse.json({ data: { transactions: parsed.data?.transactions || [] } }));
          });
        }
      );
      req.on('error', (e) => resolve(NextResponse.json({ error: e.message })));
      req.write(JSON.stringify({ query }));
      req.end();
    });
  }
}
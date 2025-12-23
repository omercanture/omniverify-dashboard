"use client";
import React, { useState, useEffect } from 'react';

export default function FuturisticDashboard() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      // Doğrudan Minascan API'sini sorguluyoruz
      const response = await fetch(
        'https://api.minascan.io/node/devnet/v1/graphql', 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query {
                transactions(
                  query: { 
                    to: "B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v",
                    canonical: true 
                  }, 
                  limit: 20, 
                  sortBy: DATETIME_DESC
                ) {
                  hash
                  from
                  amount
                  dateTime
                  memo
                  status
                }
              }
            `
          }),
        }
      );

      const result = await response.json();
      const txs = result.data?.transactions || [];

      if (txs.length > 0) {
        const formatted = txs.map((tx: any) => ({
          id: tx.hash,
          // Memo içinde "OV_Twitter" gibi bir ibare varsa onu ayıklar
          source: tx.memo && tx.memo.includes('Twitter') ? 'Twitter (X)' : 'WhatsApp / Web',
          category: 'ZK-Attestation',
          date: new Date(tx.dateTime).toLocaleString('tr-TR'),
          status: tx.status === 'applied' ? 'VERIFIED' : 'PENDING',
          hash: tx.hash
        }));
        setProofs(formatted);
      }
      setLoading(false);
    } catch (e) {
      console.error("Veri çekme hatası:", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 20000); // 20 saniyede bir tazele
    return () => clearInterval(interval);
  }, []);

  const shareOnTwitter = (hash: string) => {
    const text = `I just notarized data on @MinaProtocol! ✅%0AProof: ${hash.slice(0,15)}...%0AVerified via OmniVerify`;
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-4 md:p-12 font-mono relative">
      {/* Dekoratif Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.05),transparent)] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative">
        <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">OmniVerify <span className="text-indigo-500">Explorer</span></h1>
            <p className="text-[10px] text-slate-500 tracking-[0.3em] mt-2">MINA DEVNET LIVE NOTARY FEED</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-emerald-500 text-[10px] font-bold uppercase">Network: Devnet</span>
          </div>
        </header>

        <div className="bg-[#111114] border border-white/5 rounded-2xl shadow-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] text-slate-500 bg-white/[0.02] uppercase tracking-widest border-b border-white/5">
                <th className="p-6">Origin</th>
                <th className="p-6">Timestamp</th>
                <th className="p-6">Status</th>
                <th className="p-6">Transaction Hash</th>
                <th className="p-6 text-right">Social</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {proofs.length > 0 ? (
                proofs.map((proof) => (
                  <tr key={proof.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                    <td className="p-6 font-bold text-slate-300">{proof.source}</td>
                    <td className="p-6 text-slate-500 text-xs">{proof.date}</td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black rounded uppercase">
                        {proof.status}
                      </span>
                    </td>
                    <td className="p-6 font-mono text-slate-600 text-[11px]">
                      <a href={`https://minascan.io/devnet/tx/${proof.hash}`} target="_blank" rel="noreferrer" className="hover:text-indigo-400">
                        {proof.hash.slice(0, 24)}...
                      </a>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => shareOnTwitter(proof.hash)}
                        className="bg-white/5 hover:bg-indigo-600 text-white px-4 py-2 rounded text-[10px] font-bold transition-all uppercase"
                      >
                        Share
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-32 text-center text-slate-600 italic tracking-widest">
                    {loading ? "INITIALIZING BLOCKCHAIN CONNECTION..." : "NO TRANSACTIONS FOUND IN THIS EPOCH."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
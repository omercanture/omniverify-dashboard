"use client";
import React, { useState, useEffect, useCallback } from 'react';

export default function FuturisticDashboard() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      console.log("OmniVerify: Blockchain verileri senkronize ediliyor...");
      const response = await fetch('/api/mina', { cache: 'no-store' });
      
      if (!response.ok) throw new Error('Proxy API yanıt vermiyor');
      
      const result = await response.json();
      console.log("Sunucudan Gelen Veri:", result);

      // Veriyi hem 'zkapps' hem de 'transactions' dizileri için kontrol ediyoruz
      const rawData = result.data?.zkapps || result.data?.transactions || [];

      if (rawData.length > 0) {
        const formatted = rawData.map((item: any) => {
          // Farklı şema yapılarına göre veri ayıklama (zkappCommand veya direkt memo)
          const memo = item.zkappCommand?.memo || item.memo || "";
          const source = memo.toLowerCase().includes('twitter') ? 'Twitter (X)' : 'WhatsApp / Web';
          
          return {
            id: item.hash,
            source: source,
            category: 'ZK-Attestation',
            date: item.dateTime ? new Date(item.dateTime).toLocaleString('tr-TR') : 'Pending',
            status: item.status === 'applied' ? 'VERIFIED' : 'PENDING',
            hash: item.hash
          };
        });
        setProofs(formatted);
      } else {
        setProofs([]);
      }
    } catch (e) {
      console.error("Dashboard veri çekme hatası:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 20000); 
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  const shareOnTwitter = (hash: string) => {
    const text = `I just notarized data on @MinaProtocol! ✅%0AProof Hash: ${hash.slice(0,15)}...%0AVerified via OmniVerify Protocol`;
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-4 md:p-12 font-mono relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent)] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/10 pb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              OmniVerify <span className="text-indigo-500">Explorer</span>
            </h1>
            <p className="text-[10px] text-slate-500 tracking-[0.4em] mt-2 italic font-bold">MINA DEVNET LIVE NOTARY FEED</p>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_#6366f1]"></div>
            <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">Network: Devnet Active</span>
          </div>
        </header>

        <div className="bg-[#111114]/80 border border-white/5 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-slate-500 bg-white/[0.03] uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="p-8">Origin Source</th>
                  <th className="p-8">Timestamp</th>
                  <th className="p-8">Security Status</th>
                  <th className="p-8">Transaction Hash</th>
                  <th className="p-8 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {proofs.length > 0 ? (
                  proofs.map((proof) => (
                    <tr key={proof.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-all duration-300 group">
                      <td className="p-8 font-bold text-slate-300">
                         <span className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]"></span>
                            {proof.source}
                         </span>
                      </td>
                      <td className="p-8 text-slate-500 text-xs">{proof.date}</td>
                      <td className="p-8">
                        <span className={`px-3 py-1 border text-[10px] font-black rounded-lg tracking-tighter uppercase ${
                          proof.status === 'VERIFIED' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          {proof.status}
                        </span>
                      </td>
                      <td className="p-8 font-mono text-slate-600 text-[11px] group-hover:text-indigo-400 transition-colors">
                        <a 
                          href={`https://minascan.io/devnet/tx/${proof.hash}`} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          {proof.hash.slice(0, 25)}...
                        </a>
                      </td>
                      <td className="p-8 text-right">
                        <button 
                          onClick={() => shareOnTwitter(proof.hash)}
                          className="bg-white/5 hover:bg-indigo-600 text-white px-5 py-2 rounded-xl text-[10px] font-bold transition-all uppercase border border-white/10 hover:border-indigo-400 shadow-lg hover:shadow-indigo-500/20"
                        >
                          Share Proof
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-32 text-center">
                      <div className="flex flex-col items-center gap-5">
                          {loading ? (
                            <>
                              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-slate-500 italic tracking-[0.3em] text-xs uppercase animate-pulse">Synchronizing with Mina Ledger...</p>
                            </>
                          ) : (
                            <p className="text-slate-600 italic tracking-[0.2em] text-xs uppercase italic font-bold">No active proofs detected on this address.</p>
                          )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <footer className="mt-12 text-center border-t border-white/5 pt-8">
           <p className="text-[9px] text-slate-700 tracking-[0.5em] uppercase font-bold">
             Immutable Data Integrity Powered by Zero Knowledge Proofs
           </p>
        </footer>
      </div>
    </div>
  );
}
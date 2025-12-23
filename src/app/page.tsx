"use client";
import React, { useState, useEffect, useCallback } from 'react';

export default function FuturisticDashboard() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Doğrulama State'leri
  const [textToVerify, setTextToVerify] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'fail'>('idle');

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('/api/mina', { cache: 'no-store' });
      if (!response.ok) throw new Error('Proxy API yanıt vermiyor');
      const result = await response.json();
      
      const rawData = result.data?.zkapps || result.data?.transactions || [];

      if (rawData.length > 0) {
        const formatted = rawData.map((item: any) => ({
          id: item.hash,
          // Hash'in kendisi veya memo içindeki hash
          memoHash: (item.zkappCommand?.memo || item.memo || "").trim(),
          source: (item.zkappCommand?.memo || item.memo || "").toLowerCase().includes('twitter') ? 'Twitter (X)' : 'WhatsApp / Web',
          date: item.dateTime ? new Date(item.dateTime).toLocaleString('tr-TR') : 'Pending',
          status: item.status === 'applied' ? 'VERIFIED' : 'PENDING',
          hash: item.hash
        }));
        setProofs(formatted);
      }
    } catch (e) {
      console.error("Dashboard error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Adli Doğrulama Fonksiyonu (SHA-256)
  const handleVerifyInquiry = async () => {
    if (!textToVerify) return;
    
    // Basit bir temizleme (boşlukları silme vb.)
    const cleanText = textToVerify.trim();
    
    // Tarayıcı yerel kripto kütüphanesini kullanarak hash alıyoruz
    const msgBuffer = new TextEncoder().encode(cleanText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 30);

    console.log("Input Hash:", inputHash);

    // Blockchain'den gelen kayıtlar arasında bu hash var mı?
    const match = proofs.find(p => p.memoHash.includes(inputHash));

    if (match) {
      setVerifyStatus('success');
    } else {
      setVerifyStatus('fail');
    }
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 20000); 
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-4 md:p-12 font-mono relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent)] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/10 pb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              OmniVerify <span className="text-indigo-500">Forensics</span>
            </h1>
            <p className="text-[10px] text-slate-500 tracking-[0.4em] mt-2 italic font-bold">IMMUTABLE TRUTH ON MINA PROTOCOL</p>
          </div>
          <div className="px-4 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_#6366f1]"></div>
            <span className="text-indigo-400 text-[10px] font-bold uppercase">Devnet Sync Active</span>
          </div>
        </header>

        {/* Adli Doğrulama Paneli (Yeni!) */}
        <div className="mb-12 p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl backdrop-blur-md">
          <h2 className="text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-4">Verification Gate / Adli Sorgulama</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <textarea 
              value={textToVerify}
              onChange={(e) => { setTextToVerify(e.target.value); setVerifyStatus('idle'); }}
              placeholder="Yapıştırın: Tweet metni, WhatsApp mesajı veya herhangi bir kanıt..."
              className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:border-indigo-500 outline-none transition-all min-h-[100px]"
            />
            <button 
              onClick={handleVerifyInquiry}
              className="md:w-48 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 uppercase text-xs tracking-widest"
            >
              Verify Integrity
            </button>
          </div>

          {/* Doğrulama Sonuç Mesajları */}
          {verifyStatus === 'success' && (
            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-bounce">
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest text-center">✅ MATCH FOUND! This content is exactly as notarized on blockchain.</p>
            </div>
          )}
          {verifyStatus === 'fail' && (
            <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <p className="text-rose-400 text-xs font-bold uppercase tracking-widest text-center">❌ NO MATCH! This content has been altered or not notarized.</p>
            </div>
          )}
        </div>

        {/* Canlı Akış Tablosu */}
        <div className="bg-[#111114]/80 border border-white/5 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-slate-500 bg-white/[0.03] uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="p-8">Origin</th>
                  <th className="p-8">Timestamp</th>
                  <th className="p-8">Security</th>
                  <th className="p-8">Proof Fingerprint (Memo)</th>
                  <th className="p-8 text-right">Explorer</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {proofs.length > 0 ? (
                  proofs.map((proof) => (
                    <tr key={proof.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-all group">
                      <td className="p-8 font-bold text-slate-300">
                         <span className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]"></span>
                            {proof.source}
                         </span>
                      </td>
                      <td className="p-8 text-slate-500 text-xs">{proof.date}</td>
                      <td className="p-8">
                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-lg uppercase">
                          {proof.status}
                        </span>
                      </td>
                      <td className="p-8 font-mono text-indigo-400 text-[10px] tracking-tighter">
                        {proof.memoHash}
                      </td>
                      <td className="p-8 text-right">
                        <a 
                          href={`https://minascan.io/devnet/tx/${proof.hash}`} 
                          target="_blank" 
                          className="bg-white/5 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-all border border-white/10"
                        >
                          View Link
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-32 text-center">
                       <p className="text-slate-600 animate-pulse text-[10px] tracking-widest uppercase italic">Initializing digital evidence vaults...</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
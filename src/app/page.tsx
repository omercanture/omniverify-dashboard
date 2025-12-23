"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function FuturisticDashboard() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Doğrulama State'leri
  const [textToVerify, setTextToVerify] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [verifiedProofData, setVerifiedProofData] = useState<any>(null);

  // Veri Çekme Fonksiyonu
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('/api/mina', { cache: 'no-store' });
      if (!response.ok) throw new Error('Proxy API yanıt vermiyor');
      const result = await response.json();
      
      const rawData = result.data?.zkapps || result.data?.transactions || [];

      if (rawData.length > 0) {
        const formatted = rawData.map((item: any) => ({
          id: item.hash,
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
    const cleanText = textToVerify.trim();
    
    const msgBuffer = new TextEncoder().encode(cleanText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Eklenti hash'in ilk 30 karakterini gönderdiği için burada da aynı kesimi yapıyoruz
    const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 30);

    const match = proofs.find(p => p.memoHash.includes(inputHash));

    if (match) {
      setVerifyStatus('success');
      setVerifiedProofData({ ...match, originalText: cleanText });
    } else {
      setVerifyStatus('fail');
      setVerifiedProofData(null);
    }
  };

  // PDF Raporu Oluşturma
  const downloadReport = () => {
    if (!verifiedProofData) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("OMNIVERIFY FORENSIC REPORT", 105, 20, { align: "center" });
    
    (doc as any).autoTable({
      startY: 35,
      head: [['Evidence Detail', 'Blockchain Data']],
      body: [
        ['Status', 'CRYPTOGRAPHICALLY VERIFIED'],
        ['Platform', verifiedProofData.source],
        ['Timestamp', verifiedProofData.date],
        ['Tx Hash', verifiedProofData.hash],
        ['ZK Fingerprint', verifiedProofData.memoHash],
      ],
      theme: 'grid'
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(14);
    doc.text("Verified Original Content:", 20, finalY + 15);
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(verifiedProofData.originalText, 170);
    doc.text(splitText, 20, finalY + 25);
    
    doc.save(`Forensic_Report_${verifiedProofData.hash.slice(0,8)}.pdf`);
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 20000); 
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-4 md:p-12 font-mono relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent)] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/10 pb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              OmniVerify <span className="text-indigo-500">Forensics</span>
            </h1>
            <p className="text-[10px] text-slate-500 tracking-[0.4em] mt-2 italic font-bold">DIGITAL EVIDENCE VAULT</p>
          </div>
          <div className="px-4 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_#6366f1]"></div>
            <span className="text-indigo-400 text-[10px] font-bold uppercase">Devnet Sync</span>
          </div>
        </header>

        {/* --- DOĞRULAMA PANELİ --- */}
        <div className="mb-12 p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl backdrop-blur-md">
          <h2 className="text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-4 text-center">Verification Gate / Adli Sorgulama</h2>
          <div className="flex flex-col gap-4">
            <textarea 
              value={textToVerify}
              onChange={(e) => { setTextToVerify(e.target.value); setVerifyStatus('idle'); }}
              placeholder="Yapıştırın: Tweet metni veya WhatsApp mesajı..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:border-indigo-500 outline-none transition-all min-h-[100px]"
            />
            <button 
              onClick={handleVerifyInquiry}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 uppercase text-xs tracking-widest"
            >
              Verify Content Integrity
            </button>
          </div>

          {verifyStatus === 'success' && (
            <div className="mt-4 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">✅ MATCH FOUND! Verified on Mina Ledger.</p>
              <button onClick={downloadReport} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase">
                📥 Download PDF Report
              </button>
            </div>
          )}
          {verifyStatus === 'fail' && (
            <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
              <p className="text-rose-400 text-xs font-bold uppercase tracking-widest">❌ NO MATCH FOUND! Content altered or not notarized.</p>
            </div>
          )}
        </div>

        {/* --- İŞLEM TABLOSU (GERİ GELDİ) --- */}
        <div className="bg-[#111114]/80 border border-white/5 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Notary Feed</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="p-8">Origin</th>
                  <th className="p-8">Timestamp</th>
                  <th className="p-8">Status</th>
                  <th className="p-8">ZK-Fingerprint</th>
                  <th className="p-8 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {proofs.length > 0 ? (
                  proofs.map((proof) => (
                    <tr key={proof.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-all group">
                      <td className="p-8 font-bold text-slate-300">{proof.source}</td>
                      <td className="p-8 text-slate-500 text-xs">{proof.date}</td>
                      <td className="p-8">
                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-lg uppercase">
                          {proof.status}
                        </span>
                      </td>
                      <td className="p-8 font-mono text-indigo-400 text-[10px] tracking-tighter opacity-70 group-hover:opacity-100">
                        {proof.memoHash.slice(0, 15)}...
                      </td>
                      <td className="p-8 text-right">
                        <a href={`https://minascan.io/devnet/tx/${proof.hash}`} target="_blank" className="text-slate-500 hover:text-white transition-colors text-xs underline underline-offset-4">
                          View
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-32 text-center text-slate-600 text-xs italic tracking-widest">
                      {loading ? "SEARCHING BLOCKCHAIN..." : "NO RECORDS FOUND"}
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
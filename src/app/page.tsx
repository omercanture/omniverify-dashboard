"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function FuturisticDashboard() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [textToVerify, setTextToVerify] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [verifiedProofData, setVerifiedProofData] = useState<any>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('/api/mina', { cache: 'no-store' });
      const result = await response.json();
      const rawData = result.data?.zkapps || result.data?.transactions || [];

      if (rawData.length > 0) {
        const formatted = rawData.map((item: any) => ({
          id: item.hash,
          memoHash: (item.zkappCommand?.memo || item.memo || "").trim(),
          source: (item.zkappCommand?.memo || item.memo || "").toLowerCase().includes('twitter') ? 'X.com' : 'Secure Web',
          date: item.dateTime ? new Date(item.dateTime).toLocaleString('tr-TR') : 'Synching...',
          status: item.status === 'applied' ? 'CERTIFIED' : 'PENDING',
          hash: item.hash
        }));
        setProofs(formatted);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  const handleVerifyInquiry = async () => {
    if (!textToVerify) return;
    const cleanText = textToVerify.trim();
    const msgBuffer = new TextEncoder().encode(cleanText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 30);

    const match = proofs.find(p => p.memoHash.includes(inputHash));
    if (match) {
      setVerifyStatus('success');
      setVerifiedProofData({ ...match, originalText: cleanText });
    } else {
      setVerifyStatus('fail');
    }
  };

  const downloadReport = () => {
    if (!verifiedProofData) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("OMNIVERIFY NOTARY CERTIFICATE", 105, 30, { align: "center" });
    doc.setFontSize(10);
    doc.text("UNIVERSAL DATA INTEGRITY PROTOCOL", 105, 38, { align: "center" });
    
    (doc as any).autoTable({
      startY: 50,
      head: [['Specification', 'Data Entry']],
      body: [
        ['Certificate Status', 'AUTHENTICATED'],
        ['Origin', verifiedProofData.source],
        ['Timestamp', verifiedProofData.date],
        ['Transaction ID', verifiedProofData.hash],
        ['ZK Fingerprint', verifiedProofData.memoHash],
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });
    doc.save(`OmniVerify_Cert_${verifiedProofData.hash.slice(0,8)}.pdf`);
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 20000); 
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-indigo-500/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {/* Modern Minimal Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-20 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-light tracking-[0.2em] text-white flex items-center gap-3">
              OMNI<span className="font-bold text-indigo-500">VERIFY</span>
            </h1>
            <p className="text-[10px] tracking-[0.6em] text-slate-500 uppercase mt-2">Universal Data Notary Protocol</p>
          </div>
          <div className="flex items-center gap-6 text-[10px] tracking-widest font-bold text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              MINA DEVNET
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <span className="opacity-50 text-white">v1.2.0</span>
          </div>
        </header>

        {/* Universal Inquiry Box (Sleek Design) */}
        <section className="mb-20">
          <div className="bg-gradient-to-b from-white/[0.05] to-transparent p-px rounded-[2rem] overflow-hidden">
            <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-[2rem] p-8 md:p-12">
              <div className="max-w-2xl mx-auto text-center mb-10">
                <h2 className="text-xl text-white font-medium mb-3 italic">Verify the World's Data</h2>
                <p className="text-sm text-slate-500 font-light leading-relaxed">
                  Paste any content to check its existence and integrity on the global immutable ledger.
                </p>
              </div>

              <div className="space-y-6">
                <textarea 
                  value={textToVerify}
                  onChange={(e) => { setTextToVerify(e.target.value); setVerifyStatus('idle'); }}
                  placeholder="Drop content here..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-slate-200 text-sm focus:border-indigo-500/50 outline-none transition-all min-h-[140px] resize-none placeholder:text-slate-700"
                />
                
                <div className="flex justify-center">
                  <button 
                    onClick={handleVerifyInquiry}
                    className="group relative px-12 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-transform active:scale-95"
                  >
                    <span className="relative z-10 text-xs tracking-[0.2em] uppercase">Authenticate Content</span>
                  </button>
                </div>
              </div>

              {verifyStatus === 'success' && (
                <div className="mt-10 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                  <span className="text-indigo-400 text-xs font-bold tracking-[0.2em] uppercase">✓ Integrity Confirmed</span>
                  <button onClick={downloadReport} className="text-[10px] text-white underline underline-offset-8 decoration-indigo-500 hover:text-indigo-400 transition-colors uppercase font-black">
                    Download Official Certificate
                  </button>
                </div>
              )}
              
              {verifyStatus === 'fail' && (
                <div className="mt-8 text-center text-rose-500 text-[10px] font-bold tracking-widest uppercase animate-pulse">
                  Unverified: Content has been altered or not recorded.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Minimalist Data Feed */}
        <section>
          <div className="flex justify-between items-end mb-8 px-4">
            <h3 className="text-xs font-bold tracking-[0.3em] text-slate-500 uppercase italic">Recent Ledger Entries</h3>
            <span className="text-[10px] text-slate-600 font-mono italic">Total: {proofs.length}</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {proofs.length > 0 ? (
              proofs.map((proof) => (
                <div key={proof.id} className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 p-6 rounded-2xl transition-all flex flex-wrap md:flex-nowrap justify-between items-center gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{proof.source}</p>
                    <p className="text-white text-sm font-medium tracking-tight">Proof ID: {proof.hash.slice(0, 16)}...</p>
                    <p className="text-[10px] text-slate-600">{proof.date}</p>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden md:block">
                      <p className="text-[9px] text-slate-600 uppercase mb-1">ZK Fingerprint</p>
                      <p className="text-[10px] font-mono text-slate-400">{proof.memoHash.slice(0, 20)}</p>
                    </div>
                    <a 
                      href={`https://minascan.io/devnet/tx/${proof.hash}`} 
                      target="_blank"
                      className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-64 flex items-center justify-center border border-dashed border-white/5 rounded-3xl">
                <span className="text-[10px] tracking-[0.4em] text-slate-700 animate-pulse uppercase">Syncing Global Registry...</span>
              </div>
            )}
          </div>
        </section>

        <footer className="mt-32 text-center">
          <p className="text-[9px] text-slate-800 tracking-[1em] uppercase">Zero Knowledge Protocol • OmniVerify 2025</p>
        </footer>
      </div>
    </div>
  );
}
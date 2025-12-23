"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function FuturisticDashboard() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State: Verification
  const [textToVerify, setTextToVerify] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [verifiedProofData, setVerifiedProofData] = useState<any>(null);

  // State: File Notary
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);

  // Blockchain Data Sync
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('/api/mina', { cache: 'no-store' });
      const result = await response.json();
      const rawData = result.data?.zkapps || result.data?.transactions || [];

      if (rawData.length > 0) {
        const formatted = rawData.map((item: any) => ({
          id: item.hash,
          memoHash: (item.zkappCommand?.memo || item.memo || "").trim(),
          source: (item.zkappCommand?.memo || item.memo || "").toLowerCase().includes('twitter') ? 'X.com Verified' : 
                  (item.zkappCommand?.memo || item.memo || "").toLowerCase().includes('whatsapp') ? 'WhatsApp Secure' : 'Universal Entry',
          date: item.dateTime ? new Date(item.dateTime).toLocaleString('tr-TR') : 'Syncing...',
          status: item.status === 'applied' ? 'CERTIFIED' : 'PENDING',
          hash: item.hash
        }));
        setProofs(formatted);
      }
    } catch (e) { console.error("Sync Error:", e); } finally { setLoading(false); }
  }, []);

  // File Hashing (Tapu, Ehliyet, PDF vb.)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsHashing(true);
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 30);
    
    setFileHash(hashHex);
    setIsHashing(false);
  };

  // Content Authentication
  const handleVerifyInquiry = async () => {
    if (!textToVerify) return;
    const cleanText = textToVerify.trim();
    const msgBuffer = new TextEncoder().encode(cleanText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 30);

    const match = proofs.find(p => p.memoHash === inputHash);
    if (match) {
      setVerifyStatus('success');
      setVerifiedProofData({ ...match, originalText: cleanText });
    } else {
      setVerifyStatus('fail');
    }
  };

  // Official Certificate Generation
  const downloadReport = () => {
    if (!verifiedProofData) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("OMNIVERIFY NOTARY CERTIFICATE", 105, 30, { align: "center" });
    doc.setFontSize(10);
    doc.text("SECURED BY MINA PROTOCOL ZERO-KNOWLEDGE PROOFS", 105, 38, { align: "center" });
    
    (doc as any).autoTable({
      startY: 50,
      head: [['Specification', 'Verified Ledger Data']],
      body: [
        ['Verification Status', 'AUTHENTICATED & IMMUTABLE'],
        ['Data Source', verifiedProofData.source],
        ['Timestamp', verifiedProofData.date],
        ['Blockchain Tx Hash', verifiedProofData.hash],
        ['ZK Fingerprint (Memo)', verifiedProofData.memoHash],
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.text("Verified Content Fingerprint Match:", 20, finalY + 15);
    doc.setFontSize(8);
    doc.text(verifiedProofData.memoHash, 20, finalY + 22);
    
    doc.save(`OmniVerify_Certificate_${verifiedProofData.hash.slice(0,8)}.pdf`);
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 20000); 
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-light tracking-[0.2em] text-white">
              OMNI<span className="font-bold text-indigo-500">VERIFY</span>
            </h1>
            <p className="text-[10px] tracking-[0.6em] text-slate-500 uppercase mt-2">The World's Immutable Notary</p>
          </div>
          <div className="flex items-center gap-6 text-[10px] tracking-widest font-bold text-slate-400">
            <div className="flex items-center gap-2 text-indigo-400">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              MINA NETWORK ACTIVE
            </div>
          </div>
        </header>

        {/* SECTION 1: DOCUMENT NOTARY (Tapu, Ehliyet, Pasaport) */}
        <section className="mb-12 group">
          <div className="bg-gradient-to-r from-indigo-500/10 to-transparent p-px rounded-3xl overflow-hidden border border-white/5 backdrop-blur-3xl">
            <div className="bg-[#0a0a0a]/60 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-md">
                <h2 className="text-lg text-white font-semibold mb-2 italic">Physical Document Notary</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload your Title Deeds, ID Cards, or Legal Documents to generate a ZK-Fingerprint for blockchain notarization.
                </p>
              </div>
              <div className="w-full md:w-auto text-center">
                <input type="file" onChange={handleFileUpload} className="hidden" id="docUpload" />
                <label htmlFor="docUpload" className="inline-block px-10 py-4 bg-white text-black text-[10px] font-black uppercase rounded-full cursor-pointer hover:bg-indigo-500 hover:text-white transition-all">
                  {isHashing ? "Hashing..." : "Secure Upload"}
                </label>
                {fileHash && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[9px] text-indigo-400 mb-1 font-mono uppercase tracking-tighter">Copy this fingerprint to your Wallet Memo:</p>
                    <code className="text-[11px] bg-white/5 px-3 py-1 rounded-lg text-white border border-white/10">{fileHash}</code>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: VERIFICATION GATE */}
        <section className="mb-20">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-500/5">
            <div className="text-center mb-10">
              <h2 className="text-xl text-white font-medium italic">Authenticate Reality</h2>
              <p className="text-sm text-slate-500 mt-2 font-light">Enter the precise evidence package to verify its integrity.</p>
            </div>

            <div className="space-y-6">
              <textarea 
                value={textToVerify}
                onChange={(e) => { setTextToVerify(e.target.value); setVerifyStatus('idle'); }}
                placeholder="Paste the evidence string (Author | Content | URL)..."
                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-slate-200 text-sm focus:border-indigo-500/50 outline-none transition-all min-h-[160px] resize-none"
              />
              <div className="flex justify-center">
                <button onClick={handleVerifyInquiry} className="px-16 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition-transform active:scale-95 uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20">
                  Verify Fingerprint Match
                </button>
              </div>
            </div>

            {verifyStatus === 'success' && (
              <div className="mt-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                <span className="text-emerald-400 text-xs font-bold tracking-[0.2em] uppercase">✓ Record Authenticated on Ledger</span>
                <button onClick={downloadReport} className="text-[10px] text-white underline underline-offset-8 hover:text-emerald-400 transition-colors uppercase font-black">
                  Get Official PDF Certificate
                </button>
              </div>
            )}
            {verifyStatus === 'fail' && (
              <p className="mt-8 text-center text-rose-500 text-[10px] font-bold tracking-widest uppercase animate-pulse">Data Mismatch: Content has been altered.</p>
            )}
          </div>
        </section>

        {/* SECTION 3: LIVE LEDGER */}
        <section>
          <div className="flex justify-between items-center mb-8 px-4">
            <h3 className="text-xs font-bold tracking-[0.3em] text-slate-500 uppercase">Global Registry Feed</h3>
            <div className="h-px flex-1 mx-6 bg-white/5"></div>
            <span className="text-[10px] text-indigo-500 font-mono tracking-tighter">SYNCED</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {proofs.length > 0 ? (
              proofs.map((proof) => (
                <div key={proof.id} className="group bg-[#0d0d0f] border border-white/5 p-6 rounded-2xl transition-all hover:border-indigo-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-indigo-500">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-indigo-500 font-black tracking-widest uppercase">{proof.source}</p>
                      <p className="text-white text-xs font-mono">{proof.memoHash}</p>
                      <p className="text-[9px] text-slate-600 uppercase italic">{proof.date}</p>
                    </div>
                  </div>
                  <a href={`https://minascan.io/devnet/tx/${proof.hash}`} target="_blank" className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </a>
                </div>
              ))
            ) : (
              <div className="py-20 text-center border border-dashed border-white/5 rounded-3xl">
                <p className="text-[10px] text-slate-700 uppercase tracking-[0.5em] animate-pulse italic">Connecting to Mina Ledger...</p>
              </div>
            )}
          </div>
        </section>

        <footer className="mt-32 pb-12 text-center border-t border-white/5 pt-12">
          <p className="text-[9px] text-slate-700 tracking-[1em] uppercase">OmniVerify Protocol • Est. 2025</p>
        </footer>
      </div>
    </div>
  );
}
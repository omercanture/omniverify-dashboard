"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

declare global {
  interface Window {
    mina?: any;
  }
}

export default function FuturisticDashboard() {
  const [allProofs, setAllProofs] = useState<any[]>([]);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [textToVerify, setTextToVerify] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [verifiedProofData, setVerifiedProofData] = useState<any>(null);

  const [fileHash, setFileHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);

  const connectWallet = async () => {
    if (typeof window.mina !== 'undefined') {
      try {
        const accounts = await window.mina.requestAccounts();
        setUserAddress(accounts[0]);
      } catch (e) {
        console.error("Wallet connection error", e);
      }
    } else {
      alert("Please install Auro Wallet to see your personal vault.");
    }
  };

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('/api/mina', { cache: 'no-store' });
      const result = await response.json();
      const rawData = result.data?.transactions || [];

      if (rawData.length > 0) {
        const formatted = rawData.map((item: any) => ({
          id: item.hash,
          memoHash: (item.memo || "").trim(),
          source: (item.memo || "").toLowerCase().includes('twitter') ? 'X.com Verified' : 'Secure Web',
          date: item.dateTime ? new Date(item.dateTime).toLocaleString('tr-TR') : 'Syncing...',
          status: item.status === 'applied' ? 'CERTIFIED' : 'PENDING',
          hash: item.hash,
          from: item.from || "" 
        }));
        
        // Veriyi state'e kaydediyoruz
        setAllProofs(formatted);
      }
    } catch (e) { 
      console.error("Sync Error:", e); 
    } finally { 
      setLoading(false); 
    }
  }, []);

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

  const handleVerifyInquiry = async () => {
    if (!textToVerify) return;
    const cleanText = textToVerify.trim();
    const msgBuffer = new TextEncoder().encode(cleanText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 30);

    const match = allProofs.find(p => p.memoHash === inputHash);
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
    (doc as any).autoTable({
      startY: 50,
      head: [['Specification', 'Ledger Data']],
      body: [
        ['Status', 'AUTHENTICATED'],
        ['Source', verifiedProofData.source],
        ['Timestamp', verifiedProofData.date],
        ['Tx Hash', verifiedProofData.hash],
        ['Fingerprint', verifiedProofData.memoHash],
      ],
      theme: 'grid'
    });
    doc.save(`OmniVerify_Cert.pdf`);
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 20000); 
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  // --- HESAPLAMALAR BURADA OLMALI ---
  // Sadece onaylanmış (applied) olanları filtrele
  const certifiedOnly = allProofs.filter(p => p.status === 'CERTIFIED');

  // Kişisel Kasa: Adres eşleşenleri filtrele
  const myProofs = certifiedOnly.filter(p => 
    userAddress && p.from && p.from.toLowerCase() === userAddress.toLowerCase()
  );

  // Global Akış: Son 5 onaylanmış işlem
  const globalFeed = certifiedOnly.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-indigo-500/30 pb-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[5%] right-[-5%] w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-12 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-light tracking-[0.2em] text-white">
              OMNI<span className="font-bold text-indigo-500">VERIFY</span>
            </h1>
            <p className="text-[10px] tracking-[0.6em] text-slate-500 uppercase mt-2 italic font-bold">Universal Immutable Ledger</p>
          </div>
          
          <button 
            onClick={connectWallet}
            className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
          >
            {userAddress ? `${userAddress.slice(0,6)}...${userAddress.slice(-4)}` : "Connect Auro Wallet"}
          </button>
        </header>

        {/* TOP SECTION: PERSONAL VAULT */}
        {userAddress && (
          <section className="mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-sm font-black tracking-[0.4em] text-indigo-400 uppercase italic">Personal Vault</h2>
              <div className="h-px flex-1 bg-indigo-500/20"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProofs.length > 0 ? (
                myProofs.map((proof) => (
                  <div key={proof.id} className="bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] hover:border-indigo-500/50 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                       <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <p className="text-[9px] text-indigo-500 font-bold uppercase mb-2">{proof.source}</p>
                    <p className="text-white text-xs font-mono mb-4 truncate">{proof.memoHash}</p>
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] text-slate-600">{proof.date}</span>
                      <a href={`https://minascan.io/devnet/tx/${proof.hash}`} target="_blank" className="text-[10px] text-indigo-400 hover:text-white underline font-bold uppercase">Details</a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[2rem]">
                  <p className="text-xs text-slate-600 uppercase tracking-widest italic font-bold">Your vault is empty. Notarize content to see them here.</p>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-6 italic">Authenticate Content</h3>
            <textarea 
              value={textToVerify}
              onChange={(e) => { setTextToVerify(e.target.value); setVerifyStatus('idle'); }}
              placeholder="Paste Author | Content | URL..."
              className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-xs mb-4 outline-none focus:border-indigo-500 transition-all min-h-[100px] resize-none"
            />
            <button onClick={handleVerifyInquiry} className="w-full py-4 bg-indigo-600 text-white text-[10px] font-black tracking-[0.2em] rounded-full uppercase hover:bg-indigo-500 transition-all">Verify Integrity</button>
            {verifyStatus === 'success' && (
               <button onClick={downloadReport} className="w-full mt-4 py-3 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold rounded-full border border-emerald-500/20 uppercase animate-pulse">Download Official Certificate</button>
            )}
          </div>

          <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center">
            <h3 className="text-indigo-400 text-sm font-bold uppercase tracking-widest mb-4 italic">Asset Notary</h3>
            <p className="text-[10px] text-slate-500 mb-6 leading-relaxed uppercase font-bold tracking-tighter">Mina ZK-Notarization for Deeds, IDs, and Physical Assets.</p>
            <input type="file" onChange={handleFileUpload} className="hidden" id="fileIn" />
            <label htmlFor="fileIn" className="px-10 py-4 bg-white text-black text-[10px] font-black uppercase rounded-full cursor-pointer hover:bg-indigo-500 hover:text-white transition-all">
              {isHashing ? "Generating ZK-Hash..." : "Select Document"}
            </label>
            {fileHash && <code className="mt-4 text-[9px] text-white bg-black/40 p-2 rounded-lg border border-white/5">{fileHash}</code>}
          </div>
        </div>

        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-sm font-black tracking-[0.4em] text-slate-500 uppercase italic">Global Ledger Feed</h2>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>
          
          <div className="space-y-4">
            {globalFeed.length > 0 ? globalFeed.map((proof) => (
              <div key={proof.id} className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 p-5 rounded-2xl flex items-center justify-between transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${proof.status === 'CERTIFIED' ? 'bg-indigo-500 shadow-[0_0_8px_#6366f1]' : 'bg-amber-500 animate-pulse'}`}></div>
                  <div>
                    <p className="text-[10px] text-white font-bold tracking-tight">{proof.memoHash.slice(0, 30)}...</p>
                    <p className="text-[9px] text-slate-600 uppercase font-bold">{proof.source} • {proof.date}</p>
                  </div>
                </div>
                <a href={`https://minascan.io/devnet/tx/${proof.hash}`} target="_blank" className="p-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
              </div>
            )) : (
              <p className="text-center py-10 text-[10px] text-slate-600 uppercase tracking-widest animate-pulse">Syncing Universal Ledger...</p>
            )}
          </div>
        </section>

        <footer className="mt-32 text-center">
          <p className="text-[9px] text-slate-800 tracking-[1em] uppercase">OmniVerify Protocol • Secure Truth 2025</p>
        </footer>
      </div>
    </div>
  );
}
"use client";
import React, { useState, useEffect } from 'react';

export default function FuturisticDashboard() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [walletAddress, setWalletAddress] = useState("Bağlı Değil");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMinaEvents = async () => {
      try {
        const { Mina, PublicKey, fetchEvents } = await import('o1js');
        const Network = Mina.Network('https://api.minascan.io/node/devnet/v1/graphql');
        Mina.setActiveInstance(Network);
        
        const zkAppAddress = 'B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v';
        const fetchedEvents = await fetchEvents({ publicKey: zkAppAddress });
        
        const formattedProofs = fetchedEvents.flatMap((eventGroup) => 
          eventGroup.events.map((eventData, i) => ({
            id: `${eventGroup.blockHash}-${i}`,
            source: 'WhatsApp / Web',
            category: 'ZK-Attestation',
            date: new Date().toLocaleDateString(),
            status: 'VERIFIED',
            hash: eventData.data[0]?.toString() || "Unknown"
          }))
        );

        setProofs(formattedProofs);
        setLoading(false);
      } catch (e) {
        console.error("Event çekme hatası:", e);
        setLoading(false);
      }
    };

    fetchMinaEvents();
    const interval = setInterval(fetchMinaEvents, 30000); 
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async () => {
    if (typeof (window as any).mina !== 'undefined') {
      const accounts = await (window as any).mina.requestAccounts();
      setWalletAddress(accounts[0]);
    }
  };

  // Paylaşım Fonksiyonu
  const shareOnTwitter = (proofHash: string) => {
    const message = `I just verified my data privacy using OmniVerify on @MinaProtocol! 🛡️%0A%0AProof Hash: ${proofHash.slice(0,20)}...%0A%0AVerify here: ${window.location.href}`;
    window.open(`https://twitter.com/intent/tweet?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-6 font-mono relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-12 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <span className="text-white font-bold text-xl">Ω</span>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase">Omniverify Protocol</h1>
              <p className="text-[9px] text-indigo-400 tracking-[0.3em]">DECENTRALIZED NOTARY LAYER</p>
            </div>
          </div>
          
          <button 
            onClick={connectWallet}
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2 rounded-md transition-all">
            <span className="text-indigo-400 font-bold uppercase text-xs">
              {walletAddress === "Bağlı Değil" ? "Connect Wallet" : `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}`}
            </span>
          </button>
        </header>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] text-slate-500 border-b border-white/5 uppercase tracking-[0.2em]">
                <th className="p-6">Origin Source</th>
                <th className="p-6">Type</th>
                <th className="p-6">Timestamp</th>
                <th className="p-6">Status</th>
                <th className="p-6">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {proofs.length > 0 ? (
                proofs.map((proof) => (
                  <tr key={proof.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                    <td className="p-6 font-bold text-slate-300">{proof.source}</td>
                    <td className="p-6 text-slate-500 italic">{proof.category}</td>
                    <td className="p-6 text-slate-500">{proof.date}</td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black rounded tracking-widest">
                        {proof.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <button 
                        onClick={() => shareOnTwitter(proof.hash)}
                        className="opacity-40 group-hover:opacity-100 transition-opacity bg-indigo-500/20 hover:bg-indigo-500 text-white px-4 py-1 rounded text-[10px] font-bold uppercase"
                      >
                        Share Proof
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-600 italic tracking-widest">
                    {loading ? "SCANNING MINA BLOCKCHAIN..." : "NO PROOFS FOUND ON-CHAIN."}
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
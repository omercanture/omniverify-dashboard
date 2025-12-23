"use client";
import React, { useState, useEffect } from 'react';

export default function FuturisticDashboard() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [walletAddress, setWalletAddress] = useState("Bağlı Değil");
  const [loading, setLoading] = useState(true);

  // 1. Mina Olaylarını Çekme Mantığı (Client-side Only)
  useEffect(() => {
    const fetchMinaEvents = async () => {
      try {
        // o1js'i dinamik olarak yüklüyoruz (Vercel Build hatasını çözer)
        const { Mina, PublicKey, fetchEvents } = await import('o1js');
        
        // Devnet'e bağlan
        const Network = Mina.Network('https://api.minascan.io/node/devnet/v1/graphql');
        Mina.setActiveInstance(Network);
        
        const zkAppAddress = 'B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v';

        // Kontrattaki olayları (events) çek
        const fetchedEvents = await fetchEvents({ publicKey: zkAppAddress });
        
        // Olayları tablo formatına dönüştürelim
        const formattedProofs = fetchedEvents.flatMap((eventGroup) => 
          eventGroup.events.map((eventData, i) => ({
            id: `${eventGroup.blockHash}-${i}`,
            source: 'Verified Web Source',
            category: 'ZK-Attestation',
            date: new Date().toLocaleDateString(),
            status: 'VERIFIED',
            hash: eventData.data[0]?.toString().slice(0, 20) + "..."
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

  // 2. Cüzdan Bağlantısı
  const connectWallet = async () => {
    if (typeof (window as any).mina !== 'undefined') {
      const accounts = await (window as any).mina.requestAccounts();
      setWalletAddress(accounts[0]);
    }
  };

  // 3. Arayüz (Görsel Bölüm)
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-6 font-mono relative overflow-hidden">
      {/* Dekoratif Işıklar */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-12 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">Ω</span>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase">Omniverify Protocol</h1>
          </div>
          
          <button 
            onClick={connectWallet}
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2 rounded-md transition-all">
            <span className="text-indigo-400 font-bold uppercase text-xs">
              {walletAddress === "Bağlı Değil" ? "Cüzdanı Bağla" : `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}`}
            </span>
          </button>
        </header>

        {/* Tablo */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] text-slate-500 border-b border-white/5 uppercase tracking-widest">
                <th className="p-6">Origin</th>
                <th className="p-6">Type</th>
                <th className="p-6">Timestamp</th>
                <th className="p-6">Status</th>
                <th className="p-6">Proof Data</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {proofs.length > 0 ? (
                proofs.map((proof) => (
                  <tr key={proof.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="p-6 font-bold">{proof.source}</td>
                    <td className="p-6 text-slate-400">{proof.category}</td>
                    <td className="p-6 text-slate-500">{proof.date}</td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black rounded">
                        {proof.status}
                      </span>
                    </td>
                    <td className="p-6 font-mono text-slate-600">{proof.hash}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-600 italic">
                    {loading ? "Mina Ağı Dinleniyor (WASM)..." : "Aktif kanıt bulunamadı. Eklentiyi kullanın."}
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
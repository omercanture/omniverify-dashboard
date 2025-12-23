"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function FuturisticDashboard() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [textToVerify, setTextToVerify] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [verifiedProofData, setVerifiedProofData] = useState<any>(null); // PDF için eşleşen veriyi saklar

  // ... (fetchTransactions fonksiyonu aynı kalıyor) ...

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
      setVerifiedProofData(null);
    }
  };

  // PDF RAPORU OLUŞTURMA FONKSİYONU
  const downloadReport = () => {
    if (!verifiedProofData) return;

    const doc = new jsPDF();
    const date = new Date().toLocaleString();

    // Başlık ve Stil
    doc.setFontSize(22);
    doc.setTextColor(63, 81, 181); // Indigo rengi
    doc.text("OMNIVERIFY FORENSIC REPORT", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report Generated: ${date}`, 105, 28, { align: "center" });
    doc.line(20, 32, 190, 32);

    // Kanıt Özeti
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("1. Evidence Verification Summary", 20, 45);
    
    (doc as any).autoTable({
      startY: 50,
      head: [['Field', 'Value']],
      body: [
        ['Status', 'VERIFIED / VALID'],
        ['Source Platform', verifiedProofData.source],
        ['Blockchain Timestamp', verifiedProofData.date],
        ['Transaction Hash', verifiedProofData.hash],
        ['Mina Protocol Memo (Hash)', verifiedProofData.memoHash],
      ],
      theme: 'striped',
      headStyles: { fillStyle: [63, 81, 181] }
    });

    // Orijinal Metin
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.text("2. Notarized Content Content", 20, finalY + 15);
    doc.setFontSize(10);
    doc.setFont("courier", "normal");
    const splitText = doc.splitTextToSize(verifiedProofData.originalText, 170);
    doc.text(splitText, 20, finalY + 25);

    // Alt Bilgi
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text("This document serves as a cryptographic proof of content integrity secured by the Mina Protocol.", 105, 285, { align: "center" });

    doc.save(`OmniVerify_Report_${verifiedProofData.hash.slice(0, 8)}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-4 md:p-12 font-mono relative overflow-x-hidden">
      {/* ... (Önceki Header kısımları aynı) ... */}

      <div className="max-w-6xl mx-auto relative">
         {/* ... (Header ve Diğerleri) ... */}

        <div className="mb-12 p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl backdrop-blur-md">
          <h2 className="text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-4">Verification Gate / Adli Sorgulama</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <textarea 
              value={textToVerify}
              onChange={(e) => { setTextToVerify(e.target.value); setVerifyStatus('idle'); }}
              placeholder="Yapıştırın: Tweet metni, WhatsApp mesajı..."
              className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:border-indigo-500 outline-none transition-all min-h-[100px]"
            />
            <button 
              onClick={handleVerifyInquiry}
              className="md:w-48 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 uppercase text-xs tracking-widest"
            >
              Verify Integrity
            </button>
          </div>

          {verifyStatus === 'success' && (
            <div className="mt-4 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in zoom-in duration-300">
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
                ✅ MATCH FOUND! Content integrity is confirmed on-chain.
              </p>
              <button 
                onClick={downloadReport}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2"
              >
                📥 Download Forensic Report (PDF)
              </button>
            </div>
          )}
          
          {/* ... (Fail mesajı aynı) ... */}
        </div>

        {/* ... (Tablo kısmı aynı) ... */}
      </div>
    </div>
  );
}
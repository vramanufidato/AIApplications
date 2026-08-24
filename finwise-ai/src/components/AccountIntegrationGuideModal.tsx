import React from 'react';
import { 
  X, 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  FileCheck, 
  CreditCard, 
  Sparkles,
  AlertTriangle,
  Layers
} from 'lucide-react';

interface AccountIntegrationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskAi: (prompt: string) => void;
}

export const AccountIntegrationGuideModal: React.FC<AccountIntegrationGuideModalProps> = ({
  isOpen,
  onClose,
  onAskAi,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">SSO, DigiLocker & Open Finance Integration Advisory</h2>
              <p className="text-xs text-slate-500">Security Architecture • Paperless KYC • UPI Autopay • Account Aggregators</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs leading-relaxed">
          {/* Introduction Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-xl space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              Unified Portfolio Tracking without Sharing Sensitive Passwords
            </h3>
            <p className="text-slate-600">
              Modern Indian fintech utilizes RBI and SEBI-regulated digital public infrastructure to aggregate your bank accounts, mutual funds, and demat accounts securely through consent-driven tokenization.
            </p>
          </div>

          {/* 4 Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pillar 1: DigiLocker KYC */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  <FileCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">1. DigiLocker for Instant KYC</h4>
              </div>
              <p className="text-slate-600">
                Allows SEBI-registered brokers and AMCs to verify your Aadhaar, PAN, and address digitally in under 60 seconds with zero physical paperwork and cryptographic authenticity.
              </p>
              <div className="bg-slate-50 p-2 rounded text-[11px] text-slate-500 font-mono">
                API Standard: MeitY DigiLocker OAuth 2.0 Endpoint
              </div>
            </div>

            {/* Pillar 2: UPI 2.0 AutoPay */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">2. UPI AutoPay for SIP Mandates</h4>
              </div>
              <p className="text-slate-600">
                Set up recurring monthly SIP debits directly via BHIM/Google Pay/PhonePe with instant authorization. No physical NACH/e-mandate forms, and you can pause or cancel anytime.
              </p>
              <div className="bg-slate-50 p-2 rounded text-[11px] text-slate-500 font-mono">
                NPCI UPI 2.0 Recurring Mandate Specification
              </div>
            </div>

            {/* Pillar 3: Account Aggregator (AA) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">3. RBI Account Aggregator (AA)</h4>
              </div>
              <p className="text-slate-600">
                Connect bank accounts and NSDL/CDSL CAS demat holdings using RBI-licensed AAs (Anumati, OneMoney, Finvu). Data is encrypted end-to-end; AA cannot view or store your transaction data.
              </p>
              <div className="bg-slate-50 p-2 rounded text-[11px] text-slate-500 font-mono">
                ReBIT Financial Information Provider (FIP/FIU) Framework
              </div>
            </div>

            {/* Pillar 4: Broker Smart APIs */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">4. Broker Smart APIs & Open Banking</h4>
              </div>
              <p className="text-slate-600">
                Platforms like Angel One Smart API, Zerodha Kite Connect, or Kotak Open Banking allow programmatic read-only access to portfolio net worth without granting trading or withdrawal permissions.
              </p>
              <div className="bg-slate-50 p-2 rounded text-[11px] text-slate-500 font-mono">
                Read-only Scope Tokens • Strict IP Whitelisting
              </div>
            </div>
          </div>

          {/* Security Best Practices Checklist */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              FinWise Security & Hygiene Best Practices:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="font-semibold text-white block mb-1">🔐 Never Share OTPs or Master PINs</span>
                <span className="text-slate-300">SEBI-compliant apps will never request your banking password or UPI MPIN in chat or over phone.</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="font-semibold text-white block mb-1">🔑 Mandatory Two-Factor Auth (2FA)</span>
                <span className="text-slate-300">Always enforce biometric or Authenticator App TOTP on all your broker and banking logins.</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="font-semibold text-white block mb-1">🛡️ Verify Broker SEBI Registration</span>
                <span className="text-slate-300">Ensure any third-party aggregator holds a valid SEBI / RBI registration certificate.</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="font-semibold text-white block mb-1">⚙️ Revocable Permissions</span>
                <span className="text-slate-300">You can revoke data access grants at any moment via your AA dashboard or DigiLocker portal.</span>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                onAskAi('How can I safely connect my bank and mutual fund portfolio using Account Aggregators and DigiLocker? What are the step-by-step precautions?');
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask FinWise AI for Full Integration Advisory</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

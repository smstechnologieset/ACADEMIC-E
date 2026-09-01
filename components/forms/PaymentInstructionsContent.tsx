"use client";

import React, { useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Copy,
  Check,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Building2,
  ArrowRight,
  Info,
  X,
  Smartphone,
  CreditCard,
  Receipt,
  CheckCircle2,
} from "lucide-react";
import { CmsSiteSettings, PaymentMethod } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatBytes } from "@/lib/utils";
import { submitPaymentProofAction } from "@/app/actions/application-actions";

interface PaymentInstructionsProps {
  dynamicSettings?: CmsSiteSettings;
}

export function PaymentInstructionsContent({ dynamicSettings }: PaymentInstructionsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const applicationId = searchParams.get("ref") || "";

  const defaultMethods: PaymentMethod[] = [
    {
      id: "pm-1",
      name: "Telebirr SuperApp / USSD",
      type: "mobile_money",
      accountNumber: "0911234567",
      accountName: "Academic Excellence Ethiopia",
      instructions: "Transfer to merchant/individual phone number via Telebirr or *127#.",
      is_active: true,
    },
    {
      id: "pm-2",
      name: "Commercial Bank of Ethiopia (CBE)",
      type: "bank_account",
      accountNumber: "1000123456789",
      accountName: "Academic Excellence Admissions",
      instructions: "Transfer via CBE Mobile Banking, CBE Birr, or counter deposit.",
      is_active: true,
    },
    {
      id: "pm-3",
      name: "CBE Birr Wallet",
      type: "mobile_money",
      accountNumber: "0911234567",
      accountName: "Academic Excellence Ethiopia",
      instructions: "Transfer via CBE Birr mobile app or USSD *847# with your Reference ID.",
      is_active: true,
    },
    {
      id: "pm-4",
      name: "Awash Bank",
      type: "bank_account",
      accountNumber: "01320876543210",
      accountName: "Academic Excellence Intake",
      instructions: "Transfer via Awash Birr Pro or local branch deposit.",
      is_active: true,
    },
  ];

  const activeMethods = (dynamicSettings?.paymentMethods || defaultMethods).filter((m) => m.is_active !== false);
  const feeDisplay = dynamicSettings?.applicationFee || "3,500 ETB";

  const [selectedMethodId, setSelectedMethodId] = useState<string>(activeMethods[0]?.id || "");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form submission state
  const [chosenPaymentMethod, setChosenPaymentMethod] = useState<string>(activeMethods[0]?.name || "Telebirr");
  const [transactionRef, setTransactionRef] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeMethod = activeMethods.find((m) => m.id === selectedMethodId) || activeMethods[0];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSelectMethodTab = (m: PaymentMethod) => {
    setSelectedMethodId(m.id);
    setChosenPaymentMethod(m.name);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0]);
    }
  };

  const validateFile = (selectedFile: File) => {
    setFileError(null);
    const validExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(ext)) {
      setFileError("Only JPG, PNG or PDF receipts are allowed.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFileError("File exceeds 5MB size limit.");
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setFileError("Please attach a screenshot or deposit slip of your payment transfer.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("applicationId", applicationId);
    formData.append("paymentMethod", chosenPaymentMethod);
    formData.append("transactionRef", transactionRef);
    formData.append("paymentProof", file);

    const result = await submitPaymentProofAction(formData);
    setIsSubmitting(false);

    if (result.success) {
      router.push(`/confirmation?ref=${applicationId}`);
    } else {
      setErrorMessage(result.error || "Failed to submit receipt. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Application Reference Banner */}
      {applicationId && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-blue-800 block font-bold uppercase tracking-wider">
                Application Reference ID
              </span>
              <span className="font-mono text-base font-bold text-slate-900 tracking-wider">
                {applicationId}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(applicationId, "ref")}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-white border border-blue-200 text-blue-800 hover:bg-blue-100/50 flex items-center space-x-1.5 shadow-sm"
          >
            {copiedField === "ref" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedField === "ref" ? "Copied" : "Copy ID"}</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Payment Selector & Details */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-7 bg-white border-slate-200 shadow-md space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-blue-600">
                <Smartphone className="w-5 h-5" />
                <h2 className="text-lg font-bold text-slate-900">Select Payment Method</h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                Fee: {feeDisplay}
              </span>
            </div>

            {/* Method Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
              {activeMethods.map((m) => {
                const isSelected = selectedMethodId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMethodTab(m)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start space-x-2.5 ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-600 ring-2 ring-blue-100 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {m.type === "mobile_money" ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <Building2 className="w-4 h-4" />
                      )}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{m.name}</h4>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {m.type === "mobile_money" ? "Mobile Money / USSD" : "Bank Transfer"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Method Details Box */}
            {activeMethod && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-100 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                    {activeMethod.name}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Verified Account
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">
                      {activeMethod.type === "mobile_money" ? "Phone / Merchant Number:" : "Account Number:"}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-black text-slate-900">
                        {activeMethod.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(activeMethod.accountNumber, "acc")}
                        className="p-1 text-slate-500 hover:text-blue-600"
                        title="Copy number"
                      >
                        {copiedField === "acc" ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Account / Receiver Name:</span>
                    <span className="font-bold text-slate-800 text-right max-w-[200px]">
                      {activeMethod.accountName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Reason / Payment Memo:</span>
                    <span className="font-mono font-bold text-blue-700">
                      {applicationId || "Applicant ID"}
                    </span>
                  </div>
                </div>

                {activeMethod.instructions && (
                  <p className="text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                    💡 <strong>Instructions:</strong> {activeMethod.instructions}
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Upload Proof & Method Confirmation */}
        <div className="lg:col-span-5">
          <Card className="p-7 bg-white border-slate-200 shadow-md h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-emerald-600 mb-1">
                <Receipt className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">Upload Transfer Slip</h3>
              </div>
              <p className="text-xs text-slate-500 mb-5">
                Confirm which method you used and provide your payment screenshot or SMS receipt.
              </p>

              <form onSubmit={handleSubmitProof} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center text-rose-700 text-xs">
                    <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {fileError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center text-rose-700 text-xs">
                    <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-rose-600" />
                    <span>{fileError}</span>
                  </div>
                )}

                {/* How Did You Pay Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    How Did You Pay? <span className="text-blue-600">*</span>
                  </label>
                  <select
                    value={chosenPaymentMethod}
                    onChange={(e) => setChosenPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 text-xs shadow-sm"
                  >
                    {activeMethods.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.type === "mobile_money" ? "Mobile" : "Bank"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transaction Ref / Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Transaction ID / Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. Telebirr SMS Ref or CBE Journal No."
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-600 shadow-sm"
                  />
                </div>

                {/* Drag and drop upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Attach Screenshot / Deposit Slip <span className="text-blue-600">*</span>
                  </label>

                  {!file ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 bg-blue-50/40 hover:bg-blue-50/70 group"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md group-hover:scale-105 transition-all duration-200 mb-2">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">Upload Transaction Screenshot</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, or PDF (up to 5MB)</p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-500">{formatBytes(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <Button type="submit" className="w-full justify-center py-3 text-sm font-semibold shadow-lg shadow-blue-600/25" isLoading={isSubmitting}>
                    <span>Submit Payment Slip</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

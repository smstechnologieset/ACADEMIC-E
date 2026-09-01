"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  CreditCard,
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  MapPin,
  Calendar,
  PenTool,
  Award,
} from "lucide-react";
import { Application, ApplicationStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { formatDate, formatBytes } from "@/lib/utils";
import { processApplicationDecisionAction } from "@/app/actions/admin-actions";

interface ApplicationDetailClientProps {
  application: Application;
}

export function ApplicationDetailClient({ application }: ApplicationDetailClientProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<ApplicationStatus>(application.status);
  const [internalNotes, setInternalNotes] = useState(application.internal_notes || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const faydaFiles = application.files?.filter((f) => f.file_category === "fayda_id") || [];
  const paymentProofFiles = application.files?.filter((f) => f.file_category === "payment_proof") || [];

  const handleDecision = async (newStatus: ApplicationStatus) => {
    setIsProcessing(true);
    setActionSuccess(null);
    setActionError(null);

    const result = await processApplicationDecisionAction(
      application.id,
      newStatus,
      internalNotes,
      application.email,
      application.full_name
    );

    setIsProcessing(false);

    if (result.success) {
      setCurrentStatus(newStatus);
      setActionSuccess(
        `Application marked as ${newStatus.toUpperCase()}. Notification email dispatched to applicant.`
      );
      router.refresh();
    } else {
      setActionError(result.error || "Failed to update status.");
    }
  };

  const handleSaveNotesOnly = async () => {
    setIsProcessing(true);
    setActionSuccess(null);
    const result = await processApplicationDecisionAction(
      application.id,
      currentStatus,
      internalNotes,
      application.email,
      application.full_name
    );
    setIsProcessing(false);
    if (result.success) {
      setActionSuccess("Internal evaluator notes saved.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Admissions Registry
        </Link>
        <Badge status={currentStatus} />
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center text-emerald-800 text-xs shadow-sm">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center text-rose-800 text-xs shadow-sm">
          <AlertCircle className="w-4 h-4 mr-2 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Dossier Details & Documents */}
        <div className="lg:col-span-8 space-y-6">
          {/* Applicant Profile */}
          <Card className="p-7 bg-white border-slate-200 shadow-md">
            <h2 className="text-2xl font-black text-slate-900">{application.full_name}</h2>
            <p className="text-xs text-slate-500 mt-1">
              Reference ID: <span className="font-mono text-slate-800 font-bold">{application.id}</span> •
              Submitted {formatDate(application.created_at)}
            </p>

            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block font-bold uppercase">First Name</span>
                  <span className="font-bold text-slate-900">{application.first_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-bold uppercase">Middle Name</span>
                  <span className="font-bold text-slate-900">{application.middle_name || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-bold uppercase">Last Name</span>
                  <span className="font-bold text-slate-900">{application.last_name}</span>
                </div>

                <div>
                  <span className="text-slate-500 block font-bold uppercase">Age</span>
                  <span className="font-bold text-slate-900">{application.age || "N/A"} years</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-bold uppercase">Email</span>
                  <a href={`mailto:${application.email}`} className="font-bold text-blue-600 hover:underline">
                    {application.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block font-bold uppercase">Phone</span>
                  <a href={`tel:${application.phone}`} className="font-bold text-slate-900">
                    {application.phone}
                  </a>
                </div>

                <div className="sm:col-span-3">
                  <span className="text-slate-500 block font-bold uppercase">Full Address (Ethiopia)</span>
                  <span className="font-semibold text-slate-900">{application.full_address}</span>
                </div>

                <div className="sm:col-span-3">
                  <span className="text-slate-500 block font-bold uppercase">College or University Qualification</span>
                  <span className="font-bold text-blue-800">{application.qualification || "Not specified"}</span>
                </div>

                <div className="sm:col-span-3">
                  <span className="text-slate-500 block font-bold uppercase">Course Applied For</span>
                  <span className="font-bold text-blue-700 text-sm">{application.course_applied}</span>
                </div>
              </div>

              {/* Signature, Place & Date */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block font-bold uppercase flex items-center">
                    <PenTool className="w-3.5 h-3.5 mr-1 text-blue-600" /> Signature
                  </span>
                  <span className="font-serif italic font-bold text-slate-900 text-sm">
                    {application.signature}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block font-bold uppercase flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600" /> Place
                  </span>
                  <span className="font-bold text-slate-900">{application.place}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-bold uppercase flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-blue-600" /> Declaration Date
                  </span>
                  <span className="font-bold text-slate-900">{application.submission_date}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Official FAYDA ID */}
          <Card className="p-7 bg-white border-slate-200 shadow-md">
            <div className="flex items-center space-x-2 text-blue-600 mb-1">
              <FileText className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900">Official ID (FAYDA)</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Ethiopian National Identification document / card</p>

            <div className="space-y-3">
              {faydaFiles.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No FAYDA ID attached.</p>
              ) : (
                faydaFiles.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">{doc.file_name}</p>
                        <p className="text-[11px] text-slate-500">
                          {doc.file_size ? formatBytes(doc.file_size) : "Official ID"} • Uploaded{" "}
                          {formatDate(doc.uploaded_at)}
                        </p>
                      </div>
                    </div>

                    <a
                      href={doc.signedUrl || `/api/download?path=${encodeURIComponent(doc.file_path)}&bucket=documents`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs font-bold px-3.5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0 ml-3 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Inspect FAYDA
                    </a>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Payment Proof Preview */}
          <Card className="p-7 bg-white border-slate-200 shadow-md">
            <div className="flex items-center space-x-2 text-emerald-600 mb-1">
              <CreditCard className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900">Payment & Transfer Proof</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Submitted transfer verification via Telebirr or Ethiopian Banking partner
            </p>

            {/* Payment Method & Transaction Ref Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 mb-4 text-xs">
              <div>
                <span className="text-slate-500 block font-bold uppercase">Payment Method Selected</span>
                <span className="font-bold text-blue-900 text-sm">
                  {application.payment_method || "Telebirr / Bank Transfer"}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block font-bold uppercase">Transaction ID / Reference</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {application.transaction_ref || "Not provided"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {paymentProofFiles.length === 0 ? (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center text-amber-900 font-semibold text-xs">
                  Applicant has not submitted proof of payment yet.
                </div>
              ) : (
                paymentProofFiles.map((proof) => (
                  <div key={proof.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">{proof.file_name}</p>
                      <p className="text-[11px] text-slate-500">Uploaded {formatDate(proof.uploaded_at)}</p>
                    </div>
                    <a
                      href={
                        proof.signedUrl ||
                        `/api/download?path=${encodeURIComponent(proof.file_path)}&bucket=payment-proofs`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1" />
                      Inspect Payment Slip
                    </a>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Col: Decision Actions & Notes */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-7 bg-white border-slate-200 shadow-md">
            <h3 className="text-lg font-black text-slate-900">Admissions Decision</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Approving sends official onboarding notice and Percipio platform registration details.
            </p>

            <div className="space-y-2.5">
              <Button
                variant="success"
                className="w-full justify-center text-xs py-3 font-bold"
                isLoading={isProcessing}
                onClick={() => handleDecision("approved")}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve Application
              </Button>

              <Button
                variant="danger"
                className="w-full justify-center text-xs py-3 font-bold"
                isLoading={isProcessing}
                onClick={() => handleDecision("rejected")}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Application
              </Button>

              <Button
                variant="secondary"
                className="w-full justify-center text-xs py-2.5 font-bold"
                isLoading={isProcessing}
                onClick={() => handleDecision("under_review")}
              >
                <Clock className="w-4 h-4 mr-2" />
                Mark Under Review
              </Button>
            </div>

            {/* Internal Evaluator Notes */}
            <div className="pt-5 border-t border-slate-200 mt-5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Internal Committee Notes
              </label>
              <textarea
                rows={4}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="FAYDA verification remarks, scholarship approval notes..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 resize-none shadow-sm"
              />
              <button
                type="button"
                onClick={handleSaveNotesOnly}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline flex items-center"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                Save notes only
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

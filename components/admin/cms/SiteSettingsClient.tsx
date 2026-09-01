"use client";

import React, { useState } from "react";
import { CmsSiteSettings, PaymentMethod } from "@/types";
import {
  Settings,
  Save,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Award,
  Plus,
  Edit2,
  Trash2,
  Smartphone,
  CreditCard,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { updateSiteSettingsAction } from "@/app/actions/cms-actions";

interface SiteSettingsProps {
  initialSettings: CmsSiteSettings;
  onSettingsChange?: (newSettings: CmsSiteSettings) => void;
}

export function SiteSettingsClient({ initialSettings, onSettingsChange }: SiteSettingsProps) {
  const [settings, setSettings] = useState<CmsSiteSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Payment Method Modal state
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<Partial<PaymentMethod> | null>(null);

  const handleInputChange = (field: keyof CmsSiteSettings, value: any) => {
    const updated = {
      ...settings,
      [field]: value,
    };
    setSettings(updated);
    if (onSettingsChange) onSettingsChange(updated);
  };

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    const res = await updateSiteSettingsAction(settings);
    setIsSaving(false);

    if (res.success) {
      if (onSettingsChange) onSettingsChange(settings);
      setNotification("All site settings & payment options saved successfully.");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Payment methods helpers
  const handleOpenAddMethod = () => {
    setEditingMethod({
      id: `pm-${Date.now()}`,
      name: "",
      type: "mobile_money",
      accountNumber: "",
      accountName: "Academic Excellence Ethiopia",
      instructions: "Transfer payment and attach receipt screenshot.",
      is_active: true,
    });
    setIsOpenModal(true);
  };

  const setIsOpenModal = (open: boolean) => {
    setIsMethodModalOpen(open);
  };

  const handleOpenEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setIsOpenModal(true);
  };

  const handleSaveMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMethod || !editingMethod.name?.trim() || !editingMethod.accountNumber?.trim()) return;

    let updatedMethods = [...(settings.paymentMethods || [])];
    const existingIdx = updatedMethods.findIndex((m) => m.id === editingMethod.id);

    if (existingIdx >= 0) {
      updatedMethods[existingIdx] = editingMethod as PaymentMethod;
    } else {
      updatedMethods.push(editingMethod as PaymentMethod);
    }

    const updatedSettings = {
      ...settings,
      paymentMethods: updatedMethods,
    };

    setSettings(updatedSettings);
    setIsOpenModal(false);

    setIsSaving(true);
    await updateSiteSettingsAction(updatedSettings);
    setIsSaving(false);
    setNotification("Payment options updated.");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleActiveMethod = async (id: string) => {
    const updatedMethods = (settings.paymentMethods || []).map((m) =>
      m.id === id ? { ...m, is_active: !m.is_active } : m
    );
    const updatedSettings = { ...settings, paymentMethods: updatedMethods };
    setSettings(updatedSettings);
    await updateSiteSettingsAction(updatedSettings);
  };

  const handleDeleteMethod = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}"?`)) return;
    const updatedMethods = (settings.paymentMethods || []).filter((m) => m.id !== id);
    const updatedSettings = { ...settings, paymentMethods: updatedMethods };
    setSettings(updatedSettings);
    await updateSiteSettingsAction(updatedSettings);
    setNotification("Payment option removed.");
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-600" />
            Banking, Mobile Money & Institutional Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure subsidized fees, Telebirr & multi-bank accounts, contact lines, and institutional motto.
          </p>
        </div>

        <Button onClick={() => handleSaveAll()} isLoading={isSaving} className="shadow-md shadow-blue-600/20">
          <Save className="w-4 h-4 mr-1.5" />
          Save All Settings
        </Button>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center text-emerald-800 text-xs shadow-sm">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Section 1: Multi-Payment Accounts (Telebirr, CBE, Awash, etc.) */}
      <Card className="p-6 bg-white border-slate-200 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-blue-600">
            <Smartphone className="w-5 h-5" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Supported Ethiopian Payment Options</h3>
              <p className="text-xs text-slate-500">
                Accounts displayed to applicants on `/payment-instructions` (Telebirr, CBE Birr, Banks)
              </p>
            </div>
          </div>

          <Button type="button" size="sm" onClick={handleOpenAddMethod} className="shadow-sm">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Payment Option
          </Button>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(settings.paymentMethods || []).map((method) => (
            <div
              key={method.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                method.is_active ? "bg-white border-slate-200 shadow-sm" : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      method.type === "mobile_money"
                        ? "bg-sky-50 text-sky-700 border-sky-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {method.type === "mobile_money" ? "Mobile Money / USSD" : "Bank Transfer"}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleActiveMethod(method.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      method.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {method.is_active ? "Active" : "Disabled"}
                  </button>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{method.name}</h4>
                <div className="mt-2 p-2 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Account / Phone:</span>
                    <span className="font-mono font-bold text-slate-900">{method.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Holder Name:</span>
                    <span className="font-medium text-slate-800 text-[11px] truncate max-w-[140px]">
                      {method.accountName}
                    </span>
                  </div>
                </div>

                {method.instructions && (
                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">{method.instructions}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditMethod(method)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                  title="Edit Account"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteMethod(method.id, method.name)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                  title="Remove Account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Section 2: Fee Tariff & Institutional Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tuition Fee Tariff */}
        <Card className="p-6 bg-white border-slate-200 shadow-md space-y-4">
          <div className="flex items-center space-x-2 text-blue-600 pb-2 border-b border-slate-100">
            <CreditCard className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">Application Fee Tariff</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Fee (ETB) *
              </label>
              <input
                type="text"
                value={settings.applicationFee}
                onChange={(e) => {
                  const val = e.target.value;
                  const num = parseInt(val.replace(/[^0-9]/g, ""), 10) || 0;
                  setSettings({
                    ...settings,
                    applicationFee: val,
                    feeNumeric: num,
                  });
                }}
                placeholder="3,500 ETB"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold text-base focus:outline-none focus:border-blue-600 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Official Motto</label>
              <input
                type="text"
                value={settings.motto}
                onChange={(e) => handleInputChange("motto", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Subheading Tagline</label>
              <input
                type="text"
                value={settings.subheading}
                onChange={(e) => handleInputChange("subheading", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                required
              />
            </div>
          </div>
        </Card>

        {/* Admissions Contact Desk */}
        <Card className="p-6 bg-white border-slate-200 shadow-md space-y-4">
          <div className="flex items-center space-x-2 text-blue-600 pb-2 border-b border-slate-100">
            <Award className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">Admissions Desk Details</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Phone Line</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Office Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                required
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Modal for Adding / Editing Payment Method */}
      {isMethodModalOpen && editingMethod && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <Card className="w-full max-w-lg p-6 bg-white border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {editingMethod.name ? "Edit Payment Method" : "Add Ethiopian Payment Method"}
              </h3>
              <button onClick={() => setIsOpenModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMethod} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Payment Method Name *
                </label>
                <input
                  type="text"
                  value={editingMethod.name || ""}
                  onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                  placeholder="e.g. Telebirr, CBE Birr, Awash Bank, CBE"
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-sm shadow-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Type *</label>
                  <select
                    value={editingMethod.type || "mobile_money"}
                    onChange={(e) => setEditingMethod({ ...editingMethod, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                  >
                    <option value="mobile_money">Mobile Money (Telebirr / CBE Birr)</option>
                    <option value="bank_account">Bank Account Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Account / Phone Number *
                  </label>
                  <input
                    type="text"
                    value={editingMethod.accountNumber || ""}
                    onChange={(e) => setEditingMethod({ ...editingMethod, accountNumber: e.target.value })}
                    placeholder="e.g. 0911234567 or 1000123456789"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-blue-600 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Account Holder / Merchant Name *
                </label>
                <input
                  type="text"
                  value={editingMethod.accountName || ""}
                  onChange={(e) => setEditingMethod({ ...editingMethod, accountName: e.target.value })}
                  placeholder="e.g. Academic Excellence Ethiopia"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Transfer Instructions for Applicants
                </label>
                <textarea
                  rows={2}
                  value={editingMethod.instructions || ""}
                  onChange={(e) => setEditingMethod({ ...editingMethod, instructions: e.target.value })}
                  placeholder="e.g. Transfer via Telebirr or *127# and attach receipt screenshot."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm resize-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveMethod"
                  checked={editingMethod.is_active !== false}
                  onChange={(e) => setEditingMethod({ ...editingMethod, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActiveMethod" className="text-xs font-bold text-slate-700">
                  Enable this payment option on the applicant portal
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsOpenModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Payment Option
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

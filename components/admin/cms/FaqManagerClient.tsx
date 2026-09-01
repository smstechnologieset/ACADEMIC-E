"use client";

import React, { useState } from "react";
import { CmsFaq } from "@/types";
import { Plus, Edit2, Trash2, CheckCircle2, HelpCircle, X, Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createFaqAction, updateFaqAction, deleteFaqAction } from "@/app/actions/cms-actions";

interface FaqManagerProps {
  initialFaqs: CmsFaq[];
}

export function FaqManagerClient({ initialFaqs }: FaqManagerProps) {
  const [faqs, setFaqs] = useState<CmsFaq[]>(initialFaqs);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Partial<CmsFaq> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingFaq({
      question: "",
      answer: "",
      category: "General",
      sort_order: faqs.length + 1,
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (faq: CmsFaq) => {
    setEditingFaq(faq);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq || !editingFaq.question?.trim() || !editingFaq.answer?.trim()) return;

    setIsSaving(true);
    if (editingFaq.id) {
      // Update
      const res = await updateFaqAction(editingFaq.id, editingFaq);
      if (res.success) {
        setFaqs(faqs.map((f) => (f.id === editingFaq.id ? ({ ...f, ...editingFaq } as CmsFaq) : f)));
        setNotification("FAQ updated successfully.");
        setIsEditing(false);
      }
    } else {
      // Create
      const res = await createFaqAction(editingFaq as any);
      if (res.success && res.faq) {
        setFaqs([...faqs, res.faq]);
        setNotification("New FAQ item created.");
        setIsEditing(false);
      }
    }
    setIsSaving(false);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ question?")) return;
    const res = await deleteFaqAction(id);
    if (res.success) {
      setFaqs(faqs.filter((f) => f.id !== id));
      setNotification("FAQ question removed.");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
            Frequently Asked Questions Editor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add or edit questions and responses rendered inside the homepage accordion.
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="shadow-md shadow-blue-600/20">
          <Plus className="w-4 h-4 mr-1.5" />
          Add New Question
        </Button>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center text-emerald-800 text-xs shadow-sm">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <Card key={faq.id} className="p-6 bg-white border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-sm font-bold text-slate-900">
                  <span className="text-blue-600 mr-2 font-mono">Q{idx + 1}.</span>
                  {faq.question}
                </h3>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(faq)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.answer}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditing && editingFaq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <Card className="w-full max-w-xl p-6 bg-white border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {editingFaq.id ? "Edit Question & Answer" : "Add New FAQ Question"}
              </h3>
              <button onClick={() => setIsEditing(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Question *</label>
                <input
                  type="text"
                  value={editingFaq.question || ""}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  placeholder="e.g. How does FAYDA verification work?"
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-sm shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Answer *</label>
                <textarea
                  rows={4}
                  value={editingFaq.answer || ""}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  placeholder="Detailed answer for applicant guidance..."
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 resize-none shadow-sm text-xs"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSaving}>
                  Save FAQ
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

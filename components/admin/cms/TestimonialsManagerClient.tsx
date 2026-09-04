"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Star, CheckCircle2, Award, Quote, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CmsTestimonial } from "@/types";
import {
  createCmsTestimonial,
  updateCmsTestimonial,
  deleteCmsTestimonial,
} from "@/lib/cms-repo";

export function TestimonialsManagerClient({
  initialTestimonials,
}: {
  initialTestimonials: CmsTestimonial[];
}) {
  const [testimonials, setTestimonials] = useState<CmsTestimonial[]>(initialTestimonials);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    role: "",
    quote: "",
    course_completed: "",
    rating: 5,
    is_featured: true,
    sort_order: 1,
  });

  const resetForm = () => {
    setForm({
      name: "",
      role: "",
      quote: "",
      course_completed: "",
      rating: 5,
      is_featured: true,
      sort_order: testimonials.length + 1,
    });
    setEditingId(null);
    setIsEditing(false);
  };

  const handleEdit = (item: CmsTestimonial) => {
    setForm({
      name: item.name,
      role: item.role || "",
      quote: item.quote,
      course_completed: item.course_completed || "",
      rating: item.rating || 5,
      is_featured: item.is_featured,
      sort_order: item.sort_order || 1,
    });
    setEditingId(item.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    await deleteCmsTestimonial(id);
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    setSuccessMsg("Testimonial removed successfully.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateCmsTestimonial(editingId, form);
      setTestimonials((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, ...form } : t))
      );
      setSuccessMsg("Testimonial updated successfully.");
    } else {
      const created = await createCmsTestimonial(form);
      setTestimonials((prev) => [...prev, created]);
      setSuccessMsg("New testimonial published successfully.");
    }
    resetForm();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Quote className="w-5 h-5 text-blue-600" />
            Testimonials & Success Stories
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student quotes, success stories, and verified ratings displayed on the public portal.
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} size="sm" className="shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Testimonial
          </Button>
        )}
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Editor Modal / Card */}
      {isEditing && (
        <Card className="p-6 bg-white border-blue-200 shadow-md">
          <CardHeader className="p-0 pb-4 mb-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900">
              {editingId ? "Edit Testimonial" : "New Student Success Story"}
            </CardTitle>
            <button
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              Cancel
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Bethlehem Tadesse"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Academic / Professional Role
                  </label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="e.g. BSc Software Engineering, AAU"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Completed Academic Program
                </label>
                <input
                  type="text"
                  value={form.course_completed}
                  onChange={(e) => setForm({ ...form, course_completed: e.target.value })}
                  placeholder="e.g. Artificial Intelligence (AI)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Testimonial Quote *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.quote}
                  onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  placeholder="Write the student's quote or experience..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Star Rating (1 - 5)
                  </label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r} Stars {r === 5 ? "★★★★★" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-xs font-bold text-slate-700">Feature on Homepage</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-5">
                  <Button type="submit" size="sm">
                    {editingId ? "Save Changes" : "Publish Story"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((item) => (
          <Card key={item.id} className="p-5 bg-white border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: item.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  {item.is_featured && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Featured
                    </span>
                  )}
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 italic leading-relaxed mb-4">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{item.name}</p>
                {item.role && <p className="text-[10px] text-slate-500">{item.role}</p>}
              </div>
              {item.course_completed && (
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {item.course_completed}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

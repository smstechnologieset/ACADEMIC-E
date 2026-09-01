"use client";

import React, { useState } from "react";
import { CmsCourse } from "@/types";
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Sparkles, BookOpen, X, Search, Tag } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createCourseAction, updateCourseAction, deleteCourseAction } from "@/app/actions/cms-actions";

interface CourseManagerProps {
  initialCourses: CmsCourse[];
}

export function CourseManagerClient({ initialCourses }: CourseManagerProps) {
  const [courses, setCourses] = useState<CmsCourse[]>(initialCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isEditing, setIsEditing] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<CmsCourse> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingCourse({
      title: "",
      duration: "24 Weeks",
      level: "Certificate / Diploma",
      category: "job-ready",
      status: "Active",
      is_featured: false,
      sort_order: courses.length + 1,
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (course: CmsCourse) => {
    setEditingCourse(course);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editingCourse.title?.trim()) return;

    setIsSaving(true);
    if (editingCourse.id) {
      // Update
      const res = await updateCourseAction(editingCourse.id, editingCourse);
      if (res.success) {
        setCourses(courses.map((c) => (c.id === editingCourse.id ? ({ ...c, ...editingCourse } as CmsCourse) : c)));
        setNotification("Course updated successfully.");
        setIsEditing(false);
      }
    } else {
      // Create
      const res = await createCourseAction(editingCourse as any);
      if (res.success && res.course) {
        setCourses([...courses, res.course]);
        setNotification("New course added to catalog.");
        setIsEditing(false);
      }
    }
    setIsSaving(false);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    const res = await deleteCourseAction(id);
    if (res.success) {
      setCourses(courses.filter((c) => c.id !== id));
      setNotification("Course removed from catalog.");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            Course & Program Manager
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add, update, or remove courses displayed on the public catalog and `/apply` dropdown.
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="shadow-md shadow-blue-600/20">
          <Plus className="w-4 h-4 mr-1.5" />
          Add New Program
        </Button>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center text-emerald-800 text-xs shadow-sm">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search programs..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {["all", "job-ready", "pgd"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat === "all" ? "All Tracks" : cat === "job-ready" ? "Job-Ready (24 Wks)" : "Postgraduate (PGD)"}
            </button>
          ))}
        </div>
      </div>

      {/* Courses List Table */}
      <Card className="overflow-hidden bg-white border-slate-200 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Program Title</th>
                <th className="py-3.5 px-4">Duration & Level</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900">
                    <div className="flex items-center space-x-2">
                      <span>{course.title}</span>
                      {course.is_featured && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                          Featured
                        </span>
                      )}
                    </div>
                    {course.specialization && (
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5 max-w-md">{course.specialization}</p>
                    )}
                  </td>

                  <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                    <div className="font-semibold">{course.duration}</div>
                    <div className="text-[11px] text-slate-400">{course.level}</div>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {course.category === "pgd" ? "PGD Track" : "Job-Ready Track"}
                    </span>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                        course.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenEdit(course)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        title="Edit Course"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id, course.title)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit / Add Modal */}
      {isEditing && editingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <Card className="w-full max-w-xl p-6 bg-white border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {editingCourse.id ? "Edit Program Track" : "Create New Program Track"}
              </h3>
              <button onClick={() => setIsEditing(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Program Title *</label>
                <input
                  type="text"
                  value={editingCourse.title || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  placeholder="e.g. Artificial Intelligence & Generative AI"
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-sm shadow-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Duration *</label>
                  <input
                    type="text"
                    value={editingCourse.duration || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                    placeholder="e.g. 24 Weeks or 12 Months"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Level *</label>
                  <input
                    type="text"
                    value={editingCourse.level || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value })}
                    placeholder="e.g. Certificate / Diploma"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category *</label>
                  <select
                    value={editingCourse.category || "job-ready"}
                    onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                  >
                    <option value="job-ready">Job-Ready (24 Weeks)</option>
                    <option value="pgd">Postgraduate Diploma (PGD)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Status *</label>
                  <select
                    value={editingCourse.status || "Active"}
                    onChange={(e) => setEditingCourse({ ...editingCourse, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Coming Soon">Coming Soon</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Specialization / Remarks</label>
                <textarea
                  rows={2}
                  value={editingCourse.specialization || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, specialization: e.target.value })}
                  placeholder="Specialization notes or course modules summary..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={editingCourse.is_featured || false}
                  onChange={(e) => setEditingCourse({ ...editingCourse, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isFeatured" className="text-xs font-bold text-slate-700">
                  Feature this program on the homepage hero showcase
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSaving}>
                  Save Course Track
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

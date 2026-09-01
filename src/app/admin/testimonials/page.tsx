"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Testimonial } from "@/lib/types";
import { Plus, Pencil, Trash2, X, Loader2, Star } from "lucide-react";

const EMPTY_FORM = {
  customer_name: "",
  rating: 5,
  comment: "",
  is_active: true,
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadTestimonials();
  }, [supabase]);

  const loadTestimonials = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    setTestimonials((data as Testimonial[]) ?? []);
    setLoading(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setError(null);
    setShowForm(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({
      customer_name: t.customer_name,
      rating: t.rating,
      comment: t.comment,
      is_active: t.is_active,
    });
    setError(null);
    setShowForm(true);
  };

  const handleDelete = async (t: Testimonial) => {
    if (!confirm(`Delete testimonial from "${t.customer_name}"?`)) return;
    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", t.id);
    if (!error) loadTestimonials();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!form.customer_name.trim()) {
      setError("Customer name is required.");
      setSaving(false);
      return;
    }
    if (!form.comment.trim()) {
      setError("Comment is required.");
      setSaving(false);
      return;
    }
    if (form.rating < 1 || form.rating > 5) {
      setError("Rating must be between 1 and 5.");
      setSaving(false);
      return;
    }

    const payload = {
      customer_name: form.customer_name.trim(),
      rating: form.rating,
      comment: form.comment.trim(),
      is_active: form.is_active,
    };

    if (editing) {
      const { error: updateErr } = await supabase
        .from("testimonials")
        .update(payload)
        .eq("id", editing.id);
      if (updateErr) {
        setError(updateErr.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: insertErr } = await supabase
        .from("testimonials")
        .insert(payload);
      if (insertErr) {
        setError(insertErr.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setShowForm(false);
    loadTestimonials();
  };

  const toggleActive = async (t: Testimonial) => {
    await supabase
      .from("testimonials")
      .update({ is_active: !t.is_active })
      .eq("id", t.id);
    loadTestimonials();
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= rating ? "fill-gold-400 text-gold-400" : "text-gray-300"}
        />
      ))}
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy-700">Testimonials</h2>
        <button onClick={openAdd} className="btn-gold">
          <Plus size={16} className="mr-1" /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-400 border-t-transparent" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          No testimonials yet.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-medium uppercase tracking-wider text-gray-400">
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {testimonials.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-gray-50/40">
                    <td className="px-4 py-3 font-medium text-navy-700 whitespace-nowrap">
                      {t.customer_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {renderStars(t.rating)}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-gray-500">
                      <p className="truncate">{t.comment}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(t)}
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                          t.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {t.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(t)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-navy-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy-700">
                {editing ? "Edit Testimonial" : "Add Testimonial"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-navy-600">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label-text">Customer Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Ravi Kumar"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                />
              </div>

              <div>
                <label className="label-text">Rating *</label>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setForm({ ...form, rating: i })}
                      className="transition-colors hover:scale-110"
                    >
                      <Star
                        size={24}
                        className={
                          i <= form.rating
                            ? "fill-gold-400 text-gold-400"
                            : "text-gray-300 hover:text-gold-300"
                        }
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-400">{form.rating}/5</span>
                </div>
              </div>

              <div>
                <label className="label-text">Comment *</label>
                <textarea
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Write the customer's testimonial..."
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-navy-600">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="h-4 w-4 rounded accent-gold-400"
                  />
                  Active (visible on public site)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : editing ? (
                    "Save Changes"
                  ) : (
                    "Add Testimonial"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

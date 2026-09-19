"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import FileUpload from "@/components/dashboard/FileUpload";
import { Plus, Trash2, Pencil, X } from "lucide-react";

const emptyForm = { title: "", excerpt: "", content: "", featuredImage: "", status: "draft" };

export default function AdminBlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    fetch("/api/admin/blog").then((r) => r.json()).then((d) => setPosts(d.posts || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (post) => {
    setEditingId(post._id);
    setForm({
      title: post.title || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      featuredImage: post.featuredImage || "",
      status: post.status || "draft",
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async (e) => {
    e.preventDefault();
    const isEditing = Boolean(editingId);
    const res = await fetch(isEditing ? `/api/admin/blog/${editingId}` : "/api/blog", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(isEditing ? "Post updated" : "Post created");
      cancelForm();
      load();
    } else toast.error(data.message);
  };

  const togglePublish = async (post) => {
    const res = await fetch(`/api/admin/blog/${post._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: post.status === "published" ? "draft" : "published" }),
    });
    const data = await res.json();
    if (data.success) load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    if (editingId === id) cancelForm();
    load();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Blog</h1>
        <Button size="sm" onClick={() => (showForm ? cancelForm() : startCreate())}>
          {showForm ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> New Post</>}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-6 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{editingId ? "Editing post" : "New post"}</p>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Excerpt" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <FileUpload
            label="Featured Image"
            value={form.featuredImage}
            onChange={(url) => setForm({ ...form, featuredImage: url })}
            folder="blog"
          />
          <textarea required rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Content" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <Button type="submit" size="sm">{editingId ? "Save Changes" : "Save as Draft"}</Button>
            {!editingId && (
              <Button type="button" size="sm" variant="accent" onClick={() => setForm((f) => ({ ...f, status: "published" }))}>
                Publish
              </Button>
            )}
            <Button type="button" size="sm" variant="ghost" onClick={cancelForm}>Cancel</Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {posts.map((p) => (
            <div key={p._id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{p.title}</p>
                <p className="text-xs text-slate-500">by {p.author?.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={p.status === "published" ? "verified" : "neutral"}>{p.status}</Badge>
                <button onClick={() => startEdit(p)} className="text-slate-400 hover:text-brand" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => togglePublish(p)} className="text-xs font-medium text-brand hover:underline">
                  {p.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => remove(p._id)} className="text-slate-400 hover:text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

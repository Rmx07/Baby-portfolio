"use client";

import Link from "next/link";
import { useState } from "react";
import { apiJson } from "@/lib/client";
import { useExperience } from "@/components/experience/ExperienceProvider";

type Project = {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  dreamType: string;
  accent: string;
  artKey: string;
  year: string;
  sortOrder: number;
  published: boolean;
};

type Story = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  accent: string;
  emoji: string;
  published: boolean;
  sortOrder: number;
  pageCount: number;
};

type Page = { id: number; pageNumber: number; body: string; art: string };

const ACCENT_OPTIONS = ["pink", "cyan", "lavender", "yellow", "peach", "mint"];
const ART_OPTIONS = ["dispatch", "bakery", "library", "party", "portrait"];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function Status({ error, success }: { error: string | null; success: string | null }) {
  if (error) {
    return (
      <p role="alert" className="rounded-md border-2 border-[#a3143c] bg-[#ffe0e6] p-2 text-sm font-bold text-[#7b0f2c]">
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p role="status" className="rounded-md border-2 border-[#12855f] bg-[#dcffe9] p-2 text-sm font-bold text-[#0b5c42]">
        {success}
      </p>
    );
  }
  return null;
}

const emptyProject = {
  slug: "",
  title: "",
  tagline: "",
  description: "",
  dreamType: "dream",
  accent: "pink",
  artKey: "dispatch",
  year: "1996",
  sortOrder: 10,
  published: true,
};

export function ProjectsManager({ initialProjects }: { initialProjects: Project[] }) {
  const { playSfx } = useExperience();
  const [projects, setProjects] = useState(initialProjects);
  const [form, setForm] = useState<typeof emptyProject>(emptyProject);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => {
    setForm(emptyProject);
    setEditingId(null);
    setShowForm(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const clash = projects.find((item) => item.slug === form.slug && item.id !== editingId);
    if (clash) {
      setError(`The slug “${form.slug}” already belongs to “${clash.title}”. Add a number to make it unique, e.g. ${form.slug}-2.`);
      return;
    }
    setBusy(true);
    const payload = { ...form, sortOrder: Number(form.sortOrder) };
    try {
      if (editingId) {
        const result = await apiJson<{ project: Project }>(`/api/projects/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setProjects((current) => current.map((item) => (item.id === editingId ? result.project : item)));
        setSuccess("Dream project updated.");
      } else {
        const result = await apiJson<{ project: Project }>("/api/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setProjects((current) => [...current, result.project]);
        setSuccess("New dream project created.");
      }
      playSfx("ok");
      reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save that project.");
      playSfx("err");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (project: Project) => {
    if (!window.confirm(`Delete “${project.title}”? This cannot be undone.`)) return;
    const previous = projects;
    setProjects((current) => current.filter((item) => item.id !== project.id));
    try {
      await apiJson(`/api/projects/${project.id}`, { method: "DELETE" });
      setSuccess(`Deleted “${project.title}”.`);
      playSfx("ok");
      if (editingId === project.id) reset();
    } catch (caught) {
      setProjects(previous);
      setError(caught instanceof Error ? caught.message : "Could not delete that project.");
    }
  };

  const togglePublished = async (project: Project) => {
    const next = { ...project, published: !project.published };
    setProjects((current) => current.map((item) => (item.id === project.id ? next : item)));
    try {
      await apiJson(`/api/projects/${project.id}`, { method: "PATCH", body: JSON.stringify(next) });
      playSfx("ok");
    } catch (caught) {
      setProjects((current) => current.map((item) => (item.id === project.id ? project : item)));
      setError(caught instanceof Error ? caught.message : "Could not change that project.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-[family-name:var(--font-mono-retro)] text-lg text-ink">
          {projects.length} projects · {projects.filter((item) => item.published).length} live on the homepage
        </p>
        <button
          type="button"
          className="btn btn-pink"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm(emptyProject);
          }}
          aria-expanded={showForm}
        >
          {showForm ? "✕ Close form" : "＋ New dream project"}
        </button>
      </div>

      <Status error={error} success={success} />

      {showForm || editingId ? (
        <form onSubmit={submit} className="panel space-y-3 p-4">
          <div className="window-bar -mx-4 -mt-4 mb-3">
            <span>{editingId ? "EDIT_PROJECT.EXE" : "NEW_PROJECT.EXE"}</span>
            <span aria-hidden>🛠️</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-bold">
              Title
              <input
                className="retro-input mt-1"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                    slug: editingId ? current.slug : slugify(event.target.value),
                  }))
                }
                required
              />
            </label>
            <label className="block text-sm font-bold">
              Slug
              <input
                className="retro-input mt-1"
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
                pattern="[a-z0-9-]+"
                required
              />
            </label>
          </div>
          <label className="block text-sm font-bold">
            Tagline
            <input
              className="retro-input mt-1"
              value={form.tagline}
              maxLength={140}
              onChange={(event) => setForm((current) => ({ ...current, tagline: event.target.value }))}
              required
            />
          </label>
          <label className="block text-sm font-bold">
            Description
            <textarea
              className="retro-textarea mt-1 min-h-[130px]"
              value={form.description}
              maxLength={1800}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              required
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-4">
            <label className="block text-sm font-bold">
              Dream type
              <input
                className="retro-input mt-1"
                value={form.dreamType}
                onChange={(event) => setForm((current) => ({ ...current, dreamType: event.target.value }))}
              />
            </label>
            <label className="block text-sm font-bold">
              Accent
              <select
                className="retro-select mt-1"
                value={form.accent}
                onChange={(event) => setForm((current) => ({ ...current, accent: event.target.value }))}
              >
                {ACCENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-bold">
              Artwork
              <select
                className="retro-select mt-1"
                value={form.artKey}
                onChange={(event) => setForm((current) => ({ ...current, artKey: event.target.value }))}
              >
                {ART_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-bold">
              Year
              <input
                className="retro-input mt-1"
                value={form.year}
                onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))}
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-bold">
              Sort order
              <input
                type="number"
                className="retro-input mt-1"
                value={form.sortOrder}
                onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))}
              />
            </label>
            <label className="mt-6 flex items-center gap-2 text-sm font-bold">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))}
                className="h-5 w-5 accent-[#ff4fa3]"
              />
              Published on the homepage
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-pink" disabled={busy}>
              {busy ? "Saving…" : editingId ? "💾 Save changes" : "✨ Create project"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={reset}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {projects.length === 0 ? (
        <div className="panel p-6 text-center">
          <p className="text-3xl" aria-hidden>
            🗂️
          </p>
          <p className="mt-2 font-[family-name:var(--font-pixel)] text-[0.6rem]">No dream projects yet</p>
          <p className="mono-retro mt-1 text-lg">Create the first one and it appears on the homepage immediately.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <article key={project.id} className="panel flex flex-wrap items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`chip ${project.published ? "" : "opacity-60"}`}>
                    {project.published ? "● live" : "○ draft"}
                  </span>
                  <span className="chip">{project.accent}</span>
                  <span className="chip">{project.year}</span>
                </div>
                <h3 className="mt-1 truncate text-xs sm:text-sm">{project.title}</h3>
                <p className="mono-retro truncate text-base opacity-80">
                  /projects/{project.slug} · sort {project.sortOrder}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/projects/${project.slug}`} className="btn btn-sm btn-ghost">
                  View
                </Link>
                <button type="button" className="btn btn-sm btn-mint" onClick={() => togglePublished(project)}>
                  {project.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-cyan"
                  onClick={() => {
                    setForm({
                      slug: project.slug,
                      title: project.title,
                      tagline: project.tagline,
                      description: project.description,
                      dreamType: project.dreamType,
                      accent: project.accent,
                      artKey: project.artKey,
                      year: project.year,
                      sortOrder: project.sortOrder,
                      published: project.published,
                    });
                    setEditingId(project.id);
                    setShowForm(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Edit
                </button>
                <button type="button" className="btn btn-sm btn-pink" onClick={() => remove(project)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

const emptyStory = {
  slug: "",
  title: "",
  summary: "",
  accent: "lavender",
  emoji: "🌙",
  sortOrder: 10,
  published: true,
};

export function StoriesManager({ initialStories }: { initialStories: Story[] }) {
  const { playSfx } = useExperience();
  const [stories, setStories] = useState(initialStories);
  const [form, setForm] = useState<typeof emptyStory>(emptyStory);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => {
    setForm(emptyStory);
    setEditingId(null);
    setShowForm(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const clash = stories.find((item) => item.slug === form.slug && item.id !== editingId);
    if (clash) {
      setError(`The slug “${form.slug}” is already used by “${clash.title}”. Add a number to make it unique, e.g. ${form.slug}-2.`);
      return;
    }
    setBusy(true);
    const payload = { ...form, sortOrder: Number(form.sortOrder) };
    try {
      if (editingId) {
        const result = await apiJson<{ story: Story }>(`/api/stories/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setStories((current) =>
          current.map((item) => (item.id === editingId ? { ...item, ...result.story, pageCount: item.pageCount } : item)),
        );
        setSuccess("Story details updated.");
      } else {
        const result = await apiJson<{ story: Story }>("/api/stories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setStories((current) => [...current, { ...result.story, pageCount: 0 }]);
        setSuccess("New story added. Open it to write the pages.");
      }
      playSfx("ok");
      reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save that story.");
      playSfx("err");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (story: Story) => {
    if (!window.confirm(`Delete “${story.title}” and all ${story.pageCount} pages?`)) return;
    const previous = stories;
    setStories((current) => current.filter((item) => item.id !== story.id));
    try {
      await apiJson(`/api/stories/${story.id}`, { method: "DELETE" });
      setSuccess(`Deleted “${story.title}”.`);
      playSfx("ok");
    } catch (caught) {
      setStories(previous);
      setError(caught instanceof Error ? caught.message : "Could not delete that story.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-[family-name:var(--font-mono-retro)] text-lg text-ink">
          {stories.length} stories · {stories.reduce((total, story) => total + story.pageCount, 0)} flipbook pages
        </p>
        <button
          type="button"
          className="btn btn-pink"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm(emptyStory);
          }}
          aria-expanded={showForm}
        >
          {showForm ? "✕ Close form" : "＋ New bedtime story"}
        </button>
      </div>

      <Status error={error} success={success} />

      {showForm || editingId ? (
        <form onSubmit={submit} className="panel space-y-3 p-4">
          <div className="window-bar -mx-4 -mt-4 mb-3">
            <span>{editingId ? "EDIT_STORY.EXE" : "NEW_STORY.EXE"}</span>
            <span aria-hidden>📚</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-bold">
              Title
              <input
                className="retro-input mt-1"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                    slug: editingId ? current.slug : slugify(event.target.value),
                  }))
                }
                required
              />
            </label>
            <label className="block text-sm font-bold">
              Slug
              <input
                className="retro-input mt-1"
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
                pattern="[a-z0-9-]+"
                required
              />
            </label>
          </div>
          <label className="block text-sm font-bold">
            Summary
            <textarea
              className="retro-textarea mt-1 min-h-[80px]"
              value={form.summary}
              maxLength={280}
              onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
              required
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-4">
            <label className="block text-sm font-bold">
              Cover emoji
              <input
                className="retro-input mt-1"
                value={form.emoji}
                maxLength={8}
                onChange={(event) => setForm((current) => ({ ...current, emoji: event.target.value }))}
              />
            </label>
            <label className="block text-sm font-bold">
              Accent
              <select
                className="retro-select mt-1"
                value={form.accent}
                onChange={(event) => setForm((current) => ({ ...current, accent: event.target.value }))}
              >
                {ACCENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-bold">
              Sort order
              <input
                type="number"
                className="retro-input mt-1"
                value={form.sortOrder}
                onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))}
              />
            </label>
            <label className="mt-6 flex items-center gap-2 text-sm font-bold">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))}
                className="h-5 w-5 accent-[#ff4fa3]"
              />
              Published
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-pink" disabled={busy}>
              {busy ? "Saving…" : editingId ? "💾 Save story" : "✨ Add story"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={reset}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {stories.length === 0 ? (
        <div className="panel p-6 text-center">
          <p className="text-3xl" aria-hidden>
            📚
          </p>
          <p className="mt-2 font-[family-name:var(--font-pixel)] text-[0.6rem]">The library shelves are bare</p>
          <p className="mono-retro mt-1 text-lg">Add a story, then fill it with flipbook pages.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {stories.map((story) => (
            <article key={story.id} className="panel flex flex-wrap items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip">
                    {story.emoji} {story.published ? "● live" : "○ draft"}
                  </span>
                  <span className="chip">{story.pageCount} pages</span>
                  <span className="chip">{story.accent}</span>
                </div>
                <h3 className="mt-1 truncate text-xs sm:text-sm">{story.title}</h3>
                <p className="mono-retro truncate text-base opacity-80">/stories/{story.slug}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/stories/${story.slug}`} className="btn btn-sm btn-ghost">
                  Read
                </Link>
                <Link href={`/dashboard/stories/${story.id}`} className="btn btn-sm btn-mint">
                  Pages ({story.pageCount})
                </Link>
                <button
                  type="button"
                  className="btn btn-sm btn-cyan"
                  onClick={() => {
                    setForm({
                      slug: story.slug,
                      title: story.title,
                      summary: story.summary,
                      accent: story.accent,
                      emoji: story.emoji,
                      sortOrder: story.sortOrder,
                      published: story.published,
                    });
                    setEditingId(story.id);
                    setShowForm(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Edit
                </button>
                <button type="button" className="btn btn-sm btn-pink" onClick={() => remove(story)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function StoryPagesEditor({
  storyId,
  storyTitle,
  initialPages,
}: {
  storyId: number;
  storyTitle: string;
  initialPages: Page[];
}) {
  const { playSfx } = useExperience();
  const [pages, setPages] = useState(initialPages);
  const [draft, setDraft] = useState({ body: "", art: "✨" });
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addPage = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (draft.body.trim().length < 4) {
      setError("Write at least a few words for the new page.");
      return;
    }
    setBusyId(-1);
    try {
      const result = await apiJson<{ page: Page }>(`/api/stories/${storyId}/pages`, {
        method: "POST",
        body: JSON.stringify(draft),
      });
      setPages((current) => [...current, result.page]);
      setDraft({ body: "", art: "✨" });
      setSuccess("Page added to the flipbook.");
      playSfx("ok");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not add that page.");
    } finally {
      setBusyId(null);
    }
  };

  const savePage = async (page: Page) => {
    setBusyId(page.id);
    setError(null);
    setSuccess(null);
    try {
      const result = await apiJson<{ page: Page }>(`/api/pages/${page.id}`, {
        method: "PATCH",
        body: JSON.stringify({ body: page.body, art: page.art }),
      });
      setPages((current) => current.map((item) => (item.id === page.id ? result.page : item)));
      setSuccess(`Page ${result.page.pageNumber} saved.`);
      playSfx("ok");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save that page.");
    } finally {
      setBusyId(null);
    }
  };

  const deletePage = async (page: Page) => {
    if (!window.confirm(`Delete page ${page.pageNumber}?`)) return;
    const previous = pages;
    setPages((current) => current.filter((item) => item.id !== page.id));
    try {
      await apiJson(`/api/pages/${page.id}`, { method: "DELETE" });
      setSuccess(`Page ${page.pageNumber} deleted.`);
      playSfx("ok");
    } catch (caught) {
      setPages(previous);
      setError(caught instanceof Error ? caught.message : "Could not delete that page.");
    }
  };

  const move = async (page: Page, direction: -1 | 1) => {
    const sorted = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);
    const index = sorted.findIndex((item) => item.id === page.id);
    const swapWith = sorted[index + direction];
    if (!swapWith) return;
    const next = sorted.map((item) => {
      if (item.id === page.id) return { ...item, pageNumber: swapWith.pageNumber };
      if (item.id === swapWith.id) return { ...item, pageNumber: page.pageNumber };
      return item;
    });
    setPages([...next].sort((a, b) => a.pageNumber - b.pageNumber));
    try {
      await Promise.all([
        apiJson(`/api/pages/${page.id}`, { method: "PATCH", body: JSON.stringify({ pageNumber: swapWith.pageNumber }) }),
        apiJson(`/api/pages/${swapWith.id}`, { method: "PATCH", body: JSON.stringify({ pageNumber: page.pageNumber }) }),
      ]);
      setSuccess("Page order updated.");
      playSfx("page");
    } catch (caught) {
      setPages(sorted);
      setError(caught instanceof Error ? caught.message : "Could not reorder pages.");
    }
  };

  return (
    <div className="space-y-4">
      <Status error={error} success={success} />
      <div className="panel space-y-3 p-4">
        <p className="font-[family-name:var(--font-mono-retro)] text-lg">
          Editing <strong>{storyTitle}</strong> · {pages.length} pages · changes appear on the public flipbook
          immediately.
        </p>
        <div className="space-y-3">
          {pages.length === 0 ? (
            <p className="rounded-md border-2 border-dashed border-[#6b3fa0] p-3 font-[family-name:var(--font-mono-retro)] text-lg">
              No pages yet. Write page one below and the flipbook comes alive.
            </p>
          ) : (
            [...pages]
              .sort((a, b) => a.pageNumber - b.pageNumber)
              .map((page) => (
                <div key={page.id} className="rounded-lg border-2 border-[#3d1c4e] bg-[#fffaf0] p-3">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-[family-name:var(--font-pixel)] text-[0.5rem] text-[#3d1c4e]">
                      PAGE {page.pageNumber}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <button type="button" className="btn btn-sm btn-ghost" onClick={() => move(page, -1)} aria-label={`Move page ${page.pageNumber} up`}>
                        ↑
                      </button>
                      <button type="button" className="btn btn-sm btn-ghost" onClick={() => move(page, 1)} aria-label={`Move page ${page.pageNumber} down`}>
                        ↓
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-mint"
                        onClick={() => savePage(page)}
                        disabled={busyId === page.id}
                      >
                        {busyId === page.id ? "Saving…" : "Save"}
                      </button>
                      <button type="button" className="btn btn-sm btn-pink" onClick={() => deletePage(page)}>
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[4rem_1fr]">
                    <label className="block text-sm font-bold">
                      Art
                      <input
                        className="retro-input mt-1 text-center"
                        value={page.art}
                        maxLength={8}
                        onChange={(event) =>
                          setPages((current) =>
                            current.map((item) => (item.id === page.id ? { ...item, art: event.target.value } : item)),
                          )
                        }
                      />
                    </label>
                    <label className="block text-sm font-bold">
                      Text
                      <textarea
                        className="retro-textarea mt-1 min-h-[80px]"
                        value={page.body}
                        maxLength={700}
                        onChange={(event) =>
                          setPages((current) =>
                            current.map((item) => (item.id === page.id ? { ...item, body: event.target.value } : item)),
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      <form onSubmit={addPage} className="panel space-y-3 p-4">
        <h3 className="text-sm">Add a new page</h3>
        <div className="grid gap-2 sm:grid-cols-[4rem_1fr]">
          <label className="block text-sm font-bold">
            Art
            <input
              className="retro-input mt-1 text-center"
              value={draft.art}
              maxLength={8}
              onChange={(event) => setDraft((current) => ({ ...current, art: event.target.value }))}
            />
          </label>
          <label className="block text-sm font-bold">
            Page text
            <textarea
              className="retro-textarea mt-1 min-h-[90px]"
              value={draft.body}
              maxLength={700}
              onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
              placeholder="Once, the moon forgot how to nap…"
            />
          </label>
        </div>
        <button type="submit" className="btn btn-pink" disabled={busyId === -1}>
          {busyId === -1 ? "Adding…" : "✨ Add page"}
        </button>
      </form>
    </div>
  );
}

import { ProjectsManager } from "@/components/dashboard/ContentManagers";
import { requireKeeperPage } from "@/lib/auth";
import { getProjects } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ProjectsDashboardPage() {
  await requireKeeperPage();
  const projects = await getProjects(true);
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-sm sm:text-base">Dream projects</h1>
        <p className="mono-retro mt-1 text-lg text-ink/80">
          Create, edit, publish and delete the dream files shown on the homepage and at /projects/[slug].
        </p>
      </div>
      <ProjectsManager initialProjects={projects} />
    </div>
  );
}

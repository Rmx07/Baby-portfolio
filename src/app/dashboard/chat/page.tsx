import { ChatLogManager } from "@/components/dashboard/CommunityManagers";
import { requireKeeperPage } from "@/lib/auth";
import { getChatMessages } from "@/lib/data";
import { geminiConfigured } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export default async function ChatDashboardPage() {
  await requireKeeperPage();
  const messages = await getChatMessages(80);
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-sm sm:text-base">Dream chat log</h1>
        <p className="mono-retro mt-1 text-lg text-ink/80">
          Gemini status:{" "}
          <strong>{geminiConfigured() ? "API key configured on the server" : "not configured — offline generator in use"}</strong>.
          Message content is shown for moderation; visitor identities are anonymous cookie ids.
        </p>
      </div>
      <ChatLogManager initialMessages={messages} />
    </div>
  );
}

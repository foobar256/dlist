import { redirect } from "next/navigation";
import { ThemeToggle } from "~/app/_components/theme-toggle";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
	const session = await getSession();
	if (!session) {
		redirect("/");
	}

	// Prefetch games
	void api.game.getDashboard.prefetch();

	return (
		<HydrateClient>
			<main className="min-h-screen bg-background p-4 text-foreground transition-colors duration-300 sm:p-8">
				<div className="mx-auto max-w-7xl space-y-8">
					<header className="flex items-center justify-between border-border border-b pb-6">
						<h1 className="font-bold text-3xl tracking-tight">Daily Quests</h1>
						<div className="flex items-center gap-4 text-muted-foreground text-sm">
							<ThemeToggle />
							Welcome back, {session.user.name}
						</div>
					</header>

					<DashboardClient />
				</div>
			</main>
		</HydrateClient>
	);
}

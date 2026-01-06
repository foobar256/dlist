import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { GameLauncher } from "~/app/_components/game-launcher";
import { ThemeToggle } from "~/app/_components/theme-toggle";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function Home() {
	const session = await getSession();

	// Prefetch the dashboard data on the server
	void api.game.getDashboard.prefetch();

	return (
		<HydrateClient>
			<main className="flex min-h-screen flex-col items-center bg-background text-foreground transition-colors duration-300">
				<div className="container flex flex-col items-center gap-8 px-4 py-8">
					<div className="flex w-full items-center justify-between">
						<h1 className="font-extrabold text-3xl tracking-tight sm:text-4xl">
							<span className="text-primary">Daily</span> Quest List
						</h1>

						<div className="flex items-center gap-4">
							<ThemeToggle />
							<p className="text-muted-foreground text-sm">
								{session && <span>{session.user?.name}</span>}
							</p>
							{!session ? (
								<form>
									<button
										className="rounded-full bg-black/10 px-6 py-2 font-semibold text-sm no-underline transition hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
										formAction={async () => {
											"use server";
											const res = await auth.api.signInSocial({
												body: {
													provider: "github",
													callbackURL: "/",
												},
											});
											if (!res.url) {
												throw new Error("No URL returned from signInSocial");
											}
											redirect(res.url);
										}}
										type="submit"
									>
										Sign in
									</button>
								</form>
							) : (
								<form>
									<button
										className="rounded-full bg-black/10 px-6 py-2 font-semibold text-sm no-underline transition hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
										formAction={async () => {
											"use server";
											await auth.api.signOut({
												headers: await headers(),
											});
											redirect("/");
										}}
										type="submit"
									>
										Sign out
									</button>
								</form>
							)}
						</div>
					</div>

					<GameLauncher />
				</div>
			</main>
		</HydrateClient>
	);
}

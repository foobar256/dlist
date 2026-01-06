"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";

const getTags = (game: { category: string | null }) => {
	if (!game.category) return ["Other"];
	return game.category
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean);
};

export function DashboardClient() {
	const [opening, setOpening] = useState(false);
	const [visibleTags, setVisibleTags] = useState<Set<string>>(new Set());
	const [hasInitializedTags, setHasInitializedTags] = useState(false);

	const utils = api.useUtils();
	const { data: games } = api.game.getDashboard.useQuery();

	const toggleMutation = api.game.togglePlayed.useMutation({
		onMutate: async (newEntry) => {
			await utils.game.getDashboard.cancel();
			const prevData = utils.game.getDashboard.getData();

			utils.game.getDashboard.setData(undefined, (old) => {
				if (!old) return [];
				return old.map((g) =>
					g.id === newEntry.gameId ? { ...g, played: newEntry.played } : g,
				);
			});

			return { prevData };
		},
		onError: (_err, _newEntry, ctx) => {
			utils.game.getDashboard.setData(undefined, ctx?.prevData);
		},
		onSettled: () => {
			utils.game.getDashboard.invalidate();
		},
	});

	const allTags = useMemo(() => {
		if (!games) return [];
		return Array.from(new Set(games.flatMap((g) => getTags(g)))).sort();
	}, [games]);

	useEffect(() => {
		if (allTags.length > 0 && !hasInitializedTags) {
			setVisibleTags(
				new Set(allTags.filter((t) => t !== "broken" && t !== "disliked")),
			);
			setHasInitializedTags(true);
		}
	}, [allTags, hasInitializedTags]);

	if (!games) return <div>Loading...</div>;

	const toggleVisibleTag = (tag: string) => {
		const newSet = new Set(visibleTags);
		if (newSet.has(tag)) {
			newSet.delete(tag);
		} else {
			newSet.add(tag);
		}
		setVisibleTags(newSet);
	};

	const setAllTags = (visible: boolean) => {
		if (visible) {
			setVisibleTags(new Set(allTags));
		} else {
			setVisibleTags(new Set());
		}
	};

	// Filtered games based on visible tags and sort by played status (unplayed first)
	const filteredGames = games
		.filter((g) => getTags(g).some((t) => visibleTags.has(t)))
		.sort((a, b) => {
			if (a.played === b.played) return a.name.localeCompare(b.name);
			return a.played ? 1 : -1;
		});

	const handleOpenAll = () => {
		setOpening(true);
		// Filter unplayed AND visible
		const toOpen = filteredGames.filter((g) => !g.played);

		if (toOpen.length === 0) {
			alert("No unplayed games in the current view!");
			setOpening(false);
			return;
		}

		toOpen.forEach((g) => {
			window.open(g.url, "_blank");
			toggleMutation.mutate({ gameId: g.id, played: true });
		});

		setOpening(false);
	};

	return (
		<div className="space-y-6">
			<div className="sticky top-0 z-10 flex flex-col gap-4 border-border border-b bg-background/90 py-4 backdrop-blur-md">
				<div className="flex items-center justify-between gap-4">
					<div className="flex flex-1 flex-wrap items-center gap-2">
						<button
							className="rounded-full border border-border bg-muted/50 px-3 py-1 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
							onClick={() => setAllTags(visibleTags.size !== allTags.length)}
							type="button"
						>
							{visibleTags.size === allTags.length
								? "Deselect All"
								: "Select All"}
						</button>
						{allTags.map((tag) => (
							<label
								className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors ${
									visibleTags.has(tag)
										? "border-primary bg-primary/10 text-primary"
										: "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
								}`}
								key={tag}
							>
								<input
									checked={visibleTags.has(tag)}
									className="hidden"
									onChange={() => toggleVisibleTag(tag)}
									type="checkbox"
								/>
								{tag}
							</label>
						))}
					</div>

					<button
						className="rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground shadow-lg transition-colors hover:opacity-90 disabled:opacity-50"
						disabled={opening || filteredGames.length === 0}
						onClick={handleOpenAll}
						type="button"
					>
						{opening ? "Opening..." : "Start Daily Routine 🚀"}
					</button>
				</div>
			</div>

			<div className="rounded-xl border border-border bg-card shadow-sm">
				<ul className="divide-y divide-border">
					{filteredGames.length === 0 ? (
						<li className="p-8 text-center text-muted-foreground">
							No games match the selected filters.
						</li>
					) : (
						filteredGames.map((game) => (
							<li
								className={`flex items-center gap-4 p-4 transition-colors hover:bg-muted/30 ${
									game.played ? "opacity-60" : ""
								}`}
								key={game.id}
							>
								<img
									alt=""
									className="h-6 w-6 shrink-0 rounded-sm bg-muted opacity-80"
									src={`https://www.google.com/s2/favicons?domain=${new URL(game.url).hostname}&sz=32`}
								/>

								<div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:gap-4">
									<a
										className={`flex-1 font-medium transition-colors hover:text-primary ${
											game.played
												? "text-muted-foreground line-through decoration-muted-foreground"
												: "text-card-foreground"
										}`}
										href={game.url}
										onClick={() =>
											toggleMutation.mutate({ gameId: game.id, played: true })
										}
										rel="noreferrer"
										target="_blank"
									>
										{game.name}
									</a>
									<div className="flex items-center gap-2">
										<span className="text-muted-foreground text-xs">
											{new URL(game.url).hostname}
										</span>
										<div className="flex flex-wrap gap-1">
											{getTags(game).map((tag) => (
												<span
													className={`rounded px-2 py-0.5 text-[10px] uppercase tracking-wider ${
														tag === "broken"
															? "bg-destructive/20 text-destructive"
															: tag === "disliked"
																? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
																: "bg-muted text-muted-foreground"
													}`}
													key={tag}
												>
													{tag}
												</span>
											))}
										</div>
									</div>
								</div>

								<button
									className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
										game.played
											? "bg-primary/20 text-primary hover:bg-primary/30"
											: "bg-muted text-muted-foreground hover:bg-muted/80"
									}`}
									onClick={(e) => {
										e.preventDefault();
										toggleMutation.mutate({
											gameId: game.id,
											played: !game.played,
										});
									}}
									title={game.played ? "Mark as unplayed" : "Mark as played"}
									type="button"
								>
									{game.played ? "✓" : "○"}
								</button>
							</li>
						))
					)}
				</ul>
			</div>
		</div>
	);
}

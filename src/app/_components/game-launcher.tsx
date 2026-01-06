"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";

type Game = {
	id: number;
	name: string;
	url: string;
	category: string | null;
	played: boolean;
};

export function GameLauncher() {
	// Use suspense query to ensure data is loaded
	const [games] = api.game.getDashboard.useSuspenseQuery();

	// State for selected game IDs
	const [selectedGameIds, setSelectedGameIds] = useState<Set<number>>(
		new Set(),
	);
	const [isLoaded, setIsLoaded] = useState(false);

	// Load from localStorage on mount
	useEffect(() => {
		if (isLoaded) return;

		try {
			const saved = localStorage.getItem("dlist-selected-games");
			if (saved) {
				const ids = JSON.parse(saved);
				if (Array.isArray(ids)) {
					setSelectedGameIds(new Set(ids));
				}
			} else {
				// Default: select all if nothing saved
				if (games) {
					setSelectedGameIds(new Set(games.map((g) => g.id)));
				}
			}
		} catch (e) {
			console.error("Failed to load selections", e);
		}
		setIsLoaded(true);
	}, [games, isLoaded]);

	// Save to localStorage whenever selection changes
	useEffect(() => {
		if (!isLoaded) return;
		try {
			localStorage.setItem(
				"dlist-selected-games",
				JSON.stringify(Array.from(selectedGameIds)),
			);
		} catch (e) {
			console.error("Failed to save selections", e);
		}
	}, [selectedGameIds, isLoaded]);

	const toggleGame = (id: number) => {
		const newSet = new Set(selectedGameIds);
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		setSelectedGameIds(newSet);
	};

	const launchGames = () => {
		const gamesToLaunch = games.filter((g) => selectedGameIds.has(g.id));
		if (gamesToLaunch.length === 0) return;

		// Open first one in current tab (optional) or all in new tabs?
		// Bash script: "waterfox --new-tab" implies keeping current one open or replacing it?
		// Usually "Launch" implies opening new things.
		gamesToLaunch.forEach((g) => {
			window.open(g.url, "_blank");
		});
	};

	// --- NEW LOGIC FOR TAG FILTERING ---
	const getTags = (game: Game) => {
		if (!game.category) return ["Uncategorized"];
		return game.category
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);
	};

	// All unique tags
	const allTags = Array.from(new Set(games.flatMap((g) => getTags(g)))).sort();

	// State for which tags are visible
	const [visibleTags, setVisibleTags] = useState<Set<string>>(new Set(allTags));

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

	// Filtered games based on visible tags: show game if ANY of its tags are selected
	const filteredGames = games
		.filter((g) => getTags(g).some((t) => visibleTags.has(t)))
		.sort((a, b) => {
			const aSelected = selectedGameIds.has(a.id);
			const bSelected = selectedGameIds.has(b.id);

			if (aSelected !== bSelected) {
				return aSelected ? -1 : 1;
			}

			if (a.played !== b.played) {
				return a.played ? 1 : -1;
			}

			return a.name.localeCompare(b.name);
		});
	// ------------------------------------

	if (!games) return <div>Loading...</div>;

	return (
		<div className="w-full max-w-4xl text-foreground">
			<div className="sticky top-0 z-10 mb-6 flex flex-col gap-4 border-border border-b bg-background/90 py-4 backdrop-blur-md">
				<div className="flex items-center justify-between">
					<h2 className="font-bold text-2xl">Daily Games</h2>
					<div className="flex gap-4">
						<span className="self-center text-muted-foreground text-sm">
							{selectedGameIds.size} selected
						</span>
						<button
							className="rounded-full bg-primary px-8 py-2 font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
							disabled={selectedGameIds.size === 0}
							onClick={launchGames}
							type="button"
						>
							Launch Selected 🚀
						</button>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
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
								className="flex items-center gap-4 p-4 hover:bg-muted/30"
								key={game.id}
							>
								<input
									checked={selectedGameIds.has(game.id)}
									className="h-5 w-5 cursor-pointer rounded border-input text-primary focus:ring-primary"
									id={`game-${game.id}`}
									onChange={() => toggleGame(game.id)}
									type="checkbox"
								/>
								<div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:gap-4">
									<label
										className={`flex-1 cursor-pointer font-medium transition hover:text-primary ${
											game.played ? "line-through opacity-50" : ""
										}`}
										htmlFor={`game-${game.id}`}
										title={game.url}
									>
										{game.name}
									</label>
									<div className="flex flex-wrap gap-1">
										{getTags(game).map((tag) => (
											<span
												className="inline-block rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground uppercase tracking-wider"
												key={tag}
											>
												{tag}
											</span>
										))}
									</div>
								</div>
								<a
									className="rounded-md p-2 hover:bg-muted hover:text-primary"
									href={game.url}
									rel="noopener noreferrer"
									target="_blank"
								>
									↗
								</a>
							</li>
						))
					)}
				</ul>
			</div>
		</div>
	);
}

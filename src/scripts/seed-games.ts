import * as fs from "node:fs";
import * as path from "node:path";
import { db } from "../server/db";
import { game } from "../server/db/schema";

async function main() {
	const scriptPath = path.resolve(process.cwd(), "open-dles.sh");
	console.log(`Reading games from ${scriptPath}...`);

	const content = fs.readFileSync(scriptPath, "utf-8");
	const lines = content.split("\n");

	const gamesToInsert = [];

	for (const line of lines) {
		const trimmed = line.trim();
		// Match lines that contain a URL, possibly commented out
		const match = trimmed.match(/^\s*(#?)\s*"([^"]+)"\s*(?:#\s*(.*))?$/);

		if (match) {
			const isCommentedOut = match[1] === "#";
			const url = match[2];
			const commentRaw = match[3] || "";

			if (!url || !url.startsWith("http")) continue;

			// Infer name from URL
			let name = "";
			try {
				const hostname = new URL(url).hostname;
				const parts = hostname.split(".");

				let inferredName = parts[0] || "";
				if (inferredName === "www" && parts.length > 1) {
					inferredName = parts[1] || "";
				}

				// Capitalize
				name = inferredName.charAt(0).toUpperCase() + inferredName.slice(1);

				if (hostname.includes("nytimes")) {
					if (url.includes("connections")) name = "NYT Connections";
					else if (url.includes("wordle")) name = "NYT Wordle";
					else if (url.includes("strands")) name = "NYT Strands";
					else name = "NYT Game";
				}
			} catch (_e) {
				name = url;
			}

			// Categories
			let category = commentRaw;
			const categoryMatch = category.split("(")[0];
			const extraMatch = category.match(/\((.*)\)/);
			let extraTag = "";
			if (extraMatch?.[1]) {
				extraTag = extraMatch[1].toLowerCase();
				if (extraTag.includes("not working")) extraTag = "broken";
				else if (
					extraTag.includes("don't like") ||
					extraTag.includes("don't know") ||
					extraTag.includes("don't watch")
				)
					extraTag = "disliked";
			}

			if (categoryMatch) {
				category = categoryMatch.trim();
			}
			category = category.replace(/,$/, "");

			if (extraTag) {
				category = category ? `${category}, ${extraTag}` : extraTag;
			}

			console.log(
				`Found: ${name} (${url}) - Category: ${category} [Active: true]`,
			);

			gamesToInsert.push({
				name,
				url,
				category: category || null,
				isActive: true,
			});
		}
	}

	console.log(`Inserting ${gamesToInsert.length} games...`);

	for (const g of gamesToInsert) {
		if (!g.url) continue;

		await db
			.insert(game)
			.values({
				name: g.name,
				url: g.url,
				category: g.category,
				isActive: g.isActive,
			})
			.onConflictDoUpdate({
				target: game.url,
				set: {
					isActive: g.isActive,
					category: g.category,
					name: g.name,
				},
			});
	}

	console.log("Done!");
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});

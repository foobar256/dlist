import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { game, gameProgress } from "~/server/db/schema";

export const gameRouter = createTRPCRouter({
	getDashboard: publicProcedure.query(async ({ ctx }) => {
		// Use server time for "today".
		// Ideally user timezone should be passed, but UTC midnight is a safe default for now.
		const startOfToday = new Date();
		startOfToday.setUTCHours(0, 0, 0, 0);

		const userId = ctx.session?.user?.id;

		const result = await ctx.db
			.select({
				id: game.id,
				name: game.name,
				url: game.url,
				category: game.category,
				// Check if a progress record exists for today
				playedId: gameProgress.id,
			})
			.from(game)
			.leftJoin(
				gameProgress,
				and(
					eq(gameProgress.gameId, game.id),
					userId ? eq(gameProgress.userId, userId) : sql`FALSE`,
					gte(gameProgress.playedAt, startOfToday),
				),
			)
			.where(eq(game.isActive, true))
			.orderBy(game.category, game.name);

		return result.map((r) => ({
			...r,
			played: r.playedId !== null,
		}));
	}),

	togglePlayed: protectedProcedure
		.input(z.object({ gameId: z.number(), played: z.boolean() }))
		.mutation(async ({ ctx, input }) => {
			const startOfToday = new Date();
			startOfToday.setUTCHours(0, 0, 0, 0);

			if (input.played) {
				// Check if already played to avoid duplicates (though UI should handle, race conditions exist)
				const existing = await ctx.db.query.gameProgress.findFirst({
					where: and(
						eq(gameProgress.userId, ctx.session.user.id),
						eq(gameProgress.gameId, input.gameId),
						gte(gameProgress.playedAt, startOfToday),
					),
				});

				if (!existing) {
					await ctx.db.insert(gameProgress).values({
						userId: ctx.session.user.id,
						gameId: input.gameId,
					});
				}
			} else {
				await ctx.db
					.delete(gameProgress)
					.where(
						and(
							eq(gameProgress.userId, ctx.session.user.id),
							eq(gameProgress.gameId, input.gameId),
							gte(gameProgress.playedAt, startOfToday),
						),
					);
			}
			return { success: true };
		}),
});

"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null; // or a placeholder to prevent hydration mismatch
	}

	return (
		<button
			aria-label="Toggle theme"
			className="rounded-full p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
			onClick={() => setTheme(theme === "light" ? "dark" : "light")}
			type="button"
		>
			{theme === "light" ? (
				<Sun className="h-5 w-5" />
			) : (
				<Moon className="h-5 w-5" />
			)}
		</button>
	);
}

import { expect, test } from "bun:test";
import { hello } from "./hello";

test("hello returns greeting", () => {
	expect(hello("World")).toBe("Hello, World!");
});

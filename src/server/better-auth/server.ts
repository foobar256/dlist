// import { headers } from "next/headers";
import { cache } from "react";
import type { Session } from "./config";

export const getSession = cache(async (): Promise<Session> => null);

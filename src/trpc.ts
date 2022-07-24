// ripped this example code from the trpc fastify example
import * as trpc from "@trpc/server";
import { z } from "zod";
import { inferAsyncReturnType } from "@trpc/server";
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type { OpenApiMeta } from "trpc-openapi";

export async function createContext({ req, res }: CreateFastifyContextOptions) {
	const user = { name: req?.headers?.username ?? "anonymous" };

	return { req, res, user };
}

export type Context = inferAsyncReturnType<typeof createContext>;

export const appRouter = trpc
	.router<Context, OpenApiMeta>()
	.query("hello", {
		meta: { openapi: { enabled: true, path: "/hello", method: "GET", tag: "TestQueries" } },
		input: z.object({}),
		output: z.string(),
		async resolve() {
			return "Hello, world";
		},
	})
	.query("avatar-random", {
		meta: { openapi: { enabled: true, path: "/avatar/{name}/{element}", method: "GET", tag: "TestQueries" } },
		input: z.object({
			name: z.string().default("Aang"),
			element: z.string().default("Air"),
		}),
		output: z.object({
			name: z.string(),
			bending: z.string(),
		}),
		async resolve({ input }) {
			return { name: input.name, bending: `${input.name} is bending ${input.element}` };
		},
	})
	.mutation("create-user", {
		meta: { openapi: { enabled: true, path: "/users", method: "POST", tag: "TestQueries" } },
		input: z.object({
			name: z.string().default("Pat"),
		}),
		output: z.object({
			name: z.string(),
			id: z.string(),
		}),
		async resolve({ input }) {
			return { name: input.name, id: "1" };
		},
	})
	.mutation("update-user", {
		meta: { openapi: { enabled: true, path: "/users/{id}", method: "PUT", tag: "TestQueries" } },
		input: z.object({
			id: z.string(),
			name: z.string().default("Pat"),
		}),
		output: z.object({
			name: z.string(),
			id: z.string(),
		}),
		async resolve({ input }) {
			return { name: input.name, id: input.id };
		},
	})
	.mutation("patch-user", {
		meta: { openapi: { enabled: true, path: "/users/{id}", method: "PATCH", tag: "TestQueries" } },
		input: z.object({
			id: z.string(),
			name: z.string().default("Pat"),
		}),
		output: z.object({
			name: z.string(),
			id: z.string(),
		}),
		async resolve({ input }) {
			return { name: input.name, id: input.id };
		},
	})
	.query("delete-user", {
		meta: { openapi: { enabled: true, path: "/users/{id}", method: "DELETE", tag: "TestQueries" } },
		input: z.object({
			id: z.string(),
		}),
		output: z.object({
			name: z.string(),
			id: z.string(),
		}),
		async resolve({ input }) {
			return { name: "Pat", id: input.id };
		},
	});

export type AppRouter = typeof appRouter;

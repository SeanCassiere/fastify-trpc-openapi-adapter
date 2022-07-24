import { AnyRouter } from "@trpc/server";
import { FastifyInstance } from "fastify";
import {
	createOpenApiNodeHttpHandler,
	CreateOpenApiNodeHttpHandlerOptions,
} from "trpc-openapi/dist/adapters/node-http/core";
import type { OpenApiRouter } from "trpc-openapi";

export type CreateOpenApiFastifyMiddlewareOptions<TRouter extends OpenApiRouter> = CreateOpenApiNodeHttpHandlerOptions<
	TRouter,
	any,
	any
> & {
	/**
	 * The path/prefix for the trpc-openapi to map your TRPC routes to dedicated public REST endpoints.
	 * @default /
	 */
	basePath?: `/${string}`;
};

export const createOpenApiFastifyMiddleware = <TRouter extends AnyRouter>(
	options: CreateOpenApiFastifyMiddlewareOptions<TRouter>
) => {
	const { basePath = "/", ...opts } = options;
	const openApiHttpHandler = createOpenApiNodeHttpHandler(opts);

	const normalizedPath = basePath.trim() !== "/" ? basePath.replace(/\/$/, "") : "/";
	const routeWildcardUrl = normalizedPath.trim() === "/" ? "/*" : normalizedPath + "/*";

	return (fastify: FastifyInstance, pluginOpts: {}, done: (err?: Error) => void) => {
		fastify.route({
			method: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS", "HEAD"],
			url: routeWildcardUrl,
			handler: async (request, reply) => {
				const endpointWithoutPrefix = basePath.trim() === "/" ? request.url : request.url.replace(normalizedPath, "");
				return await openApiHttpHandler(
					{ ...request, url: endpointWithoutPrefix, method: request.method },
					{
						...reply,
						setHeader: (key: string, value: string) => reply.header(key, value),
						end: (body: any) => reply.send(body),
					}
				);
			},
		});

		done();
	};
};

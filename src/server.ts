import fastifyServer from "fastify";
import fastifySwagger from "@fastify/swagger";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";

import { createContext, appRouter } from "./trpc";
import { openApiDocument } from "./openapi";
import { createOpenApiFastifyMiddleware } from "./fastify";

const fastify = fastifyServer({
	maxParamLength: 5000,
});

fastify.register(fastifyTRPCPlugin, {
	prefix: "/trpc",
	trpcOptions: { router: appRouter, createContext },
});

/**
 * ------------------------------------------------------------
 * Plugin down below!
 */
fastify.register(createOpenApiFastifyMiddleware({ router: appRouter, createContext }));
/**
 * ------------------------------------------------------------
 */

fastify.register(fastifySwagger, {
	routePrefix: "/docs",
	mode: "static",
	specification: { document: openApiDocument },
	uiConfig: { displayOperationId: true },
	exposeRoute: true,
});

fastify.get("/openapi.json", async () => {
	return openApiDocument;
});

function main() {
	try {
		fastify.ready(async (err) => {
			if (err) throw err;
			fastify.swagger();
			fastify.listen({ port: 3000 }, (_, address) => {
				console.log(`Server listening on ${address}`);
			});
		});
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

main();

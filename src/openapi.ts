import { generateOpenApiDocument } from "trpc-openapi";
import { appRouter } from "./trpc";

export const openApiDocument = generateOpenApiDocument(appRouter, {
	title: `tRPC OpenAPI`,
	version: "1.0.0",
	baseUrl: "http://localhost:3000",
	docsUrl: "http://localhost:3000/openapi.json",
	tags: ["TestQueries"],
});

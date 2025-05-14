import { RouteOptions } from "fastify";
import { generateEndpointTypes } from "./generate-endpoint-types";
import { getIndent } from "./get-indent";

export function generateApiSchema(routes: RouteOptions[]) {
  const routesByUrl = routes.reduce((acc, route) => {
    if (!acc[route.url]) {
      acc[route.url] = [];
    }
    acc[route.url].push(route);
    return acc;
  }, {} as Record<string, RouteOptions[]>);

  let result = `export type APISchema = {
${Object.entries(routesByUrl).map(([url, urlRoutes]) => {
const methodEndpoints = urlRoutes
  .filter(route => route.schema)
  .flatMap(route => {
    const methods = Array.isArray(route.method) 
      ? route.method 
      : route.method.split(',');
    const endpointTypes = generateEndpointTypes(route.schema!, 3);
    return methods.map(method => 
      `${getIndent(2)}'${method}': {\n${endpointTypes.join(',\n')}\n${getIndent(2)}}`
    );
  })
  .join(',\n');

return `${getIndent(1)}'${url}': {\n${methodEndpoints}\n${getIndent(1)}}`;
}).join(',\n')}
};`;
  return result;
}
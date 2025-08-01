import { FastifyInstance } from "fastify";
import { IRoute } from "./route";

export abstract class RouteDiscoveryStrategy {
  abstract discover(app: FastifyInstance): Promise<IRoute[]>
}
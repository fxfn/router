import { App } from "@/index";
import { IRoute } from "./route";

export abstract class RouteDiscoveryStrategy {
  abstract discover(app: App): Promise<IRoute[]>
}
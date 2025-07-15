import { getIndent } from "./get-indent";
import { zodToTS } from "./zod-to-ts";

export function generateEndpointTypes(schema: any, baseIndent: number): string[] {
  const endpointTypes = [];
  
  if (schema.body) {
    endpointTypes.push(`${getIndent(baseIndent)}body: ${zodToTS(schema.body, baseIndent)}`);
  }
  
  if (schema.params) {
    endpointTypes.push(`${getIndent(baseIndent)}params: ${zodToTS(schema.params, baseIndent)}`);
  }
  
  if (schema.querystring) {
    endpointTypes.push(`${getIndent(baseIndent)}query: ${zodToTS(schema.querystring, baseIndent)}`);
  }
  
  if (schema.response) {
    const responses: string[] = [];
    Object.entries(schema.response).forEach(([status, schema]) => {
      responses.push(`${getIndent(baseIndent + 1)}${status}: ${zodToTS(schema as any, baseIndent + 1)}`);
    });
    endpointTypes.push(`${getIndent(baseIndent)}response: {\n${responses.join(',\n')}\n${getIndent(baseIndent)}}`);
  }
  
  return endpointTypes;
}
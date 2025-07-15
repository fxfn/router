import { z } from "zod/v4";
import { getIndent } from "./get-indent";

export function zodToTS(schema: z.ZodType, indent = 0): string {
  if (!schema?.def) {
    throw new Error('Invalid Zod schema provided');
  }

  const {def, _zod} = schema;
  
  switch (def.type) {
    case 'string':
      return 'string';
    
    case 'number':
      return 'number';
    
    case 'boolean':
      return 'boolean';
    
    case 'date':
      return 'Date';
    
    case 'null':
      return 'null';
    
    case 'undefined':
      return 'undefined';
    
    case 'any':
      return 'any';
    
    case 'unknown':
      return 'unknown';
    
    case 'never':
      return 'never';
    
    case 'void':
      return 'void';
    
    case 'array': {
      const value = (def as any).element;
      if (value._def.typeName === 'ZodLiteral' && Array.isArray(value._def.values[0])) {
        return `[${value._def.values[0].map((v: any) => typeof v === 'string' ? `'${v}'` : String(v)).join(', ')}]`;
      }
      return `${zodToTS(value, indent)}[]`;
    }
    
    case 'object': {
      const entries = Object.entries((def as any).shape);
      if (entries.length === 0) return '{}';
      
      const props = entries.map(([key, value]: any) => {
        const isOptional = value._def.typeName === 'ZodOptional';
        const valueType = isOptional ? value._def.innerType : value;
        const propType = zodToTS(valueType, indent + 1);
        return `${getIndent(indent + 1)}${key}${isOptional ? '?' : ''}: ${propType}`;
      });
      return `{\n${props.join(';\n')}${props.length ? ';' : ''}\n${getIndent(indent)}}`;
    }
    
    case 'enum':
      return Object.values((def as any).entries).map((v: any) => `'${v}'`).join(' | ');
    
    case 'union':
      return (def as any).options.map((type: any) => zodToTS(type, indent)).join(' | ');

    // case 'ZodDiscriminatedUnion': {
    //   const options = Array.from(def.options.values());
    //   return options.map((option: any) => zodToTS(option, indent)).join(' | ');
    // }
    
    case 'intersection':
      return `${zodToTS((def as any).left, indent)} & ${zodToTS((def as any).right, indent)}`;
    
    case 'optional':
      return `${zodToTS((def as any).innerType, indent)} | undefined`;
    
    case 'nullable':
      return `${zodToTS((def as any).innerType, indent)} | null`;
    
    case 'tuple': {
      const tupleItems = (def as any).items.map((item: any) => zodToTS(item, indent));
      return `[${tupleItems.join(', ')}]`;
    }
    
    case 'record':
      return `Record<${zodToTS((def as any).keyType, indent)}, ${zodToTS((def as any).valueType, indent)}>`;
    
    case 'map':
      return `Map<${zodToTS((def as any).keyType, indent)}, ${zodToTS((def as any).valueType, indent)}>`;
    
    case 'set':
      return `Set<${zodToTS((def as any).valueType, indent)}>`;
    
    case 'literal':
      return typeof (def as any).values[0] === 'string' ? `'${(def as any).values[0]}'` : String((def as any).values[0]);
    
    case 'promise':
      return `Promise<${zodToTS((def as any).type, indent)}>`;
    
    case 'default':
      return zodToTS((def as any).innerType, indent);
    
    default:
      throw new Error(`Unsupported Zod type: ${def.type}`);
  }
}
import type { Endpoint, EndpointParam } from '../types/api.js';

export function resolveRef(ref: string, schema: any): any {
  if (!ref.startsWith('#/')) return null;
  const parts = ref.replace('#/', '').split('/');
  let current = schema;
  for (const part of parts) {
    if (!current || !current[part]) return null;
    current = current[part];
  }
  return current;
}

export function extractSchemaProperties(objSchema: any, rootSchema: any, paramsList: EndpointParam[], prefix = '') {
  if (!objSchema) return;
  
  let resolved = objSchema;
  if (objSchema.$ref) {
    resolved = resolveRef(objSchema.$ref, rootSchema);
  }
  
  if (!resolved || resolved.type !== 'object' || !resolved.properties) return;
  
  for (const [key, prop] of Object.entries(resolved.properties) as [string, any][]) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    let propResolved = prop;
    if (prop.$ref) {
      propResolved = resolveRef(prop.$ref, rootSchema) || prop;
    }
    
    paramsList.push({
      name: fullKey,
      in: 'body',
      type: propResolved.type || 'string',
      required: (resolved.required || []).includes(key),
      description: propResolved.description,
      defaultValue: propResolved.default
    });
  }
}

export function parseEndpoints(schema: any): Endpoint[] {
  const endpoints: Endpoint[] = [];
  if (!schema || !schema.paths) return endpoints;

  for (const [pathUrl, methods] of Object.entries(schema.paths)) {
    for (const [method, details] of Object.entries(methods as Record<string, any>)) {
      const params: EndpointParam[] = [];
      
      if (details.parameters) {
        for (const p of details.parameters) {
          let pRes = p;
          if (p.$ref) pRes = resolveRef(p.$ref, schema) || p;
          if (pRes.in === 'header' && !pRes.required) continue;
          
          params.push({
            name: pRes.name,
            in: pRes.in as any,
            type: pRes.schema?.type || 'string',
            required: !!pRes.required,
            description: pRes.description
          });
        }
      }
      
      if (details.requestBody) {
        let rb = details.requestBody;
        if (rb.$ref) rb = resolveRef(rb.$ref, schema) || rb;
        const content = rb.content?.['application/json'];
        if (content && content.schema) {
          extractSchemaProperties(content.schema, schema, params);
        }
      }
      
      endpoints.push({
        id: `${method.toUpperCase()} ${pathUrl}`,
        method: method.toUpperCase(),
        path: pathUrl,
        summary: details.summary || details.description || pathUrl,
        parameters: params
      });
    }
  }
  return endpoints;
}

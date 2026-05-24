export interface EndpointParam {
  name: string;
  in: 'query' | 'path' | 'header' | 'body';
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: any;
}

export interface Endpoint {
  id: string;
  method: string;
  path: string;
  summary: string;
  parameters: EndpointParam[];
}

export interface APIBranding {
  title: string;
  primaryColor: string;
  borderColor: string;
}

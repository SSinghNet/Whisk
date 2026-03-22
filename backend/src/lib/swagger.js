import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

export const registry = new OpenAPIRegistry()

export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions)
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Whisk API',
      version: '1.0.0',
      description: 'API documentation for the Whisk backend',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local development server' },
      { url: 'https://whisk-lznv.onrender.com', description: 'Production server' },
    ],
  })
}
import createError from "@fastify/error"

export class InvalidSchemaError extends createError('FST_ERR_INVALID_SCHEMA', 'Invalid schema passed: %s', 500) {
}
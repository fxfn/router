import { FastifyInstance } from "fastify"
import fp from "fastify-plugin"

async function urlContentType(fastify: FastifyInstance) {
  fastify.addContentTypeParser(
    'application/x-www-form-urlencoded', 
    { parseAs: 'buffer' },
    async (req, body) => {

    return Object.fromEntries(new URLSearchParams(body.toString()))
  })
}

export default fp(urlContentType, {
  fastify: '>=5.0.0'
})
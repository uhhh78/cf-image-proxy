/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

 export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
}

//Add the URL here
const BASE_URL = `https://example.com`



export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const url = new URL(request.url)
		const cache = await caches.open("image-proxy")
		let responseImage = await cache.match(request)
		if(!responseImage){
			responseImage = await fetch(`${BASE_URL}${url.pathname}`)
			const headers = {
				"cache-control": "public, max-age=604800",
				"expires": new Date(Date.now() + 604800000).toUTCString(),
				"last-modified": new Date(Date.now()).toUTCString(),
				"content-type": responseImage.headers.get("content-type") as string,
				"mime-type": responseImage.headers.get("content-type") as string
			}
			responseImage = new Response(responseImage.body, { ...responseImage, headers })
			console.log(`Caching ${url.pathname}`)
			ctx.waitUntil(cache.put(request, responseImage.clone()))
		}
		return responseImage

}}

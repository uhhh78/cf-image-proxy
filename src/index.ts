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

import { gracefulShutdown } from '$lib/server/pubsub';

console.log("RUNNING ON " + ((import.meta.env.MODE !== "production") ? "DEVELOPMENT" : "PRODUCTION"));

export async function handle({ event, resolve }) {
    const response = await resolve(event, {
        preload: ({ type }) => {
        return (type === 'font') || (type === 'js') || (type === 'css');
        }
    });

    response.headers.set('Access-Control-Allow-Origin', (import.meta.env.MODE == "production") ? '*' /*"*.3mworkshop.org"*/ : '*'); 
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', '*');

    if (event.request.method === 'OPTIONS') {
        return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': (import.meta.env.MODE == "production") ? '*' /*"*.3mworkshop.org"*/ : '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': '*',
        }
        });
    }

    return response;
}

process.on('sveltekit:shutdown', async () => {
    await gracefulShutdown();
}); 
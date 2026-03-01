export async function handle({ event, resolve }) {
  const response = await resolve(event);


  response.headers.set('Access-Control-Allow-Origin', (import.meta.env.MODE == "production") ? "*.3mworkshop.org" : '*'); 
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', '*');

  if (event.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': (import.meta.env.MODE == "production") ? "*.3mworkshop.org" : '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      }
    });
  }

  return response;
}
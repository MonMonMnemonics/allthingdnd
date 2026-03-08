import { addPubSubListener, broadcastDt, pubSubHeader } from "$lib/server/pubsub";
import { text } from '@sveltejs/kit';

export function GET(req) {
    const ipAddr = req.getClientAddress();
    const body = addPubSubListener("rune-wheel", ipAddr);

    return new Response(body, { headers: pubSubHeader });
}

export async function POST(req) {
    const body = await req.request.json();
    broadcastDt("rune-wheel", {
        flag: 'USER-INPUT',
        data: {
            innerShift: body.innerShift ?? 0,
            outerShift: body.outerShift ?? 0,
        }
    });

    return text("OK", { status: 200 });
}
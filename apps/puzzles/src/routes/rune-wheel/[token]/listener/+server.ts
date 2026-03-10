import { decrypt } from "$lib/helpers/encrypter.js";
import { decodeToken } from "$lib/helpers/tokenization.js";
import { addPubSubListener, broadcastDt, pubSubHeader } from "$lib/server/pubsub";
import { text } from '@sveltejs/kit';

export async function GET(req) {
    const ipAddr = req.getClientAddress();

    try {
        const encodedToken = await decrypt(req.params.token);
        const token = decodeToken(encodedToken);

        if (token) {
            const body = addPubSubListener(token, ipAddr);
            return new Response(body, { headers: pubSubHeader });
        }      

        return text("INVALID TOKEN", { status: 400 })
    } catch (err) {
        return text("INVALID TOKEN", { status: 400 })
    }
}

export async function POST(req) {
    const body = await req.request.json();

    try {
        const encodedToken = await decrypt(req.params.token);
        const token = decodeToken(encodedToken);

        if (token) {
            broadcastDt(token, {
                flag: 'USER-INPUT',
                data: {
                    innerShift: body.innerShift ?? 0,
                    outerShift: body.outerShift ?? 0,
                }
            });

            return text("OK", { status: 200 });
        }      

        return text("INVALID TOKEN", { status: 400 })
    } catch (err) {
        return text("INVALID TOKEN", { status: 400 })
    }
}
import { decrypt } from "$lib/helpers/encrypter.js";
import type { RuneWheel } from "$lib/helpers/rune-wheel.js";
import { decodeToken } from "$lib/helpers/tokenization.js";
import { addPubSubListener, broadcastDt, getWatcherState, pubSubHeader } from "$lib/server/pubsub";
import { text } from '@sveltejs/kit';

export async function GET(req) {
    const ipAddr = req.request.headers.get('X-Forwarded-For') ??  req.request.headers.get('X-Real-IP') ?? req.getClientAddress();

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
            let puzzState = getWatcherState(token);
            if (puzzState != null) {
                puzzState = puzzState as RuneWheel;
                if (puzzState.progress == puzzState.keySequence.length) {
                    return text("OK", { status: 200 });
                }

                const correctAnswer = puzzState.keySequence[puzzState.progress];
                
                if (token.gm) {
                    token.playerId = body.playerId;
                }
                
                if ((body.icoIdx == correctAnswer.icoIdx) && (token.playerId == correctAnswer.owner)) {
                    if (puzzState.progress < puzzState.keySequence.length) {
                        broadcastDt(token, {
                            flag: 'USER-INPUT',
                            data: {
                                result: true,
                                progress: puzzState.progress + 1,
                                innerShift: body.innerShift ?? 0,
                                outerShift: body.outerShift ?? 0,
                            }
                        });
                    }

                    puzzState.progress += 1;
                } else {
                    puzzState.progress = 0;
                    broadcastDt(token, {
                        flag: 'USER-INPUT',
                        data: {
                            result: false,
                            progress: puzzState.progress,
                            innerShift: 0,
                            outerShift: 0,
                        }
                    });
                }
            }

            return text("OK", { status: 200 });
        }      

        return text("INVALID TOKEN", { status: 400 })
    } catch (err) {
        return text("INVALID TOKEN", { status: 400 })
    }
}
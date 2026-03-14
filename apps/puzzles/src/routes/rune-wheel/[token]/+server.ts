import { decrypt } from '$lib/helpers/encrypter.js';
import type { RuneWheel } from '$lib/helpers/rune-wheel';
import { decodeToken } from '$lib/helpers/tokenization.js';
import { getWatcherState, broadcastDt } from '$lib/server/pubsub';
import { text } from '@sveltejs/kit';

export async function POST(req) {
    const body = await req.request.json();

    try {
        const encodedToken = await decrypt(req.params.token);
        const token = decodeToken(encodedToken);

        if (token) {
            let puzzState = getWatcherState(token);
            if (puzzState != null) {
                puzzState = puzzState as RuneWheel;
                broadcastDt(token, {
                    flag: 'GM-INIT',
                    data: {
                        ...puzzState.getState(body.playerId ?? 0),
                        id: body.id
                    }
                }, true);
            }

            return text("OK", { status: 200 });
        }      

        return text("INVALID TOKEN", { status: 400 })
    } catch (err) {
        console.log(err);
        return text("INVALID TOKEN", { status: 400 })
    }
}

export async function DELETE(req) {
    try {
        const encodedToken = await decrypt(req.params.token);
        const token = decodeToken(encodedToken);

        if (token) {
            let puzzState = getWatcherState(token);
            if (puzzState != null) {
                puzzState = puzzState as RuneWheel;
                puzzState.progress = 0;
                broadcastDt(token, {
                    flag: 'USER-INPUT',
                    data: {
                        result: false,
                        progress: puzzState.progress + 1,
                        innerShift: 0,
                        outerShift: 0,
                    }
                });
            }
        }      

        return text("INVALID TOKEN", { status: 400 })
    } catch (err) {
        console.log(err);
        return text("INVALID TOKEN", { status: 400 })
    }
}
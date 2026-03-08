import { encrypt } from '$lib/helpers/encrypter.js';
import { json, text } from '@sveltejs/kit';

export async function POST(req) {
    const data = await req.request.json();

    for (const key of ["nPlayer", "seed"]) {
        if (!data.hasOwnProperty(key)) {
            return text("INVALID DATA", { status: 400 });
        }
    }

    const gmToken = await encrypt(JSON.stringify({ nPlayer: data.nPlayer, seed: data.seed, gm: true }));
    
    let playerTokens: string[] = []
    while (playerTokens.length < data.nPlayer) {
        const token = await encrypt(JSON.stringify({ nPlayer: data.nPlayer, seed: data.seed, gm: false, playerId: playerTokens.length }));
        playerTokens.push(token);
    }

    return json({
        gmToken,
        playerTokens
    }, { status: 200 });
}
import { encodeToken, PuzzleCode, type Token } from '$lib/helpers/tokenization.js';
import { encrypt } from '$lib/helpers/encrypter.js';
import { json, text } from '@sveltejs/kit';
import MersenneTwister from '$lib/helpers/mersenneRandom.js';

export async function POST(req) {
    let data = await req.request.json();

    for (const key of ["nPlayer"]) {
        if (!data.hasOwnProperty(key)) {
            return text("INVALID DATA", { status: 400 });
        }
    }

    if (!data.seed) {
        data.seed = Math.floor(Math.random()*100000);
    }

    const gmToken: Token = { type: PuzzleCode.RUNE_WHEEL, nPlayer: data.nPlayer, seed: data.seed, gm: true };
    const encodedGmToken = await encrypt(encodeToken(gmToken));

    let playerTokens: string[] = []
    while (playerTokens.length < data.nPlayer) {
        const token: Token = { type: PuzzleCode.RUNE_WHEEL, nPlayer: data.nPlayer, seed: data.seed, gm: false, playerId: playerTokens.length };
        const encodedToken = await encrypt(encodeToken(token));
        playerTokens.push(encodedToken);
    }

    return json({
        gmToken: encodedGmToken,
        playerTokens
    }, { status: 200 });
}
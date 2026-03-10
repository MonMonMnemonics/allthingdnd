export const PuzzleCode = {
    RUNE_WHEEL: "ruwhl"
}

export type Token = {
    type: string,
    nPlayer: number,
    seed: number,
    gm: boolean,
    playerId?: number
}

export function encodeToken(token: Token): string {
    let encodedToken = token.type.toString();
    encodedToken += "/" + token.nPlayer.toString();
    encodedToken += "/" + token.seed.toString();
    encodedToken += "/" + (token.gm ? "1" : "0");

    if (token.playerId != undefined) {
        encodedToken += "/" + token.playerId.toString();
    }

    return(encodedToken);
}

export function decodeToken(encodedToken: string): Token | null {
    const splitToken = encodedToken.split("/");

    if (!Object.values(PuzzleCode).includes(splitToken[0])) {
        return null;
    }

    return ({
        type: splitToken[0],
        nPlayer: Number(splitToken[1]),
        seed: Number(splitToken[2]),
        gm: (splitToken[3] == "1"),
        playerId: splitToken.length > 3 ? Number(splitToken[4]) : undefined
    });
}
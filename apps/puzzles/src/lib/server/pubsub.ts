import { PuzzleCode, type Token } from "$lib/helpers/tokenization";
import { RuneWheel } from "$lib/helpers/rune-wheel";
import type { ReadableStreamDefaultController } from "stream/web";

export const pubSubHeader = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
};

export type PuzzleState = {
    progress: number,
    colour: string[],
    resetState: () => void,
    getState: (idx: number) => Object,
}

type Watcher = {
    conn: {[index: string]: {[index: string]: {
        controller: ReadableStreamDefaultController,
        playerId: number | undefined,
        gm: boolean
    }}},
    staleCount: number,
    state: RuneWheel
};

let listenerPack: {[index: string]: Watcher} = {};

export let pingerId: NodeJS.Timeout | undefined;
function broadcast(key: string, data: string, gmOnly: boolean = false){
    if (listenerPack.hasOwnProperty(key)) {
        if (gmOnly) {
            Object.values(listenerPack[key].conn).forEach(connList => 
                Object.values(connList).filter(c => c.gm).forEach(c => 
                    c.controller.enqueue("data:" + data + "\n\n")
                )
            );
        } else {
            Object.values(listenerPack[key].conn).forEach(connList => 
                Object.values(connList).forEach(c => 
                    c.controller.enqueue("data:" + data + "\n\n")
                )
            );
        }
    }    
}

function getTokenId(token: Token) {
    return token.type + "-" + token.nPlayer.toString() + "-" + token.seed.toString();
}

if (!pingerId) {
    pingerId = setInterval(() => {
        for (const key in listenerPack) {
            for (const ip in listenerPack[key].conn) {
                if (Object.keys(listenerPack[key].conn[ip]).length <= 0) {
                    delete listenerPack[key].conn[ip];
                }
            }

            if (Object.keys(listenerPack[key].conn).length > 0) {
                broadcast(key, "{}");
            } else {
                delete listenerPack[key];
            }            
        }
    }, 10*1000);
}

export async function gracefulShutdown() {
    if (pingerId) {
        clearInterval(pingerId);
    }
    console.log("CLEARED PINGER");

    for (const key in listenerPack) {
        for (const ip in listenerPack[key].conn) {
            for (const connId in listenerPack[key].conn[ip]) {
                try {
                    listenerPack[key].conn[ip][connId].controller.close();
                } catch (error) {
                    console.log(error);
                }

                delete listenerPack[key].conn[ip][connId];
            }

            delete listenerPack[key].conn[ip];
        }
        delete listenerPack[key];
    }
    
    console.log("CLOSED ALL ACTIVE CONNECTIONS")
}

export function getWatcherState(token: Token) {
    const key = getTokenId(token);
    if (!listenerPack.hasOwnProperty(key)) {
        return null;
    }

    if (token.type == PuzzleCode.RUNE_WHEEL) {
        return listenerPack[key].state as RuneWheel;
    } else {
        return null;
    }
}

export function broadcastDt(token: Token, data: Object, gmOnly: boolean = false) {
    broadcast(getTokenId(token), JSON.stringify(data), gmOnly);
}

export function addPubSubListener(token: Token, ip: string): ReadableStream {
    const listenerId = getTokenId(token);
    if (!listenerPack.hasOwnProperty(listenerId)) {
        if (token.type == PuzzleCode.RUNE_WHEEL) {
            listenerPack[listenerId] = {
                conn: {},
                staleCount: 0,
                state: new RuneWheel(token)
            };
        }        
    }

    if (!listenerPack[listenerId].conn.hasOwnProperty(ip)) {
        listenerPack[listenerId].conn[ip] = {};
    }

    const connId = crypto.randomUUID();
    const body = new ReadableStream({
        start(controller) {
            const takenId = Object.values(listenerPack[listenerId].conn[ip]).filter(c => !c.gm).map(c => c.playerId);
            console.log({
                ip: ip,
                playerId: token.playerId,
                takenId: takenId
            });

            if (takenId.length > 0) {
                if (!takenId.includes(token.playerId)) {
                    if (!token.gm) {
                        controller.enqueue("data:" + JSON.stringify({
                            flag: "REJECTED",
                        }) + "\n\n")
                        return;
                    }
                }
            }

            listenerPack[listenerId].conn[ip][connId] = {
                controller: controller,
                playerId: token.playerId,
                gm: token.gm
            };

            if (token.gm) {
                controller.enqueue("data:" + JSON.stringify({
                    flag: "GM-MODE",
                    id: connId
                }) + "\n\n")
            }

            if (token.type == PuzzleCode.RUNE_WHEEL) {
                const state = listenerPack[listenerId].state as RuneWheel;
                controller.enqueue("data:" + JSON.stringify({
                    flag: "STATE",
                    data: state.getState(token.playerId ?? 0)
                }) + "\n\n");                
            }
        },

        cancel() {
            delete listenerPack[listenerId].conn[ip][connId];
        },
        
    });

    return (body);
}

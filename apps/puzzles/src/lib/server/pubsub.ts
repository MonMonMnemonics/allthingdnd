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
    conn: {[index: string]: {[index: string]: ReadableStreamDefaultController}},
    staleCount: number,
    state: RuneWheel
};

let listenerPack: {[index: string]: Watcher} = {};

let pingerId: NodeJS.Timeout | undefined;
function broadcast(key: string, data: string){
    if (listenerPack.hasOwnProperty(key)) {
        Object.values(listenerPack[key].conn).forEach(connList => 
            Object.values(connList).forEach(c => 
                c.enqueue("data:" + data + "\n\n")
            )
        );
    }    
}

if (!pingerId) {
    pingerId = setInterval(() => {
        for (const key in listenerPack) {
            if (Object.keys(listenerPack[key].conn).length > 0) {
                broadcast(key, "{}");
            } else {
                delete listenerPack[key];
            }            
        }
    }, 10*1000);
}

export function getWatcherState(token: Token) {
    const key = token.type + "-" + token.nPlayer.toString() + "-" + token.seed.toString();
    if (!listenerPack.hasOwnProperty(key)) {
        return null;
    }

    if (token.type == PuzzleCode.RUNE_WHEEL) {
        return listenerPack[key].state as RuneWheel;
    } else {
        return null;
    }
}

export function broadcastDt(token: Token, data: Object) {
    broadcast(token.type + "-" + token.nPlayer.toString() + "-" + token.seed.toString(), JSON.stringify(data));
}

export function addPubSubListener(token: Token, ip: string): ReadableStream {
    const listenerId = token.type + "-" + token.nPlayer.toString() + "-" + token.seed.toString();
    if (!listenerPack.hasOwnProperty(listenerId)) {
        listenerPack[listenerId] = {
            conn: {},
            staleCount: 0,
            state: new RuneWheel(token)
        };
    }

    if (!listenerPack[listenerId].conn.hasOwnProperty(ip)) {
        listenerPack[listenerId].conn[ip] = {};
    }

    const connId = Date.now();
    const body = new ReadableStream({
        start(controller) {
            listenerPack[listenerId].conn[ip][connId] = controller;

            if (token.type == PuzzleCode.RUNE_WHEEL) {
                const state = listenerPack[listenerId].state as RuneWheel;
                if (state.progress < state.keySequence.length) {
                    controller.enqueue("data:" + JSON.stringify({
                        flag: "STATE",
                        data: state.getState(token.playerId ?? 0)
                    }) + "\n\n")
                }
            }
        },
        cancel() {
            delete listenerPack[listenerId].conn[ip][connId];
        },
    });

    return (body);
}

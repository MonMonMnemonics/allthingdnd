import type { ReadableStreamDefaultController } from "stream/web";

export const pubSubHeader = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
};

type Watcher = {
    conn: {[index: string]: {[index: string]: ReadableStreamDefaultController}},
    staleCount: number
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

export function broadcastDt(token: string, data: Object) {
    broadcast(token, JSON.stringify(data));
}

export function addPubSubListener(token: string, ip: string): ReadableStream {
    if (!listenerPack.hasOwnProperty(token)) {
        listenerPack[token] = {
            conn: {},
            staleCount: 0
        };
    }

    if (!listenerPack[token].conn.hasOwnProperty(ip)) {
        listenerPack[token].conn[ip] = {};
    }

    const connId = Date.now();

    const body = new ReadableStream({
        start(controller) {
            listenerPack[token].conn[ip][connId] = controller;
        },
        cancel() {
            delete listenerPack[token].conn[ip][connId];
        },
    });

    return (body);
}

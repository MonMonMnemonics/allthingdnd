import { APP_KEY } from '$env/static/private';

function concatArrayBuffers(buffers: ArrayBuffer[]) {
    let totalLength = buffers.reduce((acc, buffer) => acc + buffer.byteLength, 0);
    let result = new Uint8Array(totalLength);
    let offset = 0;

    for (const buffer of buffers) {
        result.set(new Uint8Array(buffer), offset);
        offset += buffer.byteLength;
    }

    return result.buffer;
}

function bufferToBase64URL (arrayBuffer: ArrayBuffer) {
    let base64    = '';
    let encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

    let bytes         = new Uint8Array(arrayBuffer);
    let byteLength    = bytes.byteLength;
    let byteRemainder = byteLength % 3;
    let mainLength    = byteLength - byteRemainder;

    let a, b, c, d;
    let chunk;

    for (let i = 0; i < mainLength; i = i + 3) {
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

        a = (chunk & 16515072) >> 18;
        b = (chunk & 258048) >> 12;
        c = (chunk & 4032) >> 6;
        d = chunk & 63 ;

        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
    }

    if (byteRemainder == 1) {
        chunk = bytes[mainLength];

        a = (chunk & 252) >> 2;
        b = (chunk & 3) << 4;

        base64 += encodings[a] + encodings[b] + '==';
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

        a = (chunk & 64512) >> 10;
        b = (chunk & 1008) >> 4;
        c = (chunk & 15) <<  2;

        base64 += encodings[a] + encodings[b] + encodings[c] + '=';
    }
    
    return base64;
}

function base64URLToBuffer(text: string) {
    const encodings = ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_").split("");
    let buffer = [];

    for(let i = 0; i < text.length/4; i++) {
        let chunk = [...text.slice(4*i, 4*i + 4)]
        let bin = chunk.map(x=> encodings.indexOf(x).toString(2).padStart(6, "0")).join('');
        let bytes = (bin.match(/.{1,8}/g) ?? []).map(x=> +("0b" + x));
        buffer.push(...bytes.slice(0, 3 - ((text[4*i + 2] == "=") ? 1 : 0) - ((text[4*i + 3] == "=") ? 1 : 0)));
    }

    return new Uint8Array(buffer);
}

function bufferToHex(arrayBuffer: ArrayBuffer) {
    const buff = new Uint8Array(arrayBuffer);
    const hexOctets = [];

    const byteToHex = [];
    for (let n = 0; n <= 0xff; ++n) {
        const hexOctet = n.toString(16).padStart(2, "0");
        byteToHex.push(hexOctet);
    }

    for (let i = 0; i < buff.length; ++i)
        hexOctets.push(byteToHex[buff[i]]);

    return hexOctets.join("");
}

export async function encrypt(text: string) {
    const encoder = new TextEncoder();
    const hashedKey = await crypto.subtle.digest("SHA-256", encoder.encode(APP_KEY));
    const ivKey = crypto.getRandomValues(new Uint8Array(12));
    const key = await crypto.subtle.importKey("raw", hashedKey, "AES-GCM", false, ["encrypt", "decrypt"]);

    const token = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: ivKey
        },
        key,
        encoder.encode(text).buffer
    )

    return bufferToBase64URL(concatArrayBuffers([ivKey.buffer, token]));
}

export async function decrypt(text:string) {
    const encoder = new TextEncoder();
    const hashedKey = await crypto.subtle.digest("SHA-256", encoder.encode(APP_KEY));
    const key = await crypto.subtle.importKey("raw", hashedKey, "AES-GCM", false, ["encrypt", "decrypt"]);

    const buffer = base64URLToBuffer(text);
    const tokenBuffer = buffer.slice(12);
    const ivBuffer = buffer.slice(0, 12);

    const token = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: ivBuffer
        },
        key,
        tokenBuffer
    )

    return (new TextDecoder()).decode(token);
}
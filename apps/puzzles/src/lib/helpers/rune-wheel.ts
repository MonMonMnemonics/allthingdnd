import MersenneTwister from "./mersenneRandom"
import type { Token } from "./tokenization"
import type { PuzzleState } from "$lib/server/pubsub";
import { colourSeed, generateColourScheme } from "./colFilterGenerator";

export const nIcon = 78;
export const nWheel = 9;
export const padLength = 5

export type Marker = { 
    icoIdx: number, 
    owner: number 
}

export class RuneWheel implements PuzzleState {
    private initInnerWheel: {[index: number]: number[]} = {};
    private initOuterWheel: {[index: number]: Marker[]} = {};
    private keySequence: {
        icoIdx: number, 
        owner: number,
        innerShift: number,
        outerShift: number
    }[] = [];

    private lockMarkers: Marker[] = [];
    private innerWheel: {[index: number]: number[]} = {};
    private outerWheel: {[index: number]: Marker[]} = {};
    private pad: {[index: number]: { icoIdx: number, innerShift: number, outerShift: number }[]} = {};

    progress: number = 0;
    colour: string[] = [];

    constructor(token: Token) {
        const globalRandGen = new MersenneTwister(token.seed);

        for (let playerId = 0; playerId < token.nPlayer; playerId++) {
            this.innerWheel[playerId] = [];
            this.outerWheel[playerId] = [];
            this.pad[playerId] = [];
        }

        //------------- LOCK MARKER GENERATION -------------
        let nTotMarker = 5;
        if (token.nPlayer > 3 ) {
            nTotMarker = 10;
        } else if (token.nPlayer > 5) {
            nTotMarker = 15;
        }

        let nMarkerMinPerPlayer = Math.floor(nTotMarker/token.nPlayer);
        let iconBin = [...Array(nIcon).keys()];
        
        for (let playerId = 0; playerId < token.nPlayer; playerId++) {
            this.innerWheel[playerId] = [];
            this.outerWheel[playerId] = [];
            this.pad[playerId] = [];

            for (let nMarker = 0; nMarker < nMarkerMinPerPlayer; nMarker++) {
                const icoIdx = Math.floor(globalRandGen.random()*iconBin.length);
                this.lockMarkers.push({
                    icoIdx: iconBin[icoIdx],
                    owner: playerId
                });

                iconBin.splice(icoIdx, 1);
            }
        }

        while (this.lockMarkers.length < nTotMarker) {
            const icoIdx = Math.floor(globalRandGen.random()*iconBin.length);
            this.lockMarkers.push({
                icoIdx: iconBin[icoIdx],
                owner: Math.floor(globalRandGen.random()*token.nPlayer)
            });

            iconBin.splice(icoIdx, 1);
        }

        this.lockMarkers = this.lockMarkers
            .map(value => ({ value, sort: globalRandGen.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)

        //------------- INNER WHEEL GENERATION -------------
        for (let playerId = 0; playerId < token.nPlayer; playerId++) {
            this.lockMarkers.filter(marker => marker.owner == playerId).forEach(marker => {
                this.innerWheel[playerId].push(marker.icoIdx);
            });

            iconBin = [...Array(nIcon).keys()].filter(n => !this.innerWheel[playerId].includes(n));
            while (this.innerWheel[playerId].length < nWheel) {
                const icoIdx = Math.floor(globalRandGen.random()*iconBin.length);
                this.innerWheel[playerId].push(iconBin[icoIdx]);
                iconBin.splice(icoIdx, 1);
            }

            this.innerWheel[playerId] = this.innerWheel[playerId]
                .map(value => ({ value, sort: globalRandGen.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)
        }

        //------------- OUTER WHEEL GENERATION -------------
        nMarkerMinPerPlayer = Math.floor(nWheel/token.nPlayer);
        for (let playerId = 0; playerId < token.nPlayer; playerId++) {
            iconBin = [...Array(nIcon).keys()];

            for (let playerAuxId = 0; playerAuxId < token.nPlayer; playerAuxId++) {
                for (let nMarker = 0; nMarker < nMarkerMinPerPlayer; nMarker++) {
                    const icoIdx = Math.floor(globalRandGen.random()*iconBin.length);
                    this.outerWheel[playerId].push({
                        icoIdx: iconBin[icoIdx],
                        owner: playerAuxId
                    });

                    iconBin.splice(icoIdx, 1);
                }
            }

            while (this.outerWheel[playerId].length < nWheel) {
                const icoIdx = Math.floor(globalRandGen.random()*iconBin.length);
                this.outerWheel[playerId].push({
                    icoIdx: iconBin[icoIdx],
                    owner: Math.floor(globalRandGen.random()*token.nPlayer)
                });

                iconBin.splice(icoIdx, 1);
            }

            this.outerWheel[playerId] = this.outerWheel[playerId]
                .map(value => ({ value, sort: globalRandGen.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)
        }

        //------------- PAD GENERATION -------------
        for (let playerId = 0; playerId < token.nPlayer; playerId++) {
            iconBin = [];

            Object.values(this.outerWheel).flat()
                .filter(marker => marker.owner == playerId)
                .forEach(marker => {
                    iconBin.push(marker.icoIdx);
                })

            iconBin = [...new Set(iconBin)];
            
            for (const icoIdx of iconBin) {
                this.pad[playerId].push({
                    icoIdx: icoIdx,
                    innerShift: Math.floor(globalRandGen.random()*nWheel*2) - nWheel,
                    outerShift: Math.floor(globalRandGen.random()*nWheel*2) - nWheel,
                })
            }
            
            iconBin = [...Array(nIcon).keys()].filter(idx => !iconBin.includes(idx));

            while (this.pad[playerId].length < padLength*padLength) {
                const icoIdx = Math.floor(globalRandGen.random()*iconBin.length);
                this.pad[playerId].push({
                    icoIdx: iconBin[icoIdx],
                    innerShift: Math.floor(globalRandGen.random()*nWheel*2) - nWheel,
                    outerShift: Math.floor(globalRandGen.random()*nWheel*2) - nWheel,
                });

                iconBin.splice(icoIdx, 1);
            }

            this.pad[playerId] = this.pad[playerId]
                .map(value => ({ value, sort: globalRandGen.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)
        }

        this.initInnerWheel = JSON.parse(JSON.stringify(this.innerWheel));
        this.outerWheel = JSON.parse(JSON.stringify(this.outerWheel));

        //------------- KEY SEQUENCE GENERATION -------------
        let innerShift = 0;
        let outerShift = 0;
        for (const lock of this.lockMarkers) {
            let wheelIdx = this.innerWheel[lock.owner].findIndex(e => e == lock.icoIdx);

            wheelIdx += innerShift;
            if (wheelIdx < 0) {
                wheelIdx = nWheel + wheelIdx;
            } else {
                wheelIdx = wheelIdx % nWheel;
            }

            wheelIdx -= outerShift;
            if (wheelIdx < 0) {
                wheelIdx = nWheel + wheelIdx;
            } else {
                wheelIdx = wheelIdx % nWheel;
            }

            const wheelKey = this.outerWheel[lock.owner][wheelIdx];
            const padIdx = this.pad[wheelKey.owner].findIndex(e => e.icoIdx == wheelKey.icoIdx);

            this.keySequence.push({
                icoIdx: this.pad[wheelKey.owner][padIdx].icoIdx,
                owner: wheelKey.owner,
                innerShift: this.pad[wheelKey.owner][padIdx].innerShift,
                outerShift: this.pad[wheelKey.owner][padIdx].outerShift,
            })

            innerShift = this.pad[wheelKey.owner][padIdx].innerShift;
            outerShift = this.pad[wheelKey.owner][padIdx].outerShift;
        }

        this.colour = generateColourScheme(colourSeed[Math.floor(globalRandGen.random()*colourSeed.length)], token.nPlayer);
        this.colour = this.colour
                .map(value => ({ value, sort: globalRandGen.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)
    };

    resetState() {
        this.innerWheel = JSON.parse(JSON.stringify(this.initInnerWheel));
        this.outerWheel = JSON.parse(JSON.stringify(this.initOuterWheel));
    }

    getState(playerId: number) {
        return ({
            innerWheel: this.innerWheel[playerId],
            outerWheel: this.outerWheel[playerId].map(e => ({
                icoIdx: e.icoIdx,
                colour: this.colour[e.owner]
            })),
            pad: this.pad[playerId],
            innerShift: this.progress > 0 ? this.keySequence[this.progress].innerShift : 0,
            outerShift: this.progress > 0 ? this.keySequence[this.progress].outerShift : 0,
            colour: this.colour[playerId],
            markers: this.lockMarkers.map(e => ({
                icoIdx: e.icoIdx,
                colour: this.colour[e.owner]
            })),
        });
    }
}
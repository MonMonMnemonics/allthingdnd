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
    private lockMarkers: Marker[] = [];
    private lockVisibility : {[index: number]: boolean[]} = {};
    private innerWheel: {[index: number]: number[]} = {};
    private outerWheel: {[index: number]: Marker[]} = {};
    private pad: {[index: number]: { icoIdx: number, innerShift: number, outerShift: number }[]} = {};

    progress: number = 0;
    colour: string[] = [];
    public keySequence: {
        icoIdx: number, 
        owner: number,
        innerShift: number,
        outerShift: number
    }[] = [];

    constructor(token: Token) {
        const globalRandGen = new MersenneTwister(token.seed);

        for (let playerId = 0; playerId < token.nPlayer; playerId++) {
            this.innerWheel[playerId] = [];
            this.outerWheel[playerId] = [];
            this.pad[playerId] = [];
            this.lockVisibility[playerId] = [];
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

        this.outerWheel = JSON.parse(JSON.stringify(this.outerWheel));

        //------------- GENERATE LOCK VISIBILITY -------------
        for (let idx = 0; idx < this.lockMarkers.length; idx++) {
            const binaryString = Math.floor(globalRandGen.random()*(Math.pow(2, token.nPlayer) - 2) + 1)
                .toString(2)
                .padStart(token.nPlayer, "0");

            for (let playerId = 0; playerId < token.nPlayer; playerId++) {
                this.lockVisibility[playerId].push(binaryString[playerId] == "1");
            }
        }

        for (let playerId = 0; playerId < token.nPlayer; playerId++) {
            let visibleMarkers = this.lockVisibility[playerId].reduce((acc, curr) => acc + (curr ? 1 : 0), 0);
            let idxBin = [...Array(this.lockMarkers.length).keys()].filter(idx => !this.lockVisibility[playerId][idx]);
            while (visibleMarkers*3 < this.lockMarkers.length) {
                const idx = Math.floor(globalRandGen.random()*idxBin.length);
                this.lockVisibility[playerId][idx] = true;
                delete idxBin[idx];
                visibleMarkers += 1;
            }
        }

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

    resetState(){};
    getState(playerId: number) {
        return ({
            innerWheel: this.innerWheel[playerId],
            outerWheel: this.outerWheel[playerId].map(e => ({
                icoIdx: e.icoIdx,
                colour: this.colour[e.owner]
            })),
            pad: this.pad[playerId],
            innerShift: ((this.progress) > 0 && (this.progress <= this.keySequence.length)) ? this.keySequence[this.progress - 1].innerShift : 0,
            outerShift: ((this.progress) > 0 && (this.progress <= this.keySequence.length)) ? this.keySequence[this.progress - 1].outerShift : 0,
            colour: this.colour[playerId],
            progress: this.progress,
            markers: this.lockMarkers.map((e, idx) => ({
                icoIdx: this.lockVisibility[playerId][idx] ? e.icoIdx : -1,
                colour: this.colour[e.owner],
                progress: this.progress
            })),
        });
    }
}
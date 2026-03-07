<script lang="ts">
	import type { Marker } from "$lib/helpers/rune-wheel";
	import { onMount } from "svelte";
    const wheelN = 9;
    const playerIdx = [
        "D61A3C",
        "48864D",
        "4A57BA"
    ]
    const filterArr = [
        "brightness(0) saturate(100%) invert(14%) sepia(57%) saturate(4796%) hue-rotate(337deg) brightness(114%) contrast(97%)",
        "brightness(0) saturate(100%) invert(39%) sepia(46%) saturate(438%) hue-rotate(75deg) brightness(105%) contrast(91%)",
        "brightness(0) saturate(100%) invert(30%) sepia(93%) saturate(724%) hue-rotate(204deg) brightness(93%) contrast(91%)"
    ]

    let terminalIdx = $state(0);
    let innerIdxShift = $state(0);
    let outerIdxShift = $state(0);

    let outerCanvas: HTMLCanvasElement;
    let innerCanvas: HTMLCanvasElement;

    let data: { inner: number[], outer: number[], pad: number[], markers: Marker[] } = $state({
        inner: [],
        outer: [],
        pad: [],
        markers: []
    });

    onMount(() => {
        let numberBin = [...Array(77).keys()].map(e => e + 1);
        
        let innerVal: number[] = [];
        while (innerVal.length < wheelN) {
            const randIdx = Math.floor(Math.random()*numberBin.length);
            innerVal.push(numberBin[randIdx]);
            numberBin.splice(randIdx, 1);
        }

        numberBin = [...Array(77).keys()].map(e => e + 1);
        let outerVal: number[] = []
        while (outerVal.length < wheelN) {
            const randIdx = Math.floor(Math.random()*numberBin.length);
            outerVal.push(numberBin[randIdx]);
            numberBin.splice(randIdx, 1);
        }

        numberBin = [...Array(77).keys()].map(e => e + 1);
        let markers: Marker[] = []
        while (markers.length < 5) {
            let idx = 0;
            while (idx == ((markers.length > 0) ? markers[markers.length - 1].owner : terminalIdx)) {
                idx = Math.floor(Math.random()*playerIdx.length);
            }

            const randIdx = Math.floor(Math.random()*numberBin.length);
            markers.push({
                icoIdx: numberBin[randIdx],
                owner: idx
            });
            numberBin.splice(randIdx, 1);
        }

        numberBin = [...Array(77).keys()].map(e => e + 1);
        let pad: number[] = []
        while (pad.length < 25) {
            const randIdx = Math.floor(Math.random()*numberBin.length);
            pad.push(numberBin[randIdx]);
            numberBin.splice(randIdx, 1);
        }

        data = {
            ...data,
            inner: innerVal,
            outer: outerVal,
            markers: markers,
            pad: pad
        }

        loadCanvasImages(innerVal, outerVal);
    })

    async function loadCanvasImages(innerVal: number[], outerVal: number[]) {
        const imgIdxs = [...new Set([...innerVal, ...outerVal])];
        let imgElements: HTMLImageElement[] = []
        
        const imgLoadPromises = imgIdxs.map(idx => {
            const src = "/src/lib/assets/icons/" + idx + ".png";

            return new Promise((resolve, reject) => {
                const img = new Image();
                imgElements[idx] = img;
                img.onload = () => resolve(true);
                img.onerror = () => reject(new Error('Failed to load ' + src));
                img.src = src;
            })
        })

        await Promise.all(imgLoadPromises);

        const innerCtx = innerCanvas.getContext("2d");
        let innerRingRadius = 0;
        if (innerCtx) {
            const innerCanvasSize = [
                innerCanvas.getBoundingClientRect().height,
                innerCanvas.getBoundingClientRect().width
            ];
            innerCanvas.height = innerCanvasSize[0];
            innerCanvas.width = innerCanvasSize[1];
            
            innerVal.forEach((icoIdx, idx) => {
                innerCtx.save();

                innerCtx.translate(
                    innerCanvas.width*(50 - Math.sin(2*Math.PI*(idx)/wheelN)*32.5)/100,
                    innerCanvas.height*(50 - Math.cos(2*Math.PI*(idx)/wheelN)*32.5)/100
                );

                innerCtx.rotate(-idx/wheelN*2.*Math.PI);

                innerCtx.drawImage(
                    imgElements[icoIdx], 
                    -innerCanvas.width*0.17/2,
                    -innerCanvas.height*0.17/2,
                    innerCanvas.width*0.17,
                    innerCanvas.height*0.17,
                );

                innerCtx.restore();
            })

            const imageData = innerCtx.getImageData(0, 0, innerCanvas.width, innerCanvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
            }

            innerCtx.putImageData(imageData, 0, 0);

            innerCtx.strokeStyle = "#FFFFFF";
            innerCtx.lineWidth = 5;
            innerRingRadius = innerCanvas.width/2 - innerCtx.lineWidth;
            innerCtx.beginPath()
            innerCtx.arc(
                innerCanvas.width/2,
                innerCanvas.height/2,
                innerCanvas.width/2 - innerCtx.lineWidth, 
                0, 
                2*Math.PI, 
            );
            innerCtx.stroke()

            for (let idx = 0; idx < wheelN; idx++) {
                innerCtx.beginPath()
                innerCtx.moveTo(
                    innerCanvas.width/2 - innerRingRadius*Math.sin(2*Math.PI*(idx + 0.5)/wheelN),
                    innerCanvas.height/2 - innerRingRadius*Math.cos(2*Math.PI*(idx + 0.5)/wheelN)
                );
                innerCtx.lineTo(
                    innerCanvas.width/2, 
                    innerCanvas.height/2
                );
                innerCtx.stroke()
            }
        }
        
        const outerCtx = outerCanvas.getContext("2d");
        let outerRingRadius = 0;
        if (outerCtx) {
            const outerCanvasSize = [
                outerCanvas.getBoundingClientRect().height,
                outerCanvas.getBoundingClientRect().width
            ];
            outerCanvas.height = outerCanvasSize[0];
            outerCanvas.width = outerCanvasSize[1];
            
            outerVal.forEach((icoIdx, idx) => {
                outerCtx.save();

                outerCtx.translate(
                    outerCanvas.width*(50 - Math.sin(2*Math.PI*(idx)/wheelN)*40)/100,
                    outerCanvas.height*(50 - Math.cos(2*Math.PI*(idx)/wheelN)*40)/100
                );

                outerCtx.rotate(-idx/wheelN*2.*Math.PI);

                outerCtx.drawImage(
                    imgElements[icoIdx], 
                    -outerCanvas.width*0.14/2,
                    -outerCanvas.height*0.14/2,
                    outerCanvas.width*0.14,
                    outerCanvas.height*0.14,
                );

                outerCtx.restore();
            })

            const imageData = outerCtx.getImageData(0, 0, outerCanvas.width, outerCanvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
            }

            outerCtx.putImageData(imageData, 0, 0);

            outerCtx.strokeStyle = "#FFFFFF";
            outerCtx.lineWidth = 5;
            outerRingRadius = outerCanvas.width/2 - outerCtx.lineWidth;
            outerCtx.beginPath()
            outerCtx.arc(
                outerCanvas.width/2,
                outerCanvas.height/2,
                outerRingRadius,
                0, 
                2*Math.PI, 
            );
            outerCtx.stroke()

            for (let idx = 0; idx < wheelN; idx++) {
                outerCtx.beginPath()
                outerCtx.moveTo(
                    outerCanvas.width/2 - outerRingRadius*Math.sin(2*Math.PI*(idx + 0.5)/wheelN),
                    outerCanvas.height/2 - outerRingRadius*Math.cos(2*Math.PI*(idx + 0.5)/wheelN)
                );
                outerCtx.lineTo(
                    outerCanvas.width/2 - innerRingRadius*Math.sin(2*Math.PI*(idx + 0.5)/wheelN), 
                    outerCanvas.height/2 - innerRingRadius*Math.cos(2*Math.PI*(idx + 0.5)/wheelN)
                );
                outerCtx.stroke()
            }
        }
    }
</script>

<div class="w-screen h-screen home overflow-x-hidden overflow-y-auto relative">
    <div class="absolute w-screen h-screen p-5 overflow-x-hidden overflow-y-hidden flex flex-row gap-2 p-7">
        <div class="grow flex flex-col relative">
            <div class="my-auto flex flex-col gap-2 p-7 z-10">
                <div class="flex flex-row justify-center">
                    {#each data.markers as dt}
                        <div class="border border-1 aspect-square flex flex-col relative">
                            <div class="my-auto flex flex-row w-full">
                                <img src={"/src/lib/assets/icons/" + (dt.icoIdx) + ".png"} class="mx-auto aspect-square w-[80%] inverted" draggable="false" alt=""
                                    style:filter={filterArr[dt.owner]}
                                />
                            </div>
                        </div>
                    {/each}
                </div>
                <div class="mx-auto grid grid-flow-col grid-rows-5">
                    {#each data.pad as icoIdx}
                        <button class="border border-1 aspect-square w-[100%] flex flex-col relative cursor-pointer"
                            onclick={() => {
                                let newIdx = Math.floor(Math.random()*2*wheelN);
                                while (newIdx == innerIdxShift) {
                                    newIdx = Math.floor(Math.random()*2*wheelN);
                                }
                                innerIdxShift = newIdx;

                                newIdx = Math.floor(Math.random()*2*wheelN);
                                while (newIdx == outerIdxShift) {
                                    newIdx = Math.floor(Math.random()*2*wheelN);
                                }
                                outerIdxShift = newIdx;
                            }}
                        >
                            <div class="my-auto flex flex-row w-full">
                                <img src={"/src/lib/assets/icons/" + (icoIdx) + ".png"} class="mx-auto aspect-square w-[80%] inverted" draggable="false" alt=""/>
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
        </div>
        <div class="h-full aspect-square relative">
            <div class="h-3/5 aspect-square absolute top-1/2 left-1/2 relative" style="translate: -50% -50%;">
                <div class="h-1/5 rounded-full border-2 border aspect-square absolute top-1/2 left-1/2 relative z-2" 
                    style="translate: -50% -50%; border-color: #{playerIdx[terminalIdx]}; background: #{playerIdx[terminalIdx]}">
                </div>
                <canvas 
                    class="h-full w-full absolute top-1/2 left-1/2 transition-all duration-2000" 
                    style="translate: -50% -50%;" 
                    style:rotate="-{innerIdxShift/wheelN}turn"
                    bind:this={innerCanvas}
                ></canvas>
            </div>
            <canvas 
                class="h-full w-full absolute top-1/2 left-1/2 transition-all duration-2000" 
                style="translate: -50% -50%;"
                style:rotate="-{outerIdxShift/wheelN}turn"
                bind:this={outerCanvas}                
            ></canvas>
        </div>
    </div>
</div>
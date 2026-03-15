<script lang="ts">
	import LoadingScreen from "$lib/components/LoadingScreen.svelte";
	import { generateCSS, hexToRgb } from "$lib/helpers/colFilterGenerator";
	import { onMount } from "svelte";
    import { page } from "$app/state";
    import "./animation.css"
	import RejectedScreen from "$lib/components/RejectedScreen.svelte";
	import swal from 'sweetalert2';
	import InstructionModal from "$lib/components/InstructionModal.svelte";
	import SpectatorToggle from "$lib/components/SpectatorToggle.svelte";

    let innerIdxShift = $state(0);
    let outerIdxShift = $state(0);
    let progress = $state(0);
    let colFilterCss: {[index:string]: string} = $state({});
    let loading = $state(true);
    let gmMode = $state(false);
    let hintPanel = $state(false);
    let playerId = $state(-1);
    let gmId = $state("");
    let spectateMode = $state(false);

    let outerCanvas: HTMLCanvasElement;
    let innerCanvas: HTMLCanvasElement;
    let interimCanvas: HTMLCanvasElement;
    let wheelDiv: HTMLDivElement;
    let centerWheelDiv: HTMLDivElement;

    let finalCard = $state(false);
    let rejected = $state(false);

    let puzzleData: { 
        inner: number[], 
        outer: { icoIdx: number, colour: string }[],
        pad: { icoIdx: number, innerShift: number, outerShift: number }[], 
        markers: { icoIdx: number, colour: string }[],
        wheelN: number, 
        mainCol: string
    } = $state({
        inner: [],
        outer: [],
        pad: [],
        markers: [],
        wheelN: 0,
        mainCol: ""
    });

    let esListener: EventSource | undefined;

    $effect(() => {
        if ((puzzleData.markers.length > 0) && (puzzleData.markers.length == progress)) {
            wheelDiv.classList.add("animation-sequence-wheel-final");
            centerWheelDiv.classList.add("animation-sequence-center-final");
        }
    });

    onMount(() => {
        //-------------- START EVENT SOURCE --------------
        esListener = new EventSource("/rune-wheel/" + page.params.token + "/listener");

        esListener.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.hasOwnProperty("flag")) {
                switch (data.flag) {
                    case "USER-INPUT": {
                        progress = data.data.progress;
                        if (progress == puzzleData.markers.length) {
                            break;
                        } else if (data.data.result == false) {
                            wheelDiv.classList.add("animation-shake");
                            innerIdxShift = 0;
                            outerIdxShift = 0;
                        } else {
                            innerIdxShift = data.data.innerShift;
                            outerIdxShift = data.data.outerShift;
                        }
                        break;
                    }

                    case "STATE": {
                        initiatePuzzle(data.data);
                        break;
                    }

                    case "REJECTED": {
                        loading = false;
                        rejected = true;
                        esListener?.close();
                        break;
                    }

                    case "GM-MODE": {
                        playerId = 0;
                        gmId = data.id;
                        gmMode = true;
                        hintPanel = true;
                        spectateMode = true;
                        break;
                    }

                    case "GM-INIT": {
                        if (data.data.id === gmId) {
                            initiatePuzzle(data.data);
                        }
                        break;
                    }
                }
            }
        };

        esListener.onerror = (err) => {
            console.error('EventSource failed:', err);
            if (esListener) {
                esListener.close();
            }            
        };

        return () => {
            if (esListener) {
                esListener.close();
            }            
        };
    })

    async function initiatePuzzle(data: any) {
        innerIdxShift = data.innerShift;
        outerIdxShift = data.outerShift;
        progress = data.progress;

        let colList: string[] = [];
        colList.push(data.colour);
        data.outerWheel.forEach((e: any) => colList.push(e.colour));
        data.markers.forEach((e: any) => colList.push(e.colour));
        colList = [...new Set(colList)];

        colFilterCss = Object.fromEntries(colList.map(col => [col, generateCSS(col)]));

        puzzleData = {
            inner: data.innerWheel,
            outer: data.outerWheel,
            pad: data.pad,
            markers: data.markers,
            wheelN: data.innerWheel.length,
            mainCol: data.colour
        };

        //-------------- DRAW TO CANVAS --------------
        const imgIdxs = [...new Set([...puzzleData.inner, ...puzzleData.outer.map(e => e.icoIdx)])];
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
            
            puzzleData.inner.forEach((icoIdx, idx) => {
                innerCtx.save();

                innerCtx.translate(
                    innerCanvas.width*(50 - Math.sin(2*Math.PI*(idx)/puzzleData.wheelN)*32.5)/100,
                    innerCanvas.height*(50 - Math.cos(2*Math.PI*(idx)/puzzleData.wheelN)*32.5)/100
                );

                innerCtx.rotate(-idx/puzzleData.wheelN*2.*Math.PI);

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

            for (let idx = 0; idx < puzzleData.wheelN; idx++) {
                innerCtx.beginPath()
                innerCtx.moveTo(
                    innerCanvas.width/2 - innerRingRadius*Math.sin(2*Math.PI*(idx + 0.5)/puzzleData.wheelN),
                    innerCanvas.height/2 - innerRingRadius*Math.cos(2*Math.PI*(idx + 0.5)/puzzleData.wheelN)
                );
                innerCtx.lineTo(
                    innerCanvas.width/2, 
                    innerCanvas.height/2
                );
                innerCtx.stroke()
            }
        }
        
        const outerCtx = outerCanvas.getContext("2d");
        const interimCtx = interimCanvas.getContext("2d", { willReadFrequently: true });
        let outerRingRadius = 0;
        if ((outerCtx) && (interimCtx)) {
            const outerCanvasSize = [
                outerCanvas.getBoundingClientRect().height,
                outerCanvas.getBoundingClientRect().width
            ];
            outerCanvas.height = outerCanvasSize[0];
            outerCanvas.width = outerCanvasSize[1];

            interimCanvas.height = outerCanvas.height*0.14;
            interimCanvas.width = outerCanvas.width*0.14;
            
            puzzleData.outer.forEach((dt, idx) => {
                const imgCol = hexToRgb(dt.colour);
                interimCtx.clearRect(0, 0, interimCanvas.width, interimCanvas.height);
                interimCtx.drawImage(imgElements[dt.icoIdx], 0, 0, interimCanvas.width, interimCanvas.height);
                interimCtx.save()

                const imageData = interimCtx.getImageData(
                    0,
                    0,
                    interimCanvas.width,
                    interimCanvas.height
                );
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = imgCol[0];
                    data[i + 1] = imgCol[1];
                    data[i + 2] = imgCol[2];
                }
                interimCtx.putImageData(imageData, 0, 0);

                outerCtx.save();

                outerCtx.translate(
                    outerCanvas.width*(50 - Math.sin(2*Math.PI*(idx)/puzzleData.wheelN)*39)/100,
                    outerCanvas.height*(50 - Math.cos(2*Math.PI*(idx)/puzzleData.wheelN)*39)/100
                );

                outerCtx.rotate(-idx/puzzleData.wheelN*2.*Math.PI);

                outerCtx.drawImage(
                    interimCanvas, 
                    -outerCanvas.width*0.14/2,
                    -outerCanvas.height*0.14/2,
                    outerCanvas.width*0.14,
                    outerCanvas.height*0.14,
                );

                outerCtx.restore();
            })

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

            for (let idx = 0; idx < puzzleData.wheelN; idx++) {
                outerCtx.beginPath()
                outerCtx.moveTo(
                    outerCanvas.width/2 - outerRingRadius*Math.sin(2*Math.PI*(idx + 0.5)/puzzleData.wheelN),
                    outerCanvas.height/2 - outerRingRadius*Math.cos(2*Math.PI*(idx + 0.5)/puzzleData.wheelN)
                );
                outerCtx.lineTo(
                    outerCanvas.width/2 - innerRingRadius*Math.sin(2*Math.PI*(idx + 0.5)/puzzleData.wheelN), 
                    outerCanvas.height/2 - innerRingRadius*Math.cos(2*Math.PI*(idx + 0.5)/puzzleData.wheelN)
                );
                outerCtx.stroke()
            }
        }

        loading = false;
    }

async function padClick(padIdx: number) {
    if (spectateMode) {
        return;
    }

    await fetch("/rune-wheel/" + page.params.token + "/listener", {
        method: "POST",
        body: JSON.stringify({
            icoIdx: puzzleData.pad[padIdx].icoIdx,
            innerShift: puzzleData.pad[padIdx].innerShift,
            outerShift: puzzleData.pad[padIdx].outerShift,
            playerId: playerId
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
}

async function switchPlayerTerminal() {
    await fetch("/rune-wheel/" + page.params.token, {
        method: "POST",
        body: JSON.stringify({
            id: gmId,
            playerId: playerId,
        }),
        headers: {
            "Content-Type": "application/json"
        }
    });
}

function resetPuzzle() {
    swal.fire({
        title: "Reset Puzzle?",
        icon: "warning",
        theme: "dark",
        showCancelButton: true,
        confirmButtonColor: "red",
        confirmButtonText: "Reset Puzzle",
        reverseButtons: true
    }).then(async(res) => {
        if (res.isConfirmed) {
            await fetch("/rune-wheel/" + page.params.token, {
                method: "DELETE",
            });
        }
    })
}

</script>

{#if loading}
<LoadingScreen/>
{/if}
{#if hintPanel}
<InstructionModal closeModal={() => hintPanel = false}
    dcDescriptions={["0-5: ANUNUNUN", "6-10: WKWKWKWK", "11-15: AJKLSAD", ">16: MKNKAJSDHL"]}
    puzzleDescription={"N< asdf asdfha sfasdjncfasdkjfaslkdjfb asdjhfals fasldjkb fasdbasjld afsljkfbals asdhb fasd"}
    howToPlay={["asdfkarjasdf sdafasd fasdfaw", "asdf asdf asdklf anwb asd", "a sdfa slkfjhawelkurgasd asdhv asf ", "asd askljdf akslf weuiacasd bfsd"]}
/>
{/if}
<div class="w-screen h-screen home overflow-x-hidden overflow-y-auto relative">
    <canvas 
        class="hidden" 
        bind:this={interimCanvas}
    ></canvas>
    <div class="absolute w-screen h-screen p-5 overflow-x-hidden overflow-y-hidden flex flex-col gap-2 top-0 left-0">
        {#if gmMode}
            <div class="flex flex-row items-center gap-2">
                <select
                    bind:value={playerId}
                    onchange={() => switchPlayerTerminal()}
                >
                    {#each { length: Object.keys(colFilterCss).length }, idx}
                        <option class="text-white bg-default" value={idx}>Player {idx + 1} Screen</option>
                    {/each}
                </select>
                <button class="border rounded-xl p-2 font-bold cursor-pointer hover:bg-white hover:text-black" onclick={() => hintPanel = true}>Hint and Narration</button>
                <button class="border rounded-xl p-2 font-bold cursor-pointer hover:bg-red-500 hover:text-white" onclick={() => resetPuzzle()}>Reset Puzzle</button>
                <SpectatorToggle checked={spectateMode} setChecked={(checked) => spectateMode = checked}/>
            </div>
        {/if}
        <div class="grow flex flex-row gap-2">
            <div class="grow flex flex-col relative">
                <div class="my-auto flex flex-col gap-2 p-7 z-10">
                    <div class="mx-auto grid grid-flow-row grid-cols-5 w-[{puzzleData.markers.length > 5 ? "60%" : "70%"}]">
                        {#each puzzleData.markers as dt, idx}
                            <div class="border border-1 aspect-square flex flex-col relative pointer-events-none h-[100%]">
                                {#if dt.icoIdx >= 0}
                                    <div class="my-auto flex flex-row w-full">
                                        <img src={"/src/lib/assets/icons/" + (dt.icoIdx) + ".png"} class="mx-auto aspect-square w-[80%] inverted z-1" 
                                            class:animation-heartbeat2={idx < progress}
                                            draggable="false" alt=""
                                            style:filter={colFilterCss[dt.colour]}
                                        />
                                    </div>
                                    <img src={"/src/lib/assets/icons/" + (dt.icoIdx) + ".png"} 
                                        class="mx-auto aspect-square w-[80%] inverted absolute top-1/2 left-1/2 -translate-1/2" 
                                        draggable="false" alt="" class:animation-heartbeat={idx < progress}
                                        class:hidden={idx >= progress}
                                        style:filter={colFilterCss[dt.colour] + " blur(4px)"}
                                    />
                                {:else}
                                    <div class="my-auto flex aspect-square w-[80%] flex-row w-full"></div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                    <div class="mx-auto grid grid-flow-row grid-cols-5 w-[{puzzleData.markers.length > 5 ? "60%" : "70%"}]">
                        {#each puzzleData.pad as pad, padIdx}
                            <button class="border border-1 aspect-square h-[100%] flex flex-col relative z-2 overflow-visible"
                                onclick={(ev) =>  {
                                    padClick(padIdx);

                                    const rippleImg = document.createElement("img");
                                    rippleImg.className = "absolute aspect-square w-[80%] top-1/2 left-1/2 -translate-1/2 inverted pointer-events-none";
                                    rippleImg.src = "/src/lib/assets/icons/" + (pad.icoIdx) + ".png";
                                    rippleImg.onload = (e) => {
                                        const target = e.currentTarget as HTMLImageElement;
                                        target.classList.add("animation-ripple")
                                    }
                                    rippleImg.onanimationend = () => {
                                        rippleImg.remove();
                                    }

                                    ev.currentTarget.appendChild(rippleImg);
                                }}
                            >
                                <div class="my-auto flex flex-row w-full">
                                    <img src={"/src/lib/assets/icons/" + (pad.icoIdx) + ".png"} class="mx-auto aspect-square w-[80%] inverted" draggable="false" alt=""/>
                                </div>
                            </button>
                        {/each}
                    </div>
                </div>
            </div>
            <div class="h-full aspect-square relative z-11" 
                bind:this={wheelDiv}
                onanimationend={(ev) => {
                    if (puzzleData.markers.length > progress) {
                        for (const className of ev.currentTarget.classList) {
                            if (className.indexOf("animation-") == 0) {                            
                                ev.currentTarget.classList.remove(className);
                            }
                        }
                    } else if (puzzleData.markers.length > 0) {
                        finalCard = true;
                    }
                }}
            >
                <div class="h-3/5 aspect-square absolute top-1/2 left-1/2 relative z-11" style="translate: -50% -50%;">
                    <div bind:this={centerWheelDiv} class="h-1/5 rounded-full border-2 border aspect-square absolute top-1/2 left-1/2 relative z-12" 
                        style="translate: -50% -50%; border-color: {puzzleData.mainCol}; background: {puzzleData.mainCol}">
                    </div>
                    <canvas 
                        class="h-full w-full absolute top-1/2 left-1/2 transition-all duration-2000" 
                        style="translate: -50% -50%;" 
                        style:rotate="{-1*innerIdxShift/puzzleData.wheelN}turn"
                        bind:this={innerCanvas}
                    ></canvas>
                </div>
                <canvas 
                    class="h-full w-full absolute top-1/2 left-1/2 transition-all duration-2000" 
                    style="translate: -50% -50%;"
                    style:rotate="{-1*outerIdxShift/puzzleData.wheelN}turn"
                    bind:this={outerCanvas}                
                ></canvas>
            </div>
        </div>
    </div>
    {#if finalCard}
        <div class="flex flex-col h-screen w-screen absolute top-0 left-0 z-20">
            <div class="flex flex-row w-full my-auto">
                <div class="mx-auto">
                    <div class="flex flex-col items-center animation-bounce">
                        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chest-icon lucide-chest"><path d="M8 19a2 2 0 0 0 2-2V9a4 4 0 0 0-8 0v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a4 4 0 0 0-4-4H6"/><path d="M2 11h20"/><path d="M16 11v3"/></svg>
                        <div class="font-bold text-3xl">The treasure is yours to claim</div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
    {#if rejected}
        <RejectedScreen/>
    {/if}
</div>
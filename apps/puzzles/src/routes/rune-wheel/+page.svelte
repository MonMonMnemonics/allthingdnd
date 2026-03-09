<script lang="ts">
    import Dices from "@lucide/svelte/icons/dices";

    let nPlayer = $state(4);
    let seed = $state(Math.floor(Math.random()*10000));

    let gmToken = $state("");
    let playerTokens: string[] = $state([]);

    async function getTokens() {
        const res = await fetch("/rune-wheel", {
            method: "POST",
            body: JSON.stringify({
                nPlayer,
                seed
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })

        const data = await res.json();
        gmToken = data.gmToken;
        playerTokens = data.playerTokens;
    }
</script>

<div class="w-screen h-screen overflow-hidden relative p-3">
    <div class="w-full h-full border-3 rounded-xl flex flex-row p-5">
        <div class="h-full flex flex-col gap-2">
            <div class="flex flex-row items-center gap-3">
                <div>Number of Player:</div>
                <select 
                    bind:value={nPlayer}
                    style="width: 3em;"
                    class="font-bold"
                >
                    <option value={1} class="text-white bg-default">1</option>
                    <option value={2} class="text-white bg-default">2</option>
                    <option value={3} class="text-white bg-default">3</option>
                    <option value={4} class="text-white bg-default">4</option>
                    <option value={5} class="text-white bg-default">5</option>
                    <option value={6} class="text-white bg-default">6</option>
                </select>
            </div>
            <div class="flex flex-row items-center gap-3">
                <div>Seed (optional):</div>
                <input bind:value={seed} type="number" max="100000" min="0" step="1" class="py-1 px-2" />
                <Dices class="cursor-pointer" onclick={() => {seed = Math.floor(Math.random()*10000)}}/>
            </div>
            <button class="border rounded-xl p-2 hover:font-bold hover:border-3 cursor-pointer"
                onclick={getTokens}
            >Generate Puzzle</button>
            
            {#if gmToken != ""} 
                <a href={"/rune-wheel/" + gmToken} class="cursor-pointer underline text-blue-500 hover:text-blue-700" >GM Link</a>
            {/if}

            {#if playerTokens.length > 0}
                <div>Player Links:</div>
                <ul class="list-disc ms-6">
                    {#each playerTokens as token, idx}
                        <li><a href={"/rune-wheel/" + token} class="cursor-pointer underline text-blue-500 hover:text-blue-700" >Player {idx + 1} Link</a></li>
                    {/each}
                </ul>
            {/if}
        </div>
    </div>
</div>
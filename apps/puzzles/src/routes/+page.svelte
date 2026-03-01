<script lang="ts">
</script>

<div class="w-screen h-screen home overflow-x-hidden overflow-y-auto relative">
    <div class="absolute w-screen h-screen p-5 overflow-x-hidden overflow-y-auto">
        <div class="w-full grid grid-cols-8 gap-3">
            {#each Array(78) as _, idx}
                <div class="border border-2 rounded-2xl aspect-square flex flex-col relative">
                    <div class="my-auto flex flex-row w-full">
                        <img src={"/src/lib/assets/icons/" + (idx + 1) + ".png"} class="mx-auto aspect-square w-[80%] inverted" alt={"Image " + idx}/>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>
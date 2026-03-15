<script lang="ts">
    let { closeModal, dcDescriptions, puzzleDescription, howToPlay } = $props<{ 
        closeModal: (message: string) => void,
        dcDescriptions: string[],
        puzzleDescription: string,
        howToPlay: string[]
    }>();
</script>


<div class="h-screen w-screen fixed top-0 left-0 overflow-hidden z-998 flex flex-col">
    <div class="absolute h-full w-full top-0 left-0 bg-black opacity-50" onclick={() => closeModal()} onkeydown={() => {}}  role="button" tabindex={100}></div>
    <div class="flex flex-row my-auto w-full z-999">
        <div class="flex flex-col mx-auto p-5 border-3 rounded-xl bg-default items-center max-w-[60%] gap-7">
            <div class="flex flex-row gap-4 w-full">
                <div class="flex flex-col gap-2 w-full">
                    <div class="text-center font-bold text-xl">Puzzle Lore</div>
                    <div class="text-wrap">
                        {puzzleDescription}
                    </div>
                    <div class="text-center font-bold text-xl">How to Play</div>
                    <div class="grow ps-5">
                        <ul class="list-disc">
                            {#each howToPlay as desc}
                                <li>{desc}</li>
                            {/each}                            
                        </ul>
                    </div>
                </div>
                <div class="h-full w-full ps-5 flex flex-col gap-2">
                    <div class="text-center font-bold text-xl">DC Desciprtion</div>
                    <ul class="list-disc">
                        {#each dcDescriptions as desc}
                            <li>{desc}</li>
                        {/each}
                    </ul>
                </div>
            </div>
            <button class="border rounded-xl p-2 font-bold text-xl cursor-pointer hover:bg-white hover:text-black mx-auto" onclick={() => closeModal()}>
                Close
            </button>
        </div>
    </div>
</div>
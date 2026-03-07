<script lang="ts">
    import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import { onDestroy, onMount } from 'svelte';

    let loadingDots = $state(".")
    let timerId: number;
    
    onMount(() => {
        timerId = setInterval(() => {
            if (loadingDots.length > 10) {
                loadingDots = "";
            } else {
                loadingDots = loadingDots + ".";
            }
        }, 1000);
    });

    onDestroy(() => {
        clearInterval(timerId);
    });
</script>

<div class="h-screen w-screen z-999 absolute top-0 left-0 bg-default overflow-hidden flex flex-col">
    <div class="w-full my-auto flex flex-row">
        <div class="mx-auto flex flex-col gap-3">
            <LoaderCircleIcon size="300" class="animate-spin"/>
            <div class="w-full text-center text-4xl font-bold">Loading{loadingDots}</div>
        </div>
    </div>
</div>
<template>
  <footer class="relative mt-12">
    <!-- subtle apple-ish fade -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white to-transparent dark:from-zinc-950"></div>

    <div
      class="relative mx-auto max-w-4xl px-4 py-6 sm:px-6
             text-xs text-zinc-600 dark:text-zinc-400"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <!-- left meta -->
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span class="text-zinc-500 dark:text-zinc-500">
            © {{ year }} BinGo Tools
          </span>

          <span class="hidden sm:inline opacity-40">·</span>

          <span class="inline-flex items-center gap-1.5">
            <!-- branch icon -->
            <svg class="h-4 w-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 3v12"></path>
              <path d="M18 21V9"></path>
              <path d="M6 15a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3"></path>
              <circle cx="6" cy="18" r="2"></circle>
              <circle cx="6" cy="4" r="2"></circle>
              <circle cx="18" cy="20" r="2"></circle>
            </svg>

            <span class="text-zinc-700 dark:text-zinc-300">
              {{ branchLabel }}
            </span>

            <span v-if="commit" class="font-mono text-[11px] text-zinc-500 dark:text-zinc-500">
              #{{ commit }}
            </span>
          </span>

          <span class="hidden sm:inline opacity-40">·</span>

          <span class="text-zinc-500 dark:text-zinc-500">
            构建：{{ buildTimeText }}
          </span>
        </div>

        <!-- right links -->
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a
            :href="`mailto:${contactEmail}`"
            class="text-zinc-700 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-500
                   dark:text-zinc-300 dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
          >
            联系：{{ contactEmail }}
          </a>

          <button
            type="button"
            class="text-zinc-700 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-500
                   dark:text-zinc-300 dark:decoration-zinc-600 dark:hover:decoration-zinc-400 cursor-pointer" 
            @click="$emit('open-privacy')"
          >
            隐私 / 说明
          </button>
        </div>
      </div>
    </div>

    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent dark:from-zinc-950"></div>
  </footer>
</template>

<script setup>
import { computed } from "vue";

import { APP_BRANCH, APP_COMMIT, APP_BUILD_TIME } from "@/env";

const branch = APP_BRANCH;
const commit = APP_COMMIT;
const buildTime = APP_BUILD_TIME;


defineProps({
  contactEmail: { type: String, default: "aliya@nbcnm.cn" },
});
defineEmits(["open-privacy"]);

const year = new Date().getFullYear();

const branchLabel = computed(() => branch ? branch : "local");

const buildTimeText = computed(() => {
  if (!buildTime) return "—";
  // ISO -> 本地友好显示
  const d = new Date(buildTime);
  if (isNaN(d.getTime())) return buildTime;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
});
</script>

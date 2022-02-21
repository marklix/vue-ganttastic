<template>
  <div class="g-grid-container">
    <div
      v-for="{label, value, width} in timeaxisUnits.lowerUnits"
      :key="label"
      :class="(highlightedUnits.includes(Number(value)) ? 'highlight' : '') + ' g-grid-line'"
      :style="{
        width,
      }"
    />
  </div>
</template>

<script setup lang="ts">
import useColorScheme from "../composables/useColorScheme"
import useTimeaxisUnits from "../composables/useTimeaxisUnits"
import { defineProps, inject, toRefs } from "vue"
import INJECTION_KEYS from "../models/symbols"

const props = defineProps<{
  highlightedUnits?: number[]
}>()

const { highlightedUnits } = toRefs(props)
const gGanttChartPropsRefs = inject(INJECTION_KEYS.gGanttChartPropsKey)
if (!gGanttChartPropsRefs) {
  throw new Error("GGanttBar: Provide/Inject of values from GGanttChart failed!")
}
const { timeaxisUnits } = useTimeaxisUnits(gGanttChartPropsRefs)
</script>

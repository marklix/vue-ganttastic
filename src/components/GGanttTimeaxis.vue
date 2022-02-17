<template>
  <div class="g-timeaxis">
    <div class="g-timeunits-container">
      <div
        v-for="({ label, value, width }, index) in timeaxisUnits.upperUnits"
        :key="label"
        class="g-upper-timeunit"
        :style="{
          background: index % 2 === 0 ? colors.primary : colors.secondary,
          color: colors.text,
          width
        }"
      >
        <slot
          name="upper-timeunit"
          :label="label"
          :value="value"
        >
          {{ label }}
        </slot>
      </div>
    </div>

    <div class="g-timeunits-container">
      <div
        v-for="({ label, value, width }, index) in timeaxisUnits.lowerUnits"
        :key="label"
        class="g-timeunit"
        :style="{
          background: index % 2 === 0 ? colors.ternary : colors.quartenary,
          color: colors.text,
          flexDirection: precision === 'hour' ? 'column' : 'row',
          alignItems: precision === 'hour' ? '' : 'center',
          width
        }"
      >
        <slot
          name="timeunit"
          :label="label"
          :value="value"
        >
          {{ label }}
        </slot>
        <div
          v-if="precision === 'hour'"
          class="g-timeaxis-hour-pin"
          :style="{background: colors.text}"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ColorScheme } from "@/color-schemes"
import useTimeaxisUnits from "../composables/useTimeaxisUnits"
import { defineProps, inject } from "vue"
import INJECTION_KEYS from "../models/symbols"

defineProps<{
  chartStart: string
  chartEnd: string
  precision: "hour" | "day" | "month"
  colors: ColorScheme
}>()
const gGanttChartPropsRefs = inject(INJECTION_KEYS.gGanttChartPropsKey)
if (!gGanttChartPropsRefs) {
  throw new Error("GGanttBar: Provide/Inject of values from GGanttChart failed!")
}
const { precision } = gGanttChartPropsRefs
const { timeaxisUnits } = useTimeaxisUnits(gGanttChartPropsRefs)
</script>

<style scoped>
</style>

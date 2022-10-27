<template>
  <div class="g-timeaxis">
    <div class="g-timeunits-container">
      <div
        v-for="({ label, value, width }, index) in timeaxisUnits.upperUnits"
        :key="label"
        :class="(index % 2 === 0 ? 'primary-color' : 'secondary-color') + ' g-upper-timeunit'"
        :style="{
          width,
        }"
      >
        <slot name="upper-timeunit" :label="label" :value="value">
          {{ label }}
        </slot>
      </div>
    </div>

    <div class="g-timeunits-container">
      <div
        v-for="({ label, value, width }, index) in timeaxisUnits.lowerUnits"
        :key="label"
        :class="(index % 2 === 0 ? 'primary-color' : 'secondary-color') + ' g-timeunit'"
        :style="{
          flexDirection: precision === 'hour' ? 'column' : 'row',
          alignItems: precision === 'hour' ? '' : 'center',
          width,
        }"
      >
        <slot name="timeunit" :label="label" :value="value">
          {{ label }}
        </slot>
        <div v-if="precision === 'hour'" class="g-timeaxis-hour-pin" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useTimeaxisUnits from "../composables/useTimeaxisUnits";
import { defineProps, inject } from "vue";
import INJECTION_KEYS from "../models/symbols";

defineProps<{
  chartStart: string;
  chartEnd: string;
  precision: "hour" | "day" | "month";
}>();
const gGanttChartPropsRefs = inject(INJECTION_KEYS.gGanttChartPropsKey);
if (!gGanttChartPropsRefs) {
  throw new Error("GGanttBar: Provide/Inject of values from GGanttChart failed!");
}
const { precision } = gGanttChartPropsRefs;
const { timeaxisUnits } = useTimeaxisUnits(gGanttChartPropsRefs);
</script>

<style scoped></style>

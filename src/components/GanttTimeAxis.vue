<!--
  - MARKLIX PLANNER
  - Copyright (c) 2022, Marklix SAS.
  -
  - Tous droits réservés pour tous pays. L’ensemble du contenu de ce fichier est confidentiel et demeure la propriété
  - exclusive de son auteur. Tous les droits sont réservés pour tous pays, notamment les droits de consultation, de
  - reproduction, de représentation, d’adaptation, de modification, de traduction, de distribution, de
  - commercialisation, d’usage, d’exploitation et de cession dudit fichier. Les traductions éventuelles de cette notice
  - sont uniquement données à titre indicatif.
  -
  - All rights reserved for all countries. All information contained herein is confidential and remain the exclusive
  - property of its author. All rights are reserved for all countries, including the rights to read, copy, depict,
  - adapt, modify, translate, distribute, sell, use (including commercially) and concede this file. Only the French
  - version of this notice is legally binding (see above).
  -->

<template>
  <div class="gantt-time-axis">
    <div class="gantt-time-units-container">
      <div
        v-for="({ label, value, width }, index) in timeAxisUnits.upperUnits"
        class="gantt-upper-time-unit"
        :key="label"
        :class="index % 2 === 0 ? 'primary-color' : 'secondary-color'"
        :style="{ width }"
      >
        <slot name="upper-timeunit" :label="label" :value="value">{{ label }}</slot>
      </div>
    </div>
    <div class="gantt-time-units-container">
      <div
        v-for="({ label, value, width }, index) in timeAxisUnits.lowerUnits"
        :key="label"
        :class="index % 2 === 0 ? 'primary-color' : 'secondary-color'"
        :style="{
          flexDirection: ganttChartPropsRefs.precision.value === 'hour' ? 'column' : 'row',
          alignItems: ganttChartPropsRefs.precision.value === 'hour' ? '' : 'center',
          width,
        }"
        class="gantt-time-unit"
      >
        <slot name="timeunit" :label="label" :value="value">
          {{ label }}
        </slot>
        <div v-if="ganttChartPropsRefs.precision.value === 'hour'" class="gantt-time-axis-hour-pin" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";

import useTimeAxisUnits from "../composables/useTimeAxisUnits";

import INJECTION_KEYS from "../models/symbols";

export default defineComponent({
  name: "GanttTimeAxis",
  props: {
    chartStart: { type: String },
    chartEnd: { type: String },
  },
  setup() {
    const ganttChartPropsRefs = inject(INJECTION_KEYS.ganttChartPropsKey);

    if (!ganttChartPropsRefs) {
      throw new Error("GanttBar: Provide/Inject of values from GanttChart failed!");
    }

    const { timeAxisUnits } = useTimeAxisUnits(ganttChartPropsRefs);

    return { ganttChartPropsRefs, timeAxisUnits };
  },
});
</script>

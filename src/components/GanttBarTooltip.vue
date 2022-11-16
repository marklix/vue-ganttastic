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
  <teleport to="body">
    <div
      v-if="modelValue && !outOfLimits"
      class="gantt-tooltip"
      :style="{
        top: tooltipTop,
        left: tooltipLeft,
      }"
    >
      <div class="gantt-bar-tooltip-color-dot" :style="{ background: dotColor }" />
      <slot>
        {{ tooltipContent }}
      </slot>
    </div>
  </teleport>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, nextTick, inject } from "vue";

import useDayjsHelper from "@/composables/useDayjsHelper";

import INJECTION_KEYS from "@/models/symbols";

import { GanttBarObject } from "@/models/models";

export default defineComponent({
  name: "GanttBarTooltip",
  props: {
    parentId: { type: String, required: true },
    bar: { type: Object as () => GanttBarObject, required: false },
    modelValue: { type: Boolean },
  },
  setup(props) {
    const ganttChartPropsRefs = inject(INJECTION_KEYS.ganttChartPropsKey);

    if (!ganttChartPropsRefs) {
      throw Error("GanttBarTooltip: Provide/Inject of values from GanttChart failed!");
    }

    const tooltipTop = ref("0px");
    const tooltipLeft = ref("0px");
    const outOfLimits = ref(false);

    watch(
      () => props.bar,
      () => {
        const barId = props.bar?.ganttBarConfig.id || "";
        const barElement = document.getElementById(barId);
        nextTick(() => {
          if (barId) {
            let top = 0;
            let left = 0;

            const { rowHeight } = ganttChartPropsRefs;

            // Get relative position to window for hide tooltip if is out of container
            const chartContainerOffset = document.getElementById(props.parentId)?.getBoundingClientRect().left || 0;
            const chartContainerWidth = document.getElementById(props.parentId)?.getBoundingClientRect().width || 0;

            if (barElement) {
              top = barElement.getBoundingClientRect().top;

              // There is a bug that randomly changes the place of tooltip when changing row, this is a workaround for it
              if (barElement?.offsetLeft) {
                left = barElement?.offsetLeft + 10 + chartContainerOffset;
              }
            }

            // Hide/show tooltip if true/false out of limits
            outOfLimits.value = left < chartContainerOffset || left > chartContainerOffset + chartContainerWidth;

            tooltipTop.value = `${top + rowHeight.value - 10}px`;
            tooltipLeft.value = `${left}px`;
          }
        });
      },
      { deep: true, immediate: true }
    );

    const dotColor = computed(() => props.bar?.value?.ganttBarConfig.style?.background || "cadetblue");

    const tooltipFormats = {
      hour: "HH:mm",
      day: "DD. MMM HH:mm",
      month: "DD. MMMM YYYY",
    };

    const { toDayjs } = useDayjsHelper(ganttChartPropsRefs);

    const { precision } = ganttChartPropsRefs;

    const tooltipContent = computed(() => {
      const format = tooltipFormats[precision.value];

      if (props.bar) {
        const barStartFormatted = toDayjs(props.bar, "start").format(format);
        const barEndFormatted = toDayjs(props.bar, "end").format(format);

        return `${barStartFormatted} - ${barEndFormatted}`;
      }

      return "";
    });

    return { dotColor, outOfLimits, tooltipContent, tooltipLeft, tooltipTop };
  },
});
</script>

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
  <div
    :id="bar.ganttBarConfig.id"
    @mousedown="onMouseEvent"
    @mouseup="onMouseEvent"
    @dblclick="onMouseEvent"
    @mouseenter="onMouseEvent"
    @mouseleave="onMouseEvent"
    @contextmenu="onMouseEvent"
    :class="bar.ganttBarConfig.immobile ? 'immobile' : '' + ' ' + bar.ganttBarConfig.enableOverlap ? 'overlapped' : ''"
    class="gantt-bar"
    :style="barStyle"
  >
    <div class="gantt-bar-label" style="text-align: center">
      <slot :bar="bar">
        <div>
          {{ bar.ganttBarConfig.label || "" }}
        </div>
      </slot>
    </div>
    <template v-if="bar.ganttBarConfig.hasHandles">
      <div class="gantt-bar-handle-left" />
      <div class="gantt-bar-handle-right" />
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, inject, watch, nextTick } from "vue";

import useBarDragManagement from "../composables/useBarDragManagement";
import useTimePositionMapping from "../composables/useTimePositionMapping";

import { GanttBarObject } from "../models/models";

import INJECTION_KEYS from "../models/symbols";

export default defineComponent({
  name: "GanttBar",
  props: {
    bar: { type: Object as () => GanttBarObject, required: true },
  },
  setup(props) {
    const allRowsInChart = inject(INJECTION_KEYS.allBarsInChartKey);
    const ganttChartPropsRefs = inject(INJECTION_KEYS.ganttChartPropsKey);
    const emitBarEvent = inject(INJECTION_KEYS.emitBarEventKey);

    if (!allRowsInChart || !ganttChartPropsRefs || !emitBarEvent) {
      throw Error("GanttBar: Provide/Inject of values from GanttChart failed!");
    }

    const { rowHeight } = ganttChartPropsRefs;
    const { mapTimeToPosition, mapPositionToTime } = useTimePositionMapping(ganttChartPropsRefs);
    const { initDragOfBar, initDragOfBundle } = useBarDragManagement(allRowsInChart, ganttChartPropsRefs, emitBarEvent);
    // const { setDragLimitsOfGanttBar } = useBarDragLimit(allRowsInChart, ganttChartPropsRefs)

    const isDragging = ref(false);

    const prepareForDrag = () => {
      // setDragLimitsOfGanttBar(bar.value)
      if (!props.bar.ganttBarConfig.immobile) {
        const firstMousemoveCallback = (e: MouseEvent) => {
          props.bar.ganttBarConfig.bundle != null ? initDragOfBundle(props.bar, e) : initDragOfBar(props.bar, e);
          isDragging.value = true;
        };

        window.addEventListener("mousemove", firstMousemoveCallback, { once: true }); // on first mousemove event
        window.addEventListener(
          "mouseup",
          () => {
            // in case user does not move the mouse after mousedown at all
            window.removeEventListener("mousemove", firstMousemoveCallback);
            isDragging.value = false;
          },
          { once: true }
        );
      }
    };

    const onMouseEvent = (e: MouseEvent) => {
      e.preventDefault();
      if (e.type === "mousedown") {
        prepareForDrag();
      }

      const barElement = document.getElementById(props.bar.ganttBarConfig.id);
      const barContainer = barElement?.closest(".gantt-row-bars-container")?.getBoundingClientRect();
      let datetime;

      if (barContainer) {
        datetime = mapPositionToTime(e.clientX - barContainer.left);
      }

      emitBarEvent(e, props.bar, datetime);
    };

    const { barStart, barEnd, width, chartStart, chartEnd } = ganttChartPropsRefs;

    const xStart = ref(0);
    const xEnd = ref(0);

    watch(
      [props.bar, width, chartStart, chartEnd],
      () => {
        nextTick(() => {
          xStart.value = mapTimeToPosition(props.bar[barStart.value]);
          xEnd.value = mapTimeToPosition(props.bar[barEnd.value]);
        });
      },
      { deep: true, immediate: true }
    );

    window.addEventListener("resize", () => {
      xStart.value = mapTimeToPosition(props.bar[barStart.value]);
      xEnd.value = mapTimeToPosition(props.bar[barEnd.value]);
    });

    const barStyle = computed(() => {
      return {
        ...props.bar.ganttBarConfig.style,
        position: "absolute",
        top: `${rowHeight.value * 0.05}px`,
        left: `${xStart.value}px`,
        width: `${xEnd.value - xStart.value}px`,
        height: `${rowHeight.value * 0.9}px`,
        zIndex: isDragging.value ? 3 : props.bar.ganttBarConfig.immobile ? 1 : 2,
      };
    });

    return { barStyle, onMouseEvent };
  },
});
</script>

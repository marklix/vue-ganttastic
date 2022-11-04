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
  <!--div class="gantt-row-label">
    <slot name="label">
      {{ label }}
    </slot>
  </div-->

  <div id="gantt-chart" ref="ganttChart" :style="{ width }">
    <GanttTimeAxis v-if="!hideTimeAxis" :chart-start="chartStart" :chart-end="chartEnd" :precision="precision">
      <template #upper-timeunit="{ label, value }">
        <slot name="upper-timeunit" :label="label" :value="value" />
      </template>
      <template #timeunit="{ label, value }">
        <slot name="timeunit" :label="label" :value="value" />
      </template>
    </GanttTimeAxis>
    <GanttGrid v-if="grid" :highlighted-units="highlightedUnits" />
    <div id="gantt-rows-container">
      <slot />
    </div>
    <GanttBarTooltip :model-value="showTooltip || isDragging" :bar="tooltipBar">
      <template #default>
        <slot name="bar-tooltip" :bar="tooltipBar" />
      </template>
    </GanttBarTooltip>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, provide, ref, toRefs, useSlots, VNode } from "vue";

import INJECTION_KEYS from "../models/symbols";

import GanttTimeAxis from "@/components/GanttTimeAxis.vue";
import GanttGrid from "@/components/GanttGrid.vue";
import GanttBarTooltip from "@/components/GanttBarTooltip.vue";

import { GanttBarObject } from "@/models/models";

export default defineComponent({
  name: "GanttChart",
  emits: [
    "contextmenu-bar",
    "dblclick-bar",
    "drag-bar",
    "dragend-bar",
    "dragstart-bar",
    "mousedown-bar",
    "mouseenter-bar",
    "mouseleave-bar",
    "mouseup-bar",
  ],
  props: {
    barEnd: { type: String, required: true },
    barStart: { type: String, required: true },
    chartEnd: { type: String, required: true },
    chartStart: { type: String, required: true },
    dateFormat: { type: String, default: "YYYY-MM-DD HH:mm" },
    grid: { type: Boolean, default: false },
    hideTimeAxis: { type: Boolean, default: false },
    highlightedUnits: { type: Array as () => number[], default: () => [] },
    minimumGap: { type: Number, default: 60 },
    noOverlap: { type: Boolean, default: false },
    precision: { type: String as () => "hour" | "day" | "month", default: "day" },
    pushOnOverlap: { type: Boolean, default: false },
    rowHeight: { type: Number, default: 40 },
    width: { type: String, default: "100%" },
  },
  components: {
    GanttTimeAxis,
    GanttGrid,
    GanttBarTooltip,
  },
  setup(props, { emit }) {
    const slots = useSlots();

    const allBarsInChartByRow = computed(() => {
      const defaultSlot = slots.default?.();
      const barsArray: Array<VNode> = [];
      const allBars: GanttBarObject[][] = [];

      defaultSlot?.forEach((el) => {
        if (typeof el.children !== "string" || el.props !== null) {
          barsArray.push(el as VNode);
        }
      });

      if (barsArray) {
        if (barsArray?.length <= 1) {
          const arrayChildren: [] = barsArray[0].children as [];
          arrayChildren?.forEach((child: VNode) => {
            if (child.props?.bars) {
              const bars = child.props.bars as GanttBarObject[];
              allBars.push(bars);
            }
          });
        } else {
          barsArray?.forEach((child: VNode) => {
            if (child.props?.bars) {
              const bars = child.props.bars as GanttBarObject[];
              allBars.push(bars);
            }
          });
        }
      }
      return allBars;
    });

    const showTooltip = ref(false);
    const isDragging = ref(false);
    const tooltipBar = ref<GanttBarObject | null>(null);
    let tooltipTimeoutId: ReturnType<typeof setTimeout>;
    const initTooltip = (bar: GanttBarObject) => {
      if (tooltipTimeoutId) {
        clearTimeout(tooltipTimeoutId);
      }
      tooltipTimeoutId = setTimeout(() => {
        showTooltip.value = true;
      }, 800);
      tooltipBar.value = bar;
    };

    const clearTooltip = () => {
      clearTimeout(tooltipTimeoutId);
      showTooltip.value = false;
    };

    const emitBarEvent = (
      e: MouseEvent,
      bar: GanttBarObject,
      datetime?: string,
      movedBars?: Map<GanttBarObject, { oldStart: string; oldEnd: string }>,
      newRowId?: string
    ) => {
      switch (e.type) {
        case "mousedown":
          initTooltip(bar);
          emit("mousedown-bar", { bar, e, datetime });
          break;
        case "mouseup":
          emit("mouseup-bar", { bar, e, datetime });
          break;
        case "dblclick":
          emit("dblclick-bar", { bar, e, datetime });
          break;
        case "mouseenter":
          if (!isDragging.value) {
            initTooltip(bar);
          }
          emit("mouseenter-bar", { bar, e });
          break;
        case "mouseleave":
          clearTooltip();
          emit("mouseleave-bar", { bar, e });
          break;
        case "dragstart":
          isDragging.value = true;
          emit("dragstart-bar", { bar, e });
          break;
        case "drag":
          emit("drag-bar", { bar, e, newRowId });
          break;
        case "dragend":
          isDragging.value = false;
          emit("dragend-bar", { bar, e, movedBars });
          break;
        case "contextmenu":
          emit("contextmenu-bar", { bar, e, datetime });
          break;
      }
    };

    const ganttChart = ref<HTMLElement | null>(null);

    provide(INJECTION_KEYS.allBarsInChartKey, allBarsInChartByRow);
    provide(INJECTION_KEYS.ganttChartPropsKey, { ...toRefs(props), ganttChart });
    provide(INJECTION_KEYS.emitBarEventKey, emitBarEvent);

    return { isDragging, showTooltip, tooltipBar, ganttChart };
  },
});
</script>

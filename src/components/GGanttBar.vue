<template>
  <div
    :id="bar.ganttBarConfig.id"
    :class="'g-gantt-bar ' + (bar.ganttBarConfig.immobile ? 'immobile' : '')"
    :style="barStyle"
    @mousedown="onMouseEvent"
    @mouseup="onMouseEvent"
    @dblclick="onMouseEvent"
    @mouseenter="onMouseEvent"
    @mouseleave="onMouseEvent"
    @contextmenu="onMouseEvent"
  >
    <div class="g-gantt-bar-label" style="text-align: center">
      <slot :bar="bar">
        <div>
          {{ bar.ganttBarConfig.label || "" }}
        </div>
      </slot>
    </div>
    <template v-if="bar.ganttBarConfig.hasHandles">
      <div class="g-gantt-bar-handle-left" />
      <div class="g-gantt-bar-handle-right" />
    </template>
  </div>
</template>

<script setup lang="ts">
import useBarDragManagement from "../composables/useBarDragManagement";
import useTimePositionMapping from "../composables/useTimePositionMapping";
// import useBarDragLimit from "../composables/useBarDragLimit"
import { GanttBarObject } from "@/models/models";
import { defineProps, computed, ref, toRefs, inject, watch, nextTick } from "vue";
import INJECTION_KEYS from "../models/symbols";

const props = defineProps<{
  bar: GanttBarObject;
}>();

const allRowsInChart = inject(INJECTION_KEYS.allBarsInChartKey);
const gGanttChartPropsRefs = inject(INJECTION_KEYS.gGanttChartPropsKey);
const emitBarEvent = inject(INJECTION_KEYS.emitBarEventKey);
if (!allRowsInChart || !gGanttChartPropsRefs || !emitBarEvent) {
  throw Error("GGanttBar: Failed to inject values from GGanttChart!");
}

const { bar } = toRefs(props);
const { rowHeight } = gGanttChartPropsRefs;
const { mapTimeToPosition, mapPositionToTime } = useTimePositionMapping(gGanttChartPropsRefs);
const { initDragOfBar, initDragOfBundle } = useBarDragManagement(allRowsInChart, gGanttChartPropsRefs, emitBarEvent);
// const { setDragLimitsOfGanttBar } = useBarDragLimit(allRowsInChart, gGanttChartPropsRefs)

const isDragging = ref(false);

const prepareForDrag = () => {
  // setDragLimitsOfGanttBar(bar.value)
  if (!bar.value.ganttBarConfig.immobile) {
    const firstMousemoveCallback = (e: MouseEvent) => {
      bar.value.ganttBarConfig.bundle != null ? initDragOfBundle(bar.value, e) : initDragOfBar(bar.value, e);
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
  const barElement = document.getElementById(bar.value.ganttBarConfig.id);
  const barContainer = barElement?.closest(".g-gantt-row-bars-container")?.getBoundingClientRect();
  let datetime;
  if (barContainer) {
    datetime = mapPositionToTime(e.clientX - barContainer.left);
  }
  emitBarEvent(e, bar.value, datetime);
};

const { barStart, barEnd, width, chartStart, chartEnd } = gGanttChartPropsRefs;

const xStart = ref(0);
const xEnd = ref(0);

watch(
  [bar, width, chartStart, chartEnd],
  () => {
    nextTick(() => {
      xStart.value = mapTimeToPosition(bar.value[barStart.value]);
      xEnd.value = mapTimeToPosition(bar.value[barEnd.value]);
    });
  },
  { deep: true, immediate: true }
);

window.addEventListener("resize", () => {
  xStart.value = mapTimeToPosition(bar.value[barStart.value]);
  xEnd.value = mapTimeToPosition(bar.value[barEnd.value]);
});

const barStyle = computed(() => {
  return {
    ...bar.value.ganttBarConfig.style,
    position: "absolute",
    top: `${rowHeight.value * 0.05}px`,
    left: `${xStart.value}px`,
    width: `${xEnd.value - xStart.value}px`,
    height: `${rowHeight.value * 0.9}px`,
    zIndex: isDragging.value ? 3 : 2,
  };
});
</script>

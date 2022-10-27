<template>
  <div
    class="g-gantt-row"
    :style="rowStyle"
    @dragover="
      $event.preventDefault();
      isHovering = true;
    "
    @dragleave="isHovering = false"
    @drop="onDrop($event)"
    @dblclick="doubleClickRow($event)"
    @mouseover="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <div class="g-gantt-row-label">
      <slot name="label">
        {{ label }}
      </slot>
    </div>
    <div ref="barContainer" class="g-gantt-row-bars-container" v-bind="$attrs">
      <transition-group name="bar-transition" tag="div">
        <g-gantt-bar v-for="bar in bars" :key="bar.ganttBarConfig.id" :bar="bar">
          <slot name="bar-label" :bar="bar" />
        </g-gantt-bar>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import useTimePositionMapping from "../composables/useTimePositionMapping";
import INJECTION_KEYS from "../models/symbols";
import { defineProps, defineEmits, inject, ref, Ref, toRefs, computed } from "vue";
import { GanttBarObject } from "@/models/models";
import GGanttBar from "./GGanttBar.vue";

const props = defineProps<{
  label: string;
  bars: GanttBarObject[];
  highlightOnHover?: boolean;
}>();

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: "drop", value: { e: MouseEvent; datetime: string }): void;
  (e: "dblclick-row", value: { e: MouseEvent; id: string; datetime: string }): void;
}>();

const gGanttChartPropsRefs = inject(INJECTION_KEYS.gGanttChartPropsKey);
if (!gGanttChartPropsRefs) {
  throw Error("GGanttRow: Failed to inject GGanttChart props!");
}

const { rowHeight } = gGanttChartPropsRefs;
const { highlightOnHover } = toRefs(props);
const isHovering = ref(false);

const rowStyle = computed(() => {
  return {
    height: `${rowHeight.value}px`,
    background: highlightOnHover?.value && isHovering.value ? "rgba(204, 216, 219, 0.5)" : null,
  };
});

const { mapPositionToTime } = useTimePositionMapping(gGanttChartPropsRefs);
const barContainer: Ref<HTMLElement | null> = ref(null);

const getDatetime = (e: MouseEvent): string => {
  const container = barContainer.value?.getBoundingClientRect();
  if (container) {
    const xPos = e.clientX - container.left;
    return mapPositionToTime(xPos);
  }
  console.error("Vue-Ganttastic: failed to find bar container element for row.");
  return "";
};

const onDrop = (e: MouseEvent) => {
  const datetime = getDatetime(e);
  if (datetime) {
    emit("drop", { e, datetime });
  }
};

/*
Event for row emit datetime and id when double clicking
*/
const doubleClickRow = (e: MouseEvent) => {
  if ((e.target as Element).className === "g-gantt-row") {
    const id = (e.target as Element).id;
    const datetime = getDatetime(e);
    if (datetime && id) {
      emit("dblclick-row", { e, id, datetime });
    }
  }
};
</script>

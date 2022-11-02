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
    class="gantt-row"
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
    <div ref="barContainer" class="gantt-row-bars-container" v-bind="$attrs">
      <transition-group name="bar-transition" tag="div">
        <GanttBar v-for="bar in bars" :key="bar.ganttBarConfig.id" :bar="bar">
          <slot name="bar-label" :bar="bar" />
        </GanttBar>
      </transition-group>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, Ref, toRefs, computed } from "vue";

import useTimePositionMapping from "@/composables/useTimePositionMapping";

import INJECTION_KEYS from "@/models/symbols";

import { GanttBarObject } from "@/models/models";

import GanttBar from "@/components/GanttBar.vue";

export default defineComponent({
  name: "GanttRow",
  emits: ["drop", "dblclick-row"],
  props: {
    label: { type: String },
    bars: { type: Object as () => GanttBarObject[] },
    highlightOnHover: { type: Boolean, default: false },
  },
  components: {
    GanttBar,
  },
  setup(props, { emit }) {
    const ganttChartPropsRefs = inject(INJECTION_KEYS.ganttChartPropsKey);

    if (!ganttChartPropsRefs) {
      throw Error("GanttRow: Provide/Inject of values from GanttChart failed!");
    }

    const { rowHeight } = ganttChartPropsRefs;
    const { highlightOnHover } = toRefs(props);
    const isHovering = ref(false);

    const rowStyle = computed(() => {
      return {
        height: `${rowHeight.value}px`,
        background: highlightOnHover?.value && isHovering.value ? "rgba(204, 216, 219, 0.5)" : null,
      };
    });

    const { mapPositionToTime } = useTimePositionMapping(ganttChartPropsRefs);
    const barContainer: Ref<HTMLElement | null> = ref(null);

    const getDatetime = (e: MouseEvent): string => {
      const container = barContainer.value?.getBoundingClientRect();
      if (container) {
        const xPos = e.clientX - container.left;
        return mapPositionToTime(xPos);
      }

      return "";
    };

    const onDrop = (e: MouseEvent) => {
      const datetime = getDatetime(e);
      if (datetime) {
        emit("drop", { e, datetime });
      }
    };

    /*
    Event for row emit datetime and id when double-clicking
    */
    const doubleClickRow = (e: MouseEvent) => {
      if ((e.target as Element).className === "gantt-row") {
        const id = (e.target as Element).id;
        const datetime = getDatetime(e);
        if (datetime && id) {
          emit("dblclick-row", { e, id, datetime });
        }
      }
    };

    return { isHovering, rowStyle, doubleClickRow, onDrop };
  },
});
</script>

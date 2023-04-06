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
  <div style="width: 100%; display: flex">
    <div :style="{ width: 100 - width + '%', overflow: 'hidden' }">
      <div class="gantt-rows-label">
        {{ labelRows }}
      </div>
      <div class="gantt-row-label" v-for="rowBar in rowBarData" :key="rowBar.id" :style="{ height: rowHeight + 'px' }">
        {{ rowBar.device.name }}
      </div>
    </div>
    <div class="gantt-chart" :id="id" ref="ganttChart" :style="{ width: width + '%' }">
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
      <GanttBarTooltip :model-value="showTooltip || isDragging" :bar="tooltipBar" :parent-id="id">
        <template #default>
          <slot name="bar-tooltip" :bar="tooltipBar" />
        </template>
      </GanttBarTooltip>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, provide, ref, onMounted, toRefs, useSlots, VNode } from "vue";

import INJECTION_KEYS from "../models/symbols";

import GanttTimeAxis from "./GanttTimeAxis.vue";
import GanttGrid from "./GanttGrid.vue";
import GanttBarTooltip from "./GanttBarTooltip.vue";

import { Emitter } from "mitt";

import { GanttBarObject, GanttRowObject } from "../models/models";
import dayjs from "dayjs";

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
    id: { type: String, required: true },
    labelRows: { type: String, required: false },
    barEnd: { type: String, required: true },
    barStart: { type: String, required: true },
    chartEnd: { type: String, required: true },
    chartStart: { type: String, required: true },
    dateFormat: { type: String, default: "YYYY-MM-DD HH:mm" },
    grid: { type: Boolean, default: false },
    hideTimeAxis: { type: Boolean, default: false },
    highlightedUnits: { type: Array as () => number[], default: () => [] },
    rowBarData: { type: Array as () => GanttRowObject[], default: () => [] },
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
    const eventBus = inject("marklixBus") as Emitter<GanttBarObject>;
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

    /**
     * Initialize the tooltip popup
     * @param {GanttBarObject} bar The bar that contains the tooltip
     */
    const initTooltip = (bar: GanttBarObject) => {
      if (tooltipTimeoutId) {
        clearTimeout(tooltipTimeoutId);
      }
      tooltipTimeoutId = setTimeout(() => {
        showTooltip.value = true;
      }, 800);
      tooltipBar.value = bar;
    };

    /**
     * Clear the tooltip popup
     */
    const clearTooltip = () => {
      clearTimeout(tooltipTimeoutId);
      showTooltip.value = false;
    };

    /**
     * Emit all bar events
     * @param {MouseEvent} e The mouse event
     * @param {GanttBarObject} bar The bar that creates the event
     * @param {string} datetime The datetime for the event
     * @param {Map<GanttBarObject, { oldStart: string; oldEnd: string }>} [movedBars] A map with the bars that have been moved
     * @param {string} newRowId The new row ID if there is a row change
     */
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
          emit("drag-bar", updateOnBarChangeRow(bar, props.rowBarData, newRowId));
          break;
        case "dragend":
          isDragging.value = false;
          if (movedBars) {
            emit("dragend-bar", updateOnDragEnd(movedBars, props.rowBarData));
          }
          break;
        case "contextmenu":
          emit("contextmenu-bar", { bar, e, datetime });
          break;
      }
    };

    /**
     * Update the rowBarData object if there is moved bars
     * @param {Map<GanttBarObject, { oldStart: string; oldEnd: string }>} movedBars The bars that have been moved
     * @param {GanttRowObject[]} rowBarData The main data object
     * @return the object updated
     */
    const updateOnDragEnd = (
      movedBars: Map<GanttBarObject, { oldStart: string; oldEnd: string }>,
      rowBarData: GanttRowObject[]
    ): GanttRowObject[] => {
      const rowObjectToUpdate = [...rowBarData];
      movedBars.forEach((oldPosition, movedBar) => {
        const deleteBarRow = rowObjectToUpdate.find((row) =>
          row.bars.find((b) => Object.entries(b).toString() === Object.entries(movedBar).toString())
        );

        if (deleteBarRow && deleteBarRow.id !== movedBar.movedBar) {
          const foundBar = deleteBarRow.bars.find((b) => b.ganttBarConfig.id === movedBar.ganttBarConfig.id);

          if (foundBar) {
            const index = deleteBarRow.bars.indexOf(foundBar);
            if (index !== -1) {
              deleteBarRow.bars.splice(index, 1);
            }
          }
          const addBarRow = rowObjectToUpdate.find((row) => row.id === movedBar.device);
          if (addBarRow && foundBar) {
            addBarRow.bars.push(foundBar);
          }
        }
      });

      return rowObjectToUpdate;
    };

    /**
     * Update the rowBarData object if there is a bar changing row
     * @param {GanttBarObject} bar The bar being moved
     * @param {GanttRowObject[]} rowBarData The main data object
     * @param {string} [newRowId] The new rowId in case of changing row
     * @return the object updated

     */
    const updateOnBarChangeRow = (
      bar: GanttBarObject,
      rowBarData: GanttRowObject[],
      newRowId?: string
    ): GanttRowObject[] => {
      const rowObjectToUpdate = [...rowBarData];
      if (newRowId !== "") {
        const newRow = rowBarData.find((row) => row.id === newRowId);
        for (const eachBar of rowBarData) {
          const foundBar = eachBar.bars.find((b) => b.ganttBarConfig.id === bar.ganttBarConfig.id);
          if (foundBar) {
            const index = eachBar.bars.indexOf(foundBar);
            if (newRow && foundBar) {
              newRow.bars.push(foundBar);
            }
            if (index !== -1) {
              eachBar.bars.splice(index, 1);
            }
          }
        }
      }
      return rowObjectToUpdate;
    };

    /**
    Enable Marklix event bus
    */
    const enableBusEvent = () => {
      eventBus.on("bar-events", (e) => {
        onBusEvent(e.componentId, e.type, e.values);
      });
    };

    /**
     * Manage the bus events
     * @param {string} componentId The component Id
     * @param {string} type The event type
     * @param {Record<string, GanttBarObject | string>} values The event values
     */
    const onBusEvent = (componentId: string, type: string, values: Record<string, GanttBarObject | string>) => {
      if (componentId === props.id) {
        switch (type) {
          case "add":
            addBar(values.bar as GanttBarObject);
            break;
          case "delete":
            deleteBar(values.id as string);
            break;
        }
      }
    };

    /**
     * Add a bar to the Gantt chart
     * @param {GanttBarObject} bar The bar being added
     */
    const addBar = (bar: GanttBarObject) => {
      for (const row of props.rowBarData) {
        if (row.bars.some((someBar) => someBar.ganttBarConfig.id === bar.ganttBarConfig.id)) {
          return;
        }
      }
      if (calculateCollision(bar)) {
        return;
      }

      const newRow = props.rowBarData.find((row) => row.id === bar.device);
      if (newRow) {
        newRow.bars.push(bar);
      }
    };

    /**
     Detect if there is a collision with any other bar
     @param {GanttBarObject} bar The bar being added
     */
    const calculateCollision = (bar: GanttBarObject): boolean => {
      const selectedRow = props.rowBarData.find((row) => row.id === bar.device);
      let batches: GanttBarObject[] = [];
      if (selectedRow) {
        batches = selectedRow.bars;
      }
      for (const batch of batches) {
        if (
          bar.ganttBarConfig.id !== batch.ganttBarConfig.id &&
          dayjs(bar.startDate as string).diff(batch.endDate as string) < 0 &&
          dayjs(bar.endDate as string).diff(batch.startDate as string) > 0
        ) {
          return true;
        }
      }
      return false;
    };

    /**
     * Delete a bar from the Gantt chart
     * @param {string} id The bar ID
     */
    const deleteBar = (id: string) => {
      for (const row of props.rowBarData) {
        const idx = row.bars.findIndex((b) => b.ganttBarConfig.id === id);
        if (idx !== -1) {
          row.bars.splice(idx, 1);
        }
      }
    };

    onMounted(() => {
      enableBusEvent();
    });

    const ganttChart = ref<HTMLElement | null>(null);

    provide(INJECTION_KEYS.allBarsInChartKey, allBarsInChartByRow);
    provide(INJECTION_KEYS.ganttChartPropsKey, { ...toRefs(props), ganttChart });
    provide(INJECTION_KEYS.emitBarEventKey, emitBarEvent);

    return { isDragging, showTooltip, tooltipBar, ganttChart };
  },
});
</script>

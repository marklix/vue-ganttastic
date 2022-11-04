<template>
  <GanttChart
    :chart-start="chartStart"
    :chart-end="chartEnd"
    precision="hour"
    :row-height="40"
    grid
    width="80%"
    bar-start="startDate"
    bar-end="endDate"
    :date-format="format"
    no-overlap
    :highlighted-units="[6, 12, 18]"
    :minimum-gap="120"
    style="margin: 0 10%"
    @mousedown-bar="onMousedownBar($event.bar, $event.e, $event.datetime)"
    @dblclick-bar="onMouseupBar($event.bar, $event.e, $event.datetime)"
    @mouseenter-bar="onMouseenterBar($event.bar, $event.e)"
    @mouseleave-bar="onMouseleaveBar($event.bar, $event.e)"
    @dragstart-bar="onDragstartBar($event.bar, $event.e)"
    @drag-bar="onDragBar($event.bar, $event.e, $event.newRowId)"
    @dragend-bar="onDragendBar($event.bar, $event.e, $event.movedBars)"
    @contextmenu-bar="onContextmenuBar($event.bar, $event.e, $event.datetime)"
  >
    <ganttRow
      v-for="rowBar in initialBars"
      :id="rowBar.id ? rowBar.id : ''"
      :key="rowBar.id"
      :label="rowBar.device.name"
      :bars="rowBar.bars"
      @dblclick-row="onDoubleClickRow($event.e, $event.id, $event.datetime)"
    >
      <template #bar-label="{ bar }">
        {{ bar.ganttBarConfig.label }}
      </template>
    </ganttRow>
  </GanttChart>

  <button @click="addBar()">Add bar</button>
  <button @click="deleteBar()">Delete bar</button>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import GanttRow from "./components/GanttRow.vue";
import GanttChart from "./components/GanttChart.vue";

import { GanttBarObject } from "@/models/models";

export default defineComponent({
  name: "GanttPlannerDemo",
  components: {
    GanttRow,
    GanttChart,
  },
  setup() {
    const chartStart = ref("2022-03-28 00:00");
    const chartEnd = ref("2022-03-28 23:59");
    const format = ref("YYYY-MM-DD HH:mm");

    const initialBars = ref([
      {
        id: "60354f7a5f1b9c301d7d7f58",
        device: {
          id: "60354f7a5f1b9c301d7d7f58",
          name: "Formiga P110 Velocis",
          serial: "ABCDEF123456",
        },
        bars: [
          {
            startDate: "2022-03-28 15:42",
            endDate: "2022-03-28 21:07",
            gapMs: 19500000,
            device: "60354f7a5f1b9c301d7d7f58",
            items: [],
            ganttBarConfig: {
              id: "623a713e84226bb7c3214f0d",
              label: "zerzer",
              immobile: true,
              hasHandles: true,
              style: { background: "#4aabcc", borderRadius: "8px", color: "#ffffff" },
            },
          },
          {
            startDate: "2022-03-28 05:07",
            endDate: "2022-03-28 11:34",
            gapMs: 23220000,
            device: "60354f7a5f1b9c301d7d7f58",
            items: ["6238acf81a71fff5ccdc8ac8"],
            ganttBarConfig: {
              id: "624175ab908749b66d60a74e",
              label: "Batch P110",
              hasHandles: true,
              style: { background: "#4aabcc", borderRadius: "8px", color: "#ffffff" },
            },
          },
        ],
      },
      {
        id: "61f0fe1384183f00fdd7ad78",
        device: {
          id: "61f0fe1384183f00fdd7ad78",
          name: "Integra P450",
          serial: "ABCDE0123456",
        },
        bars: [
          {
            startDate: "2022-03-28 08:41",
            endDate: "2022-03-28 13:37",
            gapMs: 17760000,
            device: "61f0fe1384183f00fdd7ad78",
            items: ["6238acf61a71fff5ccdc8ac5"],
            ganttBarConfig: {
              id: "62417507908749b66d60a747",
              label: "Batch P450",
              hasHandles: true,
              style: { background: "#4aabcc", borderRadius: "8px", color: "#ffffff" },
            },
          },
        ],
      },
      {
        id: "61f0fe1384183f00fdd7ad48",
        device: {
          id: "61f0fe1384183f00fdd7ad48",
          name: "Integra P330",
          serial: "ABCDE0123421",
        },
        bars: [
          {
            startDate: "2022-03-28 08:41",
            endDate: "2022-03-28 13:37",
            gapMs: 17760000,
            device: "61f0fe1384183f00fdd7ad48",
            items: [],
            ganttBarConfig: {
              id: "62417507908749b66d60a737",
              label: "Batch P330",
              hasHandles: true,
              style: { background: "#4aabcc", borderRadius: "8px", color: "#ffffff" },
            },
          },
        ],
      },
    ]);

    const addBar = () => {
      for (const row of initialBars.value) {
        if (row.bars.some((bar) => bar.ganttBarConfig.id === "62417507908749b66d60b231")) {
          return;
        }
      }
      const bar = {
        startDate: "2022-03-28 19:00",
        endDate: "2022-03-28 22:15",
        gapMs: 11700000,
        device: "61f0fe1384183f00fdd7ad48",
        items: [],
        ganttBarConfig: {
          id: "62417507908749b66d60b231",
          label: "Batch P330 - 2",
          hasHandles: true,
          style: { background: "#4aabcc", borderRadius: "8px", color: "#ffffff" },
        },
      };
      const newRow = initialBars.value.find((row) => row.id === "61f0fe1384183f00fdd7ad48");
      if (newRow) {
        newRow.bars.push(bar);
      }
    };

    const deleteBar = () => {
      for (const row of initialBars.value) {
        const idx = row.bars.findIndex((b) => b.ganttBarConfig.id === "62417507908749b66d60b231");
        if (idx !== -1) {
          row.bars.splice(idx, 1);
        }
      }
      const idx = initialBars.value[1].bars.findIndex((b) => b.ganttBarConfig.id === "62417507908749b66d60b231");
      if (idx !== -1) {
        initialBars.value[1].bars.splice(idx, 1);
      }
    };

    const onMousedownBar = (bar: GanttBarObject, e: MouseEvent, datetime?: string) => {
      // console.log("mousedown-bar", bar, e, datetime)
    };

    const onMouseupBar = (bar: GanttBarObject, e: MouseEvent, datetime?: string) => {
      // console.log("mouseup-bar", bar, e, datetime)
    };

    const onMouseenterBar = (bar: GanttBarObject, e: MouseEvent) => {
      // console.log("mouseenter-bar", bar, e)
    };

    const onMouseleaveBar = (bar: GanttBarObject, e: MouseEvent) => {
      // console.log("mouseleave-bar", bar, e)
    };

    const onDragstartBar = (bar: GanttBarObject, e: MouseEvent) => {
      // console.log("dragstart-bar", bar, e)
    };
    const onDragBar = (bar: GanttBarObject, e: MouseEvent, newRowId: string) => {
      let foundBar;
      if (newRowId !== "") {
        const newRow = initialBars.value.find((row) => row.id === newRowId);
        for (const eachBar of initialBars.value) {
          foundBar = eachBar.bars.find((b) => b.ganttBarConfig.id === bar.ganttBarConfig.id);
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
    };

    const onDragendBar = (
      bar: GanttBarObject,
      e: MouseEvent,
      movedBars?: Map<GanttBarObject, { oldStart: string; oldEnd: string; oldRow: string }>
    ) => {
      // console.log("dragend-bar", bar, e, movedBars)
      const deleteBarRow = initialBars.value.find((row) =>
        row.bars.find((b) => Object.entries(b).toString() === Object.entries(bar).toString())
      );
      if (deleteBarRow && deleteBarRow.id !== bar.device) {
        const foundBar = deleteBarRow.bars.find((b) => b.ganttBarConfig.id === bar.ganttBarConfig.id);
        if (foundBar) {
          const index = deleteBarRow.bars.indexOf(foundBar);
          if (index !== -1) {
            deleteBarRow.bars.splice(index, 1);
          }
        }
        const addBarRow = initialBars.value.find((row) => row.id === bar.device);
        if (addBarRow && foundBar) {
          addBarRow.bars.push(foundBar);
        }
      }
    };

    const onContextmenuBar = (bar: GanttBarObject, e: MouseEvent, datetime?: string) => {
      // console.log("contextmenu-bar", bar, e, datetime)
    };

    const onDoubleClickRow = (e: MouseEvent, id: string, datetime: string) => {
      console.log(e, id, datetime);
    };

    return {
      initialBars,
      chartStart,
      chartEnd,
      format,
      addBar,
      deleteBar,
      onMousedownBar,
      onMouseupBar,
      onMouseenterBar,
      onMouseleaveBar,
      onDragstartBar,
      onDragBar,
      onDragendBar,
      onContextmenuBar,
      onDoubleClickRow,
    };
  },
});
</script>

<style lang="scss">
@import "public/style.scss";
</style>

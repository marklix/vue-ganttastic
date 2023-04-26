<template>
  <h2>GANTT DEMO</h2>
  <GanttChart
    id="gantt-chart-1"
    labelRows="Devices"
    :chart-start="chartStart"
    :chart-end="chartEnd"
    precision="hour"
    :row-height="80"
    grid
    width="80"
    bar-start="startDate"
    bar-end="endDate"
    :date-format="format"
    no-overlap
    :highlighted-units="[6, 12, 18]"
    :minimum-gap="120"
    style="margin: 0"
    :rowBarData="demoData"
    @mousedown-bar="onMousedownBar($event.bar, $event.e, $event.datetime)"
    @dblclick-bar="onMouseupBar($event.bar, $event.e, $event.datetime)"
    @mouseenter-bar="onMouseenterBar($event.bar, $event.e)"
    @mouseleave-bar="onMouseleaveBar($event.bar, $event.e)"
    @dragstart-bar="onDragstartBar($event.bar, $event.e)"
    @drag-bar="(value) => (demoData.value = value)"
    @dragend-bar="(value) => (demoData.value = value.rowObjectToUpdate)"
    @contextmenu-bar="onContextmenuBar($event.bar, $event.e, $event.datetime)"
  >
    <template #device-label="{ rowBar }">
      {{ rowBar.device.name }}
    </template>
    <GanttRow
      v-for="rowBar in demoData"
      :id="rowBar.id ? rowBar.id : ''"
      :key="rowBar.id"
      :label="rowBar.device.name"
      :bars="rowBar.bars"
      @dblclick-row="onDoubleClickRow($event.e, $event.id, $event.datetime)"
    >
      <template #bar-label="{ bar }">
        {{ bar.ganttBarConfig.label }}
      </template>
    </GanttRow>
  </GanttChart>

  <button @click="addBar()">Add bar</button>
  <button @click="deleteBar()">Delete bar</button>
  <h2>KANBAN DEMO</h2>
  <div style="display: flex">
    <KanbanList
      v-for="child in childrenOne"
      :id="child.id"
      :key="child.id"
      :group="child.group"
      :acceptFrom="child.acceptFrom"
      style="width: 25%"
    >
      <KanbanItem
        v-for="item in child.children"
        :key="item.id"
        :id="item.id"
        :has-children="item.hasChildren"
        :group="item.group"
        style="display: flex; flex-direction: column"
        ><template v-slot:childList>
          <KanbanList :id="'sub-item-' + item.id" :group="item.group" :acceptFrom="item.acceptFrom" class="sub-list">
            <KanbanItem v-for="subItem in item.children" :key="subItem.id" :id="subItem.id" :has-children="false" />
          </KanbanList>
        </template>
      </KanbanItem>
    </KanbanList>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from "vue";

import GanttRow from "./components/GanttRow.vue";
import GanttChart from "./components/GanttChart.vue";

import { GanttBarObject, GanttRowObject } from "./models/models";
import { Emitter } from "mitt";
import { List } from "./models/modelsKanban";
import KanbanList from "./components/KanbanList.vue";
import KanbanItem from "./components/KanbanItem.vue";
import Sortable, { MultiDrag } from "sortablejs";
Sortable.mount(new MultiDrag());

export default defineComponent({
  name: "GanttPlannerDemo",
  components: {
    GanttRow,
    GanttChart,
    KanbanList,
    KanbanItem,
  },
  setup() {
    const eventBus = inject("marklixBus") as Emitter<GanttBarObject>;
    const chartStart = ref("2022-03-28 00:00");
    const chartEnd = ref("2022-03-28 23:59");
    const format = ref("YYYY-MM-DD HH:mm");

    const demoData = ref([
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
    ] as GanttRowObject[]);
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
    const childrenOne = ref([
      {
        id: "column-one",
        group: "0:orders",
        acceptFrom: [],
        children: [
          {
            id: "order-1",
            hasChildren: true,
            group: "1:orderItem",
            children: [
              {
                id: "item-4",
                hasChildren: false,
              },
            ],
          },
        ],
      },
      {
        id: "column-two",
        group: "0:confirmed",
        acceptFrom: [],
        children: [
          {
            id: "batch-2",
            hasChildren: true,
            group: "1:batchItemConfirmed",
            acceptFrom: ["orderItem"],
            children: [
              {
                id: "item-1",
                hasChildren: false,
              },
            ],
          },
        ],
      },
      {
        id: "column-three",
        group: "0:finished",
        acceptFrom: ["confirmed"],
        children: [
          {
            id: "batch-3",
            hasChildren: true,
            group: "1:batchItemFinished",
            acceptFrom: ["batchItemConfirmed"],
            children: [
              {
                id: "item-2",
                hasChildren: false,
              },
            ],
          },
        ],
      },
    ] as List[]);

    const addBar = () => {
      eventBus.emit("bar-events", {
        componentId: "gantt-chart-1",
        type: "add",
        values: {
          bar: bar,
        },
      });
    };

    const deleteBar = () => {
      eventBus.emit("bar-events", {
        componentId: "gantt-chart-1",
        type: "delete",
        values: {
          id: "62417507908749b66d60b231",
        },
      });
    };

    const onMousedownBar = (bar: GanttBarObject, e: MouseEvent, datetime?: string) => {
      // console.log("mousedown-bar", bar, e, datetime);
    };

    const onMouseupBar = (bar: GanttBarObject, e: MouseEvent, datetime?: string) => {
      // console.log("mouseup-bar", bar, e, datetime);
    };

    const onMouseenterBar = (bar: GanttBarObject, e: MouseEvent) => {
      // console.log("mouseenter-bar", bar, e);
    };

    const onMouseleaveBar = (bar: GanttBarObject, e: MouseEvent) => {
      // console.log("mouseleave-bar", bar, e);
    };

    const onDragstartBar = (bar: GanttBarObject, e: MouseEvent) => {
      // console.log("dragstart-bar", bar, e);
    };

    const onContextmenuBar = (bar: GanttBarObject, e: MouseEvent, datetime?: string) => {
      // console.log("contextmenu-bar", bar, e, datetime);
    };

    const onDoubleClickRow = (e: MouseEvent, id: string, datetime: string) => {
      // console.log(e, id, datetime);
    };

    return {
      demoData,
      chartStart,
      chartEnd,
      childrenOne,
      format,
      addBar,
      deleteBar,
      onMousedownBar,
      onMouseupBar,
      onMouseenterBar,
      onMouseleaveBar,
      onDragstartBar,
      onContextmenuBar,
      onDoubleClickRow,
    };
  },
});
</script>

<template>
  <g-gantt-chart
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
    :highlighted-units="[6,12,18]"
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
    <g-gantt-row
      v-for="rowBar in bars1"
      :id="rowBar.id ? rowBar.id : ''"
      :key="rowBar.id"
      :label="rowBar.device.name"
      :bars="rowBar.bars"
      @dblclick-row="onDoubleClickRow($event.e, $event.id, $event.datetime)"
    >
      <template #bar-label="{ bar }">
        {{ bar.ganttBarConfig.label }}
      </template>
    </g-gantt-row>
  </g-gantt-chart>

  <button @click="addBar()">
    Add bar
  </button>
  <button @click="deleteBar()">
    Delete bar
  </button>
</template>

<script setup lang="ts">
import { ref } from "vue"
import GGanttRow from "./components/GGanttRow.vue"
import GGanttChart from "./components/GGanttChart.vue"
import { GanttBarObject } from "./models/models"

const chartStart = ref("2022-03-28 00:00")
const chartEnd = ref("2022-03-28 23:59")
const format = ref("YYYY-MM-DD HH:mm")

const bars1 = ref([
  {
    id: "60354f7a5f1b9c301d7d7f58",
    device: {
      id: "60354f7a5f1b9c301d7d7f58",
      name: "Formiga P110 Velocis",
      serial: "ABCDEF123456"
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
          hasHandles: true,
          style: { background: "#4aabcc", borderRadius: "8px", color: "#ffffff" }
        }
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
          style: { background: "#4aabcc", borderRadius: "8px", color: "#ffffff" }
        }
      }
    ]
  },
  {
    id: "61f0fe1384183f00fdd7ad78",
    device: {
      id: "61f0fe1384183f00fdd7ad78",
      name: "Integra P450",
      serial: "ABCDE0123456"
    },
    bars: [{
      startDate: "2022-03-28 08:41",
      endDate: "2022-03-28 13:37",
      gapMs: 17760000,
      device: "61f0fe1384183f00fdd7ad78",
      items: ["6238acf61a71fff5ccdc8ac5"],
      ganttBarConfig: {
        id: "62417507908749b66d60a747",
        label: "Batch P450",
        hasHandles: true,
        style: { background: "#4aabcc", borderRadius: "8px", color: "#ffffff" }
      }
    }]
  },
  {
    id: "61f0fe1384183f00fdd7ad48",
    device: {
      id: "61f0fe1384183f00fdd7ad48",
      name: "Integra P330",
      serial: "ABCDE0123421"
    },
    bars: [{
      startDate: "2022-03-28 08:41",
      endDate: "2022-03-28 13:37",
      gapMs: 17760000,
      device: "61f0fe1384183f00fdd7ad48",
      items: [],
      ganttBarConfig: {
        id: "62417507908749b66d60a737",
        label: "Batch P330",
        hasHandles: true,
        style: { background: "#4aabcc", borderRadius: "8px", color: "#ffffff" }
      }
    }]
  }
]
)

const addBar = () => {
  for (const row of bars1.value) {
    if (row.bars.some(bar => bar.ganttBarConfig.id === "62417507908749b66d60b231")) {
      return
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
      style: { background: "#4aabcc", borderRadius: "8px", color: "#ffffff" }
    }
  }
  const newRow = bars1.value.find(row => row.id === "61f0fe1384183f00fdd7ad48")
  if (newRow) {
    newRow.bars.push(bar)
  }
}

const deleteBar = () => {
  for (const row of bars1.value) {
    const idx = row.bars.findIndex(b => b.ganttBarConfig.id === "62417507908749b66d60b231")
    if (idx !== -1) {
      row.bars.splice(idx, 1)
    }
  }
  const idx = bars1.value[1].bars.findIndex(b => b.ganttBarConfig.id === "62417507908749b66d60b231")
  if (idx !== -1) {
    bars1.value[1].bars.splice(idx, 1)
  }
}

const onMousedownBar = (bar: GanttBarObject, e:MouseEvent, datetime?: string) => {
  // console.log("mousedown-bar", bar, e, datetime)
}

const onMouseupBar = (bar: GanttBarObject, e:MouseEvent, datetime?: string) => {
  // console.log("mouseup-bar", bar, e, datetime)
}

const onMouseenterBar = (bar: GanttBarObject, e:MouseEvent) => {
  // console.log("mouseenter-bar", bar, e)
}

const onMouseleaveBar = (bar: GanttBarObject, e:MouseEvent) => {
  // console.log("mouseleave-bar", bar, e)
}

const onDragstartBar = (bar: GanttBarObject, e:MouseEvent) => {
  // console.log("dragstart-bar", bar, e)
}
const onDragBar = (bar: GanttBarObject, e:MouseEvent, newRowId: string) => {
  let foundBar
  if (newRowId !== "") {
    const newRow = bars1.value.find(row => row.id === newRowId)
    for (const eachBar of bars1.value) {
      foundBar = eachBar.bars.find(b => b.ganttBarConfig.id === bar.ganttBarConfig.id)
      if (foundBar) {
        const index = eachBar.bars.indexOf(foundBar)
        if (newRow && foundBar) {
          newRow.bars.push(foundBar)
        }
        if (index !== -1) {
          eachBar.bars.splice(index, 1)
        }
      }
    }
  }
}

const onDragendBar = (bar: GanttBarObject, e:MouseEvent, movedBars?: Map<GanttBarObject, {oldStart: string, oldEnd: string, oldRow: string}>) => {
  // console.log("dragend-bar", bar, e, movedBars)
  const deleteBarRow = bars1.value.find(row => row.bars.find((b) => Object.entries(b).toString() === Object.entries(bar).toString()))
  if (deleteBarRow && deleteBarRow.id !== bar.device) {
    const foundBar = deleteBarRow.bars.find(b => b.ganttBarConfig.id === bar.ganttBarConfig.id)
    if (foundBar) {
      const index = deleteBarRow.bars.indexOf(foundBar)
      if (index !== -1) {
        deleteBarRow.bars.splice(index, 1)
      }
    }
    const addBarRow = bars1.value.find(row => row.id === bar.device)
    if (addBarRow && foundBar) {
      addBarRow.bars.push(foundBar)
    }
  }
}

const onContextmenuBar = (bar: GanttBarObject, e:MouseEvent, datetime?: string) => {
  // console.log("contextmenu-bar", bar, e, datetime)
}

const onDoubleClickRow = (e:MouseEvent, id: string, datetime: string) => {
  console.log(e, id, datetime)
}
</script>
<style>

/* Grid row styles */
.g-gantt-row {
  width: 100%;
  position: relative;
}

.g-gantt-row > .g-gantt-row-bars-container{
  position: relative;
  border-top: 1px solid #eaeaea;
  width: 100%;
  border-bottom: 1px solid #eaeaea;
}

.g-gantt-row-label {
  position: absolute;
  top:0;
  left: 0px;
  padding: 0px 8px;
  display: flex;
  align-items: center;
  height: 60%;
  min-height: 20px;
  font-size: 0.8em;
  font-weight: bold;
  border-bottom-right-radius: 6px;
  background: #f9fafd;
  color: #404040;
  z-index: 3;
  box-shadow: 0px 1px 4px 0px rgba(0,0,0,0.6);
}

.bar-transition-leave-active,
.bar-transition-enter-active {
  transition: 0s;
}
.bar-transition-enter-from {
  transform: scale(0);
}
.bar-transition-leave-to {
  transform: scale(0);
}

/* grid container styles */
   .g-grid-container {
     position: absolute;
     top: 0;
     left: 0%;
     width: 100%;
     height: 100%;
     display: flex;
     justify-content: space-between;
   }
.g-grid-line {
  width: 1px;
  height: 100%;
  border-left: 1px solid #eeeeee;
}
.highlight {
   background: #edf2f9;
 }

.g-timeaxis {
  position: sticky;
  top:0;
  width: 100%;
  height: 100px;
  min-height: 75px;
  background: white;
  z-index: 4;
  box-shadow: 0px 1px 3px 2px rgba(50,50,50, 0.5);
  display: flex;
  flex-direction: column;
}

.g-timeunits-container {
  display:flex;
  width: 100%;
  height: 50%;
}
.g-timeunits-container .primary-color {
  background-color: #f9fafd;
}
.g-timeunits-container .secondary-color {
  background-color: #edf2f9;
}

.g-timeunit {
  height: 100%;
  font-size: 65%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.g-upper-timeunit {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
}

.g-timeaxis-hour-pin {
  width: 1px;
  height: 10px;
  background: #333;
}
#g-timeaxis-marker {
  position: absolute;
  top:0;
  left:0;
  height: 100%;
  width: 3px;
  background: black;
}

/* Chart styles */
#g-gantt-chart{
  position: relative;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  border-radius: 5px;
  background: #FFFFFF;
}

#g-gantt-rows-container{
  position: relative;
}

/* Tooltip styles */
.g-gantt-tooltip {
  position: fixed;
  background: black;
  color: white;
  z-index: 4;
  font-size: 0.85em;
  padding: 5px;
  border-radius: 3px;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
}
.g-gantt-tooltip:before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  width: 0;
  height: 0;
  border: 10px solid transparent;
  border-bottom-color: black;
  border-top: 0;
  margin-left: -5px;
  margin-top: -5px;
}
.g-gantt-tooltip > .gantt-bar-tooltip-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 100%;
  margin-right: 4px;
}
.fade-enter-active {
  animation: fade-in .3s;
}
.fade-leave-active {
  animation: fade-in .3s reverse;
}

@keyframes fade-in {
  from {
    opacity: 0;
  } to {
      opacity: 1;
    }
}

/* Bar styles */
.g-gantt-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  background: cadetblue;
  overflow: hidden;
}

.g-gantt-bar-label {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 14px 0 14px;   /* 14px is the width of the handle */
  display: flex;
  justify-content: center;
  align-items: center;
}
.g-gantt-bar-label > * {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.g-gantt-bar-handle-left, .g-gantt-bar-handle-right {
  position: absolute;
  width: 10px;
  height: 100%;
  background: white;
  opacity: 0.7;
  border-radius: 0px;
  cursor: w-resize;
  top: 0;
}
.g-gantt-bar-handle-left {
  left: 0;
}
.g-gantt-bar-handle-right {
  right: 0;
}

.g-gantt-bar-label img {
  pointer-events: none;
}

</style>

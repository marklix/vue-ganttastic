<template>
  <g-gantt-chart
    :chart-start="chartStart"
    :chart-end="chartEnd"
    precision="hour"
    :row-height="40"
    grid
    width="100%"
    bar-start="beginDate"
    bar-end="endDate"
    :date-format="format"
    no-overlap
    @mousedown-bar="onMousedownBar($event.bar, $event.e, $event.datetime)"
    @dblclick-bar="onMouseupBar($event.bar, $event.e, $event.datetime)"
    @mouseenter-bar="onMouseenterBar($event.bar, $event.e)"
    @mouseleave-bar="onMouseleaveBar($event.bar, $event.e)"
    @dragstart-bar="onDragstartBar($event.bar, $event.e)"
    @drag-bar="onDragBar($event.bar, $event.e)"
    @dragend-bar="onDragendBar($event.bar, $event.e, $event.movedBars)"
    @contextmenu-bar="onContextmenuBar($event.bar, $event.e, $event.datetime)"
  >
    <g-gantt-row
      v-for="(bar, idx) in bars1"
      :key="idx"
      :label="'My row' + idx"
      :bars="bar"
      highlight-on-hover
    />
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

const chartStart = ref("2022-12-11 00:00")
const chartEnd = ref("2022-12-11 23:59")
const format = ref("YYYY-MM-DD HH:mm")

const bars1 = ref([
  [
    {
      beginDate: "2022-12-11 16:00",
      endDate: "2022-12-11 18:00",
      gapMs: 7200000,
      ganttBarConfig: {
        id: "8621987329",
        label: "I'm in a bundle"
      }
    }
  ],
  [
    {
      beginDate: "2022-12-11 11:00",
      endDate: "2022-12-11 12:00",
      gapMs: 3600000,
      ganttBarConfig: {
        id: "1592311887",
        label: "I'm in a bundle",
        style: {
          background: "magenta"
        }
      }
    },
    {
      beginDate: "2022-12-11 08:00",
      endDate: "2022-12-11 10:00",
      gapMs: 7200000,
      ganttBarConfig: {
        id: "7716981641",
        label: "Lorem ipsum dolor",
        hasHandles: true,
        style: {
          background: "#b74b52"
        }
      }
    },
    {
      beginDate: "2022-12-11 17:00",
      endDate: "2022-12-11 18:00",
      gapMs: 3600000,
      ganttBarConfig: {
        id: "9716981641",
        label: "Oh hey",
        style: {
          background: "#69e064",
          borderRadius: "15px",
          color: "blue",
          fontSize: "10px"
        }
      }
    }
  ]
])

const bars2 = ref([
  {
    beginDate: "2022-12-11 11:00",
    endDate: "2022-12-11 12:00",
    gapMs: 3600000,
    ganttBarConfig: {
      id: "1592311887",
      label: "I'm in a bundle",
      style: {
        background: "magenta"
      }
    }
  },
  {
    beginDate: "2022-12-11 08:00",
    endDate: "2022-12-11 10:00",
    gapMs: 7200000,
    ganttBarConfig: {
      id: "7716981641",
      label: "Lorem ipsum dolor",
      hasHandles: true,
      style: {
        background: "#b74b52"
      }
    }
  },
  {
    beginDate: "2022-12-11 17:00",
    endDate: "2022-12-11 18:00",
    gapMs: 3600000,
    ganttBarConfig: {
      id: "9716981641",
      label: "Oh hey",
      style: {
        background: "#69e064",
        borderRadius: "15px",
        color: "blue",
        fontSize: "10px"
      }
    }
  }
])
const addBar = () => {
  if (bars1.value[0].some(bar => bar.ganttBarConfig.id === "test1")) {
    return
  }
  const bar = {
    beginDate: "2022-12-11 08:00",
    endDate: "2022-12-11 10:00",
    gapMs: 7200000,
    ganttBarConfig: {
      id: "test1",
      hasHandles: true,
      label: "Hello!",
      style: {
        background: "#5484b7",
        borderRadius: "20px"
      }
    }
  }
  bars1.value[0].push(bar)
}

const deleteBar = () => {
  const idx = bars1.value[0].findIndex(b => b.ganttBarConfig.id === "test1")
  if (idx !== -1) {
    bars1.value[0].splice(idx, 1)
  }
}

const onMousedownBar = (bar: GanttBarObject, e:MouseEvent, datetime?: string) => {
  console.log("mousedown-bar", bar, e, datetime)
}

const onMouseupBar = (bar: GanttBarObject, e:MouseEvent, datetime?: string) => {
  console.log("mouseup-bar", bar, e, datetime)
}

const onMouseenterBar = (bar: GanttBarObject, e:MouseEvent) => {
  console.log("mouseenter-bar", bar, e)
}

const onMouseleaveBar = (bar: GanttBarObject, e:MouseEvent) => {
  console.log("mouseleave-bar", bar, e)
}

const onDragstartBar = (bar: GanttBarObject, e:MouseEvent) => {
  console.log("dragstart-bar", bar, e)
}

const onDragBar = (bar: GanttBarObject, e:MouseEvent) => {
  console.log("drag-bar", bar, e)
}

const onDragendBar = (bar: GanttBarObject, e:MouseEvent, movedBars?: Map<GanttBarObject, {oldStart: string, oldEnd: string}>) => {
  console.log("dragend-bar", bar, e, movedBars)
}

const onContextmenuBar = (bar: GanttBarObject, e:MouseEvent, datetime?: string) => {
  console.log("contextmenu-bar", bar, e, datetime)
}
</script>

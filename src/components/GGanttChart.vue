<template>
  <div
    id="g-gantt-chart"
    ref="gGanttChart"
    :style="{width, fontFamily: font}"
  >
    <g-gantt-timeaxis
      v-if="!hideTimeaxis"
      :chart-start="chartStart"
      :chart-end="chartEnd"
      :precision="precision"
    >
      <template #upper-timeunit="{label, value}">
        <!-- expose upper-timeunit slot of g-gantt-timeaxis-->
        <slot
          name="upper-timeunit"
          :label="label"
          :value="value"
        />
      </template>
      <template #timeunit="{label, value}">
        <!-- expose timeunit slot of g-gantt-timeaxis-->
        <slot
          name="timeunit"
          :label="label"
          :value="value"
        />
      </template>
    </g-gantt-timeaxis>

    <g-gantt-grid
      v-if="grid"
      :highlighted-units="highlightedUnits"
    />

    <div id="g-gantt-rows-container">
      <slot />   <!-- the g-gantt-row components go here -->
    </div>

    <g-gantt-bar-tooltip
      :model-value="showTooltip || isDragging"
      :bar="tooltipBar"
    >
      <template #default>
        <slot
          name="bar-tooltip"
          :bar="tooltipBar"
        />
      </template>
    </g-gantt-bar-tooltip>
  </div>
</template>

<script setup lang="ts">
import GGanttTimeaxis from "./GGanttTimeaxis.vue"
import GGanttGrid from "./GGanttGrid.vue"
import GGanttBarTooltip from "./GGanttBarTooltip.vue"
import INJECTION_KEYS from "../models/symbols"
import { computed, provide, ref, toRefs, defineProps, withDefaults, defineEmits, useSlots, VNode } from "vue"
import { GanttBarObject } from "@/models/models"

interface GGanttChartProps {
  chartStart: string
  chartEnd: string
  precision?: "hour" | "day" | "month"
  barStart: string
  barEnd: string
  dateFormat?: string
  width?: string
  hideTimeaxis?: boolean
  grid?: boolean
  pushOnOverlap?: boolean
  noOverlap?: boolean
  rowHeight?: number
  highlightedUnits?: number[]
  font?: string
  minimumGap?: number
}

const props = withDefaults(defineProps<GGanttChartProps>(), {
  dateFormat: "YYYY-MM-DD HH:mm",
  precision: "day",
  width: "100%",
  hideTimeaxis: false,
  grid: false,
  pushOnOverlap: false,
  noOverlap: false,
  rowHeight: 40,
  highlightedUnits: () => [],
  font: "Helvetica",
  minimumGap: 60
})

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: "mousedown-bar", value: {bar: GanttBarObject, e: MouseEvent, datetime?: string}) : void
  (e: "mouseup-bar", value: {bar: GanttBarObject, e: MouseEvent, datetime?: string}) : void
  (e: "dblclick-bar", value: {bar: GanttBarObject, e: MouseEvent, datetime?: string}) : void
  (e: "mouseenter-bar", value: {bar: GanttBarObject, e: MouseEvent}) : void
  (e: "mouseleave-bar", value: {bar: GanttBarObject, e: MouseEvent}) : void
  (e: "dragstart-bar", value: {bar: GanttBarObject, e: MouseEvent}) : void
  (e: "drag-bar", value: {bar: GanttBarObject, e: MouseEvent, newRowId?: string}) : void
  (e: "dragend-bar", value: {bar: GanttBarObject, e: MouseEvent, movedBars?: Map<GanttBarObject, {oldStart: string, oldEnd: string}>}) : void
  (e: "contextmenu-bar", value: {bar: GanttBarObject, e: MouseEvent, datetime?: string }) : void
}>()

const { chartStart, chartEnd, precision, width, font } = toRefs(props)
const slots = useSlots()

const allBarsInChartByRow = computed(() => {
  const defaultSlot = slots.default?.()
  const barsArray: Array<VNode> = []
  const allBars: GanttBarObject[][] = []

  defaultSlot?.forEach((el) => {
    if (typeof el.children !== "string" || el.props !== null) {
      barsArray.push(el as VNode)
    }
  })

  if (barsArray) {
    if (barsArray?.length <= 1) {
      const arrayChildren: [] = barsArray[0].children as []
      arrayChildren?.forEach((child: VNode) => {
        if (child.props?.bars) {
          const bars = child.props.bars as GanttBarObject[]
          allBars.push(bars)
        }
      })
    } else {
      barsArray?.forEach((child: VNode) => {
        if (child.props?.bars) {
          const bars = child.props.bars as GanttBarObject[]
          allBars.push(bars)
        }
      })
    }
  }
  return allBars
})

const showTooltip = ref(false)
const isDragging = ref(false)
const tooltipBar = ref<GanttBarObject | null>(null)
let tooltipTimeoutId : number
const initTooltip = (bar: GanttBarObject) => {
  if (tooltipTimeoutId) {
    clearTimeout(tooltipTimeoutId)
  }
  tooltipTimeoutId = setTimeout(() => { showTooltip.value = true }, 800)
  tooltipBar.value = bar
}

const clearTooltip = () => {
  clearTimeout(tooltipTimeoutId)
  showTooltip.value = false
}

const emitBarEvent = (
  e: MouseEvent,
  bar: GanttBarObject,
  datetime?: string,
  movedBars?: Map<GanttBarObject, {oldStart: string, oldEnd: string}>,
  newRowId?: string
) => {
  switch (e.type) {
    case "mousedown":
      initTooltip(bar)
      emit("mousedown-bar", { bar, e, datetime })
      break
    case "mouseup":
      emit("mouseup-bar", { bar, e, datetime }); break
    case "dblclick": emit("dblclick-bar", { bar, e, datetime }); break
    case "mouseenter":
      if (!isDragging.value) {
        initTooltip(bar)
      }
      emit("mouseenter-bar", { bar, e })
      break
    case "mouseleave":
      clearTooltip()
      emit("mouseleave-bar", { bar, e })
      break
    case "dragstart":
      isDragging.value = true
      emit("dragstart-bar", { bar, e })
      break
    case "drag":
      emit("drag-bar", { bar, e, newRowId })
      break
    case "dragend":
      isDragging.value = false
      emit("dragend-bar", { bar, e, movedBars })
      break
    case "contextmenu": emit("contextmenu-bar", { bar, e, datetime }); break
  }
}

const gGanttChart = ref<HTMLElement | null>(null)

provide(INJECTION_KEYS.allBarsInChartKey, allBarsInChartByRow)
provide(INJECTION_KEYS.gGanttChartPropsKey, { ...toRefs(props), gGanttChart })
provide(INJECTION_KEYS.emitBarEventKey, emitBarEvent)
</script>

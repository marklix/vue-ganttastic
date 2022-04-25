<template>
  <teleport to="body">
    <div
      v-if="modelValue && !outOfLimits"
      class="g-gantt-tooltip"
      :style="{
        top: tooltipTop,
        left: tooltipLeft,
        fontFamily: font
      }"
    >
      <div
        class="gantt-bar-tooltip-color-dot"
        :style="{background: dotColor}"
      />
      <slot>
        {{ tooltipContent }}
      </slot>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { GanttBarObject } from "@/models/models"
import INJECTION_KEYS from "../models/symbols"
import { computed, toRefs, ref, defineProps, watch, nextTick, inject } from "vue"
import useDayjsHelper from "../composables/useDayjsHelper"

const props = defineProps<{
  bar?: GanttBarObject
  modelValue: boolean
}>()

const { bar } = toRefs(props)
const gGanttChartPropsRefs = inject(INJECTION_KEYS.gGanttChartPropsKey)
if (!gGanttChartPropsRefs) {
  throw Error("GGanttBarTooltip: Failed to inject values from GGanttChart!")
}
const tooltipTop = ref("0px")
const tooltipLeft = ref("0px")
const outOfLimits = ref(false)

watch(() => bar, () => {
  const barId = bar?.value?.ganttBarConfig.id || ""
  const barElement = document.getElementById(barId)
  nextTick(() => {
    if (barId) {
      let { top, left } = barElement?.getBoundingClientRect() || { top: 0, left: 0 }
      const { rowHeight } = gGanttChartPropsRefs

      // Get relative position to window for hide tooltip if is out of container
      const chartContainerOffset = document.getElementById("g-gantt-chart")?.getBoundingClientRect().left || 0
      const chartContainerWidth = document.getElementById("g-gantt-chart")?.getBoundingClientRect().width || 0

      // There is a bug that randomly changes the place of tooltip when changing row, this is a workaround for it
      if (barElement?.offsetLeft && (left > barElement?.offsetLeft)) {
        left = barElement?.offsetLeft + 10 + chartContainerOffset
      } else {
        left = Math.max(left, 10)
      }

      // Hide/show tooltip if true/false out of limits
      outOfLimits.value = left < chartContainerOffset || left > chartContainerOffset + chartContainerWidth

      tooltipTop.value = `${top + rowHeight.value - 10}px`
      tooltipLeft.value = `${left}px`
    }
  })
}, { deep: true, immediate: true })

const dotColor = computed(() => bar?.value?.ganttBarConfig.style?.background || "cadetblue")

const tooltipFormats = {
  hour: "HH:mm",
  day: "DD. MMM HH:mm",
  month: "DD. MMMM YYYY"
}
const { toDayjs } = useDayjsHelper(gGanttChartPropsRefs)
const { precision, font } = gGanttChartPropsRefs
const tooltipContent = computed(() => {
  const format = tooltipFormats[precision.value]
  if (bar && bar.value) {
    const barStartFormatted = toDayjs(bar.value, "start").format(format)
    const barEndFormatted = toDayjs(bar.value, "end").format(format)
    return `${barStartFormatted} - ${barEndFormatted}`
  }
  return ""
})

</script>

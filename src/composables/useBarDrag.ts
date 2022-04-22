import { GanttBarObject, GGanttChartPropsRefs } from "@/models/models"
import useDayjsHelper from "./useDayjsHelper"
import dayjs from "dayjs"
import useTimePositionMapping from "./useTimePositionMapping"
import { Ref, ref } from "vue"

export default function useBarDrag (
  bar: Ref<GanttBarObject>,
  gGanttChartPropsRefs: GGanttChartPropsRefs,
  onDrag: (e: MouseEvent, bar: GanttBarObject, newRowId: string) => void = () => null,
  onEndDrag: (e: MouseEvent, bar: GanttBarObject) => void = () => null
) {
  const { barStart, barEnd, pushOnOverlap, dateFormat } = gGanttChartPropsRefs
  const isDragging = ref(false)
  let cursorOffsetX = 0
  let dragCallBack : (e: MouseEvent) => void

  const { mapPositionToTime } = useTimePositionMapping(gGanttChartPropsRefs)
  const { toDayjs, addGapDayjs, differenceDayjs } = useDayjsHelper(gGanttChartPropsRefs)

  const initDrag = (e: MouseEvent) => {
    const barElement = document.getElementById(bar.value.ganttBarConfig.id)
    if (barElement) {
      cursorOffsetX = e.clientX - (barElement.getBoundingClientRect().left || 0)
      const mousedownType = (e.target as Element).className
      switch (mousedownType) {
        case "g-gantt-bar-handle-left":
          document.body.style.cursor = "w-resize"
          dragCallBack = dragByLeftHandle
          break
        case "g-gantt-bar-handle-right":
          document.body.style.cursor = "w-resize"
          dragCallBack = dragByRightHandle
          break
        default: dragCallBack = drag
      }
      isDragging.value = true
      window.addEventListener("mousemove", dragCallBack)
      window.addEventListener("mouseup", endDrag)
    }
  }

  const drag = (e: MouseEvent) => {
    const barElement = document.getElementById(bar.value.ganttBarConfig.id)
    const oldRow = barElement?.closest(".g-gantt-row")
    const newRow = document.elementFromPoint(e.clientX, e.clientY)?.closest(".g-gantt-row")

    // Case for changing row
    if (oldRow && newRow && barElement && (oldRow.id !== newRow.id)) {
      move(oldRow, newRow, barElement)
      bar.value.device = newRow.id
      onDrag(e, bar.value, newRow.id)
    }

    // Case for changing time
    const barContainer = barElement?.closest(".g-gantt-row-bars-container")?.getBoundingClientRect()
    if (barElement && barContainer) {
      const barWidth = barElement.getBoundingClientRect().width
      const xStart = (e.clientX - barContainer.left - cursorOffsetX)
      const xEnd = xStart + barWidth
      if (isOutOfRange(xStart, xEnd)) {
        return
      }
      bar.value[barStart.value] = mapPositionToTime(xStart)
      // Calculate the Gap between start Date and end Date
      bar.value[barEnd.value] = addGapDayjs(mapPositionToTime(xStart), bar.value.gapMs, "ms")
      onDrag(e, bar.value, "")
    }
  }

  /* Update DOM when changing row */
  const move = (oldParent: Element, newParent: Element, movedElement: Element) => {
    for (const oldParentChild of Array.from(oldParent.children)) {
      if (oldParentChild.id === oldParent.id) {
        for (const secondLevelChild of Array.from(oldParentChild.children[0].children)) {
          if (secondLevelChild.id === movedElement.id) {
            newParent.appendChild(secondLevelChild)
          }
        }
      }
    }
  }

  const dragByLeftHandle = (e: MouseEvent) => {
    const barElement = document.getElementById(bar.value.ganttBarConfig.id)
    const barContainer = barElement?.closest(".g-gantt-row-bars-container")?.getBoundingClientRect()
    if (barElement && barContainer) {
      const xStart = e.clientX - barContainer.left
      const newBarStart = mapPositionToTime(xStart)
      if (toDayjs(newBarStart).isSameOrAfter(toDayjs(bar.value, "end"))) {
        return
      }

      // Keep the minimum Gap size between start Date and end Date
      if (toDayjs(newBarStart).isSameOrAfter(dayjs(bar.value[barEnd.value]).subtract(30 * 60, "s"))) {
        bar.value[barStart.value] = dayjs(bar.value[barEnd.value]).subtract(30 * 60, "s").format(dateFormat.value)
        return
      }

      bar.value[barStart.value] = newBarStart
      // Calculate the Gap between start Date and end Date
      bar.value.gapMs = differenceDayjs(bar.value[barStart.value], bar.value[barEnd.value])
      onDrag(e, bar.value, "")
    }
  }

  const dragByRightHandle = (e: MouseEvent) => {
    const barElement = document.getElementById(bar.value.ganttBarConfig.id)
    const barContainer = barElement?.closest(".g-gantt-row-bars-container")?.getBoundingClientRect()
    if (barElement && barContainer) {
      const xEnd = e.clientX - barContainer.left
      const newBarEnd = mapPositionToTime(xEnd)
      if (toDayjs(newBarEnd).isSameOrBefore(toDayjs(bar.value, "start"))) {
        return
      }

      // Keep the minimum Gap size between start Date and end Date
      if (toDayjs(newBarEnd).isSameOrBefore(dayjs(bar.value[barStart.value]).add(30 * 60, "s"))) {
        bar.value[barEnd.value] = dayjs(bar.value[barStart.value]).add(30 * 60, "s").format(dateFormat.value)
        return
      }

      bar.value[barEnd.value] = newBarEnd
      // Calculate the Gap between start Date and end Date
      bar.value.gapMs = differenceDayjs(bar.value[barStart.value], bar.value[barEnd.value])
      onDrag(e, bar.value, "")
    }
  }

  const isOutOfRange = (xStart?: number, xEnd?: number) => {
    if (!pushOnOverlap) {
      return false
    }
    const dragLimitLeft = bar.value.ganttBarConfig.dragLimitLeft
    const dragLimitRight = bar.value.ganttBarConfig.dragLimitRight

    if (xStart && dragLimitLeft != null && xStart < dragLimitLeft) {
      return true
    }

    if (xEnd && dragLimitRight != null && xEnd > dragLimitRight) {
      return true
    }

    return false
  }

  const endDrag = (e: MouseEvent) => {
    isDragging.value = false
    document.body.style.cursor = "auto"
    window.removeEventListener("mousemove", dragCallBack)
    window.removeEventListener("mouseup", endDrag)
    onEndDrag(e, bar.value)
  }

  return {
    isDragging,
    initDrag,
    move
  }
}

import { GanttBarObject, GGanttChartPropsRefs } from "@/models/models"
import { ComputedRef, ref } from "vue"
import useBarDrag from "./useBarDrag"
import useDayjsHelper from "./useDayjsHelper"

export default function useBarDragManagement (
  allRowsInChart : ComputedRef<GanttBarObject[][]>,
  gGanttChartPropsRefs: GGanttChartPropsRefs,
  emitBarEvent: (
    e: MouseEvent,
    bar: GanttBarObject,
    datetime?: string,
    movedBars?: Map<GanttBarObject, {oldStart: string, oldEnd: string, oldRow: string}>,
    newRowId?: string,
  ) => void
) {
  const movedBarsInDrag = new Map<GanttBarObject, {oldStart: string, oldEnd: string, oldRow: string}>()

  const { pushOnOverlap, barStart, barEnd, noOverlap, dateFormat } = gGanttChartPropsRefs
  const { toDayjs, differenceDayjs } = useDayjsHelper(gGanttChartPropsRefs)
  const initDragOfBar = (bar: GanttBarObject, e: MouseEvent) => {
    const { initDrag } = useBarDrag(ref(bar), gGanttChartPropsRefs, onDrag, onEndDrag)
    const ev = {
      ...e,
      type: "dragstart"
    }
    emitBarEvent(ev, bar)
    initDrag(e)
    addBarToMovedBars(bar)
  }

  const initDragOfBundle = (mainBar: GanttBarObject, e: MouseEvent) => {
    const bundle = mainBar.ganttBarConfig.bundle
    if (bundle != null) {
      allRowsInChart.value.forEach(row => {
        row.forEach(bar => {
          if (bar.ganttBarConfig.bundle === bundle) {
            const dragEndHandler = bar === mainBar ? onEndDrag : () => null
            const { initDrag } = useBarDrag(ref(bar), gGanttChartPropsRefs, onDrag, dragEndHandler)
            initDrag(e)
            addBarToMovedBars(bar)
          }
        })
      })
      const ev = {
        ...e,
        type: "dragstart"
      }
      emitBarEvent(ev, mainBar)
    }
  }

  const onDrag = (e: MouseEvent, bar: GanttBarObject, newRowId: string) => {
    const ev = {
      ...e,
      type: "drag"
    }
    emitBarEvent(ev, bar, undefined, undefined, newRowId)
    fixOverlaps(bar)
  }

  /* Only works if pushOnOverlap is enabled */
  const fixOverlaps = (ganttBar: GanttBarObject) => {
    if (!pushOnOverlap.value) {
      return
    }
    let currentBar = ganttBar
    let { overlapBar, overlapType } = getOverlapBarAndType(currentBar)
    while (overlapBar) {
      addBarToMovedBars(overlapBar)
      const currentBarStart = toDayjs(currentBar[barStart.value])
      const currentBarEnd = toDayjs(currentBar[barEnd.value])
      const overlapBarStart = toDayjs(overlapBar[barStart.value])
      const overlapBarEnd = toDayjs(overlapBar[barEnd.value])
      let minuteDiff : number
      switch (overlapType) {
        case "left":
          minuteDiff = overlapBarEnd.diff(currentBarStart, "minutes", true)
          overlapBar[barEnd.value] = currentBarStart.format(dateFormat.value)
          overlapBar[barStart.value] = overlapBarStart.subtract(minuteDiff, "minutes").format(dateFormat.value)
          break
        case "right":
          minuteDiff = currentBarEnd.diff(overlapBarStart, "minutes", true)
          overlapBar[barStart.value] = currentBarEnd.format(dateFormat.value)
          overlapBar[barEnd.value] = overlapBarEnd.add(minuteDiff, "minutes").format(dateFormat.value)
          break
        default:
          console.warn("Vue-Ganttastic: One bar is inside of the other one! This should never occur while push-on-overlap is active!")
          return
      }
      if (overlapBar && (overlapType === "left" || overlapType === "right")) {
        moveBundleOfPushedBarByMinutes(overlapBar, minuteDiff, overlapType)
      }
      currentBar = overlapBar;
      ({ overlapBar, overlapType } = getOverlapBarAndType(overlapBar))
    }
  }

  const getOverlapBarAndType = (ganttBar: GanttBarObject) => {
    let overlapLeft, overlapRight, overlapInBetween, overlapSameSize
    const allBarsInRow = allRowsInChart.value.find(row => row.includes(ganttBar)) || []
    const ganttBarStart = toDayjs(ganttBar[barStart.value])
    const ganttBarEnd = toDayjs(ganttBar[barEnd.value])
    const overlapBar = allBarsInRow.find(otherBar => {
      if (otherBar === ganttBar) {
        return false
      }
      const otherBarStart = toDayjs(otherBar[barStart.value])
      const otherBarEnd = toDayjs(otherBar[barEnd.value])
      overlapLeft = ganttBarStart.isBetween(otherBarStart, otherBarEnd)
      overlapRight = ganttBarEnd.isBetween(otherBarStart, otherBarEnd)
      overlapInBetween = otherBarStart.isBetween(ganttBarStart, ganttBarEnd) ||
                        otherBarEnd.isBetween(ganttBarStart, ganttBarEnd)
      overlapSameSize = ganttBarStart.isBetween(otherBarStart, otherBarEnd, null, "[]") && ganttBarEnd.isBetween(otherBarStart, otherBarEnd, null, "[]")
      return overlapLeft || overlapRight || overlapInBetween || overlapSameSize
    })
    const overlapType : "left" | "right" | "between" | null = overlapLeft ? "left" : (overlapRight ? "right" : (overlapInBetween ? "between" : null))

    return { overlapBar, overlapType }
  }
  /* Only works if pushOnOverlap is enabled */
  const moveBundleOfPushedBarByMinutes = (pushedBar: GanttBarObject, minutes: number, direction: "left" | "right") => {
    addBarToMovedBars(pushedBar)
    if (pushedBar.ganttBarConfig.bundle) {
      allRowsInChart.value.forEach(row => {
        row.forEach(bar => {
          if (bar.ganttBarConfig.bundle === pushedBar.ganttBarConfig.bundle && bar !== pushedBar) {
            addBarToMovedBars(bar)
            moveBarByMinutes(bar, minutes, direction)
          }
        })
      })
    }
  }
  /* Only works if pushOnOverlap is enabled */
  const moveBarByMinutes = (bar: GanttBarObject, minutes: number, direction: "left" | "right") => {
    switch (direction) {
      case "left":
        bar[barStart.value] = toDayjs(bar, "start").subtract(minutes, "minutes").format(dateFormat.value)
        bar[barEnd.value] = toDayjs(bar, "end").subtract(minutes, "minutes").format(dateFormat.value)
        break
      case "right":
        bar[barStart.value] = toDayjs(bar, "start").add(minutes, "minutes").format(dateFormat.value)
        bar[barEnd.value] = toDayjs(bar, "end").add(minutes, "minutes").format(dateFormat.value)
    }
    fixOverlaps(bar)
  }

  const onEndDrag = (e: MouseEvent, bar: GanttBarObject) => {
    snapBackAllMovedBarsIfNeeded()
    const ev = {
      ...e,
      type: "dragend"
    }
    emitBarEvent(ev, bar, undefined, new Map(movedBarsInDrag))
    movedBarsInDrag.clear()
  }

  const addBarToMovedBars = (bar: GanttBarObject) => {
    if (!movedBarsInDrag.has(bar)) {
      const oldStart = bar[barStart.value]
      const oldEnd = bar[barEnd.value]
      const oldRow = bar.device
      movedBarsInDrag.set(bar, { oldStart, oldEnd, oldRow })
    }
  }

  const snapBackAllMovedBarsIfNeeded = () => {
    if (!pushOnOverlap.value && noOverlap.value) {
      let isAnyOverlap = false
      movedBarsInDrag.forEach((_, bar) => {
        const { overlapBar } = getOverlapBarAndType(bar)
        if (overlapBar != null) {
          isAnyOverlap = true
        }
      })
      if (isAnyOverlap) {
        movedBarsInDrag.forEach(({ oldStart, oldEnd, oldRow }, bar) => {
          const oldRowElement = document.getElementById(oldRow)
          const barElement = document.getElementById(bar.ganttBarConfig.id)
          const rowToRollback = barElement?.closest(".g-gantt-row")
          if (oldRowElement && rowToRollback && barElement && (oldRowElement.id !== rowToRollback.id)) {
            const { move } = useBarDrag(ref(bar), gGanttChartPropsRefs, onDrag, onEndDrag)
            move(oldRowElement, rowToRollback, barElement)
          }
          bar[barStart.value] = oldStart
          bar[barEnd.value] = oldEnd
          bar.device = oldRow
          bar.gapMs = differenceDayjs(bar[barStart.value], bar[barEnd.value])
        })
      }
    }
  }

  return {
    initDragOfBar,
    initDragOfBundle
  }
}

/*
 * MARKLIX PLANNER
 * Copyright (c) 2022, Marklix SAS.
 *
 * Tous droits réservés pour tous pays. L’ensemble du contenu de ce fichier est confidentiel et demeure la propriété
 * exclusive de son auteur. Tous les droits sont réservés pour tous pays, notamment les droits de consultation, de
 * reproduction, de représentation, d’adaptation, de modification, de traduction, de distribution, de
 * commercialisation, d’usage, d’exploitation et de cession dudit fichier. Les traductions éventuelles de cette notice
 * sont uniquement données à titre indicatif.
 *
 * All rights reserved for all countries. All information contained herein is confidential and remain the exclusive
 * property of its author. All rights are reserved for all countries, including the rights to read, copy, depict,
 * adapt, modify, translate, distribute, sell, use (including commercially) and concede this file. Only the French
 * version of this notice is legally binding (see above).
 */

import { Ref, ref } from "vue";

import dayjs from "dayjs";

import { GanttBarObject, GanttChartPropsRefs } from "@/models/models";

import useDayjsHelper from "./useDayjsHelper";
import useTimePositionMapping from "./useTimePositionMapping";

/**
 * Returns the functions related to bar drag.
 * @param {Ref<GanttBarObject>} bar The bar to handle dragging for.
 * @param {GanttChartPropsRefs} ganttChartPropsRefs The properties of the GANTT chart.
 * @param {(e: MouseEvent, bar: GanttBarObject, newRowId: string) => void} onDrag The function executed in response to a
 *   drag event.
 * @param {(e: MouseEvent, bar: GanttBarObject) => void} onEndDrag The function executed after a drag event.
 * @return isDragging Whether a dragging event is ongoing.
 * @return initDrag A function that setups event listeners to handle a bar drag.
 * @return move A function that moves an element from a parent to another.
 */
export default function useBarDrag(
  bar: Ref<GanttBarObject>,
  ganttChartPropsRefs: GanttChartPropsRefs,
  onDrag: (e: MouseEvent, bar: GanttBarObject, newRowId: string) => void = () => null,
  onEndDrag: (e: MouseEvent, bar: GanttBarObject) => void = () => null
) {
  const { barStart, barEnd, pushOnOverlap, dateFormat, minimumGap } = ganttChartPropsRefs;
  const isDragging = ref(false);
  let cursorOffsetX = 0;
  let dragCallBack: (e: MouseEvent) => void;

  const { mapPositionToTime } = useTimePositionMapping(ganttChartPropsRefs);
  const { toDayjs, addGapDayjs, differenceDayjs } = useDayjsHelper(ganttChartPropsRefs);

  /**
   * Handles the dragging of a bar.
   * @param {MouseEvent} e The event that fired the dragging.
   */
  const drag = (e: MouseEvent) => {
    const barElement = document.getElementById(bar.value.ganttBarConfig.id);
    const oldRow = barElement?.closest(".gantt-row");
    const newRow = document.elementFromPoint(e.clientX, e.clientY)?.closest(".gantt-row");

    // Case for changing row
    if (oldRow && newRow && barElement && oldRow.id !== newRow.id) {
      move(oldRow, newRow, barElement);
      bar.value.device = newRow.id;
      onDrag(e, bar.value, newRow.id);
    }

    // Case for changing time
    const barContainer = barElement?.closest(".gantt-row-bars-container")?.getBoundingClientRect();
    if (barElement && barContainer) {
      const barWidth = barElement.getBoundingClientRect().width;
      const xStart = e.clientX - barContainer.left - cursorOffsetX;
      const xEnd = xStart + barWidth;

      if (isOutOfRange(xStart, xEnd)) {
        return;
      }

      bar.value[barStart.value] = mapPositionToTime(xStart);

      // Calculate the Gap between start Date and end Date
      bar.value[barEnd.value] = addGapDayjs(mapPositionToTime(xStart), bar.value.gapMs, "ms");

      onDrag(e, bar.value, "");
    }
  };

  /**
   * Handles the dragging of a left handle.
   * @param {MouseEvent} e The event that fired the left handle dragging.
   */
  const dragByLeftHandle = (e: MouseEvent) => {
    const barElement = document.getElementById(bar.value.ganttBarConfig.id);
    const barContainer = barElement?.closest(".gantt-row-bars-container")?.getBoundingClientRect();

    if (barElement && barContainer) {
      const xStart = e.clientX - barContainer.left;
      const newBarStart = mapPositionToTime(xStart);

      if (toDayjs(newBarStart).isSameOrAfter(toDayjs(bar.value, "end"))) {
        return;
      }

      // Keep the minimum Gap size between start Date and end Date
      if (toDayjs(newBarStart).isSameOrAfter(dayjs(bar.value[barEnd.value]).subtract(minimumGap.value * 60, "s"))) {
        bar.value[barStart.value] = dayjs(bar.value[barEnd.value])
          .subtract(minimumGap.value * 60, "s")
          .format(dateFormat.value);
        return;
      }

      bar.value[barStart.value] = newBarStart;

      // Calculate the Gap between start Date and end Date
      bar.value.gapMs = differenceDayjs(bar.value[barStart.value], bar.value[barEnd.value]);
      onDrag(e, bar.value, "");
    }
  };

  /**
   * Handles the dragging of a right handle.
   * @param {MouseEvent} e The event that fired the right handle dragging.
   */
  const dragByRightHandle = (e: MouseEvent) => {
    const barElement = document.getElementById(bar.value.ganttBarConfig.id);
    const barContainer = barElement?.closest(".gantt-row-bars-container")?.getBoundingClientRect();

    if (barElement && barContainer) {
      const xEnd = e.clientX - barContainer.left;
      const newBarEnd = mapPositionToTime(xEnd);

      if (toDayjs(newBarEnd).isSameOrBefore(toDayjs(bar.value, "start"))) {
        return;
      }

      // Keep the minimum Gap size between start Date and end Date
      if (toDayjs(newBarEnd).isSameOrBefore(dayjs(bar.value[barStart.value]).add(minimumGap.value * 60, "s"))) {
        bar.value[barEnd.value] = dayjs(bar.value[barStart.value])
          .add(minimumGap.value * 60, "s")
          .format(dateFormat.value);
        return;
      }

      bar.value[barEnd.value] = newBarEnd;

      // Calculate the Gap between start Date and end Date
      bar.value.gapMs = differenceDayjs(bar.value[barStart.value], bar.value[barEnd.value]);
      onDrag(e, bar.value, "");
    }
  };

  /**
   * Checks if the position is outside the allowed limits (mainly when an overlap occurs).
   * @param {number} xStart the new X where the bar starts.
   * @param {number} xEnd the new X where the bar ends.
   */
  const isOutOfRange = (xStart?: number, xEnd?: number): boolean => {
    if (!pushOnOverlap) {
      return false;
    }

    const dragLimitLeft = bar.value.ganttBarConfig.dragLimitLeft;
    const dragLimitRight = bar.value.ganttBarConfig.dragLimitRight;

    if (xStart && dragLimitLeft != null && xStart < dragLimitLeft) {
      return true;
    }

    return !!(xEnd && dragLimitRight != null && xEnd > dragLimitRight); // TODO: check new version
  };

  /**
   * Remove listeners and reset cursor/isDragging values after dragging.
   * @param {MouseEvent} e The event that fired the dragging.
   */
  const endDrag = (e: MouseEvent) => {
    isDragging.value = false;

    document.body.style.cursor = "auto";

    window.removeEventListener("mousemove", dragCallBack);
    window.removeEventListener("mouseup", endDrag);

    onEndDrag(e, bar.value);
  };

  /**
   * Setup event listeners to handle a bar drag.
   * @param {MouseEvent} e The event that fired the dragging.
   */
  const initDrag = (e: MouseEvent) => {
    const barElement = document.getElementById(bar.value.ganttBarConfig.id);

    if (barElement) {
      cursorOffsetX = e.clientX - (barElement.getBoundingClientRect().left || 0);

      const mousedownType = (e.target as Element).className;
      switch (mousedownType) {
        case "gantt-bar-handle-left":
          document.body.style.cursor = "w-resize";
          dragCallBack = dragByLeftHandle;
          break;
        case "gantt-bar-handle-right":
          document.body.style.cursor = "w-resize";
          dragCallBack = dragByRightHandle;
          break;
        default:
          dragCallBack = drag;
      }

      isDragging.value = true;

      window.addEventListener("mousemove", dragCallBack);
      window.addEventListener("mouseup", endDrag);
    }
  };

  /**
   * Moves an element from a parent to another.
   * @param {Element} oldParent The initial parent of the element.
   * @param {Element} newParent The new parent of the element.
   * @param {Element} movedElement The element to move.
   */
  const move = (oldParent: Element, newParent: Element, movedElement: Element) => {
    for (const oldParentChild of Array.from(oldParent.children)) {
      if (oldParentChild.id === oldParent.id) {
        for (const secondLevelChild of Array.from(oldParentChild.children[0].children)) {
          if (secondLevelChild.id === movedElement.id) {
            newParent.appendChild(secondLevelChild);
          }
        }
      }
    }
  };

  return {
    isDragging,
    initDrag,
    move,
  };
}

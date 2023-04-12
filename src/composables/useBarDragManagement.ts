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

import { ComputedRef, ref } from "vue";

import { GanttBarObject, GanttChartPropsRefs } from "../models/models";

import useBarDrag from "./useBarDrag";
import useDayjsHelper from "./useDayjsHelper";

/**
 * Returns a function to handle dragging limits of a bar.
 * @param {ComputedRef<GanttBarObject[][]>} allRowsInChart List of the bars in all rows of the Gantt chart.
 * @param {GanttChartPropsRefs} ganttChartPropsRefs The properties of the GANTT chart.
 * @param {(e: MouseEvent, bar: GanttBarObject, datetime?: string, movedBars?: Map<GanttBarObject,
 *   { oldStart: string; oldEnd: string; oldRow: string }>, newRowId?: string) => void} emitBarEvent The event emitted
 *   when dragging a bar or a bundle.
 * @return initDragOfBar A function that starts dragging a bar in response to a drag event. Emits a BarEvent when
 *   initiated.
 * @return initDragOfBundle A function that starts dragging a bar bundle in response to a drag event. Emits a BarEvent
 *   when initiated.
 */
export default function useBarDragManagement(
  allRowsInChart: ComputedRef<GanttBarObject[][]>,
  ganttChartPropsRefs: GanttChartPropsRefs,
  emitBarEvent: (
    e: MouseEvent,
    bar: GanttBarObject,
    datetime?: string,
    movedBars?: Map<GanttBarObject, { oldStart: string; oldEnd: string; oldRow: string }>,
    newRowId?: string
  ) => void
) {
  // Setup bar and drag event constants.
  const movedBarsInDrag = new Map<GanttBarObject, { oldStart: string; oldEnd: string; oldRow: string }>();
  const { pushOnOverlap, barStart, barEnd, noOverlap, dateFormat } = ganttChartPropsRefs;
  const { toDayjs, differenceDayjs } = useDayjsHelper(ganttChartPropsRefs);

  /**
   * Emits a BarEvent when dragging.
   * @param {MouseEvent} e The event that fired the drag.
   * @param {GanttBarObject} bar The dragged bar.
   * @param {string} newRowId The new row ID the bar is affected to.
   */
  const onDrag = (e: MouseEvent, bar: GanttBarObject, newRowId: string) => {
    const ev = {
      ...e,
      type: "drag",
    };

    emitBarEvent(ev, bar, undefined, undefined, newRowId);

    fixOverlaps(bar);
  };

  /**
   * Fixes overlaps when dragging a bar or a bundle provokes a push.
   * @param {GanttBarObject} ganttBar The bar to fix overlaps for.
   */
  const fixOverlaps = (ganttBar: GanttBarObject) => {
    if (!pushOnOverlap.value) {
      return;
    }

    let currentBar = ganttBar;
    let { overlapBar, overlapType } = getOverlapBarAndType(currentBar);

    while (overlapBar) {
      addBarToMovedBars(overlapBar);

      const currentBarStart = toDayjs(currentBar[barStart.value]);
      const currentBarEnd = toDayjs(currentBar[barEnd.value]);
      const overlapBarStart = toDayjs(overlapBar[barStart.value]);
      const overlapBarEnd = toDayjs(overlapBar[barEnd.value]);
      let minuteDiff: number;

      switch (overlapType) {
        case "left":
          minuteDiff = overlapBarEnd.diff(currentBarStart, "minutes", true);
          overlapBar[barEnd.value] = currentBarStart.format(dateFormat.value);
          overlapBar[barStart.value] = overlapBarStart.subtract(minuteDiff, "minutes").format(dateFormat.value);
          break;

        case "right":
          minuteDiff = currentBarEnd.diff(overlapBarStart, "minutes", true);
          overlapBar[barStart.value] = currentBarEnd.format(dateFormat.value);
          overlapBar[barEnd.value] = overlapBarEnd.add(minuteDiff, "minutes").format(dateFormat.value);
          break;

        default:
          console.warn(
            "Vue-Ganttastic: One bar is inside of the other one! This should never occur while push-on-overlap is active!"
          );
          return;
      }

      if (overlapBar && (overlapType === "left" || overlapType === "right")) {
        moveBundleOfPushedBarByMinutes(overlapBar, minuteDiff, overlapType);
      }

      currentBar = overlapBar;

      ({ overlapBar, overlapType } = getOverlapBarAndType(overlapBar));
    }
  };

  /**
   * Finds overlaps for the passed bar and returns its type.
   * @param {GanttBarObject} ganttBar The bar to fix overlaps for.
   * @return The bar overlapped by the passed one and the type of overlap.
   */
  const getOverlapBarAndType = (ganttBar: GanttBarObject) => {
    let overlapLeft, overlapRight, overlapInBetween, overlapSameSize;
    const allBarsInRow = allRowsInChart.value.find((row) => row.includes(ganttBar)) || [];
    const ganttBarStart = toDayjs(ganttBar[barStart.value]);
    const ganttBarEnd = toDayjs(ganttBar[barEnd.value]);

    const overlapBar = allBarsInRow.find((otherBar) => {
      if (otherBar === ganttBar) {
        return false;
      }

      if (otherBar.ganttBarConfig.immobile) {
        return false;
      }

      const otherBarStart = toDayjs(otherBar[barStart.value]);
      const otherBarEnd = toDayjs(otherBar[barEnd.value]);

      overlapLeft = ganttBarStart.isBetween(otherBarStart, otherBarEnd);
      overlapRight = ganttBarEnd.isBetween(otherBarStart, otherBarEnd);
      overlapInBetween =
        otherBarStart.isBetween(ganttBarStart, ganttBarEnd) || otherBarEnd.isBetween(ganttBarStart, ganttBarEnd);
      overlapSameSize =
        ganttBarStart.isBetween(otherBarStart, otherBarEnd, null, "[]") &&
        ganttBarEnd.isBetween(otherBarStart, otherBarEnd, null, "[]");

      return overlapLeft || overlapRight || overlapInBetween || overlapSameSize;
    });

    const overlapType: "left" | "right" | "between" | null = overlapLeft
      ? "left"
      : overlapRight
      ? "right"
      : overlapInBetween
      ? "between"
      : null;

    return { overlapBar, overlapType };
  };

  /**
   * Move a bundle of pushed bars.
   * @param {GanttBarObject} pushedBar The bar pertaining a bundle, pushed by another one.
   * @param {number} minutes The number of minutes to move the pushed bar of.
   * @param {"left" | "right"} direction The direction on which the bar is moved.
   */
  const moveBundleOfPushedBarByMinutes = (pushedBar: GanttBarObject, minutes: number, direction: "left" | "right") => {
    addBarToMovedBars(pushedBar);

    if (pushedBar.ganttBarConfig.bundle) {
      allRowsInChart.value.forEach((row) => {
        row.forEach((bar) => {
          if (bar.ganttBarConfig.bundle === pushedBar.ganttBarConfig.bundle && bar !== pushedBar) {
            addBarToMovedBars(bar);
            moveBarByMinutes(bar, minutes, direction);
          }
        });
      });
    }
  };

  /**
   * Move a bar.
   * @param {GanttBarObject} bar The bar moved.
   * @param {number} minutes The number of minutes to move the bar of.
   * @param {"left" | "right"} direction The direction on which the bar is moved.
   */
  const moveBarByMinutes = (bar: GanttBarObject, minutes: number, direction: "left" | "right") => {
    switch (direction) {
      case "left":
        bar[barStart.value] = toDayjs(bar, "start").subtract(minutes, "minutes").format(dateFormat.value);
        bar[barEnd.value] = toDayjs(bar, "end").subtract(minutes, "minutes").format(dateFormat.value);
        break;

      case "right":
        bar[barStart.value] = toDayjs(bar, "start").add(minutes, "minutes").format(dateFormat.value);
        bar[barEnd.value] = toDayjs(bar, "end").add(minutes, "minutes").format(dateFormat.value);
    }

    fixOverlaps(bar);
  };

  /**
   * Accepts the move of the passed dragged bar if possible, otherwise reset the position of moved bars. In all cases,
   *  emits a "dragend" event.
   * @param {MouseEvent} e The event that fired the drag.
   * @param {GanttBarObject} bar The bar moved.
   */
  const onEndDrag = (e: MouseEvent, bar: GanttBarObject) => {
    snapBackAllMovedBarsIfNeeded();

    const ev = {
      ...e,
      type: "dragend",
    };

    emitBarEvent(ev, bar, undefined, new Map(movedBarsInDrag));

    movedBarsInDrag.clear();
  };

  /**
   * Add the passed bar to the moved bars.
   * @param {GanttBarObject} bar The dragged bar to move.
   */
  const addBarToMovedBars = (bar: GanttBarObject) => {
    if (!movedBarsInDrag.has(bar)) {
      const oldStart = bar[barStart.value];
      const oldEnd = bar[barEnd.value];
      const oldRow = bar.device;

      movedBarsInDrag.set(bar, { oldStart, oldEnd, oldRow });
    }
  };

  /**
   * Resets position of all bars moved by a drag event.
   */
  const snapBackAllMovedBarsIfNeeded = () => {
    if (!pushOnOverlap.value && noOverlap.value) {
      let isAnyOverlap = false;

      movedBarsInDrag.forEach((_, bar) => {
        const { overlapBar } = getOverlapBarAndType(bar);

        if (overlapBar != null) {
          isAnyOverlap = true;
        }
      });
      if (isAnyOverlap) {
        movedBarsInDrag.forEach(({ oldStart, oldEnd, oldRow }, bar) => {
          const oldRowElement = document.getElementById(oldRow);
          const barElement = document.getElementById(bar.ganttBarConfig.id);
          const rowToRollback = barElement?.closest(".gantt-row");

          if (oldRowElement && rowToRollback && barElement && oldRowElement.id !== rowToRollback.id) {
            const { move } = useBarDrag(ref(bar), ganttChartPropsRefs, onDrag, onEndDrag);
            move(oldRowElement, rowToRollback, barElement);
          }

          bar[barStart.value] = oldStart;
          bar[barEnd.value] = oldEnd;
          bar.device = oldRow;
          bar.gapMs = differenceDayjs(bar[barStart.value], bar[barEnd.value]);
        });
      }
    }
  };

  /**
   * Starts dragging a bar in response to a drag event. Emits a BarEvent when initiated.
   * @param {GanttBarObject} bar the bar to drag.
   * @param {MouseEvent} e The event that initiated the drag.
   */
  const initDragOfBar = (bar: GanttBarObject, e: MouseEvent) => {
    const { initDrag } = useBarDrag(ref(bar), ganttChartPropsRefs, onDrag, onEndDrag);
    const ev = {
      ...e,
      type: "dragstart",
    };

    emitBarEvent(ev, bar); // TODO: check the order of the emit event instruction

    initDrag(e);
    addBarToMovedBars(bar);
  };

  /**
   * Starts dragging a bar bundle in response to a drag event. Emits a BarEvent when initiated.
   * @param {GanttBarObject} mainBar the main bar to drag, pertaining to a bundle.
   * @param {MouseEvent} e The event that initiated the drag.
   */
  const initDragOfBundle = (mainBar: GanttBarObject, e: MouseEvent) => {
    const bundle = mainBar.ganttBarConfig.bundle;

    if (bundle != null) {
      allRowsInChart.value.forEach((row) => {
        row.forEach((bar) => {
          if (bar.ganttBarConfig.bundle === bundle && bar.device === mainBar.device) {
            const dragEndHandler = bar === mainBar ? onEndDrag : () => null;
            const { initDrag } = useBarDrag(ref(bar), ganttChartPropsRefs, onDrag, dragEndHandler);

            initDrag(e);
            addBarToMovedBars(bar);
          }
        });
      });

      const ev = {
        ...e,
        type: "dragstart",
      };

      emitBarEvent(ev, mainBar);
    }
  };

  return {
    initDragOfBar,
    initDragOfBundle,
  };
}

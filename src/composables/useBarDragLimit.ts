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

import { ComputedRef } from "vue";

import { GanttBarObject, GanttChartPropsRefs } from "@/models/models";

/**
 * Returns a function to handle dragging limits of a bar.
 * @param {ComputedRef<GanttBarObject[][]>} allRowsInChart List of the bars in all rows of the Gantt chart.
 * @param {GanttChartPropsRefs} ganttChartPropsRefs The properties of the GANTT chart.
 * @return setDragLimitsOfGanttBar A function that computes the limits for dragging a bar.
 */
export default function useBarDragLimit(
  allRowsInChart: ComputedRef<GanttBarObject[][]>,
  ganttChartPropsRefs: GanttChartPropsRefs
) {
  const { pushOnOverlap } = ganttChartPropsRefs;

  /**
   * Returns all the bars that pertain to a bundle.
   * @param {string} bundle The identifier of the bundle.
   * @return A list of the bars pertaining to the bundle, as a list of GanttBarObject.
   */
  const getBarsFromBundle = (bundle?: string): GanttBarObject[] => {
    const res: GanttBarObject[] = [];

    if (bundle != null) {
      allRowsInChart.value.forEach((row) => {
        row.forEach((bar) => {
          if (bar.ganttBarConfig.bundle === bundle) {
            res.push(bar);
          }
        });
      });
    }

    return res;
  };

  /**
   * Get the previous or following bar.
   * @param {GanttBarObject} bar The bar to get the previous or following bar of.
   * @param {"left" | "right"} side Whether the previous or following bar must be got.
   * @return
   */
  const getNextGanttBar = (bar: GanttBarObject, side: "left" | "right"): GanttBarObject | null => {
    const barElem = document.getElementById(bar.ganttBarConfig.id) as HTMLElement;
    const allBarsInRow = allRowsInChart.value.find((row) => row.includes(bar)) || [];
    let allBarsLeftOrRight: GanttBarObject[];

    if (side === "left") {
      allBarsLeftOrRight = allBarsInRow.filter((otherBar) => {
        const otherBarElem = document.getElementById(otherBar.ganttBarConfig.id) as HTMLElement;

        return (
          otherBarElem &&
          otherBarElem.offsetLeft < barElem.offsetLeft &&
          otherBar.ganttBarConfig.pushOnOverlap !== false
        );
      });
    } else {
      allBarsLeftOrRight = allBarsInRow.filter((otherBar) => {
        const otherBarElem = document.getElementById(otherBar.ganttBarConfig.id) as HTMLElement;

        return (
          otherBarElem &&
          otherBarElem.offsetLeft > barElem.offsetLeft &&
          otherBar.ganttBarConfig.pushOnOverlap !== false
        );
      });
    }

    if (allBarsLeftOrRight.length > 0) {
      return allBarsLeftOrRight.reduce((bar1, bar2) => {
        const bar1Elem = document.getElementById(bar1.ganttBarConfig.id) as HTMLElement;
        const bar2Elem = document.getElementById(bar2.ganttBarConfig.id) as HTMLElement;
        const bar1Dist = Math.abs(bar1Elem.offsetLeft - barElem.offsetLeft);
        const bar2Dist = Math.abs(bar2Elem.offsetLeft - barElem.offsetLeft);
        return bar1Dist < bar2Dist ? bar1 : bar2;
      }, allBarsLeftOrRight[0]);
    } else {
      return null;
    }
  };

  /**
   * The gap distance to the next immobile bar.
   * @param {GanttBarObject} bar The bar to compute the gap from.
   * @param {number} gapDistanceSoFar The offset distance to start computing the gap from.
   * @param {"left" | "right"} side The side to compute the gap from.
   */
  const countGapDistanceToNextImmobileBar = (bar: GanttBarObject, gapDistanceSoFar = 0, side: "left" | "right") => {
    const bundleBarsAndGapDist = bar.ganttBarConfig.bundle ? [{ bar, gapDistance: gapDistanceSoFar }] : [];
    let currentBar = bar;
    let nextBar = getNextGanttBar(currentBar, side);

    if (side === "left") {
      while (nextBar) {
        const currentBarElem = document.getElementById(currentBar.ganttBarConfig.id) as HTMLElement;
        const nextBarElem = document.getElementById(nextBar.ganttBarConfig.id) as HTMLElement;
        const nextBarOffsetRight = nextBarElem.offsetLeft + nextBarElem.offsetWidth;

        gapDistanceSoFar += currentBarElem.offsetLeft - nextBarOffsetRight;

        if (nextBar.ganttBarConfig.immobile) {
          return { gapDistanceSoFar, bundleBarsAndGapDist };
        } else if (nextBar.ganttBarConfig.bundle) {
          bundleBarsAndGapDist.push({ bar: nextBar, gapDistance: gapDistanceSoFar });
        }

        currentBar = nextBar;
        nextBar = getNextGanttBar(nextBar, "left");
      }
    }

    if (side === "right") {
      while (nextBar) {
        const currentBarElem = document.getElementById(currentBar.ganttBarConfig.id) as HTMLElement;
        const nextBarElem = document.getElementById(nextBar.ganttBarConfig.id) as HTMLElement;
        const currentBarOffsetRight = currentBarElem.offsetLeft + currentBarElem.offsetWidth;

        gapDistanceSoFar += nextBarElem.offsetLeft - currentBarOffsetRight;

        if (nextBar.ganttBarConfig.immobile) {
          return { gapDistanceSoFar, bundleBarsAndGapDist };
        } else if (nextBar.ganttBarConfig.bundle) {
          bundleBarsAndGapDist.push({ bar: nextBar, gapDistance: gapDistanceSoFar });
        }

        currentBar = nextBar;
        nextBar = getNextGanttBar(nextBar, "right");
      }
    }

    return { gapDistanceSoFar: null, bundleBarsAndGapDist };
  };

  /**
   * Computes the limits for dragging a bar.
   * @param {GanttBarObject} bar the bar to compute the dragging limits for.
   */
  const setDragLimitsOfGanttBar = (bar: GanttBarObject) => {
    if (!pushOnOverlap || bar.ganttBarConfig.pushOnOverlap === false) {
      return;
    }

    for (const sideValue of ["left", "right"]) {
      const side = sideValue as "left" | "right";
      const { gapDistanceSoFar, bundleBarsAndGapDist } = countGapDistanceToNextImmobileBar(bar, 0, side);
      let totalGapDistance = gapDistanceSoFar;
      const bundleBarsOnPath = bundleBarsAndGapDist;

      if (bundleBarsOnPath) {
        for (let i = 0; i < bundleBarsOnPath.length; i++) {
          const barFromBundle = bundleBarsOnPath[i].bar;
          const gapDist = bundleBarsOnPath[i].gapDistance;
          const otherBarsFromBundle = getBarsFromBundle(barFromBundle.ganttBarConfig.bundle).filter(
            (otherBar) => otherBar !== barFromBundle
          );

          otherBarsFromBundle.forEach((otherBar) => {
            const nextGapDistanceAndBars = countGapDistanceToNextImmobileBar(otherBar, gapDist, side);
            const newGapDistance = nextGapDistanceAndBars.gapDistanceSoFar;
            const newBundleBars = nextGapDistanceAndBars.bundleBarsAndGapDist;

            if (newGapDistance != null && (!totalGapDistance || newGapDistance < totalGapDistance)) {
              totalGapDistance = newGapDistance;
            }

            newBundleBars.forEach((newBundleBar) => {
              if (!bundleBarsOnPath.find((barAndGap) => barAndGap.bar === newBundleBar.bar)) {
                bundleBarsOnPath.push(newBundleBar);
              }
            });
          });
        }

        const barElem = document.getElementById(bar.ganttBarConfig.id) as HTMLElement;
        if (totalGapDistance != null && side === "left") {
          bar.ganttBarConfig.dragLimitLeft = barElem.offsetLeft - totalGapDistance;
        } else if (totalGapDistance != null && side === "right") {
          bar.ganttBarConfig.dragLimitRight = barElem.offsetLeft + barElem.offsetWidth + totalGapDistance;
        }
      }
    }

    // All bars from the bundle of the clicked bar need to have the same drag limit.
    const barsFromBundleOfClickedBar = getBarsFromBundle(bar.ganttBarConfig.bundle);
    barsFromBundleOfClickedBar.forEach((barFromBundle) => {
      barFromBundle.ganttBarConfig.dragLimitLeft = bar.ganttBarConfig.dragLimitLeft;
      barFromBundle.ganttBarConfig.dragLimitRight = bar.ganttBarConfig.dragLimitRight;
    });
  };

  return {
    setDragLimitsOfGanttBar,
  };
}

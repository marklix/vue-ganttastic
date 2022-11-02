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

import { computed } from "vue";

import useDayjsHelper from "./useDayjsHelper";

import { GanttChartPropsRefs } from "@/models/models";

import { ManipulateType } from "dayjs";

export default function useTimeAxisUnits(ganttChartPropsRefs: GanttChartPropsRefs) {
  const { precision } = ganttChartPropsRefs;
  const { chartStartDayjs, chartEndDayjs } = useDayjsHelper(ganttChartPropsRefs);

  /**
   * Computes the upper precision (day, month, year) of the chart from the precision (hour, day, month).
   */
  const upperPrecision = computed(() => {
    switch (precision?.value) {
      case "hour":
        return "day";
      case "day":
        return "month";
      case "month":
        return "year";
      default:
        throw new Error("Precision prop incorrect. Must be one of the following: 'hour', 'day', 'month'");
    }
  });

  /**
   * Returns the time display formats.
   */
  const displayFormats = {
    hour: "HH:mm",
    date: "DD-MM-YYYY",
    day: "DD-MM-YYYY",
    month: "MMMM YYYY",
    year: "YYYY",
  }; // TODO: modify for i18n.

  /**
   * A function that setups the units for the time axis.
   */
  const timeAxisUnits = computed(() => {
    // Setup unit grid
    const upperUnits: { label: string; value?: string; width?: string }[] = [];
    const lowerUnits: { label: string; value?: string; width?: string }[] = [];

    // Setup generic units
    const upperUnit = upperPrecision.value === "day" ? "date" : upperPrecision.value;
    const lowerUnit = precision.value;

    // Setup chart start, end and span.
    let currentUnit = chartStartDayjs.value.startOf(lowerUnit);
    const totalMinutes = chartEndDayjs.value.diff(chartStartDayjs.value, "minutes", true);
    let upperUnitMinutesCount = 0;
    let currentUpperUnitVal = currentUnit[upperUnit]();

    // For the range of the chart...
    while (currentUnit.isBefore(chartEndDayjs.value) || currentUnit.isSame(chartEndDayjs.value)) {
      // ...if the upper unit has been changed...
      if (currentUnit[upperUnit]() !== currentUpperUnitVal) {
        let width = "0%";

        if (upperUnits.length === 0) {
          // ...if the upperUnits list is empty (beginning of the chart)
          width = `${
            (currentUnit.startOf(upperUnit).diff(chartStartDayjs.value, "minutes", true) / totalMinutes) * 100
          }%`;
        } else if (currentUnit.isSameOrAfter(chartEndDayjs.value)) {
          // ...if the current unit is at the end of the chart...
          width = `${
            (chartEndDayjs.value.diff(
              currentUnit.subtract(1, upperUnit as ManipulateType).startOf(upperUnit),
              "minutes",
              true
            ) /
              totalMinutes) *
            100
          }%`;
        } else {
          // ... in all other cases (i.e., change of unit in the middle of the chart)...
          const end = currentUnit.startOf(upperUnit);
          const start = currentUnit.subtract(1, upperUnit as ManipulateType).startOf(upperUnit);
          width = `${(end.diff(start, "minutes", true) / totalMinutes) * 100}%`;
        }

        // ... add the new upper unit to the list.
        upperUnits.push({
          label: currentUnit.subtract(1, upperUnit as ManipulateType).format(displayFormats[upperUnit]),
          value: String(currentUpperUnitVal),
          width,
        });

        upperUnitMinutesCount = 0;
        currentUpperUnitVal = currentUnit[upperUnit]();
      }

      // Create and push lower unit
      let width = "0%";

      if (lowerUnits.length === 0) {
        // If the lowerUnits list is empty (beginning of the chart)
        width = `${(currentUnit.endOf(lowerUnit).diff(chartStartDayjs.value, "minutes", true) / totalMinutes) * 100}%`;
      } else if (currentUnit.add(1, lowerUnit).isSameOrAfter(chartEndDayjs.value)) {
        // If the current unit is at the end of the chart
        width = `${(chartEndDayjs.value.diff(currentUnit.startOf(lowerUnit), "minutes", true) / totalMinutes) * 100}%`;
      } else {
        // In all other cases (at the middle of the chart)
        width = `${
          (currentUnit.endOf(lowerUnit).diff(currentUnit.startOf(lowerUnit), "minutes", true) / totalMinutes) * 100
        }%`;
      }

      lowerUnits.push({
        label: currentUnit.format(displayFormats[lowerUnit]),
        value: String(currentUnit[lowerUnit === "day" ? "date" : lowerUnit]()),
        width,
      });

      const prevUpperUnitUnit = currentUnit;

      currentUnit = currentUnit.add(1, lowerUnit);

      if (currentUnit.isBefore(chartEndDayjs.value) || currentUnit.isSame(chartEndDayjs.value)) {
        upperUnitMinutesCount += currentUnit.diff(prevUpperUnitUnit, "minutes", true);
      }
    }

    // For the very last upper unit
    const lastUpperUnit = chartEndDayjs.value.isSame(chartEndDayjs.value.startOf(upperUnit))
      ? chartEndDayjs.value[upperUnit]() - 1
      : chartEndDayjs.value[upperUnit]();
    const isLastUnitAdded = upperUnits.some((un) => un.value === String(lastUpperUnit));

    if (!isLastUnitAdded) {
      upperUnitMinutesCount += chartEndDayjs.value.diff(currentUnit.subtract(1, lowerUnit), "minutes", true);
      upperUnits.push({
        label: chartEndDayjs.value.format(displayFormats[upperUnit]),
        value: String(currentUpperUnitVal),
        width: `${(upperUnitMinutesCount / totalMinutes) * 100}%`,
      });
    }

    return { upperUnits, lowerUnits };
  });

  return {
    timeAxisUnits,
  };
}

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

import dayjs, { ManipulateType } from "dayjs";

import { GanttBarObject, GanttChartPropsRefs } from "@/models/models";

/**
 * Return time properties and functions related to a particular GANTT chart.
 * @param {GanttChartPropsRefs} ganttChartPropsRefs The properties of the GANTT chart.
 * @return chartStartDayjs The start date of the chart as a Dayjs instance.
 * @return chartEndDayjs The end date of the chart as a Dayjs instance.
 * @return toDayjs A function that fetches the start or end time of the passed string or GanttBarObject instance.
 * @return addGapDayjs A function that adds a specific duration to the passed start time and returns the result as a Dayjs
 *   instance.
 * @return differenceDayjs A function that computes the difference between a start time and an end time and returns the
 *   result as a Dayjs instance.
 */
export default function useBarDrag(ganttChartPropsRefs: GanttChartPropsRefs) {
  const { chartStart, chartEnd, barStart, barEnd, dateFormat } = ganttChartPropsRefs;

  /**
   * A function that fetches the start or end time of the passed string or GanttBarObject instance.
   * @param {string|GanttBarObject} value The time as a string or the GanttBarObject instance to get the time from.
   * @param {"start"|"end"} startOrEnd When a GanttBarObject instance is passed for value, whether the start or end time
   *   must be picked.
   * @return The (start or end) time, as a Dayjs instance.
   */
  const toDayjs = (value: string | GanttBarObject, startOrEnd?: "start" | "end"): dayjs.Dayjs => {
    if (typeof value === "string") {
      return dayjs(value, dateFormat.value, true);
    }

    if (startOrEnd == null) {
      throw Error("Planner - toDayjs: passed a GanttBarObject as value, but did not provide start|end parameter.");
    }

    const property = startOrEnd === "start" ? value[barStart.value] : value[barEnd.value];

    return dayjs(property, dateFormat.value, true);
  };

  /**
   * A function that adds a specific duration to the passed start time and returns the result as a Dayjs instance.
   * @param {string} startTime The start time.
   * @param {number} gap The duration to add.
   * @param {ManipulateType} unit The unit used to express the gap.
   * @return The addition of start time and gap, as a Dayjs instance.
   */
  const addGapDayjs = (startTime: string, gap: number, unit: ManipulateType): string => {
    return dayjs(startTime).add(gap, unit).format(dateFormat.value);
  };

  /**
   * A function that computes the difference between a start time and an end time and returns the result as a Dayjs
   * instance.
   * @param {string} startTime The start time.
   * @param {string} endTime The end time.
   * @return The difference between start time and end time, as a Dayjs instance.
   */
  const differenceDayjs = (startTime: string, endTime: string): number => {
    return dayjs(endTime).diff(dayjs(startTime));
  };

  const chartStartDayjs = computed(() => toDayjs(chartStart.value));
  const chartEndDayjs = computed(() => toDayjs(chartEnd.value));

  return {
    chartStartDayjs,
    chartEndDayjs,
    toDayjs,
    addGapDayjs,
    differenceDayjs,
  };
}

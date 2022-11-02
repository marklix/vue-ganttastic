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

// TODO: check that "minutes" is the right unit for time/space conversion.

/**
 Return functions related to position/time conversion.
 @param {GanttChartPropsRefs} ganttChartPropsRefs The properties of the GANTT chart.
 @return mapTimeToPosition A function that converts a time to a position in the Gantt chart.
 @return mapPositionToTime A function that converts a position in the Gantt chart to a time.
 */
export default function useTimePositionMapping(ganttChartPropsRefs: GanttChartPropsRefs) {
  const { chartStart, width, dateFormat, ganttChart } = ganttChartPropsRefs;
  const { chartStartDayjs, chartEndDayjs, toDayjs } = useDayjsHelper(ganttChartPropsRefs);

  /**
   * Returns the total number of minutes visible in the Gantt chart.
   */
  const totalNumOfMinutes = computed(() => {
    return chartEndDayjs.value.diff(chartStartDayjs.value, "minutes");
  });

  // Checks that injection has been successfull.
  if (!chartStart || !width) {
    throw new Error("useTimePositionMapping: Provide/Inject of values from GanttChart failed!");
  }

  /**
   * Converts a time to a position in the Gantt chart.
   * @param time The time to convert to position.
   * @return The position, as an XPos (in pixels).
   */
  const mapTimeToPosition = (time: string) => {
    const width = ganttChart.value?.getBoundingClientRect().width || 0;
    const diffFromStart = toDayjs(time).diff(chartStartDayjs.value, "minutes", true);

    return Math.ceil((diffFromStart / totalNumOfMinutes.value) * width);
  };

  /**
   * Converts a position in the Gantt chart to a time.
   * @param xPos The position (in pixels).
   * @return The corresponding time.
   */
  const mapPositionToTime = (xPos: number) => {
    const width = ganttChart.value?.getBoundingClientRect().width || 0;
    const diffFromStart = (xPos / width) * totalNumOfMinutes.value;

    return chartStartDayjs.value.add(diffFromStart, "minutes").format(dateFormat.value);
  };

  return {
    mapTimeToPosition,
    mapPositionToTime,
  };
}

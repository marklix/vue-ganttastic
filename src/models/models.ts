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

import { Ref } from "vue";

export type GanttRowObject = {
  id: string;
  device: { id: string; name: string; serial: string };
  bars: GanttBarObject[];
};

export type GanttBarObject = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  ganttBarConfig: {
    id: string;
    label?: string;

    bundle?: string;
    dragLimitLeft?: number;
    dragLimitRight?: number;
    hasHandles?: boolean;
    immobile?: boolean;
    enableOverlap?: boolean;
    pushOnOverlap?: boolean;

    style?: CSSStyleSheet | Record<string, string>;
  };
};

export type GanttChartPropsRefs = {
  barEnd: Ref<string>;
  barStart: Ref<string>;
  chartEnd: Ref<string>;
  chartStart: Ref<string>;
  dateFormat: Ref<string>;
  ganttChart: Ref<HTMLElement | null>;
  grid: Ref<boolean>;
  hideTimeAxis: Ref<boolean>;
  minimumGap: Ref<number>;
  noOverlap: Ref<boolean>;
  precision: Ref<"hour" | "day" | "month">;
  pushOnOverlap: Ref<boolean>;
  rowHeight: Ref<number>;
  width: Ref<string>;
};

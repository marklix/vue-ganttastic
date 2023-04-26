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

// Import dayjs and its plugins
import dayjs from "dayjs";

import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";

import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

// Create plugin

import { Plugin } from "vue";

import GanttChart from "./components/GanttChart.vue";
import GanttRow from "./components/GanttRow.vue";
import KanbanList from "./components/KanbanList.vue";
import KanbanItem from "./components/KanbanItem.vue";

const planner: Plugin = {
  install(app) {
    app.component("GanttChart", GanttChart);
    app.component("GanttRow", GanttRow);
    app.component("KanbanList", KanbanList);
    app.component("KanbanItem", KanbanItem);
  },
};

export default planner;

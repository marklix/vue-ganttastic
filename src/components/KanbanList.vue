<!--
  - MARKLIX PLANNER
  - Copyright (c) 2022, Marklix SAS.
  -
  - Tous droits réservés pour tous pays. L’ensemble du contenu de ce fichier est confidentiel et demeure la propriété
  - exclusive de son auteur. Tous les droits sont réservés pour tous pays, notamment les droits de consultation, de
  - reproduction, de représentation, d’adaptation, de modification, de traduction, de distribution, de
  - commercialisation, d’usage, d’exploitation et de cession dudit fichier. Les traductions éventuelles de cette notice
  - sont uniquement données à titre indicatif.
  -
  - All rights reserved for all countries. All information contained herein is confidential and remain the exclusive
  - property of its author. All rights are reserved for all countries, including the rights to read, copy, depict,
  - adapt, modify, translate, distribute, sell, use (including commercially) and concede this file. Only the French
  - version of this notice is legally binding (see above).
  -->

<template>
  <ul :id="id" class="kanban-list-container">
    <slot></slot>
  </ul>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import Sortable, { GroupOptions, SortableEvent } from "sortablejs";

export default defineComponent({
  name: "KanbanList",
  props: {
    id: { type: String, required: true },
    group: { type: String, required: true },
    acceptFrom: { type: Array, required: false, default: () => [] },
  },
  emits: ["start", "end", "add", "update", "sort", "change"],
  setup(props, { emit }) {
    /**
     * Sortable list configuration object
     */
    const options: Sortable.Options = {
      group: {
        name: props.group,
        put: (to: Sortable, from: Sortable, dragEl: HTMLElement, event: SortableEvent) =>
          checkLevel(to, from, dragEl, event),
      } as Sortable.GroupOptions,
      onStart: (evt: SortableEvent) => eventCallback(evt),
      onEnd: (evt: SortableEvent) => eventCallback(evt),
      onAdd: (evt: SortableEvent) => eventCallback(evt),
      onUpdate: (evt: SortableEvent) => eventCallback(evt),
      onSort: (evt: SortableEvent) => eventCallback(evt),
      onChange: (evt: SortableEvent) => eventCallback(evt),
      multiDrag: true,
    };

    const checkLevel = (to: Sortable, from: Sortable, dragEl: HTMLElement, event: SortableEvent) => {
      if (
        (from.options.group as GroupOptions).name.split(":")[0] !==
        (to.options.group as GroupOptions).name.split(":")[0]
      ) {
        return false;
      }

      return props.acceptFrom.includes((from.options.group as GroupOptions).name.split(":")[1]);
    };

    /**
     * Event emit callback
     */
    const eventCallback = (event: SortableEvent) => {
      emit(event.type as "start" | "end" | "add" | "update" | "sort" | "change", event);
    };

    onMounted(() => {
      const sortableElement = document.getElementById(props.id);
      if (sortableElement) {
        Sortable.create(sortableElement, options);
      }
    });
  },
});
</script>

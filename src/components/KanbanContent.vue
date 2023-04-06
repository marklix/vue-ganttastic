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
  <KanbanList :id="data.id" :group="data.group">
    <KanbanItem
      v-for="item in data.children"
      :key="item.id"
      :id="item.id"
      :has-children="item.hasChildren"
      :group="item.childGroup"
      style="display: flex; flex-direction: column"
      ><template v-slot:childList>
        <KanbanList :id="'list-' + item.id" :group="item.childGroup" class="sub-list">
          <KanbanItem v-for="subItem in item.children" :key="subItem.id" :id="subItem.id" :has-children="false" />
        </KanbanList>
      </template>
    </KanbanItem>
  </KanbanList>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { List } from "../models/modelsKanban";
import KanbanItem from "./KanbanItem.vue";
import KanbanList from "./KanbanList.vue";

export default defineComponent({
  name: "KanbanContent",
  components: { KanbanItem, KanbanList },
  props: {
    data: { type: Object as () => List, required: true },
  },
});
</script>

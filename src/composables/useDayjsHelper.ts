import { GanttBarObject, GGanttChartPropsRefs } from "@/models/models";
import dayjs, { ManipulateType } from "dayjs";
import { computed } from "vue";

export default function useBarDrag(gGanttChartPropsRefs: GGanttChartPropsRefs) {
  const { chartStart, chartEnd, barStart, barEnd, dateFormat } = gGanttChartPropsRefs;

  const chartStartDayjs = computed(() => toDayjs(chartStart.value));
  const chartEndDayjs = computed(() => toDayjs(chartEnd.value));

  const toDayjs = (value: string | GanttBarObject, startOrEnd?: "start" | "end") => {
    if (typeof value === "string") {
      return dayjs(value, dateFormat.value, true);
    }
    if (startOrEnd == null) {
      throw Error(
        "VueGanttastic - toDayjs: passed a GanttBarObject as value, but did not provide start|end parameter."
      );
    }
    const property = startOrEnd === "start" ? value[barStart.value] : value[barEnd.value];
    return dayjs(property, dateFormat.value, true);
  };

  const addGapDayjs = (startTime: string, gap: number, unit: ManipulateType): string => {
    return dayjs(startTime).add(gap, unit).format(dateFormat.value);
  };

  const differenceDayjs = (startTime: string, endTime: string): number => {
    return dayjs(endTime).diff(dayjs(startTime));
  };

  return {
    chartStartDayjs,
    chartEndDayjs,
    toDayjs,
    addGapDayjs,
    differenceDayjs,
  };
}

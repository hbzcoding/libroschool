import { api } from "@/lib/api";
import {
  Report,
  CreateReportData,
} from "@/types/report";

export const reportsService = {
  async create(data: CreateReportData): Promise<Report> {
    const response = await api.post<{ data: Report }>("/reports", data);
    return response.data;
  },
};

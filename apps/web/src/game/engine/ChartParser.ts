import { ChartFileSchema } from "@rhythm-battle/shared";
import type { ChartFile } from "../types/chart";

export class ChartParser {
  static parse(raw: unknown): ChartFile {
    const parsed = ChartFileSchema.safeParse(raw);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
        .join("; ");
      throw new Error(`Invalid chart JSON: ${issues}`);
    }

    const sortedNotes = [...parsed.data.notes].sort((a, b) => {
      if (a.time !== b.time) {
        return a.time - b.time;
      }
      return a.lane - b.lane;
    });

    return {
      ...parsed.data,
      notes: sortedNotes
    };
  }

  static parseList(rawList: readonly unknown[]): ChartFile[] {
    return rawList.map((item) => ChartParser.parse(item));
  }
}


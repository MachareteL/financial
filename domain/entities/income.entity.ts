export class Income {
  constructor(
    public id: string,
    public amount: number,
    public description: string,
    public type: "recurring" | "one_time",
    public date: Date,
    public familyId: string,
    public userId: string,
    public frequency?: "monthly" | "weekly" | "yearly",
    public userName?: string | null,
  ) {}
}

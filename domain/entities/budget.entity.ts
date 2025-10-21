export class Budget {
  constructor(
    public id: string,
    public month: number,
    public year: number,
    public totalIncome: number,
    public necessidadesBudget: number,
    public desejosBudget: number,
    public poupancaBudget: number,
    public familyId: string,
  ) {}
}

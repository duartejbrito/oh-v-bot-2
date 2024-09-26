export abstract class Schedule {
  static rule: string[];
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  static callback(fireDate: Date): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

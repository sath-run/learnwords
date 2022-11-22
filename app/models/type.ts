
export interface TaskModel {
  id: number,
  videoUrl: string,
  imageUrl: string,
  question: string,
  example: string,
  initial: string[],
  alternative: string[]
}
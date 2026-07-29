import { Circle } from "./circle";
import { Rect } from "./rect";
import { Shape } from "./shape";

export function render(shapes: Shape[]): string[] {
  return shapes.map((s) => s.describe());
}

const scene = [new Circle(2), new Rect(3, 4)];
render(scene).forEach((line) => console.log(line));

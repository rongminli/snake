import { CreatePathAnalyst, Path, Point } from "./pathAnalysis"


class CellPoint {
    constructor(public x: number, public y: number) { }
    getId() {
        return this.x + ":" + this.y
    }
}

const target = new CellPoint(5, 5)

const analyst = CreatePathAnalyst({
    getAddressablePoints(path: Path): Point[] {
        const pathPoint = path.point as CellPoint
        const { x, y } = pathPoint
        const points = []

        x > 0 && points.push(new CellPoint(x - 1, y))
        x < 5 && points.push(new CellPoint(x + 1, y))

        y > 0 && points.push(new CellPoint(x, y - 1))
        y < 5 && points.push(new CellPoint(x, y + 1))

        return points
    },
    isTarget(path: Path): boolean {
        return path.point.getId() === target.getId()
    }
})

export function test() {
   const path =  analyst({
        parent: null,
        point: new CellPoint(0,0),
        children: []
    })

    console.log(path)
}


import { Snake } from "./snake"
import { Ground } from "../Ground"
import { CellPoint, createSnakePathAnalyst } from "./snakePathAnalysis"
import { Cell } from "../Cell"

type Path = Cell[]

export class SmartSnake extends Snake {
    private pathAnalyst
    constructor(ground: Ground) {
        super(ground)
        this.pathAnalyst = createSnakePathAnalyst(this.ground)
    }
    moveOnPath(path: Path, i: number) {
        const cell = path[i] as Cell
        if (cell) {
            setTimeout(() => {
                if (i === path.length - 1) {
                    this.eat()
                } else {
                    this.body.moveTo(cell)
                }
                this.moveOnPath(path, ++i)
            }, 5)
        } else {
            setTimeout(this.auto.bind(this), 0)
        }

    }
    auto() {
        let path = this.pathAnalyst()
        if (path) {
            const pathCells = []
            while (path) {
                const point = path.point as CellPoint
                const cell = this.ground.cells[point.y][point.x]
                pathCells.unshift(cell)
                path = path.parent
            }
            this.moveOnPath(pathCells, 0)
        }

    }
}

export function CreateSmartSnake(ground: Ground) {
    return new SmartSnake(ground)
}
import { Snake } from "./snake"
import { ground , Ground} from "../Ground"
import { CellPoint, createSnakePathAnalyst } from "./snakePathAnalysis"
import { Cell } from "../Cell"
import searchPath4Snake from "@/js/searchPath4Snake"

type Path = Cell[]

export function CreateSmartSnake(ground: Ground) {
    return new SmartSnake(ground)
}

export class SmartSnake extends Snake {
    private pathAnalyst
    constructor(ground: Ground) {
        super(ground)
        this.pathAnalyst = searchPath4Snake(ground)
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
            }, 50)
        } else {
            setTimeout(this.auto.bind(this), 0)
        }

    }
    auto() {
        let path = this.pathAnalyst()
        if (path) {
            const pathCells = []
            while (path.parent) {
                const point = path.node as CellPoint
                const cell = this.ground.cells[point.y][point.x]
                pathCells.unshift(cell)
                path = path.parent
            }
            this.moveOnPath(pathCells, 0)
        }

    }
}


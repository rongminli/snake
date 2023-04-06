import { Snake } from "./snake"
import { ground, Ground } from "../Ground"
import { CellPoint, createSnakePathAnalyst } from "./snakePathAnalysis"
import { Cell } from "../Cell"
import searchPath4Snake from "@/js/searchPath4Snake"
import { message } from "ant-design-vue"

const cacheBody: Cell[][] = []
const cacheFood: Cell[] = []

export function last() {
    const lastBody = cacheBody.pop()
    const lastFood = cacheFood.pop()
    if (!lastBody || !lastFood) {
        return
    }
    ground.food.cell?.asSpace()
    ground.snake.body.cells.forEach(cell => cell.asSpace())
    lastBody?.forEach(cell => cell.asSnakeBody())
    lastBody[lastBody.length - 1].asTail()
    lastBody[0].asHead()
    lastFood.asFood()
    ground.snake.body.cells = lastBody
    ground.food.cell = lastFood
}

function cache() {
    if (ground.food.cell) {
        cacheBody.push(ground.snake.body.cells.slice())
        cacheFood.push(ground.food.cell)
    }
    if (ground.snake.body.cells.length === 90) {
        localStorage.setItem('body', JSON.stringify(ground.snake.body.cells))
        localStorage.setItem('food', JSON.stringify(ground.food.cell))
    }
}
function loadCache() {
    const body = localStorage.getItem('body')
    const food = localStorage.getItem('food')
    if (body && food) {
        cacheBody.push(JSON.parse(body) as Cell[])
        cacheFood.push(JSON.parse(food) as Cell)
    }
}
export function CreateSmartSnake(ground: Ground) {
    return new SmartSnake(ground)
}

export class SmartSnake extends Snake {
    private pathAnalyst
    constructor(ground: Ground) {
        super(ground)
        this.pathAnalyst = searchPath4Snake(ground)

    }
    moveOnPath(path: Cell[]) {
        let i = 0
        const timer = setInterval(() => {
            try {
                this.step(path[i])
            } catch (e) {
                console.error(e)
                clearInterval(timer)
                return
            }
            i++
            if (i >= path.length) {
                clearInterval(timer)
                setTimeout(() => this.auto(), 0)
            }
        }, 5)
    }
    auto() {
        if (this.body.cells.length === 100) {
            message.success('VETOER')
            return
        }
        let path = this.pathAnalyst()
        if (path) {
            cache()
            const pathCells = []
            while (path.parent) {
                const point = path.node as CellPoint
                const cell = this.ground.cells[point.y][point.x]
                pathCells.unshift(cell)
                path = path.parent
            }
            this.moveOnPath(pathCells)
        } else {
            console.log('path not founded')
        }

    }
}


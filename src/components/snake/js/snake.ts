import { DeepReadonly, reactive, UnwrapNestedRefs, readonly, toRaw, getCurrentInstance } from "vue"
import { Cell, Position } from "../Cell"
import { Ground } from "../Ground"
import { Food } from "./food"

enum Direction {
    UP = 1,
    DOWN = 2,
    LEFT = 3,
    RIGHT = 4
}

type SnakeBodyState = {
    bodyCells: Cell[]
}

interface SnakeBody {
    restart(): void
    state: UnwrapNestedRefs<SnakeBodyState>,
    moveTo(cell: Cell): void,
    getHead(): Cell,
    eat(food: Food): void,
    reset(bodyCells: Cell[]): void
}

function CreateSnakeBody(ground: Ground): SnakeBody {
    const state = reactive<SnakeBodyState>({
        bodyCells: []
    })

    const unshift = (cell: Cell) => {
        cell.asSnakeBody()
        state.bodyCells.unshift(cell)
    }

    const pop = () => {
        const snakeTail = state.bodyCells.pop()
        snakeTail?.asSpace()
    }

    const push = (cell: Cell) => {
        cell.asSnakeBody()
        state.bodyCells.push(cell)
    }

    function init() {
        unshift(ground.cells[0][0])
        unshift(ground.cells[0][1])
    }



    init()

    function clear() {
        state.bodyCells.forEach(cell => cell.asSpace())
        state.bodyCells.length = 0
    }

    function load(bodyCells: Cell[]) {
        bodyCells.forEach(cell => push(cell))
    }

    return {
        state: state,
        moveTo(to: Cell) {
            unshift(to)
            pop()
        },
        getHead: () => state.bodyCells[0],
        eat(food) {
            const foodCell = food.getCurrentCell()
            if (foodCell != null) {
                foodCell.asSnakeBody()
                unshift(foodCell)
            }
        },
        restart() {
            clear()
            init()
        },
        reset(bodyCells: Cell[]) {
            clear()
            load(bodyCells)
        }
    }
}

export type SnakeState = {
    speed: number,
    direction: Direction,
    isActive: boolean
}

export class Snake {
    private moveTimer!: number
    public state: UnwrapNestedRefs<SnakeState>
    public body: SnakeBody

    constructor(public ground: Ground) {
        this.state = reactive<SnakeState>({
            speed: 250,
            direction: Direction.RIGHT,
            isActive: false
        })
        this.body = CreateSnakeBody(ground)

        addEventListener('keydown', this.keydownHandler)
    }

    keydownHandler(event: KeyboardEvent) {
        const snakeState = this.state
        switch (event.code) {
            case 'ArrowUp':
                if (snakeState.direction === Direction.DOWN) break
                snakeState.direction = Direction.UP
                break
            case 'ArrowDown':
                if (snakeState.direction === Direction.UP) break
                snakeState.direction = Direction.DOWN
                break
            case 'ArrowRight':
                if (snakeState.direction === Direction.LEFT) break
                snakeState.direction = Direction.RIGHT
                break
            case 'ArrowLeft':
                if (snakeState.direction === Direction.RIGHT) break
                snakeState.direction = Direction.LEFT
                break
        }
    }

    nextCell(): Cell {
        const { body, state: snakeState, ground } = this

        const headCell = body.getHead()
        let { x, y } = headCell.position
        switch (snakeState.direction) {
            case Direction.LEFT:
                if (x === 0) throw new Error('Out of bound')
                x--
                break
            case Direction.UP:
                if (y === 0) throw new Error('Out of bound')
                y--
                break
            case Direction.RIGHT:
                if (x === 29) throw new Error('Out of bound')
                x++
                break
            case Direction.DOWN:
                if (y === 29) throw new Error('Out of bound')
                y++
                break
        }
        return ground.cells[y][x]
    }

    eat() {
        const { body, ground } = this
        body.eat(ground.food)
        ground.food.generate()
    }

    move() {
        let { body, state: snakeState, nextCell, eat } = this

        if (!snakeState.isActive) return

        let to: Cell
        try {
            to = nextCell()
        } catch (error) {
            alert(error)
            return
        }

        if (to.isFood()) {
            eat()
        } else if (to.isSnakeBody()) {
            if (to !== body.state.bodyCells[1]) {
                alert('You eat your self')
                return
            }
        } else {
            body.moveTo(to)
        }

    }

    pause() {
        this.state.isActive = false
    }

    start() {
        this.state.isActive = true
        this.move()
    }

    restart() {
        const { moveTimer, state, body } = this

        state.isActive = false
        moveTimer && clearTimeout(moveTimer)
        state.direction = Direction.RIGHT
        body.restart()
    }
}

export function CreateSnake(ground: Ground): Snake {
    return new Snake(ground)
}

type Path = Cell[]
export class SmartSnake extends Snake {
    constructor(ground: Ground) {
        super(ground)
    }
    findPath(): Path | undefined {
        const { x, y } = this.body.getHead().position
        const { row, colum } = this.ground

        type Point = {
            x: number, y: number, distance: number, parent: Point | null
        }

        let searchedMap = new Map()

        const getDirections = (point: { x: number, y: number }) => {
            const dirs = []
            const { x, y } = point

            x > 0 && dirs.push([x - 1, y])
            x < row - 1 && dirs.push([x + 1, y])
            y > 0 && dirs.push([x, y - 1])
            y < colum - 1 && dirs.push([x, y + 1])
            return dirs
        }

        const nearByBody = (point: Point, currentBodyCells: Cell[]) => {
            const directions = getDirections(point)
            for (let i = 0; i < directions.length; i++) {
                const dir = directions[i]
                const cell = getCell({ x: dir[0], y: dir[1] } as Point)
                if (currentBodyCells.includes(cell)) {
                    return true
                }
            }
        }

        const requirePoint: Point[] = []
        const createNextPoints = (point: Point, currentBody: Cell[]) => {
            const nextPoints = [] as Point[]
            const directions = getDirections(point)
            directions.forEach(dir => {
                const p = {
                    x: dir[0],
                    y: dir[1],
                    distance: point.distance + 1,
                    parent: point
                }
                const cell = getCell(p)

                if (!currentBody.includes(cell)) {
                    if (isSearched(p)) {
                        if (p.x === 0 || p.y === 0 || nearByBody(p, currentBody)) {
                            requirePoint.push(p)
                        } else {
                            requirePoint.unshift(p)
                        }
                    } else {
                        if (p.x === 0 || p.y === 0 || nearByBody(p, currentBody)) {
                            nextPoints.push(p)
                        } else {
                            nextPoints.unshift(p)
                        }
                        searchedMap.set(`${p.x}:${p.y}`, point)
                    }
                }
            })
            return nextPoints
        }

        const isCycle = (point: Point) => {
            let parent = point.parent
            while (parent) {
                if (point.x === parent.x && point.y === parent.y) {
                    return true
                }
                parent = parent.parent
            }
            return false
        }

        const getCurrentBody = (point: Point): Cell[] => {
            const cell = getCell(point)
            const snakeBody = this.body.state.bodyCells

            const bodyLen = cell.isFood() ? snakeBody.length + 1 : snakeBody.length

            const distance = point.distance

            const currentBody = [] as Cell[]
            for (let i = 0; i < bodyLen; i++) {
                if (point.distance > 0) {
                    currentBody.push(this.ground.cells[point.y][point.x])
                    point = point.parent as Point
                } else {
                    const cell = toRaw(snakeBody[i - distance])
                    currentBody.push(cell)
                }
            }
            return currentBody
        }
        const getCell = (point: Point) => {
            return this.ground.cells[point.y][point.x]
        }
        const getPath = (point: Point) => {
            const path = []
            while (point.distance > 0) {
                path.unshift(getCell(point))
                point = point.parent as Point
            }
            return path
        }

        let isSearched = (point: Point): boolean => {
            return !!searchedMap.get(`${point.x}:${point.y}`)
        }

        const checkPath = (point: Point, currentBodyCells: Cell[]) => {
            console.log('checking...')
            const linkedSpace = new Map()
            let nextSpacePoints = [] as { x: number, y: number }[]

            const space = { x: point.x, y: point.y }
            const dirs = getDirections(space)
            dirs.some(dir => {
                const key = `${[dir[0]]}:${dir[1]}`
                const cell = this.ground.cells[dir[1]][dir[0]]
                if (!currentBodyCells.includes(cell) && !cell.isFood()) {
                    linkedSpace.set(key, true)
                    nextSpacePoints.push({ x: dir[0], y: dir[1] })
                    return true
                }
            })
            let spacePoint
            while (spacePoint = nextSpacePoints.shift()) {
                const dirs = getDirections(spacePoint)
                dirs.forEach(dir => {
                    const key = `${[dir[0]]}:${dir[1]}`
                    const isLinked = linkedSpace.get(key)
                    if (!isLinked) {
                        const cell = this.ground.cells[dir[1]][dir[0]]
                        if (!currentBodyCells.includes(cell) && !cell.isFood()) {
                            linkedSpace.set(key, true)
                            nextSpacePoints.push({ x: dir[0], y: dir[1] })
                        }
                    }
                })
            }

            console.log('checked', row * colum - linkedSpace.size - currentBodyCells.length === 0)

            if(linkedSpace.size > maxLinkedSpace) {
                maxLinkedSpace = linkedSpace.size
                pathPoint = point
            }

            if (row * colum - linkedSpace.size - currentBodyCells.length === 0) {
                return true
            }

            return false
        }

        const getKey = (point: Point): string => {
            return `${point.x}:${point.y}`
        }

        const currentPoint = {
            x, y,
            distance: 0,
            parent: null
        }


        let i = 0
        let maxLinkedSpace = 0;
        let pathPoint = null;
        const paths = []
        let nextPoints = createNextPoints(currentPoint, getCurrentBody(currentPoint))
        let point
        while (point = nextPoints.shift()) {
            const cell = this.ground.cells[point.y][point.x]
            const currentBodyCells = getCurrentBody(point)

            if (cell.isFood()) {
                if (checkPath(point, currentBodyCells)) {
                    return getPath(point)
                } else {
                    paths.push(point)
                    paths.forEach(point => {
                        while (point) {
                            const key = getKey(point)
                            searchedMap.delete(key)
                            point = point.parent as Point
                        }
                    })

                    point = requirePoint.shift() as Point
                    if (point) {
                        if (!this.ground.cells[point.y][point.x].isFood()) {
                            nextPoints.unshift(point)
                            searchedMap.set(getKey(point), point)
                        }
                    }
                    continue
                }
            }

            nextPoints = nextPoints.concat(createNextPoints(point, currentBodyCells))

            if (nextPoints.length === 0) {
                const point = requirePoint.shift() as Point
                if (point) {
                    if (!this.ground.cells[point.y][point.x].isFood()) {
                        nextPoints.unshift(point)
                        searchedMap.clear()
                        paths.length = 0
                        searchedMap.set(getKey(point), point)
                    }
                }
            }
        }

        if (pathPoint) {
            return getPath(pathPoint)
        }
    }
    moveOnPath(path: Path) {
        const cell = path.shift() as Cell
        if (cell.isFood()) {
            this.eat()
        } else {
            this.body.moveTo(cell)
        }

        if (path.length > 0) {
            setTimeout(() => this.moveOnPath(path), 20)
        } else {
            this.auto()
        }
    }
    auto() {
        const path = this.findPath()

        console.log(path)

        path &&
            setTimeout(() => this.moveOnPath(path), 20)

    }
}

export function CreateSmartSnake(ground: Ground) {
    return new SmartSnake(ground)
}



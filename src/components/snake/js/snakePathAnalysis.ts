import { CreatePathAnalyst, Path, Point } from "../../../js/pathAnalysis";
import { Cell } from "../Cell";
import { Ground } from "../Ground";
import { Snake } from "./snake";

export class CellPoint {
    constructor(public x: number, public y: number) { }
    getId() {
        return this.x + ":" + this.y
    }
}

type SnakePath = Path & {
    bodyPoints: CellPoint[]
    point: CellPoint,
    children: SnakePath[],
    parent: SnakePath | null
}

type Direction = { x: number, y: number }

function getPoints(ground: Ground) {
    const cellPoints: CellPoint[][] = []
    let { row, colum } = ground

    for (let i = 0; i < colum; i++) {
        const arr = cellPoints[i] || (cellPoints[i] = [])

        for (let j = 0; j < row; j++) {
            arr[j] = new CellPoint(i, j)
        }
    }

    return cellPoints
}

export function createSnakePathAnalyst(ground: Ground) {
    let target: CellPoint

    function isTarget(path: Path): boolean {
        return path.point.getId() === target.getId()
    }

    const cellPoints: CellPoint[][] = getPoints(ground)

    function getPoint(x: number, y: number) {
        return cellPoints[x][y]
    }

    function getDirections(point: CellPoint): Direction[] {
        const { row, colum } = ground
        const { x, y } = point

        const dirs = []
        x > 0 && dirs.push({ x: x - 1, y })
        x < row - 1 && dirs.push({ x: x + 1, y })
        y > 0 && dirs.push({ x, y: y - 1 })
        y < colum - 1 && dirs.push({ x, y: y + 1 })

        return dirs
    }

    const getAddressablePoints = (path: SnakePath): CellPoint[] => {
        const points = [] as CellPoint[]

        const dirs = getDirections(path.point)
        dirs.forEach(direction => {
            const { x, y } = direction
            const nextPoint = getPoint(x, y)
            if (!isSnakeBody(path, nextPoint)) {
                points.push(nextPoint)
            }
        })

        return points
    }


    function linkSpace(space: CellPoint, path: SnakePath) {
        const linkedSpace = new Map()
        let nextSpacePoints = [space]
        let currentSpace
        while (currentSpace = nextSpacePoints.shift()) {
            const dirs = getDirections(currentSpace)
            dirs.forEach(dir => {
                const point = getPoint(dir.x, dir.y)
                if (!isSnakeBody(path, point)) {
                    const key = point.getId()
                    const isLinked = linkedSpace.get(key)
                    if (!isLinked) {
                        linkedSpace.set(key, true)
                        nextSpacePoints.push(point)
                    }
                }
            })
        }
        return linkedSpace
    }
    const pathAssess = (path: SnakePath) => {
        const linkedSpaceArea: Map<string, boolean>[] = []
        const { row, colum } = ground

        const spacePoints = getAddressablePoints(path)
        spacePoints.some(point => {
            if (!isLinked(point)) {
                const linkedSpace = linkSpace(point, path)
                linkedSpaceArea.push(linkedSpace)
            }
        })

        function isLinked(point: CellPoint) {
            if (linkedSpaceArea.length > 0) {
                const key = point.getId()
                return linkedSpaceArea.some(linkSpace => linkSpace.has(key))
            } else {
                return false
            }
        }


        if (linkedSpaceArea.length === 1) {
            return row * colum - linkedSpaceArea[0].size - path.bodyPoints.length
        } else if (linkedSpaceArea.length === 0) {
            return row * colum
        } else {
            let max: Map<string, Boolean> = new Map()
            linkedSpaceArea.forEach(linkSpace => {
                if (max.size < linkSpace.size) {
                    max = linkSpace
                }
            })
            return row * colum - max.size - path.bodyPoints.length
        }
    }

    function isSnakeBody(path: SnakePath, point: CellPoint) {
        return path.bodyPoints.includes(point)
    }

    function createBody(path: SnakePath) {
        if (path.parent) {
            const parentBody = path.parent.bodyPoints
            const currentBody = [...parentBody]
            currentBody.unshift(path.point)
            if (!isTarget(path)) {
                currentBody.pop()
            }
            path.bodyPoints = currentBody
        }
    }

    /**
     * 从当前路径派生子路径
     * @param path 
     */
    function deriveChildren(path: SnakePath) {
        let children = path.children
        if (children && children.length > 0) {
            return children
        } else {
            children = path.children = []
        }

        const addressablePoints: CellPoint[] = getAddressablePoints(path)
        addressablePoints.forEach(p => {
            const newPath = {
                parent: path,
                children: [] as SnakePath[],
                point: p,
                distance: path.distance + 1
            } as SnakePath
            createBody(newPath)

            const { x: x1, y: y1 } = newPath.point
            const { x: x2, y: y2 } = path.point

            
            if(x1 !== x2-1 && x1 !== x2+1 && x1 !== x2) {
                throw new Error()
            }
            if(y1 !== y2+1 && y1!== y2-1 && y1 !== y2) {
                throw new Error()
            }

            if (p.x === 0 || p.y === 0) {
                children.unshift(newPath)
            } else {
                children.push(newPath)
            }
        })

        return children
    }

    function isSamePath(p1: SnakePath, p2: SnakePath) {
        const body1 = p1.bodyPoints
        const body2 = p2.bodyPoints
        if (body1.length !== body2.length) {
            return false
        } else {
            return body1.every((cellPoint, index) => cellPoint === body2[index])
        }
    }

    const analyst = CreatePathAnalyst({
        isTarget,
        deriveChildren,
        pathAssess
    })

    return () => {
        const head = ground.snake.body.getHead()
        const body = [] as CellPoint[]

        const snakeBody = ground.snake.body.state.bodyCells
        snakeBody.forEach(cell => {
            const { x, y } = cell.position
            body.push(getPoint(x, y))
        })

        const path = {
            parent: null,
            distance: 0,
            point: getPoint(head.position.x, head.position.y),
            children: [],
            bodyPoints: body
        }

        const food = ground.food.getCurrentCell()
        target = getPoint(food.position.x, food.position.y)

        return analyst(path)
    }
}
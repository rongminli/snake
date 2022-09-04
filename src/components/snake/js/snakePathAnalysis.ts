import { CreatePathAnalyst, Path, Point } from "../../../js/pathAnalysis";
import { Ground } from "../Ground";

export class CellPoint {
    constructor(public x: number, public y: number) { }
}

type SnakePath = Path & {
    bodyPoints: CellPoint[] | null
    point: CellPoint,
    children: SnakePath[] | null,
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
        return path.point === target
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
        const result = {
            linkedSpace: new Map<Point, boolean>(),
            findTail: false
        }
        let nextSpacePoints = [space]
        let currentSpace
        while (currentSpace = nextSpacePoints.shift()) {
            const dirs = getDirections(currentSpace)
            dirs.forEach(dir => {
                const point = getPoint(dir.x, dir.y)
                const isLinked = result.linkedSpace.get(point)
                if (!isSnakeBody(path, point) && !isLinked) {
                    result.linkedSpace.set(point, true)
                    nextSpacePoints.push(point)
                } else if (isTail(path, point)) {
                    result.findTail = true
                }
            })
        }
        return result
    }

    function pathAssess(path: SnakePath) {
        const linkedSpaceArea: any[] = []
        const { row, colum } = ground

        const spacePoints = getAddressablePoints(path)

        spacePoints.forEach(point => {
            if (!isLinked(point)) {
                const re = linkSpace(point, path)
                linkedSpaceArea.push(re)
            }
        })

        function isLinked(point: CellPoint) {
            return linkedSpaceArea.length > 0
                && linkedSpaceArea.some(re => re.linkedSpace.has(point))
        }

        let assess = 100

        if (linkedSpaceArea.length === 1) {
            path.bodyPoints &&
                (assess = row * colum - linkedSpaceArea[0].linkedSpace.size - path.bodyPoints.length)
        } else if (linkedSpaceArea.length === 0) {
            assess = row * colum
        } else {
            let max: Map<string, Boolean> = new Map()
            linkedSpaceArea.forEach(re => {
                if (max.size < re.linkedSpace.size) {
                    max = re.linkedSpace
                }
            })
            path.bodyPoints &&
                (assess = row * colum - max.size - path.bodyPoints.length)
        }

        assess > 0 &&
            linkedSpaceArea.some(re => {
                if (re.findTail && path.bodyPoints) {
                    assess = (row * colum - re.linkedSpace.size - path.bodyPoints.length) / 2
                    return true
                }
            })


        return assess
    }

    function isSnakeBody(path: SnakePath, point: CellPoint) {
        return path.bodyPoints?.includes(point)
    }

    function isTail(path: SnakePath, point: CellPoint) {
        return path.bodyPoints
            && point === path.bodyPoints[path.bodyPoints?.length - 1]
    }

    function createBody(path: SnakePath) {
        if (path.parent && path.parent.bodyPoints) {
            const parentBody = path.parent.bodyPoints
            const currentBody = Array.from(parentBody)

            currentBody.unshift(path.point)
            !isTarget(path) && currentBody.pop()

            path.bodyPoints = currentBody
        }
    }

    function isBodySame(p1: SnakePath, p2: SnakePath) {
        if (p1.point !== p2.point) {
            return false
        }

        const p1Body = p1.bodyPoints
        const p2Body = p2.bodyPoints
        if (p1Body && p2Body) {
            if (p1.distance - p2.distance <= p1Body.length) {
                return false
            }
            return p1Body.every((point, i) => {
                return point === p2Body[i]
            })
        }

    }

    function isCycle(path: SnakePath) {
        const bodyPoints = path.bodyPoints
        if (bodyPoints) {
            if (path.distance <= bodyPoints?.length) {
                return false
            }
        }

        let flag = false
        let parent = path.parent
        while (parent) {
            if (isBodySame(path, parent)) {
                if (flag) return true
                else flag = true
            } else {
                parent = parent.parent
            }
        }
        return false
    }

    /**
     * 从当前路径派生子路径
     * @param path 
     */
    function deriveChildren(path: SnakePath) {
        if (isTarget(path)) {
            return path.children = []
        }

        let children = path.children
        if (children && children.length > 0) {
            return children
        } else {
            children = path.children = []
        }

        const addressablePoints = getAddressablePoints(path)
        addressablePoints.forEach(p => {
            const newPath = {
                parent: path,
                point: p,
                distance: path.distance + 1,
                children: null
            } as SnakePath

            createBody(newPath)

            p.x === 0 || p.y === 0 ?
                children?.unshift(newPath) :
                children?.push(newPath)
        })

        path.bodyPoints = null

        return children
    }


    const analyst = CreatePathAnalyst({
        isTarget,
        deriveChildren,
        pathAssess
    })

    return () => {
        const head = ground.snake.body.getHead()
        const body = [] as CellPoint[]

        const snakeBody = ground.snake.body.state.cells
        snakeBody.forEach(cell => {
            const { x, y } = cell.point
            body.push(getPoint(x, y))
        })

        const path = {
            parent: null,
            distance: 0,
            point: getPoint(head.point.x, head.point.y),
            children: [],
            bodyPoints: body
        }

        const food = ground.food.getCurrentCell()
        target = getPoint(food.point.x, food.point.y)

        return analyst(path)
    }
}
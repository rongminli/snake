import { Ground } from "@/components/Snake/Ground";
import { SearchPathOptions, PathNode, Node, searchPath } from "./searchPath";
import { message } from 'ant-design-vue'

type Area = Node[][]

let area: Area
const bodyNodeCache: Node[][] = [[]]
let bodyNodes: Node[]
let assessmentDeep = 0

/**
 * 初始化搜索区域
 * @param ground 
 */
function initArea(ground: Ground) {
    const y = ground.cells.length
    const x = ground.cells[0].length
    const nodes: Node[][] = Array(y)
    for (let i = 0; i < y; i++) {
        const ar: Node[] = Array(y)
        for (let j = 0; j < x; j++) {
            ar[j] = { x: j, y: i, isLocked: false }
        }
        nodes[i] = ar
    }
    area = nodes
}

function initBodyNode(ground: Ground) {
    const bodyLen = ground.snake.body.cells.length
    const nodes = Array(bodyLen)
    ground.snake.body.cells.forEach((cell, i) => {
        const { x, y } = cell.coord
        nodes[i] = area[y][x]
    })
    bodyNodes = nodes
}

function getCurrentBodyNodes(pathNode: PathNode): Node[] {
    const bodyLen = bodyNodes.length
    const currentBodyNodes = Array(bodyLen)
    let i = 0
    let j = 0
    while (i < bodyLen && pathNode.parent) {
        currentBodyNodes[i] = pathNode.node
        pathNode = pathNode.parent
        i++
    }
    while (i < bodyLen) {
        currentBodyNodes[i] = bodyNodes[j]
        i++
        j++
    }
    return currentBodyNodes
}

function isCycle(pathNode: PathNode, node: Node) {
    while (pathNode.parent) {
        if (node === pathNode.node) {
            return true
        }
        pathNode = pathNode.parent
    }
    if (node === pathNode.node) {
        return true
    }
    return false
}

function isFutilePath(pathNode: PathNode) {
    const currentBodyNodes = getCurrentBodyNodes(pathNode)
    for (let i = 0; i < currentBodyNodes.length; i++) {
        if (currentBodyNodes[i] !== bodyNodes[i])
            return false
    }
    return true
}

const accessibleCheck = (node: Node, currentBodyNodes: Node[]) => {
    return !currentBodyNodes.includes(node)
        || node === currentBodyNodes[currentBodyNodes.length - 1]
}

const getAccessibleNodes = (pathNode: PathNode): Node[] => {
    const currentBodyNodes = getCurrentBodyNodes(pathNode)
    const accessibleNodes = [] as Node[]
    const { x, y } = pathNode.node
    const len1 = area.length
    const len2 = area[0].length
    if (x > 0) {
        const node = area[y][x - 1]
        accessibleCheck(node, currentBodyNodes)
            && accessibleNodes.push(node)
    }
    if (x < len2 - 1) {
        const node = area[y][x + 1]
        accessibleCheck(node, currentBodyNodes)
            && accessibleNodes.push(node)
    }
    if (y > 0) {
        const node = area[y - 1][x]
        accessibleCheck(node, currentBodyNodes)
            && accessibleNodes.push(node)
    }
    if (y < len1 - 1) {
        const node = area[y + 1][x]
        accessibleCheck(node, currentBodyNodes)
            && accessibleNodes.push(node)
    }
    return accessibleNodes
}

/**
     * 从当前路径派生子路径
     * @param pathNode 
     */
function derive(pathNode: PathNode): PathNode[] {
    // 当前可访问的节点
    const accessibleNodes = getAccessibleNodes(pathNode)
    const children: PathNode[] = []
    accessibleNodes.forEach(node => {
        const child: PathNode = {
            parent: pathNode,
            node: node,
        }
        !isFutilePath(child) && children.push(child)
    })
    return children
}

function assessmentIn(pathNode: PathNode) {
    assessmentDeep++
    bodyNodeCache.push(bodyNodes)
    const currentBodyNodes = getCurrentBodyNodes(pathNode.parent as PathNode)
    currentBodyNodes.unshift(pathNode.node)
    bodyNodes = currentBodyNodes
}

function assessmentOut() {
    assessmentDeep--
    bodyNodes = bodyNodeCache.pop() as Node[]
}

function needAssessment() {
    if (bodyNodes.length === 99) return false
    return bodyNodes.length > 50
        ? bodyNodes.length > 95
            ? assessmentDeep < 3
            : assessmentDeep < 2
        : assessmentDeep < 1
}

/**
 * 路径评估
 * @param pathNode 需要评估的路径
 * @returns 如果到达当前路径后可以访问其他所有的空地时返回true，否则返回false 
 */
function pathAssessment(pathNode: PathNode) {
    console.log('pathAssessment', bodyNodes.length)
    if (!needAssessment()) {
        return true
    }
    assessmentIn(pathNode)
    const firstNode = pathNode.node
    for (let i = 0; i < area.length; i++) {
        for (let j = 0; j < area[0].length; j++) {
            const node = area[i][j]
            if (!bodyNodes.includes(node)) {
                const options: SearchPathOptions = {
                    firstNode,
                    target: node,
                    pathAssessment: pathAssessment,
                    derive
                }
                const path = searchPath(options)
                if (!path) {
                    assessmentOut()
                    return false
                }
            }
        }
    }
    assessmentOut()
    return true
}

/**
 * 
 * @param pathNode 寻尾式路径评估
 * @returns 如果到达当前路径后能找到自己的尾部，则返回true，否则返回false
 */
function pathAssessment_1(pathNode: PathNode) {
    assessmentIn(pathNode)
    console.log('pathAssessment_1', bodyNodes.length)
    const options: SearchPathOptions = {
        firstNode: pathNode.node,
        target: bodyNodes[bodyNodes.length - 1],
        pathAssessment: () => true,
        derive
    }
    const path = searchPath(options)
    assessmentOut()
    if (!path || !path.parent) {
        return false
    }
    return true
}

export default function (ground: Ground) {
    initArea(ground)
    return () => {
        initBodyNode(ground)
        console.log(bodyNodes.length)
        const snake = ground.snake
        if (!ground.food.cell) {
            message.error('food is not instance yet')
            return
        }
        const head = snake.body.getHead()
        const { x: foodX, y: foodY } = ground.food.cell.coord
        const options: SearchPathOptions = {
            firstNode: area[head.coord.y][head.coord.x],
            target: area[foodY][foodX],
            pathAssessment,
            derive
        }
        return searchPath(options)
    }
} 
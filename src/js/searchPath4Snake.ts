import { Ground } from "@/components/Snake/Ground";
import { SearchPathOptions, PathNode, Node, searchPath } from "./searchPath";
import { message } from 'ant-design-vue'
import path from "path";

type Area = Node[][]

let area: Area
const bodyNodeCache: Node[][] = [[]]
let bodyNodes: Node[]
let assessmentDeep = 0

function initArea(ground: Ground) {
    const y = ground.cells.length
    const x = ground.cells[0].length
    const nodes: Node[][] = Array(y)
    for (let i = 0; i < y; i++) {
        const ar = Array(y)
        for (let j = 0; j < x; j++) {
            ar[j] = { x: j, y: i }
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

const checkNodeAndPush = (node: Node, pathNode: PathNode, currentBodyNodes: Node[], accessibleNodes: Node[]) => {
    if (currentBodyNodes.includes(node)) {
        if (node === currentBodyNodes[currentBodyNodes.length - 1])
            accessibleNodes.push(node)
    } else {
        accessibleNodes.push(node)
    }
}

const getAccessibleNodes = (pathNode: PathNode): Node[] => {
    const currentBodyNodes = getCurrentBodyNodes(pathNode)
    const accessibleNodes = [] as Node[]
    const { x, y } = pathNode.node
    const len1 = area.length
    const len2 = area[0].length
    if (x > 0) {
        const node = area[y][x - 1]
        checkNodeAndPush(node, pathNode, currentBodyNodes, accessibleNodes)
    }
    if (x < len2 - 1) {
        const node = area[y][x + 1]
        checkNodeAndPush(node, pathNode, currentBodyNodes, accessibleNodes)
    }
    if (y > 0) {
        const node = area[y - 1][x]
        checkNodeAndPush(node, pathNode, currentBodyNodes, accessibleNodes)
    }
    if (y < len1 - 1) {
        const node = area[y + 1][x]
        checkNodeAndPush(node, pathNode, currentBodyNodes, accessibleNodes)
    }
    return accessibleNodes
}

/**
     * 从当前路径派生子路径
     * @param path 
     */
function derive(path: PathNode): PathNode[] {
    const accessibleNodes = getAccessibleNodes(path)
    const children: PathNode[] = []
    accessibleNodes.forEach(node => {
        const child: PathNode = {
            parent: path,
            node: node,
        }
        children.push(child)
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
    return assessmentDeep < 1
}

function pathAssessment(pathNode: PathNode) {
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
                    pathAssessment,
                    derive
                }
                const path = searchPath(options)
                console.log(bodyNodes.length, assessmentDeep, !!path)
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

function pathAssessment_1(pathNode: PathNode) {
    console.log('pathAssessment_1')
    if (!needAssessment() || bodyNodes.length === 99) {
        return true
    }
    assessmentIn(pathNode)
    const options: SearchPathOptions = {
        firstNode: pathNode.node,
        target: bodyNodes[bodyNodes.length - 1],
        pathAssessment: pathAssessment_1,
        derive
    }
    let path = searchPath(options)
    if (!path) {
        assessmentOut()
        return false
    }
    // let pathLen = 0
    // while (path.parent) {
    //     pathLen++
    //     if (pathLen > 1) {
    //         assessmentOut()
    //         return true
    //     }
    //     path = path.parent
    // }
    assessmentOut()
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
        const target = area[foodY][foodX]
        const options: SearchPathOptions = {
            firstNode: head.coord,
            target: target,
            pathAssessment: pathAssessment_1,
            derive
        }
        return searchPath(options)
    }
} 
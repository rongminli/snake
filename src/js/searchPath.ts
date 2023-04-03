export type PathNode = {
    parent: PathNode | null
    node: Node
}

export type Node = {
    x: number,
    y: number
}

export type SearchPathOptions = {
    firstNode: Node,
    target: Node,
    pathAssessment(pathNode: PathNode): Boolean,
    derive(pathNode: PathNode): PathNode[]
}

const isTarget = (node: Node, target: Node) => {
    return node === target
}
const isNodeLocked = (path: PathNode, lockedNode: Node[]) => {
    return lockedNode.includes(path.node)
}
const lockNode = (node: Node, lockedNode: Node[]) => {
    return lockedNode.push(node)
}
const recall = (nextPathNodes: PathNode[], blockedPaths: PathNode[], lockedNodes: Node[]) => {
    const blockedPath = blockedPaths.shift()
    if (blockedPath) {
        nextPathNodes.push(blockedPath)
        lockedNodes.length = 0
    }
}

export function searchPath(options: SearchPathOptions) {
    const {
        firstNode,
        target,
        pathAssessment,
        derive
    } = options
    let nextPathNodes: PathNode[] = []
    const lockedNodes: Node[] = []
    const blockedPaths: PathNode[] = []
    const firstPathNode = {
        parent: null,
        children: [],
        node: firstNode,
        assessmentCount: 0
    }
    nextPathNodes.push(firstPathNode)
    let count = 0
    let next
    while (next = nextPathNodes.shift()) {
        count++
        if (count > 2000000) {
            console.log(count)
            return false
        }
        if (isTarget(next.node, target)) {
            if (pathAssessment(next)) {
                return next
            } else {
                recall(nextPathNodes, blockedPaths, lockedNodes)
            }
        }
        if (isNodeLocked(next, lockedNodes)) {
            blockedPaths.push(next)
        } else {
            lockNode(next.node, lockedNodes)
            const childrenNode = derive(next)
            nextPathNodes = nextPathNodes.concat(childrenNode)
        }

        nextPathNodes.length === 0 && recall(nextPathNodes, blockedPaths, lockedNodes)
    }
}
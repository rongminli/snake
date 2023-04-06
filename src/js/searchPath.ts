export type PathNode = {
    parent: PathNode | null
    node: Node
}

export type Node = {
    x: number,
    y: number,
    isLocked: Boolean
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
const isNodeLocked = (path: PathNode) => {
    return path.node.isLocked
}
const lockNode = (node: Node, lockedNode: Node[]) => {
    node.isLocked = true
    lockedNode.push(node)
}

const unlockAll = (lockedNodes: Node[]) => {
    lockedNodes.forEach(node => node.isLocked = false)
    lockedNodes.length = 0
}

const recall = (nextPathNodes: PathNode[], blockedPaths: PathNode[]) => {
    const blockedPath = blockedPaths.shift()
    blockedPath && nextPathNodes.push(blockedPath)
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
    }

    nextPathNodes.push(firstPathNode)
    let count = 0
    let next
    while (next = nextPathNodes.shift()) {
        count++
        if (count > 2000000) {
            console.log(count)
            unlockAll(lockedNodes)
            return false
        }
        if (isTarget(next.node, target)) {
            unlockAll(lockedNodes)
            if (pathAssessment(next)) {
                return next
            } else {
                recall(nextPathNodes, blockedPaths)
            }
        } else {
            if (isNodeLocked(next)) {
                blockedPaths.push(next)
            } else {
                lockNode(next.node, lockedNodes)
                const childrenNode = derive(next)
                nextPathNodes = nextPathNodes.concat(childrenNode)
            }
        }

        if (nextPathNodes.length === 0) {
            unlockAll(lockedNodes)
            recall(nextPathNodes, blockedPaths)
        }
    }
}
export type Point = {
    getId(): string
}

export type Path = {
    parent: Path | null,
    children: Path[],
    point: Point,
    distance: number
}

export interface Config {
    isTarget(path: Path): boolean,
    deriveChildren(path: Path): Path[],
    pathAssess(path: Path): number
}

export function CreatePathAnalyst(config: Config) {

    const { isTarget, deriveChildren, pathAssess } = config

    const pointLockMap = new Map<string, Path[]>()
    const lockedPath = [] as Path[]

    function isPointLocked(path: Path) {
        return pointLockMap.has(path.point.getId())
    }

    function lockPoint(path: Path) {
        const pointId = path.point.getId()
        const lockedPaths = pointLockMap.get(pointId)
        if (lockedPaths) {
            throw new Error(`the point has locked, pointId: ${pointId}`)
        } else {
            pointLockMap.set(pointId, [])
        }
    }

    function unlockPath(path: Path) {
        const releasePath = []
        while (path) {
            const pointId = path.point.getId()
            const lockedPaths = pointLockMap.get(pointId)
            if (lockedPaths) {
                releasePath.push(...lockedPaths)
                pointLockMap.delete(pointId)
            }

            path = path.parent as Path
        }

        return releasePath
    }

    function recordLockedPath(path: Path) {
        const pointId = path.point.getId()
        const lockedPaths = pointLockMap.get(pointId)
        if (!lockedPaths) {
            throw new Error(`the point has not locked, pointId: ${pointId}`)
        } else {
            lockedPaths.push(path)
            lockedPath.push(path)
        }
    }

    function pathAnalysis(firstPath: Path): Path | null {
        const paths = [] as Path[]
        let result = null
        let bestPathAssess = 1000
        pointLockMap.clear()

        deriveChildren(firstPath)

        let nextPaths = [...firstPath.children]
        let currentPath
        while (currentPath = nextPaths.shift()) {
            if(currentPath === null) {
                console.log(currentPath)
                debugger
            }
            if (isTarget(currentPath)) {
                const assess = pathAssess(currentPath)

                if (assess === 0) {
                    bestPathAssess = assess
                    result = currentPath
                    break
                } else {
                    if (assess < bestPathAssess) {
                        bestPathAssess = assess
                        result = currentPath
                    }
                    paths.push(currentPath)
                    if (paths.length > 10000) {
                        break
                    }

                    const recallPath = lockedPath.shift()
                    if (recallPath) {
                        nextPaths.push(recallPath)
                        pointLockMap.clear()
                    }
                    continue
                }
            }

            if (isPointLocked(currentPath)) {
                recordLockedPath(currentPath)
            } else {
                lockPoint(currentPath)
                const children = deriveChildren(currentPath)
                nextPaths.push(...children)
                continue
            }

            if (nextPaths.length === 0) {
                const recallPath = lockedPath.shift()
                if (recallPath) {
                    nextPaths.push(recallPath)
                    pointLockMap.clear()
                }
            }
        }

        pointLockMap.clear()
        lockedPath.length = 0

        console.log(paths.length)

        return result
    }

    return pathAnalysis
}


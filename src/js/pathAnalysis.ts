export type Point = {
}

export type Path = {
    parent: Path | null,
    children: Path[] | null,
    point: Point,
    distance: number
}

export interface Options {
    isTarget(path: Path): boolean,
    deriveChildren(path: Path): Path[],
    pathAssess(path: unknown): number
}

export function CreatePathAnalyst(config: Options) {

    function pathAnalysis(firstPath: Path): Path | null {

        const { isTarget, deriveChildren, pathAssess } = config

        function* recallPath(path: Path): Generator<Path[], void, Path[]> {
            let nextPaths = [path]
            let nextPath
            while (nextPath = nextPaths.shift()) {
                if (nextPath.children !== null) {
                    nextPaths.push(...nextPath.children)
                } else {
                    const children = deriveChildren(nextPath)

                    if (children.length > 0) {
                        nextPaths.push(...children)
                        yield children
                    }
                }
            }
        }

        const pointLockMap = new Map<Point, Path>()

        function isPointLocked(path: Path) {
            return pointLockMap.has(path.point)
        }

        function lockPoint(path: Path) {
            pointLockMap.set(path.point, path)
        }

        let pathCount = 0
        let result = null
        let bestPathAssess = 1000

        const recall = recallPath(firstPath)

        let i = 0
        let currentPath
        const nextPaths = [firstPath]

        while (i < nextPaths.length) {
            currentPath = nextPaths[i]

            if (isTarget(currentPath)) {
                pathCount++

                const assess = pathAssess(currentPath)

                if (assess === 0) {
                    bestPathAssess = assess
                    result = currentPath
                    break
                } else if (assess < bestPathAssess) {
                    bestPathAssess = assess
                    result = currentPath
                }
                if (pathCount >= 10000) {
                    break
                }

            } else if (!isPointLocked(currentPath)) {
                lockPoint(currentPath)
                const children = deriveChildren(currentPath)
                nextPaths.push(...children)
            }

            i++

            if (i === nextPaths.length) {
                const paths = recall.next().value
                if (paths && paths.length > 0) {
                    pointLockMap.clear()
                    nextPaths.push(...paths)
                }
            }

        }
        return result
    }

    return pathAnalysis
}


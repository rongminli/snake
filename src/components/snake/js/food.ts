import { positionToIndex } from './shared'
import { Snake } from './snake'

export class Food {
    cell = null
    constructor(private ground: any[]) {
        this.generate()
    }
    generate() {
        const x = Math.random() * 29 | 0
        const y = Math.random() * 29 | 0
        const index = positionToIndex(x, y)

        const randomCell = this.ground[index]

        if(!randomCell.isSpace())  {
            this.generate()
        }else {
            randomCell.asFood()
            this.cell = randomCell
        }
    }
}
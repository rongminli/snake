import { Cell } from '../Cell'
import { Ground } from '../Ground'

export class Food {
    cell : Cell | null = null
    constructor(private ground: Ground) {
        ground.food = this
        this.generate()
    }
    generate() {
        const x = Math.random() * 29 | 0
        const y = Math.random() * 29 | 0

        const randomCell = this.ground.cells[y][x]

        if(!randomCell.isSpace())  {
            this.generate()
        }else {
            randomCell.asFood()
            this.cell = randomCell
        }
    }
}
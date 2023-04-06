import { Cell } from '../Cell'
import { Ground } from '../Ground'
import { flatForEach, event } from '../utils'
import { SnakeBody } from './snakeBody'

export enum Events {
    VICTORY = 'victor'
}

export class Food {
    public cell: Cell | null = null
    constructor(private ground: Ground) {    }
   
    public generate() {
        if(this.cell?.isFood()) {
            console.warn('already have food')
            return
        }

        const spaceCell = [] as Cell[]
        const groundCells = this.ground.cells
        flatForEach(groundCells, (cell: Cell) => cell.isSpace() && spaceCell.push(cell))

        switch(spaceCell.length) {
            case 0 : this.cell = null; break;
            case 1 : this.cell = spaceCell[0]; this.cell.asFood(); break ;
            default : {
                const randomIndex = Math.random() * (spaceCell.length - 1) | 0
                const randomCell = spaceCell[randomIndex]
                if(!randomCell.isSpace()) {
                    throw new Error('worry cell')
                }
                randomCell.asFood()
                this.cell = randomCell
            }
        }
    }

    public eat(snakeBody: SnakeBody) {
        if(this.cell) {
            snakeBody.cells[0].asSnakeBody()
            this.cell.asHead()
            snakeBody.cells.unshift(this.cell)
            this.cell = null
            this.generate()
        }
    }
}



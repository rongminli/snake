/****************
 *@description:
 *@author: LRM
 *@date: 2022-08-15 09:10:56
 *@version: V1.0.0
*************************************************************************/

<script setup lang='ts'>

import { computed, ref } from 'vue';

enum CellState {
    SPACE = 0,
    SNAKE_BODY = 1,
    FOOD = 2,
}

type Position  = {
    x: number,
    y: number
}

const { position } =  defineProps<{position: Position}>()

const cellState = ref(CellState.SPACE)

const className = computed(() => {
    let className = ''
    switch (cellState.value) {
        case CellState.SPACE:
            className = 'space'
            break
        case CellState.SNAKE_BODY:
            className = 'snake-body'
            break
        case CellState.FOOD:
            className = 'food'
            break
    }
    return className
})

function changeState(state: CellState) {
    cellState.value = state
}

defineExpose({
    asSpace: () => changeState(CellState.SPACE),
    asFood: () => changeState(CellState.FOOD),
    asSnakeBody: () => changeState(CellState.SNAKE_BODY),
    position,
    isSpace: () => cellState.value === CellState.SPACE,
    isFood: () => cellState.value === CellState.FOOD,
    isSnakeBody: () => cellState.value === CellState.SNAKE_BODY

})

</script>

<template>
    <div class="cell" :class="className">
    </div>
</template>

<style lang='scss' scoped>
.cell {
    border: 1px solid #fff;
}
.space {
    background-color: #ffffff;
    transition: .5s;

}

.snake-body {
    background-color: #333333;
}

.food {
    background-color: rgb(163, 207, 28);
}
</style>
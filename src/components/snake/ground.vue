/****************
 *@description:
 *@author: LRM
 *@date: 2022-08-15 09:07:22
 *@version: V1.0.0
*************************************************************************/

<script setup lang='ts'>
import { getCurrentInstance, onMounted } from 'vue';
import CellVue from './cell.vue';
import { Food } from './js/food';
import { Snake } from './js/snake';

const row = 30;
const colum = 30;

const style = {
    grid: `grid: repeat(${row}, 1fr) / repeat(${colum}, 1fr)`
}

let cells = [] as InstanceType<typeof CellVue>[]

onMounted(() => {
    cells = <InstanceType<typeof CellVue>[]>getCurrentInstance()?.refs.cells

    const food = new Food(cells)
    const snake = new Snake({cells, food})

    snake.move()
    console.log(snake)
})

</script>

<template>
    <div class="ground" :style="style">
        <template v-for="i in colum">
            <CellVue ref="cells" v-for="j in row" :position="{ x: j, y: i }" />
        </template>
    </div>
</template>

<style lang='scss' scoped>
.ground {
    width: 600px;
    height: 600px;
    display: grid;
    border: 1px solid #ddd;
    grid: repeat(30, 1fr) / repeat(30, 1fr)
}
</style>
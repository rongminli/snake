/****************
 *@description:
 *@author: LRM
 *@date: 2022-08-15 09:06:07
 *@version: V1.0.0
*************************************************************************/

<script setup lang='ts'>

import { createGround, GroundVue } from './Ground';

const ground = createGround()

</script>

<template>
    <GroundVue :ground="ground"></GroundVue>
</template>

<style lang='scss'>
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
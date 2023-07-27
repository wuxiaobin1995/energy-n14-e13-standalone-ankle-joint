<!--
 * @Author      : Mr.bin
 * @Date        : 2023-07-27 15:59:39
 * @LastEditTime: 2023-07-27 16:18:13
 * @Description : 跖屈
-->
<template>
  <div class="train-plantarFlexion">
    <div class="wrapper">
      <div>跖屈</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'train-plantarFlexion'
}
</script>

<style lang="scss" scoped>
.train-plantarFlexion {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 96%;
    height: 96%;
    border-radius: 20px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 20px;
    @include flex(row, space-between, stretch);
  }
}
</style>

<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-25 11:15:18
 * @LastEditTime: 2023-06-25 11:34:49
 * @Description : 根组件
-->
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',

  created() {
    /* 初始化医院名称 */
    if (!window.localStorage.getItem('hospital')) {
      window.localStorage.setItem('hospital', '')
    }
  }
}
</script>

<style lang="scss" scoped></style>

<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-25 11:15:18
 * @LastEditTime: 2023-06-26 09:53:00
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
    this.initLocalStorage()
  },

  methods: {
    /**
     * @description: 软件启动后，初始化localStorage的一些值
     */
    initLocalStorage() {
      /* 初始化医院名称 */
      if (!window.localStorage.getItem('hospital')) {
        window.localStorage.setItem('hospital', '')
      }
      /* 初始化免责声明的终端用户名称 */
      if (!window.localStorage.getItem('disclaimer_name')) {
        window.localStorage.setItem('disclaimer_name', '')
      }
      /* 初始化免责声明的设备编号 */
      if (!window.localStorage.getItem('disclaimer_device_id')) {
        window.localStorage.setItem('disclaimer_device_id', '')
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>

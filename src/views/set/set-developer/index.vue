<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-25 21:42:25
 * @LastEditTime: 2023-06-25 21:42:38
 * @Description : 开发者
-->
<template>
  <div class="set-developer">
    <div class="wrapper">
      <el-page-header
        class="page"
        title="返回首页"
        content="开发者（单机版）"
        @back="handleToHome"
      ></el-page-header>

      <div class="btn">
        <el-button class="item" type="success" round @click="handleOpenDev"
          >打开控制台</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
/* 用于打开控制台 */
import { remote } from 'electron'

export default {
  name: 'set-developer',

  methods: {
    /**
     * @description: 回到首页
     */
    handleToHome() {
      this.$router.push({
        path: '/home'
      })
    },

    /**
     * @description: 打开控制台
     */
    handleOpenDev() {
      try {
        remote.getCurrentWebContents().openDevTools()
      } catch (err) {
        this.$message({
          type: 'error',
          message: `打开控制台失败：${err}`
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.set-developer {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 86%;
    height: 90%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 40px;
    @include flex(column, center, center);
    position: relative;

    .page {
      position: absolute;
      top: 20px;
      left: 30px;
    }

    .btn {
      @include flex(column, center, center);
      .item {
        font-size: 28px;
      }
    }
  }
}
</style>

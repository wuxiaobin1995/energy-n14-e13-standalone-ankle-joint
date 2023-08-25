<!--
 * @Author      : Mr.bin
 * @Date        : 2023-07-25 15:38:27
 * @LastEditTime: 2023-08-22 09:59:54
 * @Description : 测试介绍
-->
<template>
  <div class="test-introduce">
    <div class="wrapper">
      <el-page-header
        class="page"
        title="返回首页"
        content="测试介绍"
        @back="handleToHome"
      ></el-page-header>

      <div class="content">
        测试踝关节：跖屈、背屈、内收、外展、内翻、外翻的活动度是否处于正常范围
      </div>

      <div class="img">
        <el-image :src="showImg" fit="scale-down"></el-image>
      </div>

      <!-- 按钮组 -->
      <div class="btn">
        <el-button class="item" type="success" @click="handleStart"
          >开始测试</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'test-introduce',

  data() {
    return {
      showImg: require('@/assets/img/Test/示意图.png') // 示意图
    }
  },

  created() {
    window.sessionStorage.setItem('test-angleArray', JSON.stringify([]))
  },

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
     * @description: 开始测试
     */
    handleStart() {
      this.$router.push({
        path: '/test-plantarFlexion-left'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.test-introduce {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 86%;
    height: 90%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 26px 40px;
    position: relative;
    @include flex(column, stretch, stretch);

    .page {
      position: absolute;
      top: 20px;
      left: 30px;
    }

    .content {
      margin-top: 35px;
      font-size: 30px;
    }

    .img {
      flex: 1;
      @include flex(row, center, center);
    }

    /* 按钮组 */
    .btn {
      margin-bottom: 10px;
      @include flex(row, center, center);
      .item {
        font-size: 22px;
      }
    }
  }
}
</style>

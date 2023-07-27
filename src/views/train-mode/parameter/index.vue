<!--
 * @Author      : Mr.bin
 * @Date        : 2023-07-27 09:34:58
 * @LastEditTime: 2023-07-27 16:00:15
 * @Description : 训练参数配置
-->
<template>
  <div class="train-parameter" v-loading.fullscreen.lock="fullscreenLoading">
    <div class="wrapper">
      <el-page-header
        class="page"
        title="返回首页"
        content="训练参数配置"
        @back="handleToHome"
      ></el-page-header>

      <div class="content">
        <!-- 参数设置 -->
        <div class="set">
          <div class="left">
            <div class="item">
              <span>跖屈最大值°：</span>
              <el-input-number
                v-model="plantarFlexion"
                :min="5"
                :max="40"
                :precision="0"
              ></el-input-number>
            </div>
            <div class="item">
              <span>背屈最大值°：</span>
              <el-input-number
                v-model="dorsiflex"
                :min="5"
                :max="30"
                :precision="0"
              ></el-input-number>
            </div>
            <div class="item">
              <span>内收最大值°：</span>
              <el-input-number
                v-model="adduction"
                :min="5"
                :max="25"
                :precision="0"
              ></el-input-number>
            </div>
            <div class="item">
              <span>外展最大值°：</span>
              <el-input-number
                v-model="abduction"
                :min="5"
                :max="25"
                :precision="0"
              ></el-input-number>
            </div>
            <div class="item">
              <span>内翻最大值°：</span>
              <el-input-number
                v-model="varus"
                :min="5"
                :max="25"
                :precision="0"
              ></el-input-number>
            </div>
            <div class="item">
              <span>外翻最大值°：</span>
              <el-input-number
                v-model="valgus"
                :min="5"
                :max="25"
                :precision="0"
              ></el-input-number>
            </div>
          </div>

          <div class="right">
            <div class="item">
              <span>重复次数：</span>
              <el-input-number
                v-model="num"
                :min="3"
                :max="10"
                :precision="0"
              ></el-input-number>
            </div>
            <div class="item">
              <span>向心比：</span>
              <el-input-number
                v-model="entadRate"
                :min="1"
                :max="10"
                :precision="0"
              ></el-input-number>
            </div>
            <div class="item">
              <span>保持比：</span>
              <el-input-number
                v-model="keepdRate"
                :min="0"
                :max="10"
                :precision="0"
              ></el-input-number>
            </div>
            <div class="item">
              <span>离心比：</span>
              <el-input-number
                v-model="offcenterRate"
                :min="1"
                :max="10"
                :precision="0"
              ></el-input-number>
            </div>
          </div>
        </div>
      </div>

      <!-- 按钮组 -->
      <div class="btn">
        <el-button class="item" type="success" @click="handleStart"
          >开始训练</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'train-parameter',

  data() {
    return {
      plantarFlexion: 30, // 跖屈
      dorsiflex: 20, // 背屈
      adduction: 25, // 内收
      abduction: 20, // 外展
      varus: 30, // 内翻
      valgus: 20, // 外翻

      num: 10, // 重复次数，3~10
      entadRate: 1, // 向心比，默认是1
      keepdRate: 0, // 保持比，默认是0
      offcenterRate: 1, // 离心比，默认是1

      fullscreenLoading: false // 加载动画
    }
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
     * @description: 开始训练
     */
    handleStart() {
      this.fullscreenLoading = true
      window.sessionStorage.setItem(
        'train-parameter-obj',
        JSON.stringify({
          plantarFlexion: this.plantarFlexion,
          dorsiflex: this.dorsiflex,
          adduction: this.adduction,
          abduction: this.abduction,
          varus: this.varus,
          valgus: this.valgus,

          num: this.num,
          entadRate: this.entadRate,
          keepdRate: this.keepdRate,
          offcenterRate: this.offcenterRate
        })
      )

      setTimeout(() => {
        this.fullscreenLoading = false
        this.$router.push({
          path: '/train-plantarFlexion'
        })
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
.train-parameter {
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
      flex: 1;
      @include flex(row, center, center);
      .set {
        width: 100%;
        @include flex(row, space-around, center);
        .left {
          @include flex(column, stretch, center);
          .item {
            margin: 20px 0;
          }
        }
        .right {
          @include flex(column, stretch, center);
          .item {
            margin: 20px 0;
          }
        }
      }
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

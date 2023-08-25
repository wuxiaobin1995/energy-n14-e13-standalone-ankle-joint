<!--
 * @Author      : Mr.bin
 * @Date        : 2022-06-23 09:06:38
 * @LastEditTime: 2023-08-22 09:09:15
 * @Description : home
-->
<template>
  <div class="home">
    <div class="wrapper">
      <div class="main-photo">
        <el-image
          :style="{ display: 'none' }"
          class="item0"
          :src="src0"
          fit="scale-down"
        ></el-image>
      </div>
      <div class="one">
        <!-- <el-image
          class="item item4"
          :src="src4"
          fit="scale-down"
          @click.native="handleClick('src4')"
        ></el-image> -->
      </div>
      <div class="two">
        <el-image
          class="item item2"
          :src="src2"
          fit="scale-down"
          @click.native="handleClick('src2')"
        ></el-image>
        <el-image
          class="item item3"
          :src="src3"
          fit="scale-down"
          @click.native="handleClick('src3')"
        ></el-image>
      </div>
      <div class="three">
        <el-image
          class="item item1"
          :src="src1"
          fit="scale-down"
          @click.native="handleClick('src1')"
        ></el-image>
        <el-image
          class="item item5"
          :src="src5"
          fit="scale-down"
          @click.native="handleClick('src5')"
        ></el-image>
      </div>

      <!-- 数据记录选择弹窗 -->
      <el-dialog
        :visible.sync="centerDialogVisible"
        width="50%"
        center
        top="35vh"
        :show-close="false"
      >
        <div class="record-select-wrapper">
          <el-button class="btn" type="success" @click="handleGoTestRecord"
            >测试记录</el-button
          >
          <el-button class="btn" type="primary" @click="handleGoTrainRecord"
            >训练记录</el-button
          >
          <!-- <el-button class="btn" type="warning" @click="handleGoMttRecord"
            >MTT记录</el-button
          > -->
        </div>
      </el-dialog>

      <!-- 语音相关 -->
      <!-- <div class="audio-control">
        <div class="title">语音功能</div>
        <el-switch
          v-model="switchValue"
          active-text="开"
          inactive-text="关"
          @change="handleSwitchChange"
        >
        </el-switch>
      </div> -->

      <!-- 免责声明 -->
      <!-- <div class="disclaimer">
        <el-button
          type="danger"
          size="small"
          round
          @click="dialogVisible = true"
          >用 户 告 知</el-button
        >
      </div> -->
      <el-dialog
        title="用户告知"
        :visible.sync="dialogVisible"
        width="40%"
        center
      >
        <div>
          终端用户名称：<span :style="{ color: 'red' }">{{ name }}</span>
        </div>
        <div>
          设备编号：<span :style="{ color: 'red' }">{{ deviceId }}</span>
        </div>
        <div>
          <h3>为了避免纠纷，特做如下说明：</h3>
          <p>
            1、请用户核对上面的"终端用户名称"，若该名称和你目前的名称不相符，请及时联系厂家（电话：0750-6318728）
          </p>
          <p>
            2、若长时间未告知厂家，而后续出现问题需要厂家提供服务时，则合同上的一切承诺的售后服务等将失效！
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="dialogVisible = false"
            >已 阅</el-button
          >
        </span>
      </el-dialog>
    </div>

    <!-- 打开控制台按钮 -->
    <el-button
      class="btn-control"
      type="info"
      size="mini"
      @click="handleOpenDev"
      >Open Dev</el-button
    >
  </div>
</template>

<script>
/* 用于打开控制台 */
import { remote } from 'electron'

export default {
  name: 'home',

  data() {
    return {
      src0: require('@/assets/img/Home/设备实物.png'),
      src1: require('@/assets/img/Home/用户.png'),
      src2: require('@/assets/img/Home/测试模块.png'),
      src3: require('@/assets/img/Home/训练模块.png'),
      src4: require('@/assets/img/Home/MTT模块.png'),
      src5: require('@/assets/img/Home/数据记录.png'),

      centerDialogVisible: false, // 数据记录选择弹窗

      /* 语音相关 */
      switchValue: null,

      /* 免责声明 */
      dialogVisible: false,
      name: window.localStorage.getItem('disclaimer_name'),
      deviceId: window.localStorage.getItem('disclaimer_device_id')
    }
  },

  created() {
    this.switchValue = this.$store.state.voiceSwitch
  },

  methods: {
    /**
     * @description: 页面跳转
     * @param {String} src
     */
    handleClick(src) {
      if (src === 'src1') {
        this.$router.push({
          path: '/user'
        })
      } else if (src === 'src2') {
        if (this.$store.state.currentUserInfo.userId) {
          if (this.$store.state.isBluetooth) {
            if (
              this.$store.state.zeroStandard.xStandard !== null &&
              this.$store.state.zeroStandard.yStandard !== null &&
              this.$store.state.zeroStandard.zStandard !== null
            ) {
              this.$router.push({
                path: '/test-introduce'
              })
            } else {
              this.$confirm(`检测到您还没有校准调零！`, '提示', {
                type: 'warning',
                center: true,
                showCancelButton: false,
                confirmButtonText: '调 零'
              })
                .then(() => {
                  this.$router.push({
                    path: '/set-zero'
                  })
                })
                .catch(() => {})
            }
          } else {
            this.$confirm(`检测到您还没有连接蓝牙！`, '提示', {
              type: 'warning',
              center: true,
              showCancelButton: false,
              confirmButtonText: '前去连接'
            })
              .then(() => {
                this.$router.push({
                  path: '/set-bluetooth-connect'
                })
              })
              .catch(() => {})
          }
        } else {
          this.$confirm(
            `检测到您还没有选择用户，请先到用户页面进行选择！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showCancelButton: false,
              confirmButtonText: '确 定'
            }
          )
            .then(() => {
              this.$router.push({
                path: '/user'
              })
            })
            .catch(() => {})
        }
      } else if (src === 'src3') {
        if (this.$store.state.currentUserInfo.userId) {
          if (this.$store.state.isBluetooth) {
            if (
              this.$store.state.zeroStandard.xStandard !== null &&
              this.$store.state.zeroStandard.yStandard !== null &&
              this.$store.state.zeroStandard.zStandard !== null
            ) {
              this.$router.push({
                path: '/train-parameter'
              })
            } else {
              this.$confirm(`检测到您还没有校准调零！`, '提示', {
                type: 'warning',
                center: true,
                showCancelButton: false,
                confirmButtonText: '调 零'
              })
                .then(() => {
                  this.$router.push({
                    path: '/set-zero'
                  })
                })
                .catch(() => {})
            }
          } else {
            this.$confirm(`检测到您还没有连接蓝牙！`, '提示', {
              type: 'warning',
              center: true,
              showCancelButton: false,
              confirmButtonText: '前去连接'
            })
              .then(() => {
                this.$router.push({
                  path: '/set-bluetooth-connect'
                })
              })
              .catch(() => {})
          }
        } else {
          this.$confirm(
            `检测到您还没有选择用户，请先到用户页面进行选择！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showCancelButton: false,
              confirmButtonText: '确 定'
            }
          )
            .then(() => {
              this.$router.push({
                path: '/user'
              })
            })
            .catch(() => {})
        }
      } else if (src === 'src4') {
        // this.$confirm(`请连接对应机械部分！`, '提示', {
        //   type: 'warning',
        //   center: true,
        //   showCancelButton: false,
        //   confirmButtonText: '确 定'
        // })
        //   .then(() => {})
        //   .catch(() => {})
      } else if (src === 'src5') {
        if (this.$store.state.currentUserInfo.userId) {
          this.centerDialogVisible = true
        } else {
          this.$confirm(
            `检测到您还没有选择用户，请先到用户页面进行选择！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showCancelButton: false,
              confirmButtonText: '确 定'
            }
          )
            .then(() => {
              this.$router.push({
                path: '/user'
              })
            })
            .catch(() => {})
        }
      }
    },

    /**
     * @description: 语音开关
     */
    handleSwitchChange() {
      if (this.switchValue === true) {
        this.$store.dispatch('setVoiceSwitch', true)
      } else {
        this.$store.dispatch('setVoiceSwitch', false)
      }
    },

    /**
     * @description: 打开控制台
     */
    handleOpenDev() {
      this.$prompt('请输入密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^htpm$/,
        inputErrorMessage: '密码不正确',
        showClose: true,
        closeOnClickModal: false
      })
        .then(() => {
          try {
            remote.getCurrentWebContents().openDevTools()
          } catch (err) {
            this.$message({
              type: 'error',
              message: `打开控制台失败：${err}`
            })
          }
        })
        .catch(() => {})
    },

    /**
     * @description: 跳转至测试记录页
     */
    handleGoTestRecord() {
      this.$router.push({ path: '/test-record' })
    },
    /**
     * @description: 跳转至训练记录页
     */
    handleGoTrainRecord() {
      this.$router.push({ path: '/train-record' })
    },
    /**
     * @description: 跳转至MTT记录页
     */
    handleGoMttRecord() {
      this.$router.push({ path: '/mtt-record' })
    }
  }
}
</script>

<style lang="scss" scoped>
.home {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 86%;
    height: 90%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    position: relative;

    .item0 {
      width: 560px;
    }
    .item {
      width: 130px;
    }

    .main-photo {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 20px;
    }
    .one {
      margin-top: 100px;
      @include flex(row, center, center);
      // .item3 {
      //   margin-right: 70px;
      // }
    }
    .two {
      @include flex(row, center, center);
      .item2 {
        margin-right: 230px;
      }
      .item4 {
        margin-left: 230px;
      }
    }
    .three {
      margin-top: 80px;
      @include flex(row, center, center);
      .item1 {
        margin-right: 420px;
      }
      .item5 {
        margin-left: 420px;
      }
    }

    /* 数据记录选择弹窗 */
    .record-select-wrapper {
      @include flex(row, space-around, center);
      .btn {
        font-size: 30px;
        margin-bottom: 15px;
      }
    }

    /* 语音相关 */
    .audio-control {
      @include flex(column, center, center);
      position: absolute;
      left: 30px;
      top: 20px;
      .title {
        margin-bottom: 10px;
        font-size: 22px;
        font-weight: 700;
      }
    }

    /* 免责声明 */
    .disclaimer {
      position: absolute;
      left: 30px;
      top: 100px;
    }
  }

  /* 打开控制台按钮 */
  .btn-control {
    position: absolute;
    right: 0;
    bottom: 0;
  }
}
</style>

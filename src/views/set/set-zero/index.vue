<!--
 * @Author      : Mr.bin
 * @Date        : 2023-07-25 09:52:26
 * @LastEditTime: 2023-07-26 11:13:09
 * @Description : 校准调零页面
-->
<template>
  <div class="set-zero">
    <div class="wrapper">
      <el-page-header
        class="page"
        title="返回首页"
        content="校准调零"
        @back="handleToHome"
      ></el-page-header>

      <div class="text">请让踏板回到初始位置的前提下，点击“调零”按钮！</div>
      <div class="show">
        <div class="show__item">
          绕x轴方向基准值：{{ xStandard === null ? '未调零' : xStandard }}°
        </div>
        <div class="show__item">
          绕y轴方向基准值：{{ yStandard === null ? '未调零' : yStandard }}°
        </div>
        <div class="show__item">
          绕z轴方向基准值：{{ zStandard === null ? '未调零' : zStandard }}°
        </div>
      </div>
      <el-button class="btn__zero" type="primary" @click="handleSetZero"
        >调 零</el-button
      >
      <el-button class="btn__refresh" type="info" @click="handleRefresh"
        >刷 新</el-button
      >
    </div>
  </div>
</template>

<script>
/* 串口通信库 */
import SerialPort from 'serialport'
import Readline from '@serialport/parser-readline'

export default {
  name: 'set-zero',

  data() {
    return {
      /* 串口相关变量 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200, // 默认波特率115200

      /* 其他 */
      xStandard: null,
      yStandard: null,
      zStandard: null
    }
  },

  created() {
    this.xStandard = this.$store.state.zeroStandard.xStandard
    this.yStandard = this.$store.state.zeroStandard.yStandard
    this.zStandard = this.$store.state.zeroStandard.zStandard

    this.initSerialPort()
  },
  beforeDestroy() {
    if (this.usbPort) {
      if (this.usbPort.isOpen) {
        this.usbPort.close()
      }
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
     * @description: 初始化串口对象
     */
    initSerialPort() {
      SerialPort.list()
        .then(ports => {
          /* 遍历设备的USB串口，目标设备需安装驱动 */
          let comPath = ''
          for (const port of ports) {
            if (/^USB/.test(port.pnpId)) {
              comPath = port.path
              break
            }
          }

          /* 验证USB有没有连接到电脑，但不能验证有无数据发送给上位机 */
          if (comPath) {
            this.$notify({
              title: '通知',
              message: `连接到串口：${comPath}；波特率为：${this.scmBaudRate}`,
              type: 'success',
              position: 'bottom-right',
              duration: 2000
            })

            /**
             * @description: 创建串口实例
             * @param {String} comPath 串行端口的系统路径。例如：在Mac、Linux上的/dev/tty.XXX或Windows上的COM1
             * @param {Object} 配置项
             */
            this.usbPort = new SerialPort(comPath, {
              baudRate: this.scmBaudRate,
              autoOpen: false // 是否自动开启串口
            })
            /* 调用 this.usbPort.open() 成功时触发（开启串口成功） */
            this.usbPort.on('open', () => {})
            /* 调用 this.usbPort.open() 失败时触发（开启串口失败） */
            this.usbPort.on('error', () => {
              this.$getLogger('串口开启失败')
              this.$alert(
                `请重新连接USB蓝牙适配器，然后点击"刷新页面"按钮！`,
                '串口开启失败',
                {
                  type: 'error',
                  showClose: false,
                  center: true,
                  confirmButtonText: '刷新页面',
                  callback: () => {
                    this.handleRefresh()
                  }
                }
              )
            })

            this.parser = this.usbPort.pipe(new Readline({ delimiter: '\n' }))
            this.parser.on('data', data => {
              console.log(data) // {String} -2.72,1.40,20.65
              const dataArray = data.split(',')

              this.xStandard = parseFloat(parseFloat(dataArray[0]).toFixed(0)) // 绕x角度（超越±180°时会减少）
              this.yStandard = parseFloat(parseFloat(dataArray[1]).toFixed(0)) // 绕y角度（超越±90°时会减少，需要特殊处理）
              this.zStandard = parseFloat(parseFloat(dataArray[2]).toFixed(0)) // 绕z角度（超越±180°时会减少）

              /* 数据校验 */
              if (
                !isNaN(this.xStandard) &&
                !isNaN(this.yStandard) &&
                !isNaN(this.zStandard)
              ) {
                /* 关闭串口 */
                if (this.usbPort) {
                  if (this.usbPort.isOpen) {
                    this.usbPort.close()
                  }
                }
                /* 设置Vuex中的传感器基准值 */
                this.$store
                  .dispatch('setZeroStandard', {
                    xStandard: this.xStandard,
                    yStandard: this.yStandard,
                    zStandard: this.zStandard
                  })
                  .then(() => {
                    this.$message({
                      message: '调零成功',
                      type: 'success',
                      duration: 2000
                    })
                  })
                  .catch(err => {
                    this.$alert(
                      `${err}。请点击"刷新页面"按钮，然后重新调零！`,
                      '调零失败',
                      {
                        type: 'error',
                        showClose: false,
                        center: true,
                        confirmButtonText: '刷新页面',
                        callback: () => {
                          this.handleRefresh()
                        }
                      }
                    )
                  })
              }
            })
          } else {
            this.$getLogger('没有检测到USB蓝牙适配器')
            this.$confirm(
              `请重新连接USB蓝牙适配器，然后点击"刷新页面"按钮！`,
              '没有检测到USB连接',
              {
                type: 'error',
                showClose: false,
                closeOnClickModal: false,
                closeOnPressEscape: false,
                center: true,
                confirmButtonText: '刷新页面',
                cancelButtonText: '返回首页'
              }
            )
              .then(() => {
                this.handleRefresh()
              })
              .catch(() => {
                this.handleToHome()
              })
          }
        })
        .catch(err => {
          this.$getLogger('初始化SerialPort.list失败')
          this.$confirm(
            `${err}。请重新连接USB蓝牙适配器，然后点击"刷新页面"按钮！`,
            `初始化SerialPort.list失败`,
            {
              type: 'error',
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              center: true,
              confirmButtonText: '刷新页面',
              cancelButtonText: '返回首页'
            }
          )
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.handleToHome()
            })
        })
    },

    /**
     * @description: 调零按钮
     */
    handleSetZero() {
      if (this.usbPort) {
        if (!this.usbPort.isOpen) {
          this.usbPort.open()
        }
      }

      this.usbPort.write('Y')
    },

    /**
     * @description: 刷新页面，通过路由跳转的方式实现
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: JSON.stringify('/set-zero'),
          duration: JSON.stringify(300)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.set-zero {
  width: 100%;
  height: 100%;
  @include flex(column, center, center);

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

    .text {
      font-size: 38px;
      margin-bottom: 100px;
      color: red;
    }

    .show {
      width: 100%;
      @include flex(row, center, center);
      margin-bottom: 100px;
      .show__item {
        font-size: 24px;
        margin: 0 50px;
      }
    }

    .btn__zero {
      font-size: 42px;
      margin-bottom: 40px;
    }
    .btn__refresh {
      font-size: 42px;
    }
  }
}
</style>

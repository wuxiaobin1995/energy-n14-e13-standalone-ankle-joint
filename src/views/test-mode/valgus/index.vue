<!--
 * @Author      : Mr.bin
 * @Date        : 2023-07-26 10:22:31
 * @LastEditTime: 2023-07-26 15:16:47
 * @Description : 外翻
-->
<template>
  <div class="test-valgus">
    <div class="wrapper">
      <div class="title">踝关节活动度测试 - 外翻</div>

      <div class="content">
        <div>实时值：{{ xAngle }}°</div>
        <div>最大值：{{ maxAngle }}°</div>
      </div>

      <!-- 按钮组 -->
      <div class="btn">
        <el-button
          class="item"
          type="success"
          @click="handleStart"
          :disabled="isStarting"
          >开始测量</el-button
        >
        <el-button
          class="item"
          type="danger"
          @click="handleFinish"
          :disabled="!isStarting || isFinished"
          >结束测量</el-button
        >
        <el-button
          class="item"
          type="primary"
          @click="handlePdf"
          :disabled="!isFinished"
          >查看报告</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
/* 串口通信库 */
import SerialPort from 'serialport'
import Readline from '@serialport/parser-readline'

/* 数据库 */
import { initDB } from '@/db/index.js'

export default {
  name: 'test-valgus',

  data() {
    return {
      /* 按钮控制 */
      isStarting: false, // 是否开始
      isFinished: false, // 是否完成

      /* 串口相关 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200,

      /* 其他 */
      xStandard: null,
      yStandard: null,
      zStandard: null,

      xAngle: null,
      yAngle: null,
      zAngle: null,

      angleArray: [], // 角度数组
      maxAngle: null, // 最大角度值（结果）
      pdfTime: ''
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
     * @description: 刷新页面，通过路由跳转的方式实现
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: JSON.stringify('/test-valgus'),
          duration: JSON.stringify(300)
        }
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
            this.usbPort.on('open', () => {
              this.isStarting = true
            })
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
              // console.log(data) // {String} -2.72,1.40,20.65
              const dataArray = data.split(',')

              // const x = parseFloat(parseFloat(dataArray[0]).toFixed(0)) // 绕x角度（超越±180°时会减少）
              const y = parseFloat(parseFloat(dataArray[1]).toFixed(0)) // 绕y角度（超越±90°时会减少，需要特殊处理）
              // const z = parseFloat(parseFloat(dataArray[2]).toFixed(0)) // 绕z角度（超越±180°时会减少）
              console.log(y)

              this.xAngle = Math.abs(y - this.yStandard)

              /* 数据校验 */
              if (!isNaN(this.xAngle)) {
                // 防止内存溢出
                if (this.angleArray.length >= 1000) {
                  this.usbPort.write('N')
                }

                this.angleArray.push(this.xAngle)
                this.maxAngle = Math.max(...this.angleArray)
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
     * @description: 开始测量
     */
    handleStart() {
      this.angleArray = []

      if (this.usbPort) {
        if (!this.usbPort.isOpen) {
          this.usbPort.open()
        }
      }

      this.usbPort.write('Y')
    },

    /**
     * @description: 结束测量
     */
    handleFinish() {
      this.saveData()
    },

    /**
     * @description: 查看报告
     */
    handlePdf() {
      this.$router.push({
        path: '/test-pdf',
        query: {
          userId: JSON.stringify(this.$store.state.currentUserInfo.userId),
          pdfTime: JSON.stringify(this.pdfTime),
          routerName: JSON.stringify('/test-introduce')
        }
      })
    },

    /**
     * @description: 数据缓存
     */
    saveData() {
      this.usbPort.write('N')

      let resultArray = JSON.parse(
        window.sessionStorage.getItem('test-angleArray')
      )
      resultArray.push(this.maxAngle)
      window.sessionStorage.setItem(
        'test-angleArray',
        JSON.stringify(resultArray)
      )

      /* 保存到数据库 */
      this.pdfTime = this.$moment().format('YYYY-MM-DD HH:mm:ss')
      const hospital = window.localStorage.getItem('hospital')
      const db = initDB()
      db.test_data
        .add({
          hospital: hospital,
          userId: this.$store.state.currentUserInfo.userId,
          userName: this.$store.state.currentUserInfo.userName,
          sex: this.$store.state.currentUserInfo.sex,
          affectedSide: this.$store.state.currentUserInfo.affectedSide,
          height: this.$store.state.currentUserInfo.height,
          weight: this.$store.state.currentUserInfo.weight,
          birthday: this.$store.state.currentUserInfo.birthday,

          pdfTime: this.pdfTime,

          angleResultArray: resultArray,
          type: '踝关节活动度测试'
        })
        .then(() => {
          this.$message({
            message: '数据保存成功，请查看报告',
            type: 'success',
            duration: 1500
          })
        })
        .then(() => {
          this.isFinished = true
        })
        .catch(() => {
          this.$alert(`请点击"返回首页"按钮，然后重新测试！`, '数据保存失败', {
            type: 'error',
            showClose: false,
            center: true,
            confirmButtonText: '返回首页',
            callback: () => {
              this.handleToHome()
            }
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.test-valgus {
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
    @include flex(column, stretch, stretch);

    .title {
      font-size: 30px;
    }

    .content {
      flex: 1;
    }

    /* 按钮组 */
    .btn {
      margin-bottom: 10px;
      @include flex(row, center, center);
      .item {
        font-size: 22px;
        margin: 0 60px;
      }
    }
  }
}
</style>

<!--
 * @Author      : Mr.bin
 * @Date        : 2023-07-27 15:59:39
 * @LastEditTime: 2023-10-08 15:28:07
 * @Description : 具体训练
-->
<template>
  <div class="train-measure">
    <div class="wrapper">
      <el-page-header
        class="page"
        title="返回上一页"
        :content="parameter.side + '-' + parameter.selectTrain"
        @back="handleBack"
      ></el-page-header>

      <div class="val">
        <div class="result-rate">
          <div class="title">完成度</div>
          <div class="num">{{ resultRate }} %</div>
        </div>
        <div class="max-angle">
          <div class="title">最大角度(°)</div>
          <div class="num">{{ maxDistance }}</div>
        </div>
        <div class="num-wrapper">
          <div class="title">剩余次数</div>
          <div class="num">
            <span class="now-num">{{ nowNum }}</span> / {{ parameter.num }}
          </div>
        </div>
      </div>

      <div class="chart">
        <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
      </div>

      <div class="btn">
        <el-button
          class="item"
          type="primary"
          :disabled="!startAllow"
          @click="handleStart"
          >开始训练</el-button
        >
        <el-button
          class="item"
          type="success"
          :disabled="!pdfAllow"
          @click="handlePdf"
          >查看报告</el-button
        >
        <el-button class="item" type="info" @click="handleRefresh"
          >刷新页面</el-button
        >
        <el-button class="item" type="danger" @click="handleBack"
          >返 回</el-button
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
  name: 'train-measure',

  data() {
    return {
      /* 配置参数 */
      parameter: {},

      /* 串口相关 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200,

      /* 图形相关变量 */
      myChart: null,
      option: {},
      xData: [], // 横坐标数组

      /* 控制相关 */
      startAllow: true, // 开始按钮的禁用与否
      pdfAllow: false, // 查看PDF按钮的禁用与否

      /* 其他 */
      xStandard: null,
      yStandard: null,
      zStandard: null,

      angleDataOneArray: [], // 单个的角度数组，用于计算次数
      angleDataShowArray: [], // 展示的角度数组
      angleDataArray: [], // 完整的角度数组

      nowNum: 0, // 实时的次数
      resultRate: 0, // 最终完成比例
      maxDistance: 0, // 最高点°
      original: 4, // 最低点°，暂定±4°以内
      pdfTime: null, // 该次训练完成时间

      /* 参考曲线 */
      standardGraph: [], // 单个基准图形
      referenceGraph: [] // 最终图形
    }
  },

  created() {
    this.parameter = JSON.parse(
      window.sessionStorage.getItem('train-parameter-obj')
    )

    this.xStandard = this.$store.state.zeroStandard.xStandard
    this.yStandard = this.$store.state.zeroStandard.yStandard
    this.zStandard = this.$store.state.zeroStandard.zStandard

    this.initSerialPort()
  },
  mounted() {
    this.initChart()
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
     * @description: 回到上一页
     */
    handleBack() {
      this.$router.push({
        path: '/train-parameter'
      })
    },

    /**
     * @description: 刷新页面，通过路由跳转的方式实现
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: JSON.stringify('/train-measure'),
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
            this.usbPort.on('open', () => {})
            /* 调用 this.usbPort.open() 失败时触发（开启串口失败） */
            this.usbPort.on('error', () => {
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

              const x = parseFloat(parseFloat(dataArray[0]).toFixed(0)) // 绕x角度（超越±180°时会减少）
              const y = parseFloat(parseFloat(dataArray[1]).toFixed(0)) // 绕y角度（超越±90°时会减少，需要特殊处理）
              const z = parseFloat(parseFloat(dataArray[2]).toFixed(0)) // 绕z角度（超越±180°时会减少）

              let angle = 0
              if (this.parameter.selectTrain === '跖屈') {
                angle = this.xStandard - x
              } else if (this.parameter.selectTrain === '背屈') {
                angle = x - this.xStandard
              } else if (this.parameter.selectTrain === '内收') {
                angle = Math.abs(z - this.zStandard)
              } else if (this.parameter.selectTrain === '外展') {
                angle = Math.abs(z - this.zStandard)
              } else if (this.parameter.selectTrain === '内翻') {
                angle = Math.abs(y - this.yStandard)
              } else if (this.parameter.selectTrain === '外翻') {
                angle = Math.abs(y - this.yStandard)
              }

              /* 数据校验 */
              if (!isNaN(angle)) {
                this.angleDataOneArray.push(angle) // 单个的角度数组，用于计算次数
                this.angleDataShowArray.push(angle) // 展示的角度数组
                this.angleDataArray.push(angle) // 完整的角度数组

                this.option.series[0].data = this.angleDataShowArray
                this.myChart.setOption(this.option)

                /* 实时递增次数 */
                if (
                  this.angleDataOneArray.length === this.standardGraph.length
                ) {
                  this.angleDataOneArray = []
                  this.nowNum += 1
                }

                /* 展示曲线走到终点重新开始 */
                if (
                  this.angleDataShowArray.length === this.referenceGraph.length
                ) {
                  this.angleDataShowArray = []
                }

                /* 训练完成 */
                if (this.nowNum === this.parameter.num) {
                  if (this.usbPort) {
                    if (this.usbPort.isOpen) {
                      /* 关闭串口通信 */
                      this.usbPort.close()

                      /* 计算完成度 */
                      const matchArray = [] // 参考曲线数组
                      const yesArray = [] // 达标数据数组
                      for (let i = 0; i < this.nowNum; i++) {
                        matchArray.push(...this.standardGraph)
                      }
                      for (let i = 0; i < matchArray.length; i++) {
                        const relative = Math.abs(
                          this.angleDataArray[i] - matchArray[i]
                        )
                        if (relative <= this.original) {
                          yesArray.push(relative)
                        }
                      }
                      this.resultRate = parseFloat(
                        ((yesArray.length / matchArray.length) * 100).toFixed(1)
                      )
                      this.startAllow = true
                      /* 验证一下结果正确性 */
                      if (this.resultRate) {
                        /* 保存到数据库 */
                        this.pdfTime = this.$moment().format(
                          'YYYY-MM-DD HH:mm:ss'
                        )
                        const hospital = window.localStorage.getItem('hospital')
                        const db = initDB()
                        db.train_data
                          .add({
                            hospital: hospital,
                            userId: this.$store.state.currentUserInfo.userId,
                            userName:
                              this.$store.state.currentUserInfo.userName,
                            sex: this.$store.state.currentUserInfo.sex,
                            affectedSide:
                              this.$store.state.currentUserInfo.affectedSide,
                            height: this.$store.state.currentUserInfo.height,
                            weight: this.$store.state.currentUserInfo.weight,
                            birthday:
                              this.$store.state.currentUserInfo.birthday,

                            selectTrain: this.parameter.selectTrain, // 训练动作
                            side: this.parameter.side, // 训练侧（左、右）
                            num: this.parameter.num, // 重复次数
                            maxDistance: this.maxDistance, // 最高点°
                            entadRate: this.parameter.entadRate, // 向心比
                            keepdRate: this.parameter.keepdRate, // 保持比
                            offcenterRate: this.parameter.offcenterRate, // 离心比

                            bgArray: matchArray, // 完整参考曲线
                            angleDataArray: this.angleDataArray, // 完整的角度数组

                            resultRate: this.resultRate, // 完成度%

                            pdfTime: this.pdfTime,
                            type: '踝关节活动度训练'
                          })
                          .then(() => {
                            this.$message({
                              message: '数据保存成功',
                              type: 'success',
                              duration: 2000
                            })
                            this.pdfAllow = true
                          })
                          .catch(() => {
                            this.$alert(
                              `请重新连接USB线，然后点击"返回上一页"按钮，重新训练！`,
                              '数据保存失败',
                              {
                                type: 'error',
                                showClose: false,
                                center: true,
                                confirmButtonText: '返回上一页',
                                callback: () => {
                                  this.handleBack()
                                }
                              }
                            )
                          })
                      } else {
                        this.$message({
                          message: `完成比例为${this.resultRate}，数值不正常，请点击"开始训练"按钮重新测试`,
                          type: 'error'
                        })
                      }
                    }
                  }
                }
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
                this.handleBack()
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
              this.handleBack()
            })
        })
    },

    /**
     * @description: 图形初始化
     */
    initChart() {
      /* 计算最终参考图形 */
      if (this.parameter.selectTrain === '跖屈') {
        this.maxDistance = this.parameter.plantarFlexion
      } else if (this.parameter.selectTrain === '背屈') {
        this.maxDistance = this.parameter.dorsiflex
      } else if (this.parameter.selectTrain === '内收') {
        this.maxDistance = this.parameter.adduction
      } else if (this.parameter.selectTrain === '外展') {
        this.maxDistance = this.parameter.abduction
      } else if (this.parameter.selectTrain === '内翻') {
        this.maxDistance = this.parameter.varus
      } else if (this.parameter.selectTrain === '外翻') {
        this.maxDistance = this.parameter.valgus
      }
      const time = 1 // 间隔时长s

      // 开始段
      for (let i = 0; i <= time * 5; i++) {
        this.standardGraph.push(this.original)
      }
      // 中间段，这里的15目前是固定的，后续可能会改其他值
      const intervalUp =
        (this.maxDistance - this.original) / (this.parameter.entadRate * 15) // 上升间隔值
      const intervalDown =
        (this.maxDistance - this.original) / (this.parameter.offcenterRate * 15) // 下降间隔值
      let sum = this.original
      for (let i = 0; i < this.parameter.entadRate * 15; i++) {
        sum = parseFloat(sum + intervalUp)
        this.standardGraph.push(sum)
      }
      for (let i = 0; i < this.parameter.keepdRate * 15; i++) {
        this.standardGraph.push(sum)
      }
      for (let i = 0; i < this.parameter.offcenterRate * 15 - 1; i++) {
        sum = parseFloat(sum - intervalDown)
        this.standardGraph.push(sum)
      }
      // 结束段
      for (let i = 0; i < time * 5; i++) {
        this.standardGraph.push(this.original)
      }
      // 最终复制3个
      for (let i = 0; i < 3; i++) {
        this.referenceGraph.push(...this.standardGraph)
      }

      // 计算横坐标数组
      this.xData = []
      for (let i = 0; i < this.referenceGraph.length; i++) {
        this.xData.push(parseFloat((i * 0.1).toFixed(1)))
      }

      this.myChart = this.$echarts.init(document.getElementById('chart'))
      this.option = {
        xAxis: {
          type: 'category',
          name: '单位：秒',
          data: this.xData,
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {
          type: 'value',
          name: '单位：角度(°)',
          min: 0
        },
        series: [
          {
            data: [],
            type: 'line',
            lineStyle: {
              color: 'rgba(255, 0, 0, 1)'
            },
            smooth: true,
            showSymbol: false
          },
          {
            data: this.referenceGraph,
            type: 'line',
            smooth: false,
            showSymbol: false,
            lineStyle: {
              // width: 40,
              opacity: 0.8
              // join: 'miter'
            }
          }
        ],
        animation: false
      }

      this.myChart.setOption(this.option)
    },

    /**
     * @description: 开始按钮
     */
    handleStart() {
      this.startAllow = false
      this.pdfAllow = false

      this.angleDataOneArray = []
      this.angleDataShowArray = []
      this.angleDataArray = []

      this.nowNum = 0
      this.resultRate = 0

      if (this.usbPort) {
        if (!this.usbPort.isOpen) {
          this.usbPort.open()
        }
      }

      this.usbPort.write('Y')
    },

    /**
     * @description: 查看PDF按钮
     */
    handlePdf() {
      this.$router.push({
        path: '/train-pdf',
        query: {
          userId: JSON.stringify(this.$store.state.currentUserInfo.userId),
          pdfTime: JSON.stringify(this.pdfTime),
          routerName: JSON.stringify('/train-parameter')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.train-measure {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 96%;
    height: 96%;
    border-radius: 20px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 40px 20px;
    position: relative;
    @include flex(column, stretch, stretch);

    .page {
      position: absolute;
      top: 20px;
      left: 30px;
    }

    .val {
      @include flex(row, space-around, center);
      .result-rate {
        @include flex(column, center, center);
        .title {
          font-size: 22px;
          margin-bottom: 5px;
        }
        .num {
          background-color: rgba(155, 155, 155, 0.6);
          border-radius: 4px;
          padding: 2px 10px;
          font-size: 18px;
        }
      }
      .max-angle {
        @include flex(column, center, center);
        .title {
          font-size: 22px;
          margin-bottom: 5px;
        }
        .num {
          background-color: rgba(155, 155, 155, 0.6);
          border-radius: 4px;
          padding: 2px 10px;
          font-size: 18px;
        }
      }
      .num-wrapper {
        @include flex(column, center, center);
        .title {
          font-size: 22px;
          margin-bottom: 5px;
        }
        .num {
          font-size: 18px;
          .now-num {
            background-color: rgba(155, 155, 155, 0.6);
            border-radius: 4px;
            padding: 2px 10px;
          }
        }
      }
    }

    .chart {
      flex: 1;
      width: 100%;
    }

    .btn {
      @include flex(row, center, center);
      .item {
        font-size: 22px;
        margin: 0 60px;
        width: 160px;
      }
    }
  }
}
</style>

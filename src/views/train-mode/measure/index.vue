<!--
 * @Author      : Mr.bin
 * @Date        : 2023-07-27 15:59:39
 * @LastEditTime: 2023-07-28 17:39:47
 * @Description : 跖屈
-->
<template>
  <div class="train-measure">
    <div class="wrapper">
      <el-page-header
        class="page"
        title="返回上一页"
        :content="parameter.selectTrain"
        @back="handleBack"
      ></el-page-header>

      <div class="chart">
        <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
      </div>

      <div class="btn">
        <el-button class="item" type="primary">开始训练</el-button>
      </div>
    </div>
  </div>
</template>

<script>
/* 串口通信库 */
import SerialPort from 'serialport'
import Readline from '@serialport/parser-readline'

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

      /* 其他 */
      xStandard: null,
      yStandard: null,
      zStandard: null,

      xAngle: null,
      yAngle: null,
      zAngle: null,

      angleDataOneArray: [], // 单个的角度数组，用于计算次数
      angleDataShowArray: [], // 展示的角度数组
      angleDataArray: [], // 完整的角度数组

      nowNum: 0, // 目前的次数
      pdfTime: null, // 该次训练完成时间
      resultRate: 0, // 最终完成比例

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
              // const y = parseFloat(parseFloat(dataArray[1]).toFixed(0)) // 绕y角度（超越±90°时会减少，需要特殊处理）
              // const z = parseFloat(parseFloat(dataArray[2]).toFixed(0)) // 绕z角度（超越±180°时会减少）
              console.log(x)

              this.xAngle = this.xStandard - x

              /* 数据校验 */
              if (!isNaN(this.xAngle)) {
                this.angleDataOneArray.push(this.xAngle) // 单个的角度数组，用于计算次数
                this.angleDataShowArray.push(this.xAngle) // 展示的角度数组
                this.angleDataArray.push(this.xAngle) // 完整的角度数组

                this.option.series[0].data = this.angleDataShowArray
                this.myChart.setOption(this.option)
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
      const original = 2 // 最低点°
      const time = 1 // 间隔时长s
      const maxDistance = this.parameter.plantarFlexion // 最高点°
      // 开始段
      for (let i = 0; i <= time * 5; i++) {
        this.standardGraph.push(original)
      }
      // 中间段，这里的15目前是固定的，后续可能会改其他值
      const intervalUp =
        (maxDistance - original) / (this.parameter.entadRate * 15) // 上升间隔值
      const intervalDown =
        (maxDistance - original) / (this.parameter.offcenterRate * 15) // 下降间隔值
      let sum = original
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
        this.standardGraph.push(original)
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
          name: '单位：度',
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

    .chart {
      flex: 1;
      width: 100%;
    }

    .btn {
      @include flex(column, flex-end, center);
      .item {
        width: 190px;
      }
    }
  }
}
</style>

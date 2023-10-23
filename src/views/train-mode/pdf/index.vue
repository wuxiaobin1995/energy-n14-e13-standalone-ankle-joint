<!--
 * @Author      : Mr.bin
 * @Date        : 2023-10-08 11:20:22
 * @LastEditTime: 2023-10-08 15:20:37
 * @Description : 踝关节训练-PDF报告
-->
<template>
  <div class="train-pdf" v-loading.fullscreen.lock="fullscreenLoading">
    <!-- PDF区域 -->
    <div id="pdf" class="pdf-wrapper">
      <div class="top">
        <el-image class="logo" :src="logoSrc" fit="scale-down"></el-image>

        <div class="title">踝关节-活动度训练报告</div>

        <div class="divider"></div>

        <div class="info">
          <div class="item">{{ pdfData.hospital }}</div>
          <div class="item">姓名：{{ pdfData.userName }}</div>
          <div class="item">性别：{{ pdfData.sex }}</div>
          <div class="item">训练日期：{{ pdfData.pdfTime }}</div>
        </div>

        <div class="divider"></div>
      </div>

      <div class="main">
        <div class="val">
          <div class="left">
            <div class="item">
              训练动作：{{ pdfData.side }}-{{ pdfData.selectTrain }}
            </div>
            <div class="item">完成度：{{ pdfData.resultRate }}%</div>
          </div>
          <div class="right">
            <div class="item">次数：{{ pdfData.num }}</div>
            <div class="item">设定值：{{ pdfData.maxDistance }}°</div>
            <div class="item">
              比值：{{ pdfData.entadRate }}:{{ pdfData.keepdRate }}:{{
                pdfData.offcenterRate
              }}
            </div>
          </div>
        </div>

        <div class="chart">
          <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
        </div>
      </div>
    </div>

    <!-- 按钮组 -->
    <div class="btn">
      <el-button class="item" type="primary" @click="handlePdf"
        >保存PDF</el-button
      >
      <el-button class="item" type="warning" @click="handleGoBack"
        >返 回</el-button
      >
    </div>
  </div>
</template>

<script>
import { initDB } from '@/db/index.js'

export default {
  name: 'train-pdf',

  data() {
    return {
      /* 路由传参 */
      userId: JSON.parse(this.$route.query.userId),
      pdfTime: JSON.parse(this.$route.query.pdfTime),
      routerName: JSON.parse(this.$route.query.routerName),

      fullscreenLoading: false,
      logoSrc: require('@/assets/img/Company_Logo/logo_1.png'), // 公司logo

      pdfData: {}
    }
  },

  mounted() {
    this.getTrainData()
  },

  methods: {
    /**
     * @description: 保存PDF
     */
    handlePdf() {
      this.$htmlToPdf(
        'pdf',
        `踝关节-活动度训练报告 ${this.$moment().format('YYYY-MM-DD HH_mm_ss')}`,
        500
      )
    },

    /**
     * @description: 返回上一页
     */
    handleGoBack() {
      this.$router.push({
        path: this.routerName
      })
    },

    /**
     * @description: 获取对应 [ID、训练时间、类型] 的训练报告源数据，并做相关计算
     */
    getTrainData() {
      const db = initDB()
      this.fullscreenLoading = true
      db.train_data
        .where({
          userId: this.userId,
          pdfTime: this.pdfTime,
          type: '踝关节活动度训练'
        })
        .toArray()
        .then(res => {
          // console.log(res)
          this.pdfData = res[0]
        })
        .then(() => {
          this.initChart()
        })
        .catch(err => {
          this.$confirm(
            `${err}。获取ID为 [${this.userId}] 的用户数据失败，请重试！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              confirmButtonText: '重 试',
              cancelButtonText: '返 回'
            }
          )
            .then(() => {
              this.getTrainData()
            })
            .catch(() => {
              this.handleGoBack()
            })
        })
        .finally(() => {
          this.fullscreenLoading = false
        })
    },

    /**
     * @description: 图形初始化
     */
    initChart() {
      // 计算横坐标数组
      const xData = []
      for (let i = 0; i < this.pdfData.bgArray.length; i++) {
        xData.push(parseFloat((i * 0.1).toFixed(1)))
      }

      const myChart = this.$echarts.init(document.getElementById('chart'))
      const option = {
        xAxis: {
          type: 'category',
          name: '单位：秒',
          data: xData,
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
            data: this.pdfData.angleDataArray,
            type: 'line',
            lineStyle: {
              color: 'rgba(255, 0, 0, 1)'
            },
            smooth: true,
            showSymbol: false
          },
          {
            data: this.pdfData.bgArray,
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

      myChart.setOption(option)
    }
  }
}
</script>

<style lang="scss" scoped>
.train-pdf {
  width: 100vw;
  height: 100vh;
  padding: 10px;
  @include flex(column, stretch, stretch);

  /* PDF区域 */
  .pdf-wrapper {
    flex: 1;
    @include flex(column, stretch, stretch);

    .top {
      position: relative;
      @include flex(column, stretch, center);
      .logo {
        position: absolute;
        top: 10px;
        right: 5px;
        width: 180px;
      }
      .title {
        font-size: 50px;
      }
      .divider {
        margin-top: 15px;
        border: 1px solid rgb(204, 204, 204);
        width: 100%;
      }
      .info {
        width: 100%;
        margin-top: 15px;
        @include flex(row, space-around, center);
        .item {
          font-size: 20px;
        }
      }
    }

    .main {
      flex: 1;
      @include flex(column, center, center);
      .val {
        @include flex(row, space-around, center);
        font-size: 20px;
        width: 100%;
        margin-top: 5px;
        .left {
          @include flex(column, center, flex-start);
        }
        .right {
          @include flex(column, center, flex-start);
        }
        .item {
          margin-bottom: 5px;
        }
      }
      .chart {
        flex: 1;
        width: 100%;
      }
    }
  }

  /* 按钮组 */
  .btn {
    @include flex(row, center, center);
    margin: 10px 0;
    .item {
      font-size: 28px;
      margin: 0 50px;
    }
  }
}
</style>

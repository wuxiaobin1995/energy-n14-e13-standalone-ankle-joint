<!--
 * @Author      : Mr.bin
 * @Date        : 2023-07-26 15:17:22
 * @LastEditTime: 2023-08-23 10:19:32
 * @Description : 踝关节活动度测试-PDF报告
-->
<template>
  <div class="test-pdf" v-loading.fullscreen.lock="fullscreenLoading">
    <!-- PDF区域 -->
    <div id="pdf" class="pdf-wrapper">
      <div class="top">
        <el-image class="logo" :src="logoSrc" fit="scale-down"></el-image>

        <div class="title">踝关节-活动度测试报告</div>

        <div class="divider"></div>

        <div class="info">
          <div class="item">{{ pdfData.hospital }}</div>
          <div class="item">姓名：{{ pdfData.userName }}</div>
          <div class="item">性别：{{ pdfData.sex }}</div>
          <div class="item">测试日期：{{ pdfData.pdfTime }}</div>
        </div>

        <div class="divider"></div>
      </div>

      <div class="main">
        <table border="2" class="table">
          <tr :style="{ height: '60px' }" bgcolor="#E7E6E6" align="center">
            <th>测试部位</th>
            <th>最大活动角度°</th>
            <th>参考范围</th>
            <th>双侧差异</th>
          </tr>
          <tr align="center">
            <td>左跖屈</td>
            <td>{{ pdfData.angleResultArray[0] }}</td>
            <td rowspan="2">40°~50°</td>
            <td rowspan="2">
              {{
                Math.abs(
                  pdfData.angleResultArray[0] - pdfData.angleResultArray[6]
                )
              }}
            </td>
          </tr>
          <tr align="center">
            <td>右跖屈</td>
            <td>{{ pdfData.angleResultArray[6] }}</td>
          </tr>

          <tr align="center">
            <td>左背屈</td>
            <td>{{ pdfData.angleResultArray[1] }}</td>
            <td rowspan="2">20°~30°</td>
            <td rowspan="2">
              {{
                Math.abs(
                  pdfData.angleResultArray[1] - pdfData.angleResultArray[7]
                )
              }}
            </td>
          </tr>
          <tr align="center">
            <td>右背屈</td>
            <td>{{ pdfData.angleResultArray[7] }}</td>
          </tr>

          <tr align="center">
            <td>左内收</td>
            <td>{{ pdfData.angleResultArray[2] }}</td>
            <td rowspan="2">20°~30°</td>
            <td rowspan="2">
              {{
                Math.abs(
                  pdfData.angleResultArray[2] - pdfData.angleResultArray[8]
                )
              }}
            </td>
          </tr>
          <tr align="center">
            <td>右内收</td>
            <td>{{ pdfData.angleResultArray[8] }}</td>
          </tr>

          <tr align="center">
            <td>左外展</td>
            <td>{{ pdfData.angleResultArray[3] }}</td>
            <td rowspan="2">5°~10°</td>
            <td rowspan="2">
              {{
                Math.abs(
                  pdfData.angleResultArray[3] - pdfData.angleResultArray[9]
                )
              }}
            </td>
          </tr>
          <tr align="center">
            <td>右外展</td>
            <td>{{ pdfData.angleResultArray[9] }}</td>
          </tr>

          <tr align="center">
            <td>左内翻</td>
            <td>{{ pdfData.angleResultArray[4] }}</td>
            <td rowspan="2">20°~30°</td>
            <td rowspan="2">
              {{
                Math.abs(
                  pdfData.angleResultArray[4] - pdfData.angleResultArray[10]
                )
              }}
            </td>
          </tr>
          <tr align="center">
            <td>右内翻</td>
            <td>{{ pdfData.angleResultArray[10] }}</td>
          </tr>

          <tr align="center">
            <td>左外翻</td>
            <td>{{ pdfData.angleResultArray[5] }}</td>
            <td rowspan="2">20°~30°</td>
            <td rowspan="2">
              {{
                Math.abs(
                  pdfData.angleResultArray[5] - pdfData.angleResultArray[11]
                )
              }}
            </td>
          </tr>
          <tr align="center">
            <td>右外翻</td>
            <td>{{ pdfData.angleResultArray[11] }}</td>
          </tr>
        </table>
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
  name: 'test-pdf',

  data() {
    return {
      /* 路由传参 */
      userId: JSON.parse(this.$route.query.userId),
      pdfTime: JSON.parse(this.$route.query.pdfTime),
      routerName: JSON.parse(this.$route.query.routerName),

      fullscreenLoading: false,
      logoSrc: require('@/assets/img/Company_Logo/logo_1.png'), // 公司logo

      pdfData: {
        angleResultArray: [null, null, null, null, null, null]
      }
    }
  },

  created() {
    this.getTestData()
  },

  methods: {
    /**
     * @description: 保存PDF
     */
    handlePdf() {
      this.$htmlToPdf(
        'pdf',
        `踝关节-活动度测试报告 ${this.$moment().format('YYYY-MM-DD HH_mm_ss')}`,
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
     * @description: 获取对应 [ID、测试时间、类型] 的测试报告源数据，并做相关计算
     */
    getTestData() {
      const db = initDB()
      this.fullscreenLoading = true
      db.test_data
        .where({
          userId: this.userId,
          pdfTime: this.pdfTime,
          type: '踝关节活动度测试'
        })
        .toArray()
        .then(res => {
          // console.log(res)
          this.pdfData = res[0]
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
              this.getTestData()
            })
            .catch(() => {
              this.handleGoBack()
            })
        })
        .finally(() => {
          this.fullscreenLoading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.test-pdf {
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
      margin-top: 10px;
      .table {
        width: 70%;
        font-size: 26px;
      }
    }
  }

  /* 按钮组 */
  .btn {
    @include flex(row, center, center);
    margin: 20px 0;
    .item {
      font-size: 28px;
      margin: 0 50px;
    }
  }
}
</style>

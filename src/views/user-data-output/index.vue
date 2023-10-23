<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-25 21:29:20
 * @LastEditTime: 2023-10-08 15:29:14
 * @Description : 导出所选用户的数据（测试、训练、......）
-->
<template>
  <div class="user-data-output">
    <div class="wrapper">
      <!-- 顶部部分 -->
      <div class="top">
        <!-- 返回 -->
        <el-page-header
          title="返回上一页"
          content="用户数据导出页面"
          @back="handleBack"
        ></el-page-header>
      </div>

      <!-- 表格 -->
      <el-table
        class="table"
        :data="allUserData"
        style="width: 100%"
        height="auto"
        :default-sort="{ prop: 'userId', order: 'descending' }"
        :stripe="false"
        :border="true"
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"> </el-table-column>
        <!-- 姓名 -->
        <el-table-column
          align="center"
          prop="userName"
          label="姓名"
          width="200"
        ></el-table-column>
        <!-- 用户ID -->
        <el-table-column
          align="center"
          prop="userId"
          label="用户ID"
          width="180"
        ></el-table-column>
        <!-- 性别 -->
        <el-table-column
          align="center"
          prop="sex"
          label="性别"
          width="100"
        ></el-table-column>
        <!-- 出生日期 -->
        <el-table-column
          align="center"
          prop="birthday"
          label="出生日期"
        ></el-table-column>
      </el-table>

      <!-- 按钮 -->
      <div class="btn">
        <el-button
          class="item"
          type="primary"
          icon="el-icon-download"
          @click="handleTestOutput"
          >导出-测试</el-button
        >
        <el-button
          class="item"
          type="primary"
          icon="el-icon-download"
          @click="handleTrainOutput"
          >导出-训练</el-button
        >
        <!-- <el-button
          class="item"
          type="primary"
          icon="el-icon-download"
          @click="handleMttOutput"
          >导出-mtt分阶</el-button
        > -->
        <el-button class="item" type="info" @click="handleRefresh"
          >刷 新</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import { initDB } from '@/db/index.js'

export default {
  name: 'user-data-output',

  data() {
    return {
      loading: false, // 加载动画

      allUserData: [], // user表的所有用户数据
      allTestData: [], // test_data表的所有数据
      allTrainData: [], // train_data表的所有数据
      allMttData: [], // mtt_data表的所有数据

      outputTestData: [], // 最终导出的测试数据
      outputTrainData: [], // 最终导出的训练数据
      outputMttData: [], // 最终导出的mtt数据

      userSelection: [] // 所选择的用户数组，多选
    }
  },

  created() {
    this.getAllUsers()
  },

  methods: {
    /**
     * @description: 返回上一页
     */
    handleBack() {
      this.$router.push({
        path: '/user'
      })
    },

    /**
     * @description: 当选择项发生变化时会触发该事件
     * @param {Array} val 多选数组
     */
    handleSelectionChange(val) {
      this.userSelection = val
    },

    /**
     * @description: 获取所有user信息数据
     */
    getAllUsers() {
      this.loading = true
      const db = initDB()
      db.user
        .toArray()
        .then(res => {
          this.allUserData = res
        })
        .catch(() => {
          this.$confirm(`获取user表数据失败，请点击刷新按钮重试！`, '提示', {
            type: 'warning',
            center: true,
            showClose: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
            confirmButtonText: '刷 新',
            cancelButtonText: '返回上一页'
          })
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.handleBack()
            })
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * @description: 获取所有测试数据
     */
    getTestData() {
      this.loading = true
      const db = initDB()
      db.test_data
        .toArray()
        .then(res => {
          this.allTestData = res
        })
        .then(() => {
          /* 筛选对应用户 */
          const userIdArray = []
          for (let i = 0; i < this.userSelection.length; i++) {
            const item = this.userSelection[i]
            userIdArray.push(item.userId)
          }

          this.outputTestData = []
          for (let i = 0; i < this.allTestData.length; i++) {
            const item = this.allTestData[i]
            if (userIdArray.includes(item.userId)) {
              this.outputTestData.push(item)
            }
          }
        })
        .then(() => {
          // 此处使用懒加载的方式
          import('@/utils/Export2Excel.js')
            .then(excel => {
              const excelTitle = {
                userId: 'ID',
                userName: '姓名',
                sex: '性别',
                height: '身高(cm)',
                weight: '体重(kg)',
                birthday: '出生日期',
                hospital: '医院',
                pdfTime: '测量时间',
                affectedSide: '患侧',
                angleResultArray: '结果'
              }
              const tHeader = Object.values(excelTitle)
              // 会根据key键的顺序、属性值等动态变化
              const filterVal = Object.keys(excelTitle)
              const exportData = this.formatJson(filterVal, this.outputTestData)
              excel.export_json_to_excel({
                header: tHeader, // 表头 必填
                data: exportData, // 具体数据 必填
                filename:
                  '踝关节评估与康复训练系统-单机版-用户测试数据 ' +
                  this.$moment().format('YYYY-MM-DD HH_mm_ss'), // 导出文件名，非必填
                autoWidth: true, // 自适应列宽，非必填
                bookType: 'xlsx' // 导出格式，非必填
              })
            })
            .then(() => {
              this.$message({
                message: '导出Excel成功',
                type: 'success',
                duration: 3000
              })
            })
            .catch(err => {
              this.$message({
                message: `导出Excel失败：${err}`,
                type: 'error',
                duration: 5000
              })
            })
        })
        .catch(() => {
          this.$confirm(
            `获取test_data表数据失败，请点击刷新按钮重试！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              confirmButtonText: '刷 新',
              cancelButtonText: '返回上一页'
            }
          )
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.handleBack()
            })
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * @description: 获取所有训练数据
     */
    getTrainData() {
      this.loading = true
      const db = initDB()
      db.train_data
        .toArray()
        .then(res => {
          this.allTrainData = res
        })
        .then(() => {
          /* 筛选对应用户 */
          const userIdArray = []
          for (let i = 0; i < this.userSelection.length; i++) {
            const item = this.userSelection[i]
            userIdArray.push(item.userId)
          }

          this.outputTrainData = []
          for (let i = 0; i < this.allTrainData.length; i++) {
            const item = this.allTrainData[i]
            if (userIdArray.includes(item.userId)) {
              this.outputTrainData.push(item)
            }
          }
        })
        .then(() => {
          // 此处使用懒加载的方式
          import('@/utils/Export2Excel.js')
            .then(excel => {
              const excelTitle = {
                userId: 'ID',
                userName: '姓名',
                sex: '性别',
                height: '身高(cm)',
                weight: '体重(kg)',
                birthday: '出生日期',
                hospital: '医院',
                pdfTime: '测量时间',
                affectedSide: '患侧',
                selectTrain: '训练动作',
                side: '训练侧',
                num: '重复次数',
                maxDistance: '设定角度',
                entadRate: '向心比',
                keepdRate: '保持比',
                offcenterRate: '离心比',
                resultRate: '完成度%'
              }
              const tHeader = Object.values(excelTitle)
              // 会根据key键的顺序、属性值等动态变化
              const filterVal = Object.keys(excelTitle)
              const exportData = this.formatJson(
                filterVal,
                this.outputTrainData
              )
              excel.export_json_to_excel({
                header: tHeader, // 表头 必填
                data: exportData, // 具体数据 必填
                filename:
                  '踝关节评估与康复训练系统-单机版-用户训练数据 ' +
                  this.$moment().format('YYYY-MM-DD HH_mm_ss'), // 导出文件名，非必填
                autoWidth: true, // 自适应列宽，非必填
                bookType: 'xlsx' // 导出格式，非必填
              })
            })
            .then(() => {
              this.$message({
                message: '导出Excel成功',
                type: 'success',
                duration: 3000
              })
            })
            .catch(err => {
              this.$message({
                message: `导出Excel失败：${err}`,
                type: 'error',
                duration: 5000
              })
            })
        })
        .catch(() => {
          this.$confirm(
            `获取train_data表数据失败，请点击刷新按钮重试！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              confirmButtonText: '刷 新',
              cancelButtonText: '返回上一页'
            }
          )
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.handleBack()
            })
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * @description: 获取所有mtt数据
     */
    getMttData() {
      this.loading = true
      const db = initDB()
      db.mtt_data
        .toArray()
        .then(res => {
          this.allMttData = res
        })
        .then(() => {
          /* 筛选对应用户 */
          const userIdArray = []
          for (let i = 0; i < this.userSelection.length; i++) {
            const item = this.userSelection[i]
            userIdArray.push(item.userId)
          }

          this.outputMttData = []
          for (let i = 0; i < this.allMttData.length; i++) {
            const item = this.allMttData[i]
            if (userIdArray.includes(item.userId)) {
              this.outputMttData.push(item)
            }
          }
        })
        .then(() => {
          // 此处使用懒加载的方式
          import('@/utils/Export2Excel.js')
            .then(excel => {
              const excelTitle = {
                userId: 'ID',
                userName: '姓名',
                sex: '性别',
                height: '身高(cm)',
                weight: '体重(kg)',
                birthday: '出生日期',
                hospital: '医院',
                pdfTime: '测量时间',
                affectedSide: '患侧'
              }
              const tHeader = Object.values(excelTitle)
              // 会根据key键的顺序、属性值等动态变化
              const filterVal = Object.keys(excelTitle)
              const exportData = this.formatJson(filterVal, this.outputMttData)
              excel.export_json_to_excel({
                header: tHeader, // 表头 必填
                data: exportData, // 具体数据 必填
                filename:
                  '踝关节评估与康复训练系统-单机版-用户MTT分阶数据 ' +
                  this.$moment().format('YYYY-MM-DD HH_mm_ss'), // 导出文件名，非必填
                autoWidth: true, // 自适应列宽，非必填
                bookType: 'xlsx' // 导出格式，非必填
              })
            })
            .then(() => {
              this.$message({
                message: '导出Excel成功',
                type: 'success',
                duration: 3000
              })
            })
            .catch(err => {
              this.$message({
                message: `导出Excel失败：${err}`,
                type: 'error',
                duration: 5000
              })
            })
        })
        .catch(() => {
          this.$confirm(
            `获取mtt_data表数据失败，请点击刷新按钮重试！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              confirmButtonText: '刷 新',
              cancelButtonText: '返回上一页'
            }
          )
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.handleBack()
            })
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * @description: 导出测试数据
     */
    handleTestOutput() {
      if (this.userSelection.length) {
        this.getTestData()
      } else {
        this.$message({
          message: '提示：请选择用户！',
          type: 'error',
          duration: 1500
        })
      }
    },

    /**
     * @description: 导出训练数据
     */
    handleTrainOutput() {
      if (this.userSelection.length) {
        this.getTrainData()
      } else {
        this.$message({
          message: '提示：请选择用户！',
          type: 'error',
          duration: 1500
        })
      }
    },

    /**
     * @description: 导出MTT分阶数据
     */
    handleMttOutput() {
      if (this.userSelection.length) {
        this.getMttData()
      } else {
        this.$message({
          message: '提示：请选择用户！',
          type: 'error',
          duration: 1500
        })
      }
    },

    /**
     * @description: 数据格式化，将 [{},{},...] => [[],[],...]
     * @param {Array} filterVal key键
     * @param {Array} jsonData [{},{},...]
     * @return {Array} 二维数组 [[],[],...]
     */
    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          return v[j]
        })
      )
    },

    /**
     * @description: 刷新页面
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: JSON.stringify('/user-data-output'),
          duration: JSON.stringify(300)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.user-data-output {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 86%;
    height: 92%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 26px 40px;
    @include flex(column, stretch, stretch);

    /* 顶部部分 */
    .top {
      margin-bottom: 20px;
      @include flex(row, flex-start, center);
    }

    /* 表格 */
    .table {
      flex: 1;
    }

    /* 按钮 */
    .btn {
      margin-top: 20px;
      @include flex(row, center, center);
      .item {
        font-size: 24px;
        margin: 0 80px;
      }
    }
  }
}
</style>

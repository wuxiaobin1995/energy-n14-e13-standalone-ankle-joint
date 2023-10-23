<!--
 * @Author      : Mr.bin
 * @Date        : 2023-08-23 10:25:10
 * @LastEditTime: 2023-10-08 14:45:54
 * @Description : 踝关节活动度训练-数据记录
-->
<template>
  <div class="activity">
    <!-- 顶部 -->
    <div class="top-wrapper">
      <!-- 标题 -->
      <el-page-header
        title="返回首页"
        content="踝关节活动度训练"
        @back="handleToHome"
      ></el-page-header>
      <!-- 日期筛选 -->
      <el-date-picker
        class="data-select"
        v-model="selectDateValue"
        type="daterange"
        :picker-options="pickerOptions"
        range-separator="——"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd HH:mm:ss"
        :editable="false"
        :clearable="false"
        :unlink-panels="true"
        align="right"
        @change="changeData"
      >
      </el-date-picker>
    </div>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      class="table-wrapper"
      style="width: 100%"
      height="100%"
      :default-sort="{ prop: 'pdfTime', order: 'descending' }"
      :stripe="true"
      :border="true"
      v-loading="loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <el-table-column type="index" width="50" align="center" />
      <el-table-column
        align="center"
        prop="pdfTime"
        label="训练时间"
        sortable
      />
      <el-table-column align="center" prop="side" label="训练侧" width="80" />
      <el-table-column
        align="center"
        prop="selectTrain"
        label="训练动作"
        width="80"
      />
      <el-table-column align="center" prop="num" label="重复次数" width="80" />
      <el-table-column
        align="center"
        prop="maxDistance"
        label="设定角度"
        width="100"
      />
      <el-table-column
        align="center"
        prop="resultRate"
        label="完成度%"
        width="200"
      />

      <!-- 查看报告按钮 -->
      <el-table-column label="训练报告" width="260" align="center">
        <template slot-scope="scope">
          <el-button
            type="primary"
            plain
            icon="el-icon-search"
            @click="handlePrint(scope.$index, scope.row)"
            >查看报告</el-button
          >
        </template>
      </el-table-column>
      <!-- 删除按钮 -->
      <el-table-column label="删除操作" width="260" align="center">
        <template slot-scope="scope">
          <el-button
            type="danger"
            plain
            icon="el-icon-delete"
            @click="handleDelete(scope.$index, scope.row)"
            >删 除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 长期趋势 -->
    <div class="btn">
      <!-- <el-button class="item" type="primary" @click="handleTendencyPrint"
        >长期趋势报告</el-button
      > -->
      <el-button class="item" type="info" @click="handleRefresh"
        >刷新页面</el-button
      >
    </div>
  </div>
</template>

<script>
import { initDB } from '@/db/index.js'

export default {
  name: 'activity',

  data() {
    return {
      tableData: [],
      loading: false, // 表格加载动画
      // 日期选择器的筛选值
      selectDateValue: [
        this.$moment().format('YYYY-MM-DD 00:00:00'),
        this.$moment().format('YYYY-MM-DD 23:59:59')
      ],
      /* 日期选择器快捷选项 */
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
              end.setTime(end.getTime() - 3600 * 1000 * 24 * 1)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一周',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一年',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 360)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '该用户所有数据',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 36000)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },

  created() {
    this.initData()
  },

  methods: {
    /**
     * @description: 返回首页
     */
    handleToHome() {
      this.$router.push({
        path: '/home'
      })
    },

    /**
     * @description: 表格数据初始化
     */
    initData() {
      const db = initDB()
      this.loading = true
      db.train_data
        .where({
          userId: this.$store.state.currentUserInfo.userId,
          type: '踝关节活动度训练'
        })
        .toArray()
        .then(res => {
          this.tableData = res
        })
        .catch(err => {
          this.$confirm(`${err}。获取数据失败，请点击刷新按钮重试！`, '提示', {
            type: 'warning',
            center: true,
            showClose: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
            confirmButtonText: '刷 新',
            cancelButtonText: '返回首页'
          })
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.handleToHome()
            })
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * @description: 根据日期选择获取表格数据
     */
    getData() {
      const db = initDB()
      this.loading = true
      db.train_data
        .where(['userId', 'type', 'pdfTime'])
        .between(
          [
            this.$store.state.currentUserInfo.userId,
            '踝关节活动度训练',
            this.selectDateValue[0]
          ],
          [
            this.$store.state.currentUserInfo.userId,
            '踝关节活动度训练',
            this.selectDateValue[1]
          ],
          true,
          true
        )
        .toArray()
        .then(res => {
          this.tableData = res
        })
        .catch(err => {
          this.$confirm(
            `${err}。根据日期获取数据失败，请点击刷新按钮重试！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              confirmButtonText: '刷 新',
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
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * @description: 用户确认选定的值时触发
     * @param {*} value 选择的日期数组
     */
    changeData(value) {
      this.selectDateValue = value
      this.getData()
    },

    /**
     * @description: 查看报告
     * @param {*} index
     * @param {*} row
     */
    handlePrint(index, row) {
      this.$router.push({
        path: '/train-pdf',
        query: {
          userId: JSON.stringify(row.userId),
          pdfTime: JSON.stringify(row.pdfTime),
          routerName: JSON.stringify('/train-record/activity')
        }
      })
    },

    /**
     * @description: 删除按钮
     * @param {*} index
     * @param {*} row
     */
    handleDelete(index, row) {
      this.$confirm('此操作将"永久删除"该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      })
        .then(() => {
          const db = initDB()
          db.train_data
            .where({
              userId: row.userId,
              pdfTime: row.pdfTime,
              type: row.type
            })
            .delete()
            .then(() => {
              this.$message({
                message: '删除成功',
                type: 'success',
                duration: 2000
              })
            })
            .then(() => {
              this.getData()
            })
            .catch(() => {
              this.$message({
                message: '删除失败',
                type: 'error',
                duration: 3000
              })
            })
        })
        .catch(() => {})
    },

    /**
     * @description: 长期趋势报告
     */
    handleTendencyPrint() {
      this.$router.push({
        path: '/train-tendency-print',
        query: {
          userId: JSON.stringify(this.$store.state.currentUserInfo.userId),
          routerName: JSON.stringify('/train-record/activity'),
          type: JSON.stringify('踝关节活动度训练')
        }
      })
    },

    /**
     * @description: 刷新页面
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: JSON.stringify('/train-record/activity'),
          duration: JSON.stringify(300)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.activity {
  width: 100%;
  height: 90%;
  @include flex(column, stretch, center);

  /* 顶部 */
  .top-wrapper {
    width: 100%;
    margin: 10px 0;
    @include flex(row, space-between, center);
    // 标题
    .text {
      font-size: 32px;
      color: green;
    }
  }

  /* 表格 */
  .table-wrapper {
    flex: 1;
  }

  /* 长期趋势 */
  .btn {
    margin: 10px 0;
    .item {
      margin: 0 50px;
      font-size: 18px;
    }
  }
}
</style>

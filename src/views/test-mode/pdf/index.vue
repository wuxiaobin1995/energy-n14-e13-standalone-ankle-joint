<!--
 * @Author      : Mr.bin
 * @Date        : 2023-07-26 15:17:22
 * @LastEditTime: 2023-07-26 15:40:27
 * @Description : 踝关节活动度测试-PDF报告
-->
<template>
  <div class="test-pdf" v-loading.fullscreen.lock="fullscreenLoading">
    <div>踝关节活动度测试-PDF报告</div>

    <!-- 按钮组 -->
    <div class="btn">
      <el-button class="item" type="danger" @click="handleGoBack"
        >返回</el-button
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

      fullscreenLoading: false
    }
  },

  mounted() {
    this.getTestData()
  },

  methods: {
    /**
     * @description: 返回按钮
     */
    handleGoBack() {
      this.$router.push({
        path: this.routerName
      })
    },

    /**
     * @description: 获取报告数据
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
          console.log(res)
        })
        .catch(err => {
          this.$message({
            message: `数据获取失败：${err}`,
            type: 'error'
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
  width: 100%;
  height: 100%;
  @include flex(column, stretch, stretch);
}
</style>

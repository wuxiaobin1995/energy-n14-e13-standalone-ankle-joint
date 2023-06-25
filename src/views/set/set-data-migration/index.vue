<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-25 21:43:44
 * @LastEditTime: 2023-06-25 21:43:50
 * @Description : 数据迁移
-->
<template>
  <div class="set-data-migration">
    <div class="wrapper">
      <el-page-header
        class="page"
        title="返回首页"
        content="数据迁移"
        @back="handleToHome"
      ></el-page-header>

      <div class="btn">
        <!-- 导出 -->
        <el-button
          class="item"
          type="success"
          @click="handleOutput"
          :loading="outputLoading"
          >导出数据（记得做好备份）</el-button
        >

        <!-- 路径输入 -->
        <el-input
          :style="{ width: '800px', 'font-size': '20px' }"
          placeholder="默认是C:/energy_all_data_output.json"
          v-model="dirInput"
        >
          <template slot="prepend">读取文件绝对路径</template>
        </el-input>
        <!-- 导入 -->
        <el-button
          class="item"
          type="primary"
          @click="handleInput"
          :loading="inputLoading"
          >导入数据</el-button
        >

        <!-- 刷新 -->
        <el-button class="item" type="info" @click="handleRefresh"
          >刷新页面</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import { initDB } from '@/db/index.js'

import Tools from './utils/index.js'

import fs from 'fs'

export default {
  name: 'set-data-migration',

  data() {
    return {
      dirInput: `C:/energy_all_data_output.json`, // 文件绝对路径，默认`C:/energy_all_data_output.json`
      outputLoading: false, // 导出按钮加载动画
      inputLoading: false // 导入按钮加载动画
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
     * @description: 导出数据
     */
    handleOutput() {
      this.$confirm('二次确认, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.outputLoading = true
          const db = initDB()
          db.user
            .toArray()
            .then(res1 => {
              db.test_data
                .toArray()
                .then(res2 => {
                  db.train_data
                    .toArray()
                    .then(res3 => {
                      db.mtt_data
                        .toArray()
                        .then(res4 => {
                          const data = {
                            user: res1,
                            test_data: res2,
                            train_data: res3,
                            mtt_data: res4
                          }
                          Tools.outputFile(
                            'energy_all_data_output.json',
                            JSON.stringify(data)
                          ) // 导出json文件操作
                        })
                        .catch(err => {
                          this.$confirm(
                            `导出mtt_data表数据失败：${err}`,
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
                    })
                    .catch(err => {
                      this.$confirm(
                        `导出train_data表数据失败：${err}`,
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
                })
                .catch(err => {
                  this.$confirm(`导出test_data表数据失败：${err}`, '提示', {
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
            })
            .catch(err => {
              this.$confirm(`导出user表数据失败：${err}`, '提示', {
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
              this.outputLoading = false
            })
        })
        .catch(() => {})
    },

    /**
     * @description: 导入数据
     */
    handleInput() {
      this.$confirm('二次确认, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.inputLoading = true
          fs.readFile(this.dirInput, async (err, res) => {
            // 若没有报错，则err为null
            if (err) {
              this.$message({
                message: `引入文件失败：${err}`,
                type: 'error',
                duration: 10000
              })

              this.inputLoading = false
            } else {
              const result = await this.insertDatabase(JSON.parse(res)) // 插入数据库操作
              if (result === 1) {
                this.$message({
                  message: '数据导入成功',
                  type: 'success',
                  duration: 5000
                })
              }

              this.inputLoading = false
            }
          })
        })
        .catch(() => {})
    },

    /**
     * @description: 插入数据库操作
     * @param {Object} data 数据源{}
     * @return {} 返回成功与否
     */
    insertDatabase(data) {
      return new Promise((resolve, reject) => {
        const db = initDB()

        for (let i = 0; i < data['user'].length; i++) {
          db.user
            .add(data['user'][i])
            .then(() => {
              resolve(1)
            })
            .catch(err => {
              this.$message({
                message: `user表数据导入失败：${err}`,
                type: 'error',
                duration: 6000
              })
              reject(err)
            })
        }

        for (let i = 0; i < data['test_data'].length; i++) {
          db.test_data
            .add(data['test_data'][i])
            .then(() => {
              resolve(1)
            })
            .catch(err => {
              this.$message({
                message: `test_data表数据导入失败：${err}`,
                type: 'error',
                duration: 6000
              })
              reject(err)
            })
        }

        for (let i = 0; i < data['train_data'].length; i++) {
          db.train_data
            .add(data['train_data'][i])
            .then(() => {
              resolve(1)
            })
            .catch(err => {
              this.$message({
                message: `train_data表数据导入失败：${err}`,
                type: 'error',
                duration: 6000
              })
              reject(err)
            })
        }

        for (let i = 0; i < data['mtt_data'].length; i++) {
          db.mtt_data
            .add(data['mtt_data'][i])
            .then(() => {
              resolve(1)
            })
            .catch(err => {
              this.$message({
                message: `mtt_data表数据导入失败：${err}`,
                type: 'error',
                duration: 6000
              })
              reject(err)
            })
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
          routerName: JSON.stringify('/set-data-migration'),
          duration: JSON.stringify(300)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.set-data-migration {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

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

    .btn {
      @include flex(column, stretch, center);
      .item {
        margin: 50px 0;
        font-size: 28px;
      }
    }
  }
}
</style>

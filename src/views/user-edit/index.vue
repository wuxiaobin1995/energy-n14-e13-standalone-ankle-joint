<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-25 21:28:10
 * @LastEditTime: 2023-06-25 21:28:21
 * @Description : 用户信息修改
-->
<template>
  <div class="user-edit" v-loading.fullscreen.lock="fullscreenLoading">
    <div class="wrapper">
      <!-- 表单 -->
      <el-form
        class="form"
        :model="formData"
        ref="form"
        :rules="rules"
        label-width="auto"
      >
        <!-- 分割线 -->
        <el-row>
          <el-divider content-position="center">用户信息修改</el-divider>
        </el-row>

        <!-- 个人信息 -->
        <el-row type="flex" justify="space-around" class="form-main">
          <el-col :span="10">
            <!-- ID -->
            <el-form-item label="ID：" prop="userId">
              <el-input v-model="formData.userId" disabled></el-input>
            </el-form-item>
            <!-- 姓名 -->
            <el-form-item label="姓名：" prop="userName">
              <el-input
                v-model="formData.userName"
                placeholder="请输入姓名（必填，限10字符）"
                clearable
                maxlength="10"
                show-word-limit
              ></el-input>
            </el-form-item>
            <!-- 性别 -->
            <el-form-item label="性别：" prop="sex">
              <el-radio-group v-model="formData.sex">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <!-- 患侧 -->
            <el-form-item label="患侧：" prop="affectedSide">
              <el-radio-group v-model="formData.affectedSide">
                <el-radio label="左">左</el-radio>
                <el-radio label="右">右</el-radio>
                <el-radio label="无">无</el-radio>
              </el-radio-group>
            </el-form-item>
            <!-- 身高 -->
            <el-form-item label="身高(cm)：" prop="height">
              <el-input-number
                v-model="formData.height"
                :precision="0"
                :min="1"
                :max="1000"
              ></el-input-number>
            </el-form-item>
            <!-- 体重 -->
            <el-form-item label="体重(kg)：" prop="weight">
              <el-input-number
                v-model="formData.weight"
                :precision="0"
                :min="1"
                :max="1000"
              ></el-input-number>
            </el-form-item>
            <!-- 出生日期 -->
            <el-form-item label="出生日期：" prop="birthday">
              <el-date-picker
                v-model="formData.birthday"
                type="date"
                placeholder="请选择日期（必填）"
                :editable="false"
                value-format="yyyy-MM-dd"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <!-- 图片 -->
            <el-form-item>
              <el-image
                class="sex-img"
                v-show="formData.sex === '男'"
                :src="manImg"
                fit="scale-down"
              ></el-image>
              <el-image
                class="sex-img"
                v-show="formData.sex === '女'"
                :src="womanImg"
                fit="scale-down"
              ></el-image>
            </el-form-item>
            <!-- 备注 -->
            <el-form-item label="备注：">
              <el-input
                type="textarea"
                v-model="formData.remarks"
                placeholder="请输入备注（限200字符）"
                :rows="6"
                resize="none"
                maxlength="200"
                show-word-limit
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 分割线 -->
        <el-row>
          <el-divider content-position="center"></el-divider>
        </el-row>

        <!-- 按钮组 -->
        <el-row class="btn">
          <el-button
            type="success"
            icon="el-icon-edit"
            class="btn-item"
            @click="handleEdit"
            >确认修改</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-circle-close"
            class="btn-item"
            @click="handleCancel"
            >取 消</el-button
          >
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script>
import { initDB } from '@/db/index.js'

export default {
  name: 'user-edit',

  data() {
    return {
      /* 路由传参 */
      userId: JSON.parse(this.$route.query.userId),
      /* 其他 */
      manImg: require('@/assets/img/User/男.png'),
      womanImg: require('@/assets/img/User/女.png'),
      fullscreenLoading: false, // 全屏加载

      /* 表单 */
      formData: {},
      rules: {
        userName: [
          { required: true, message: '姓名不能为空', trigger: 'blur' }
        ],
        sex: [{ required: true, message: '性别必选', trigger: 'change' }],
        affectedSide: [
          { required: true, message: '患侧必选', trigger: 'change' }
        ],
        height: [
          { required: true, message: '身高不能为空', trigger: 'change' }
        ],
        weight: [
          { required: true, message: '体重不能为空', trigger: 'change' }
        ],
        birthday: [
          {
            required: true,
            message: '出生日期不能为空',
            trigger: 'change'
          }
        ]
      }
    }
  },

  created() {
    this.getUser()
  },

  methods: {
    /**
     * @description: 获取对应ID的用户信息数据
     */
    getUser() {
      this.fullscreenLoading = true
      const db = initDB()
      db.user
        .where({
          userId: this.userId
        })
        .toArray()
        .then(res => {
          this.formData = res[0]
        })
        .catch(() => {
          this.$confirm(
            `获取ID为 [${this.userId}] 的用户数据失败，请重试！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              confirmButtonText: '重 试',
              cancelButtonText: '返回上一页'
            }
          )
            .then(() => {
              this.getUser()
            })
            .catch(() => {
              this.$router.push({
                path: '/user'
              })
            })
        })
        .finally(() => {
          this.fullscreenLoading = false
        })
    },

    /**
     * @description: 用户信息修改
     */
    handleEdit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const db = initDB()
          db.user
            .update(this.userId, this.formData)
            .then(() => {
              this.$message({
                message: '用户信息修改成功',
                type: 'success',
                duration: 3000
              })
            })
            .then(() => {
              if (
                this.$store.state.currentUserInfo.userId ===
                this.formData.userId
              ) {
                this.$store.dispatch('changeCurrentUserInfo', {
                  userId: this.formData.userId,
                  userName: this.formData.userName,
                  sex: this.formData.sex,
                  affectedSide: this.formData.affectedSide,
                  height: this.formData.height,
                  weight: this.formData.weight,
                  birthday: this.formData.birthday,
                  remarks: this.formData.remarks,
                  lastLoginTime: this.formData.lastLoginTime
                })
              }
            })
            .then(() => {
              this.$router.push({
                path: '/user'
              })
            })
            .catch(() => {
              this.$confirm(`用户信息修改失败，请重试！`, '提示', {
                type: 'warning',
                center: true,
                showClose: false,
                closeOnClickModal: false,
                closeOnPressEscape: false,
                confirmButtonText: '重 试',
                cancelButtonText: '返回上一页'
              })
                .then(() => {
                  this.handleEdit()
                })
                .catch(() => {
                  this.$router.push({
                    path: '/user'
                  })
                })
            })
        } else {
          return false
        }
      })
    },

    /**
     * @description: 取消
     */
    handleCancel() {
      this.$router.push({
        path: '/user'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.user-edit {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 86%;
    height: 90%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 26px;

    /* 表单 */
    .form {
      width: 100%;
      height: 100%;
      @include flex(column, stretch, stretch);

      // 个人信息
      .form-main {
        flex: 1;
        .sex-img {
          width: 200px;
        }
      }
      // 按钮组
      .btn {
        @include flex(row, center, center);
        .btn-item {
          font-size: 24px;
          margin: 0 80px;
        }
      }
    }
  }
}
</style>

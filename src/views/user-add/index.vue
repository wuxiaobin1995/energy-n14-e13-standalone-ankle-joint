<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-25 21:23:59
 * @LastEditTime: 2023-08-28 11:39:56
 * @Description : 添加用户
-->
<template>
  <div class="user-add">
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
          <el-divider content-position="center">添加用户</el-divider>
        </el-row>

        <!-- 个人信息 -->
        <el-row type="flex" justify="space-around" class="form-main">
          <el-col :span="10">
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
            icon="el-icon-edit-outline"
            class="btn-item"
            @click="handleAdd"
            >确认添加</el-button
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
  name: 'user-add',

  data() {
    return {
      manImg: require('@/assets/img/User/男.png'),
      womanImg: require('@/assets/img/User/女.png'),
      /* 表单 */
      formData: {
        userId: '', // 唯一id
        userName: '', // 姓名
        sex: '男', // 性别
        affectedSide: '左', // 患侧（左、右、无）
        height: '', // 身高
        weight: '', // 体重
        birthday: '', // 出生日期
        remarks: '', // 备注
        lastLoginTime: '' // 最后登陆时间
      },
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

  methods: {
    /**
     * @description: 添加用户
     */
    handleAdd() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.formData.userId = this.$moment().format('x') // 使用毫秒时间戳作为唯一id，字符串类型
          const db = initDB()
          db.user
            .add(this.formData)
            .then(() => {
              this.$message({
                message: '添加用户成功',
                type: 'success',
                duration: 3000
              })
            })
            .then(() => {
              this.$router.push({ path: '/user' })
            })
            .catch(() => {
              this.$message({
                message: '添加用户失败，该用户Id已存在，请重试！',
                type: 'error',
                duration: 4000
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
.user-add {
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

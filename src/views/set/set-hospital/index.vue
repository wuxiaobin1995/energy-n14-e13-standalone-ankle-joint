<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-25 21:36:46
 * @LastEditTime: 2023-06-25 21:36:59
 * @Description : 设置医院名称
-->
<template>
  <div class="set-hospital">
    <div class="wrapper">
      <el-page-header
        class="page"
        title="返回首页"
        content="设置医院名称"
        @back="handleToHome"
      ></el-page-header>

      <!-- 表单 -->
      <el-form
        class="form"
        :model="formData"
        ref="form"
        :rules="rules"
        label-width="auto"
      >
        <el-form-item label="医院名称：" prop="hospitalName">
          <el-input
            v-model="formData.hospitalName"
            placeholder="请输入医院名称（必填，限20字符）"
            clearable
            maxlength="20"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>

      <!-- 按钮组 -->
      <div class="btn">
        <el-button
          type="success"
          icon="el-icon-edit-outline"
          class="btn-item"
          @click="handleSet"
          >确认设置</el-button
        >
        <el-button type="info" class="btn-item" @click="handleRefresh"
          >刷 新</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'set-hospital',

  data() {
    return {
      formData: {
        hospitalName: ''
      },
      rules: {
        hospitalName: [
          { required: true, message: '医院名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },

  created() {
    this.formData.hospitalName = window.localStorage.getItem('hospital')
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
     * @description: 设置医院名称
     */
    handleSet() {
      this.$refs.form.validate(valid => {
        if (valid) {
          window.localStorage.setItem('hospital', this.formData.hospitalName)
          this.$message({
            message: '设置医院名称成功',
            type: 'success',
            duration: 2000
          })
          this.handleRefresh()
        } else {
          return false
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
          routerName: JSON.stringify('/set-hospital'),
          duration: JSON.stringify(300)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.set-hospital {
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

    .form {
      width: 50%;
    }
    .btn {
      margin-top: 50px;
      @include flex(row, center, center);
      .btn-item {
        margin: 0 60px;
        font-size: 24px;
      }
    }
  }
}
</style>

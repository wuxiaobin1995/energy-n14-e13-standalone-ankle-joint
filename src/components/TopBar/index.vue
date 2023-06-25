<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-25 11:40:06
 * @LastEditTime: 2023-06-25 11:40:19
 * @Description : 顶部栏
-->
<template>
  <div class="TopBar">
    <!-- logo -->
    <div class="logo">
      <el-image
        class="logo__img"
        :src="logoSrc"
        fit="scale-down"
        @click.native="handleToHome"
      ></el-image>
      <span class="text">踝关节评估与康复训练系统</span>
    </div>

    <!-- 其他 -->
    <div class="others">
      <!-- 当前登录用户 -->
      <div class="user">
        <div class="name">{{ activeUser ? activeUser : '未选择用户' }}</div>
        <i class="el-icon-user"></i>
      </div>
      <!-- 配置项 -->
      <div class="set">
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="el-dropdown-link">
            <i class="el-icon-setting self"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              icon="el-icon-office-building"
              command="设置医院名称"
              >设置医院名称</el-dropdown-item
            >
            <el-dropdown-item icon="el-icon-odometer" divided command="调零"
              >调零</el-dropdown-item
            >
            <el-dropdown-item icon="el-icon-thumb" command="设置K"
              >设置K</el-dropdown-item
            >
            <el-dropdown-item
              icon="el-icon-s-promotion"
              divided
              command="开发者"
              >开发者</el-dropdown-item
            >
            <el-dropdown-item icon="el-icon-s-data" command="数据迁移"
              >数据迁移</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <!-- 回到首页 -->
      <div class="to-home">
        <el-button type="primary" circle @click="handleToHome"
          ><i class="el-icon-s-home self"></i
        ></el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopBar',

  data() {
    return {
      logoSrc: require('@/assets/img/Company_Logo/logo_1.png') // 公司商标
    }
  },

  computed: {
    activeUser() {
      return this.$store.state.currentUserInfo.userName
    }
  },

  methods: {
    /**
     * @description: 点击菜单项触发的事件回调
     * @param {String} command 对应的command值
     */
    handleCommand(command) {
      switch (command) {
        case '设置医院名称':
          this.$prompt('请输入密码', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^energy$/,
            inputErrorMessage: '密码不正确',
            showClose: true,
            closeOnClickModal: false
          })
            .then(() => {
              this.$router.push({
                path: '/set-hospital'
              })
            })
            .catch(() => {})
          break
        case '调零':
          this.$router.push({
            path: '/set-zero'
          })
          break
        case '设置K':
          this.$prompt('请输入密码', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^energy$/,
            inputErrorMessage: '密码不正确',
            showClose: true,
            closeOnClickModal: false
          })
            .then(() => {
              this.$router.push({
                path: '/set-k'
              })
            })
            .catch(() => {})
          break
        case '开发者':
          this.$prompt('请输入密码', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^htpm$/,
            inputErrorMessage: '密码不正确',
            showClose: true,
            closeOnClickModal: false
          })
            .then(() => {
              this.$router.push({
                path: '/set-developer'
              })
            })
            .catch(() => {})
          break
        case '数据迁移':
          this.$prompt('请输入密码', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^htpm$/,
            inputErrorMessage: '密码不正确',
            showClose: true,
            closeOnClickModal: false
          })
            .then(() => {
              this.$router.push({
                path: '/set-data-migration'
              })
            })
            .catch(() => {})
          break
        default:
          this.$message({
            message: '不存在此路由，请联系开发人员！',
            type: 'error',
            duration: 5000
          })
          break
      }
    },

    /**
     * @description: 回到首页
     */
    handleToHome() {
      this.$router.push({
        path: '/home'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.TopBar {
  width: 100%;
  height: 100%;
  @include flex(row, space-between, center);

  /* logo */
  .logo {
    margin-left: 20px;
    @include flex(row, center, center);
    .logo__img {
      width: 130px;
    }
    .text {
      margin-left: 20px;
      font-size: 22px;
      color: #3d3d3d;
    }
  }

  /* 其他 */
  .others {
    margin-right: 20px;
    @include flex(row, center, center);
    // 当前登录用户
    .user {
      margin-right: 30px;
      @include flex(row, center, center);
      padding: 6px 40px;
      border-radius: 20px;
      background-color: #f0f0f0;
      font-size: 22px;
      .name {
        margin-right: 20px;
        font-size: 18px;
        color: #3d3d3d;
      }
    }
    // 配置项
    .set {
      margin-right: 30px;
      .self {
        font-size: 32px;
      }
    }
    // 回到首页
    .to-home {
      .self {
        font-size: 18px;
      }
    }
  }
}
</style>

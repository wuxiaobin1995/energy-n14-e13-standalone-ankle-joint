/*
 * @Author      : Mr.bin
 * @Date        : 2023-06-25 11:15:18
 * @LastEditTime: 2023-08-11 15:09:58
 * @Description : 路由
 */
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const routes = [
  /*
   * 前面加"/"表示绝对路径，不加"/"表示相对路径
   * 一般嵌套路由中的子路由不需要加"/"，它会在父路由后自动加上"/子路由"
   * 比如父 "/father"，子 "child"，要想访问子路由，跳转链接需要写成 "/father/child"
   */

  {
    path: '/',
    name: 'layout',
    component: () => import('@/layout'),
    redirect: '/home',
    children: [
      // 首页
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home'),
        meta: ['首页']
      },
      // 用户
      {
        path: 'user',
        name: 'user',
        component: () => import('@/views/user'),
        meta: ['用户']
      },
      // 导出所选用户的数据（测试、训练、......）
      {
        path: 'user-data-output',
        name: 'user-data-output',
        component: () => import('@/views/user-data-output'),
        meta: ['导出所选用户的数据']
      },
      // 添加用户
      {
        path: 'user-add',
        name: 'user-add',
        component: () => import('@/views/user-add'),
        meta: ['添加用户']
      },
      // 用户信息修改
      {
        path: 'user-edit',
        name: 'user-edit',
        component: () => import('@/views/user-edit'),
        meta: ['用户信息修改']
      },
      // 设置医院名称
      {
        path: 'set-hospital',
        name: 'set-hospital',
        component: () => import('@/views/set/set-hospital'),
        meta: ['设置医院名称']
      },
      // 蓝牙连接
      {
        path: 'set-bluetooth-connect',
        name: 'set-bluetooth-connect',
        component: () => import('@/views/set/set-bluetooth-connect'),
        meta: ['蓝牙连接']
      },
      // 调零
      {
        path: 'set-zero',
        name: 'set-zero',
        component: () => import('@/views/set/set-zero'),
        meta: ['调零']
      },
      // 数据迁移
      {
        path: 'set-data-migration',
        name: 'set-data-migration',
        component: () => import('@/views/set/set-data-migration'),
        meta: ['数据迁移']
      },
      // 开发者
      {
        path: 'set-developer',
        name: 'set-developer',
        component: () => import('@/views/set/set-developer'),
        meta: ['开发者']
      },

      /* 测试模块 */
      // 测试介绍
      {
        path: 'test-introduce',
        name: 'test-introduce',
        component: () => import('@/views/test-mode/introduce'),
        meta: ['测试介绍']
      },
      // 跖屈
      {
        path: 'test-plantarFlexion',
        name: 'test-plantarFlexion',
        component: () => import('@/views/test-mode/plantarFlexion'),
        meta: ['跖屈']
      },
      // 背屈
      {
        path: 'test-dorsiflex',
        name: 'test-dorsiflex',
        component: () => import('@/views/test-mode/dorsiflex'),
        meta: ['背屈']
      },
      // 内收
      {
        path: 'test-adduction',
        name: 'test-adduction',
        component: () => import('@/views/test-mode/adduction'),
        meta: ['内收']
      },
      // 外展
      {
        path: 'test-abduction',
        name: 'test-abduction',
        component: () => import('@/views/test-mode/abduction'),
        meta: ['外展']
      },
      // 内翻
      {
        path: 'test-varus',
        name: 'test-varus',
        component: () => import('@/views/test-mode/varus'),
        meta: ['内翻']
      },
      // 外翻
      {
        path: 'test-valgus',
        name: 'test-valgus',
        component: () => import('@/views/test-mode/valgus'),
        meta: ['外翻']
      },

      /* 训练模块 */
      // 训练参数配置
      {
        path: 'train-parameter',
        name: 'train-parameter',
        component: () => import('@/views/train-mode/parameter'),
        meta: ['训练参数配置']
      },
      // 具体训练
      {
        path: 'train-measure',
        name: 'train-measure',
        component: () => import('@/views/train-mode/measure'),
        meta: ['跖屈']
      }

      /* MTT分阶模块 */
    ]
  },

  /* 测试报告 */
  // 踝关节活动度测试-PDF报告
  {
    path: '/test-pdf',
    name: 'test-pdf',
    component: () => import('@/views/test-mode/pdf'),
    meta: ['踝关节活动度测试-PDF报告']
  },

  {
    path: '/refresh',
    name: 'refresh',
    component: () => import('@/views/refresh')
  },

  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  routes,
  /* 自定义路由切换时页面如何滚动 */
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 } // 回到顶部
  }
})
export default router

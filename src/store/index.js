/*
 * @Author      : Mr.bin
 * @Date        : 2023-06-25 11:15:18
 * @LastEditTime: 2023-07-24 16:20:36
 * @Description : Vuex
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    /* x，y，z调零基准值 */
    zeroStandard: {
      xStandard: null,
      yStandard: null,
      zStandard: null
    },

    /* 当前选择的用户及其信息 */
    currentUserInfo: {
      userId: '', // 唯一id
      userName: '', // 姓名
      sex: '', // 性别
      affectedSide: '', // 患侧（左、右、无）
      height: '', // 身高
      weight: '', // 体重
      birthday: '', // 出生日期
      remarks: '', // 备注
      lastLoginTime: '' // 最后登录时间
    },

    /* 蓝牙连接与否 */
    isBluetooth: false,

    /* 语音开关 */
    voiceSwitch: true
  },

  mutations: {
    /* x，y，z调零基准值 */
    SET_ZEROSTANDARD(state, zeroStandard) {
      state.zeroStandard = zeroStandard
    },

    /* 当前选择的用户及其信息 */
    CHANGE_CURRENTUSERINFO(state, currentUserInfo) {
      state.currentUserInfo = currentUserInfo
    },

    /* 蓝牙连接与否 */
    SET_ISBLUETOOTH(state, isBluetooth) {
      state.isBluetooth = isBluetooth
    },

    /* 语音开关 */
    SET_VOICESWITCH(state, voiceSwitch) {
      state.voiceSwitch = voiceSwitch
    }
  },

  actions: {
    /* x，y，z调零基准值 */
    setZeroStandard({ commit }, zeroStandard) {
      return new Promise((resolve, reject) => {
        commit('SET_ZEROSTANDARD', zeroStandard)
        resolve()
      })
    },

    /* 当前选择的用户及其信息 */
    changeCurrentUserInfo({ commit }, currentUserInfo) {
      return new Promise((resolve, reject) => {
        commit('CHANGE_CURRENTUSERINFO', currentUserInfo)
        resolve()
      })
    },

    /* 蓝牙连接与否 */
    setIsBluetooth({ commit }, isBluetooth) {
      return new Promise((resolve, reject) => {
        commit('SET_ISBLUETOOTH', isBluetooth)
        resolve()
      })
    },

    /* 语音开关 */
    setVoiceSwitch({ commit }, voiceSwitch) {
      return new Promise((resolve, reject) => {
        commit('SET_VOICESWITCH', voiceSwitch)
        resolve()
      })
    }
  }
})

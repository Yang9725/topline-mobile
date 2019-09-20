import Vue from 'vue'
import Vuex from 'vuex'
import { getItem, setItem } from '@/utils/storage'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 初始化一个数据
    user: getItem('user')
  },
  mutations: {
    // 添加一个mutation，用于修改state
    // 登陆成功，调用
    setUser (state, user) {
      state.user = user
      // 为了防止刷新数据丢失，还需要将数据存储到本地存储
      setItem('user', state.user)
    }
  },
  actions: {

  }
})

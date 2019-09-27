<template>
  <div>
    <!-- 导航栏 -->
    <van-nav-bar
      title="个人信息"
      left-arrow
      right-text="保存"
      @click-right="onSaveProfile"
    />
    <!-- /导航栏 -->

    <!-- 用户信息 -->
    <van-cell-group>
      <van-cell title="头像" is-link @click="onShowFile">
        <van-image
          round
          width="30"
          height="30"
          :src="user.photo"
        />
      </van-cell>
      <van-cell title="昵称" :value="user.name" is-link />
      <van-cell title="性别" :value="user.gender === 1 ? '女' : '男'" is-link />
      <van-cell title="生日" :value="user.birthday" is-link />
    </van-cell-group>
    <!-- /用户信息 -->

    <!-- 头像上传触发的 file 类型的 input -->
    <input hidden type="file" ref="file">
    <!-- /头像上传触发的 file 类型的 input -->
  </div>
</template>

<script>
import { getProfile, updateUserPhoto } from '@/api/user'

export default {
  name: 'UserIndex',
  data () {
    return {
      user: {} // 用户个人资料
    }
  },

  computed: {
    file () {
      return this.$refs.file
    }
  },

  created () {
    this.loadUserProfile()
  },

  // 初始化的时候操作 DOM
  mounted () {
    // 注册 file 的 change 事件，预览图片
    this.file.onchange = () => {
      // 设置给 img 的 src
      this.user.photo = window.URL.createObjectURL(this.file.files[0])
    }
  },

  methods: {
    async loadUserProfile () {
      const { data } = await getProfile()
      this.user = data.data
    },

    onShowFile () {
      // 手动触发 input 的点击事件
      this.file.click()
    },

    async onSaveProfile () {
      // loading
      const toast = this.$toast.loading({
        duration: 0, // 持续展示 toast
        forbidClick: true, // 禁用背景点击
        loadingType: 'spinner',
        message: '更新中'
      })

      try {
        // 请求提交
        await updateUserPhoto(this.file.files[0])

        // 关闭弹窗 loading
        toast.clear()

        // 提示成功
        this.$toast.success('更新成功')
      } catch (err) {
        console.log(err)
        // 关闭弹窗 loading
        toast.clear()
        // 提示失败
        this.$toast.fail('更新失败')
      }
    }
  }
}
</script>

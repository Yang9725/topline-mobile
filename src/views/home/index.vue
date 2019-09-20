<template>
  <div class="home">
    <!-- 导航栏 -->
    <van-nav-bar title="首页" />
    <!-- /导航栏 -->

    <!-- 频道列表 -->
    <van-tabs v-model="active">
      <van-tab
        :title="channel.name"
        v-for="channel in channels"
        :key="channel.id"
      >{{ channel.name }}</van-tab>
    </van-tabs>
    <!-- /频道列表 -->

    <!-- 文章列表 -->
    <!-- /文章列表 -->
  </div>
</template>

<script>
import { getAllChannels } from '@/api/channel'

export default {
  name: 'HomeIndex',
  data () {
    return {
      active: 2, // 控制当前激活的标签页
      channels: [] // 频道列表
    }
  },

  created () {
    this.loadAllChannels()
  },

  methods: {
    async loadAllChannels () {
      const { data } = await getAllChannels()
      this.channels = data.data.channels
    }
  }
}
</script>

<style>

</style>

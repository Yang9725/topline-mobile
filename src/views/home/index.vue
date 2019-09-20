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
      >

      <van-list
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad">
      <van-cell
      v-for="item in list"
      :key="item"
      :title="item" />
      </van-list>

      </van-tab>
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
      channels: [], // 频道列表
      list: [],
      loading: false,
      finished: false
    }
  },

  created () {
    this.loadAllChannels()
  },

  methods: {
    async loadAllChannels () {
      const { data } = await getAllChannels()
      this.channels = data.data.channels
    },
    onLoad () {
      setTimeout(() => {
        for (let i = 0; i < 10; i++) {
          this.list.push(this.list.length + 1)
        }
        this.loading = false

        if (this.list.length >= 40) {
          this.finished = true
        }
      }, 500)
    }
  }
}
</script>

<style lang="less">
.home{
  .van-tabs {
    .van-tabs_content {
      margin-bottom: 50px;
    }
  }
}

</style>

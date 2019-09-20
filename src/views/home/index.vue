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
        <!--
          标签页的内容：频道的文章列表
         -->
        <!-- 文章列表 -->
        <!--
           v-model="loading" 控制列表组件的上拉加载的 loading 状态
           finished 用来控制列表是否加载结束
              如果为 true，则列表组件会提示：“没有更多了”，停止继续加载更多
              如果为 false，则会继续触发 loading 加载更多
          finished-text 配置加载结束的文本提示
          load 事件：用来配置加载更多调用的函数

          List 组件通过loading和finished两个变量控制加载状态
          当组件滚动到底部时，会触发load事件并将loading设置成true。
          此时可以发起异步操作并更新数据
          数据更新完毕后，将loading设置成false即可
          若数据已全部加载完毕，则直接将finished设置成true即可。

          初始的时候，它会自动把 loading 设置为 true
          onLoad
            初始化的时候调用
            加载更多的时候调用
         -->
        <van-list
          v-model="channel.loading"
          :finished="channel.finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <!-- 具体的内容 -->
          <van-cell
            v-for="article in channel.articles"
            :key="article.art_id.toString()"
            :title="article.title"
          />
        </van-list>
        <!-- /文章列表 -->
      </van-tab>
    </van-tabs>
    <!-- /频道列表 -->
  </div>
</template>

<script>
import { getAllChannels } from '@/api/channel'
import { getArticles } from '@/api/article'

export default {
  name: 'HomeIndex',
  data () {
    return {
      active: 0, // 控制当前激活的标签页
      channels: [] // 频道列表
    }
  },

  computed: {
    currentChannel () {
      // active 是动态的
      return this.channels[this.active]
    }
  },

  created () {
    this.loadAllChannels()
  },

  methods: {
    async loadAllChannels () {
      const { data } = await getAllChannels()

      // 为每一个频道初始化一个成员 articles 用来存储该频道的文章列表
      data.data.channels.forEach(channel => {
        channel.articles = [] // 频道的文章列表
        channel.loading = false // 频道的上拉加载更多的 loading 状态
        channel.finished = false // 频道的加载结束的状态
        channel.timestamp = null // 用于获取下一页数据的时间戳（页码）
      })

      this.channels = data.data.channels
    },

    async onLoad () {
      // 1. 请求加载文章列表
      const currentChannel = this.currentChannel
      const { data } = await getArticles({
        channelId: currentChannel.id,
        // 第1页数据传递当前最新时间戳
        // 下一页数据传递上一页返回数据结果中的 pre_timestamp
        timestamp: currentChannel.timestamp || Date.now(),
        withTop: 1
      })

      // 2. 将得到的文章列表添加到当前频道.articles 中
      const { pre_timestamp: preTimestamp, results } = data.data
      currentChannel.articles.push(...results)

      // 3. 本次 onLoad 数据加载完毕，将 loading 设置为 false
      currentChannel.loading = false

      // 4. 判断是否还有下一页数据
      if (!preTimestamp) {
        currentChannel.finished = true
      } else {
        // 还有数据，将本次得到的 preTimestamp 存储到当前频道，用于加载下一页数据
        currentChannel.timestamp = preTimestamp
      }
    }

    // onLoad () {
    //   console.log('onLoad called')
    //   // 异步更新数据
    //   setTimeout(() => {
    //     for (let i = 0; i < 10; i++) {
    //       // 0 1 1
    //       // 1 1 2
    //       // this.list.push(this.list.length + 1)
    //       // 将数据添加到当前频道.文章列表中
    //       const articles = this.currentChannel.articles
    //       articles.push(articles.length + 1)
    //     }

    //     // 本次数据加载完毕，关闭本次的 loading 状态
    //     this.currentChannel.loading = false

    //     // 本次 loading 完毕以后，列表数据也渲染到视图了
    //     // 列表组件会判断当前视图中的数据是否够一屏
    //     // 如果不够一屏，它会继续调用 onLoad
    //     // 每次 onLoad 的时候，它会自动把 loading 设置为 true

    //     // 数据全部加载完成，将 finished 设置为 true，列表就不再去 onLoad 了
    //     if (this.currentChannel.articles.length >= 40) {
    //       this.currentChannel.finished = true
    //     }
    //   }, 2000)
    // }
  }
}
</script>

<style lang="less">
.home {
  .van-tabs {
    .van-tabs__content {
      margin-bottom: 50px;
    }
  }
}
</style>

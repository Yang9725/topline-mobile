<template>
  <div class="home">
    <!-- 导航栏 -->
    <van-nav-bar fixed title="首页" />
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
        <!--
          v-model="isLoading" 控制下拉刷新的 loading 状态
          @refresh 当下拉刷新的时候，会触发组件的 refresh 方法
         -->
        <van-pull-refresh v-model="channel.pullDownLoading" @refresh="onRefresh">
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
            >
              <div slot="label">
                <!-- 文章图片 -->
                <van-grid :border="false" :column-num="3">
                  <van-grid-item v-for="(img, index) in article.cover.images" :key="index">
                    <!-- Vant 提供的一个显示图片组件 -->
                    <van-image height="80" :src="img" lazy-load />
                  </van-grid-item>
                </van-grid>
                <!-- /文章图片 -->

                <!-- 描述信息 -->
                <div class="article-info">
                  <div class="meta">
                    <span>{{ article.aut_name }}</span>
                    <span>{{ article.comm_count }}评论</span>
                    <span>{{ article.pubdate | relativeTime }}</span>
                  </div>
                </div>
                <!-- 描述信息 -->
              </div>
            </van-cell>
            <!-- /具体的内容 -->
          </van-list>
        </van-pull-refresh>
        <!-- /文章列表 -->
      </van-tab>

      <!-- 面包按钮 -->
      <div slot="nav-right" class="wap-nav" @click="isChannelEditShow = true">
        <van-icon name="wap-nav" size="24" />
      </div>
      <!-- /面包按钮 -->
    </van-tabs>
    <!-- /频道列表 -->

    <!-- 频道管理 -->
    <van-popup
      v-model="isChannelEditShow"
      position="bottom"
      :style="{ height: '95%' }"
      round
    >
      <!-- 关闭按钮 -->
      <van-cell icon="cross" :border="false" @click="isChannelEditShow = false" />
      <!-- /关闭按钮 -->

      <!-- 我的频道 -->
      <div>
        <van-cell title="我的频道" :border="false">
          <van-button
            type="danger"
            size="mini"
            @click="isEdit = !isEdit"
          >{{ isEdit ? '完成' : '编辑' }}</van-button>
        </van-cell>
        <van-grid :gutter="10">
          <van-grid-item
            v-for="(channel, index) in channels"
            :key="channel.id"
            :text="channel.name"
            @click="onUserChannelClick(channel, index)"
          >
            <van-icon
              v-show="isEdit"
              class="close-icon"
              slot="icon"
              name="close"
            />
          </van-grid-item>
        </van-grid>
      </div>
      <!-- /我的频道 -->

      <!-- 频道推荐 -->
      <div>
        <van-cell title="频道推荐" :border="false">
        </van-cell>
        <van-grid :gutter="10">
          <van-grid-item
            v-for="channel in remainingChannels"
            :key="channel.id"
            :text="channel.name"
            @click="onAddChannel(channel)"
          />
        </van-grid>
      </div>
      <!-- /频道推荐 -->
    </van-popup>
    <!-- /频道管理 -->
  </div>
</template>

<script>
import {
  getUserOrDefaultChannels,
  getAllChannels,
  resetUserChannels,
  deleteUserChannel
} from '@/api/channel'
import { getArticles } from '@/api/article'
import { mapState } from 'vuex'
import { getItem, setItem } from '@/utils/storage'

export default {
  name: 'HomeIndex',
  data () {
    return {
      active: 0, // 控制当前激活的标签页
      channels: [], // 频道列表
      isChannelEditShow: true, // 控制编辑频道的显示和隐藏
      allChannels: [],
      isEdit: false
    }
  },

  computed: {
    ...mapState(['user']),
    currentChannel () {
      // active 是动态的
      return this.channels[this.active]
    },

    /**
     * 获取剩余的频道
     */
    remainingChannels () {
      // 剩余频道 = 所有频道 - 我的频道
      const channels = []
      this.allChannels.forEach(channel => {
        // 如果我的频道不包含当前遍历频道，那它就是剩余的频道
        // find 方法：遍历数组，查找满足 item.id === channel.id 的元素，找到就返回该元素
        // 如果直到遍历结束都没有，则返回 undefined
        const index = this.channels.findIndex(item => item.id === channel.id)
        if (index === -1) {
          channels.push(channel)
        }
      })
      return channels
    }
  },

  created () {
    this.loadUserOrDefaultChannels()
    this.loadAllChannels()
  },

  methods: {
    async loadUserOrDefaultChannels () {
      // 开始的时候还没有考虑频道管理这件事儿，所以为了简单，这里直接获取了所有频道列表
      // const { data } = await getAllChannels()

      // 有了频道管理这个业务
      let channels = []
      // 1. 如果用户已登录，则请求获取后端存储的用户频道列表
      if (this.user) {
        const { data } = await getUserOrDefaultChannels()
        channels = data.data.channels
      } else {
        // 2. 如果用户没有登录，则查看本地存储是否有频道列表
        const localChannels = getItem('channels')
        // 2.1 如果本地存储有，则获取使用
        if (localChannels) {
          channels = localChannels
        } else {
          // 2.2 如果本地存储没有，则请求获取默认推荐的频道列表
          const { data } = await getUserOrDefaultChannels()
          channels = data.data.channels
        }
      }

      // 为每一个频道初始化一个成员 articles 用来存储该频道的文章列表
      // channels.forEach(channel => {
      //   channel.articles = [] // 频道的文章列表
      //   channel.loading = false // 频道的上拉加载更多的 loading 状态
      //   channel.finished = false // 频道的加载结束的状态
      //   channel.timestamp = null // 用于获取下一页数据的时间戳（页码）
      //   channel.pullDownLoading = false // 频道的下拉刷新 loading 状态
      // })

      channels.forEach(channel => {
        // channel: { id: xxx, name: xxx }
        // extendChannelData() { articles: xxx, loading: xxx..... }
        const extendData = this.extendChannelData()
        // 把 extendData 合并到 channel 中
        Object.assign(channel, extendData)
      })

      this.channels = channels
    },

    /**
     * 上拉加载更多处理函数
     */
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
    },

    /**
     * 下拉刷新处理函数
     */
    async onRefresh () {
      // 1. 请求获取文章列表
      const currentChannel = this.currentChannel
      const { data } = await getArticles({
        channelId: currentChannel.id,
        timestamp: Date.now(),
        withTop: 1
      })

      // 2. 将数据添加到当前频道.article数据中（顶部）
      currentChannel.articles.unshift(...data.data.results)

      // 3. 关闭当前频道下拉刷新的 loading 状态
      currentChannel.pullDownLoading = false

      // 4. 提示用户刷新成功
      this.$toast('刷新成功')
    },

    /**
     * 获取所有频道
     */
    async loadAllChannels () {
      const { data } = await getAllChannels()
      const channels = data.data.channels

      // 为每一个频道初始化一个成员 articles 用来存储该频道的文章列表
      // channels.forEach(channel => {
      //   channel.articles = [] // 频道的文章列表
      //   channel.loading = false // 频道的上拉加载更多的 loading 状态
      //   channel.finished = false // 频道的加载结束的状态
      //   channel.timestamp = null // 用于获取下一页数据的时间戳（页码）
      //   channel.pullDownLoading = false // 频道的下拉刷新 loading 状态
      // })

      channels.forEach(channel => {
        // channel: { id: xxx, name: xxx }
        // extendChannelData() { articles: xxx, loading: xxx..... }
        const extendData = this.extendChannelData()
        // 把 extendData 合并到 channel 中
        Object.assign(channel, extendData)
      })

      this.allChannels = channels
    },

    /**
     * 添加频道处理函数
     */
    async onAddChannel (channel) {
      // 添加到我的频道
      this.channels.push(channel)

      // 持久化
      if (this.user) {
        // 已登录：请求保存到后端
        // [ { id: 频道id, seq: 序号 }, { id: 频道id, seq: 序号 }, ]
        const channels = []

        // 处理提取要重置的频道列表
        // this.channels.slice(1) 不包括第1个频道（推荐）
        this.channels.slice(1).forEach((item, index) => {
          channels.push({
            id: item.id,
            seq: index + 2
          })
        })

        // 请求重置
        await resetUserChannels(channels)
      } else {
        // 未登录：本地存储
        setItem('channels', this.channels)
      }
    },

    /**
     * 我的频道中的点击处理函数
     */
    async onUserChannelClick (channel, index) {
      // 如果是编辑状态，删除频道
      if (this.isEdit) {
        // 删除频道
        this.channels.splice(index, 1) // 将数据从视图中移除

        // 持久化
        if (this.user) {
          // 已登录，请求删除
          await deleteUserChannel(channel.id)
        } else {
          // 未登录，删除本地存储
          // 注意：本地存储中的数据无法像操作 js 数据成员一样来修改
          //      如果想要修改，则重新存储实现修改
          setItem('channels', this.channels)
        }
      } else {
        // 如果是非编辑状态，则切换频道
        // 让频道列表切换到点击的这个频道
        this.active = index
        // 关闭弹层
        this.isChannelEditShow = false
      }
    },

    /**
     * 自定义扩展频道数据
     */
    extendChannelData () {
      return {
        articles: [],
        loading: false,
        finished: false,
        timestamp: null,
        pullDownLoading: false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.home {
  .van-tabs {
    /deep/ .van-tabs__content {
      margin-bottom: 50px;
      margin-top: 90px;
    }
    /deep/ .van-tabs__wrap {
      position: fixed;
      top: 46px;
      z-index: 2;
      left: 0;
      right: 0;
    }
  }

  .article-info {
    .meta span {
      margin-right: 10px;
    }
  }

  .wap-nav {
    position: sticky;
    right: 0;
    display: flex;
    align-items: center;
    background-color: #fff;
    opacity: 0.8;
  }

  .close-icon {
    position: absolute;
    top: -5px;
    right: -5px;
  }
}
</style>

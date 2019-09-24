<template>
  <div class="serach-result">
    <!-- 导航栏 -->
    <van-nav-bar
      :title="`${$route.params.q}的搜索结果`"
      left-arrow
      fixed
      @click-left="$router.back()"
    />
    <!-- /导航栏 -->

    <!-- 文章列表 -->
    <van-list
      class="article-list"
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell
        v-for="article in list"
        :key="article.art_id.toString()"
        :title="article.title"
      />
    </van-list>
    <!-- /文章列表 -->
  </div>
</template>

<script>
import { getSearch } from '@/api/search'

export default {
  name: 'SearchResult',
  data () {
    return {
      list: [],
      loading: false,
      finished: false,
      page: 1
    }
  },

  methods: {
    async onLoad () {
      // 1. 请求获取数据
      const { data } = await getSearch({
        page: this.page, // 页码
        perPage: 20, // 每页大小
        q: this.$route.params.q
      })

      // 2. 将请求结果保存到当前组件的 list 中
      const { results } = data.data
      this.list.push(...results)

      // 3. 关闭 loading
      this.loading = false

      // 4. 判断是否已全部加载结束
      if (results.length) {
        // 4.1 如果有，更新页码
        this.page++
      } else {
        // 4.2 如果没有数据了，则将 finished 设置为 true，不再 onLoad
        this.finished = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.serach-result {
  .article-list {
    margin-top: 46px;
  }
}
</style>

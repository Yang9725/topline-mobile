<template>
  <div>
    <van-nav-bar
      left-arrow
      :title="q + ' 的搜索结果'"
      @click-left="$router.back()"
      fixed
    />
    <van-list
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell
        v-for="item in articles"
        :key="item.art_id.toString()"
        :title="item.title"
      />
    </van-list>
  </div>
</template>

<script>
import { getSearch } from '@/api/search'

export default {
  name: 'SearchResult',
  props: ['q'],
  data () {
    return {
      articles: [],
      loading: false,
      finished: false,
      page: 1
    }
  },

  methods: {
    async onLoad () {
      // 请求
      const { data } = await getSearch({
        page: this.page,
        per_page: 10,
        q: this.$route.params.q
      })
      // 将请求结果保存到当前组件中
      const { results } = data.data

      this.articles.push(...results)

      // 判断是否已全部加载结束
      // 如果没有，更新页码
      // 如果已结束，则将finished 设置为 true , 不在onload
      if (!results.length) {
        // 设置数据全部加载结束，不再 onLoad
        this.finished = true
      } else {
        // 让页码+1用于下一次请求
        this.page++
      }

      // 关闭loading
      this.loading = false
    }
  }
}
</script>

<style>
.van-list {
  margin-top: 46px;
}
</style>

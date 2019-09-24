<template>
  <div>
    <!-- 搜索框 -->
    <form action="/">
      <van-search
        v-model="searchText"
        placeholder="请输入搜索关键词"
        show-action
        @search="onSearch(searchText)"
        @cancel="onCancel"
      />
    </form>
    <!-- /搜索框 -->

    <!-- 联想建议 -->
    <van-cell-group v-if="searchText">
      <van-cell
        icon="search"
        v-for="item in suggestions"
        :key="item"
        @click="onSearch(item)"
      >
        <!-- <span style="color: red">hello</span> world -->

        <!-- 如果绑定的数据中有 HTML 标签，则默认当做字符串渲染 -->
        <!-- <div slot="title">{{ item }}</div> -->

        <!-- 如果想要把字符串中的 HTML 标签渲染出来，则使用 v-html 指定 -->
        <!-- <div slot="title" v-html="item"></div> -->

        <!--
          如果这里是 {{}} 绑定，那建议使用过滤器来处理渲染成其它内容，不影响数据本身
          但是，过滤器只能用于 {{}}、v-bind
          实现方式：使用函数就可以了
        -->
        <div slot="title" v-html="highLight(item)"></div>
      </van-cell>
    </van-cell-group>
    <!-- /联想建议 -->

    <!-- 历史记录 -->
    <van-cell-group v-else>
      <van-cell title="历史记录">
        <template v-if="isDeleteShow">
          <span style="margin-right: 10px;" @click="searchHistories = []">全部删除</span>
          <span @click="isDeleteShow = false">完成</span>
        </template>
        <van-icon
          v-else
          slot="right-icon"
          name="delete"
          style="line-height: inherit;"
          @click="isDeleteShow = true"
        />
      </van-cell>
      <van-cell
        :title="item"
        v-for="(item, index) in searchHistories"
        :key="item"
        @click="onSearch(item)"
      >
        <van-icon
          slot="right-icon"
          name="close"
          style="line-height: inherit;"
          v-show="isDeleteShow"
          @click="searchHistories.splice(index, 1)"
        />
      </van-cell>
    </van-cell-group>
    <!-- /历史记录 -->
  </div>
</template>

<script>
import { getSearchSuggestions } from '@/api/search'
import { getItem, setItem } from '@/utils/storage'
import { debounce } from 'lodash'

export default {
  name: 'SearchIndex',
  data () {
    return {
      searchText: '',
      suggestions: [],
      isDeleteShow: false,
      // searchHistories: [] // 搜索历史记录
      searchHistories: getItem('search-histories') || [] // 搜索历史记录
    }
  },

  // 监视只有运行的是当前页面才工作
  watch: {
    // 当文本框数据变化要执行的函数
    // 默认的方式：立即执行，而且一定会执行
    // async searchText (newValue) {

    // 对象的属性函数简写方式
    // 函数名 () {}

    // 完整写法
    // 函数名: function () {}

    // 所以：
    searchText: debounce(async function (newValue) {
      // 校验非空
      if (!newValue.length) {
        return
      }

      // 请求获取数据
      const { data } = await getSearchSuggestions(newValue)

      const options = data.data.options

      // // 处理
      // options.forEach((item, index) => {
      //   // /newValue/ 这样是把 newValue 当做字符串去使用了
      //   // 正则表达式有两种创建方式：
      //   // 方式一：/xxxx/g
      //   // 方式二：new RegExp('字符串匹配模式')
      //   const reg = new RegExp(newValue, 'gi')
      //   options[index] = item.replace(reg, `<span style="color: red;">${newValue}</span>`)
      // })

      this.suggestions = options

      // 模板绑定
    }, 1000),

    searchHistories (newValue) {
      // 当数据发生改变，重新保存到本地存储
      setItem('search-histories', newValue)
    }
  },

  methods: {
    onSearch (q) {
      if (!q.trim().length) {
        return
      }

      // 记录历史记录
      const searchHistories = this.searchHistories

      const index = searchHistories.findIndex(item => {
        // 忽略空格、大小写
        return item.trim().toLowerCase() === q.trim().toLowerCase()
      })

      // 如果已存在，则将其移除
      if (index !== -1) {
        searchHistories.splice(index, 1)
      }

      // 将最新搜索记录保存到最前面
      searchHistories.unshift(q)

      // 监视不是立即发生的，起码等着当前函数执行完它才会去判定数据到底有没有改变

      // 虽然我们通过监视数据改变的方式处理数据的持久化
      // 但是这里还要手动的来存储这个数据，因为后面的代码会发生页面跳转
      // 页面跳转的时候回先销毁当前页面（事件、watch、生命周期。。。。都被干掉了），然后再加载新的页面
      setItem('search-histories', searchHistories)

      // 跳转到搜索结果页面
      // 路由跳转，会先销毁当前页面，然后再加载新的页码
      this.$router.push({
        name: 'search-result',
        params: {
          q
        }
      })
    },
    onCancel () {},

    highLight (str) {
      const reg = new RegExp(this.searchText, 'gi')
      return str.replace(reg, `<span style="color: red;">${this.searchText}</span>`)
    }
  }
}
</script>

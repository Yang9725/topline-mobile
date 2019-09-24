<template>
  <div>
    <!-- 搜索框 -->
    <form action="/">
      <van-search
        v-model="searchText"
        placeholder="请输入搜索关键词"
        show-action
        @search="onSearch"
        @cancel="onCancel"
      />
    </form>
    <!-- /搜索框 -->

    <!-- 联想建议 -->
    <van-cell-group>
      <van-cell
        icon="search"
        v-for="item in suggestions"
        :key="item"
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
    <van-cell-group>
      <van-cell title="历史记录">
        <span style="margin-right: 10px;">全部删除</span>
        <span>完成</span>
        <van-icon
          slot="right-icon"
          name="delete"
          style="line-height: inherit;"
        />
      </van-cell>
      <van-cell title="hello" v-for="value in 5" :key="value">
        <van-icon
          slot="right-icon"
          name="close"
          style="line-height: inherit;"
        />
      </van-cell>
    </van-cell-group>
    <!-- /历史记录 -->
  </div>
</template>

<script>
import { getSearchSuggestions } from '@/api/search'

export default {
  name: 'SearchIndex',
  data () {
    return {
      searchText: '',
      suggestions: []
    }
  },

  watch: {
    async searchText (newValue) {
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
    }
  },

  methods: {
    onSearch () {},
    onCancel () {},

    highLight (str) {
      const reg = new RegExp(this.searchText, 'gi')
      return str.replace(reg, `<span style="color: red;">${this.searchText}</span>`)
    }
  }
}
</script>

<template>
<div>
    <mu-appbar style="width: 100%;" color="primary">
        <mu-button icon slot="left">
            0
        </mu-button>
        这里是爬虫抓取
        <mu-button flat slot="right">LOGIN</mu-button>
    </mu-appbar>
    <mu-container>
        <div v-for="(item,index) in testinfo" :key="index">
            <mu-card style="width: 100%; max-width: 375px; margin: 0 auto;">
                <mu-card-header :title="item.title" :sub-title="item.txname">
                    <mu-avatar slot="avatar">
                        <img :src="item.tximg"/>
                    </mu-avatar>
                </mu-card-header>
                <mu-card-media title="图片" v-if="item.contentimg1 || item.contentimg2 ||item.contentimg3">
                    <img :src="item.contentimg1" v-if="item.contentimg1"/>
                     <img :src="item.contentimg2" v-else-if="item.contentimg2"/>
                      <img :src="item.contentimg3" v-else/>
  </mu-card-media>
            </mu-card>

        </div>
    </mu-container>
</div>
</template>

<script>
export default {
    name: 'hello',
    data() {
        return {
            testinfo: []
        }
    },
    mounted() {
        let s = document.createElement('meta')
        s.setAttribute('name', 'referrer')
        s.setAttribute('content', 'never')
        document.head.appendChild(s)
        let that = this;
        const cheerio = require('cheerio');
        this.$ajax.get('https://bbs.hupu.com/selfie-1', {}).then((res) => {
            let $ = cheerio.load(res.data)
            $('.titlelink>a:first-child').each(function (idx, element) {

                that.$ajax.get('https://bbs.hupu.com' + element.attribs.href, {}).then((res) => {
                    let $ = cheerio.load(res.data)
                    let title = $('.bbs-hd-h1>h1').attr('data-title'); //帖子标题
                    let tximg = $('.headpic:first-child>img').attr('src'); //用户头像
                    let txname = $('.j_u:first-child').attr('uname'); //用户ID
                    let contentimg1 = $('.quote-content>p:nth-child(1)>img').attr('src'); //爆照图1
                    let contentimg2 = $('.quote-content>p:nth-child(2)>img').attr('src'); //爆照图2
                    let contentimg3 = $('.quote-content>p:nth-child(3)>img').attr('src'); //爆照图3
                    that.testinfo.push({
                        title: title,
                        tximg: tximg,
                        txname: txname,
                        contentimg1: contentimg1,
                        contentimg2: contentimg2,
                        contentimg3: contentimg3
                    })
                    console.log(that.testinfo)
                })
            })

        })
    },
    methods: {

    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>

</style>

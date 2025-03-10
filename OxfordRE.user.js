// ==UserScript==
// @name         OxfordRE Downloader
// @namespace    https://qinlili.bid
// @version      0.3.1
// @description  导出为EPUB
// @author       琴梨梨
// @match        https://oxfordre.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=oxfordre.com
// @require      https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js
// @grant        none
// @run-at       document-idle
// @downloadURL https://github.com/qinlili23333/EbookDownloadScripts/raw/refs/heads/main/OxfordRE.user.js
// @updateURL   https://github.com/qinlili23333/EbookDownloadScripts/raw/refs/heads/main/OxfordRE.user.js
// ==/UserScript==
(async function() {
    'use strict';

    //==========================================
    //           项目代号:MOOROOKA
    //               版本:0.3.1
    //               琴梨梨 2025
    //          赶在飓风之前写完的更新
    //     已添加内建依赖:SakiProgress 1.0.4
    //            本项目完全免费开源
    //==========================================
    //   推荐使用ctfile.qinlili.bid解析城通网盘
    //   推荐使用t.qinlili.bid/caj云转换CAJ文件
    //       推荐b站关注:帅比笙歌超可爱OvO
    //==========================================
    //请在下方调整你的偏好
    const config = {
        //CSS保存的激进程度，这个版本目前没用但我先放在这里
        cssFilterAggressiveLevel:0,
        //下载失败时最大的重试次数，网络不稳定情况适当调大
        maxRetry:3,
        //失败后的重试延迟
        retryDelay:1000,
    }
    //爬取失败时请带上F12内的log反馈

    //初始化依赖
    const SakiProgress = {
        isLoaded: false,
        progres: false,
        pgDiv: false,
        textSpan: false,
        first: false,
        alertMode: false,
        init: function (color) {
            if (!this.isLoaded) {
                this.isLoaded = true;
                console.info("SakiProgress Initializing!\nVersion:1.0.4\nQinlili Tech:Github@qinlili23333");
                this.pgDiv = document.createElement("div");
                this.pgDiv.id = "pgdiv";
                this.pgDiv.style = "z-index:99999;position:fixed;background-color:white;min-height:32px;width:auto;height:32px;left:0px;right:0px;top:0px;box-shadow:0px 2px 2px 1px rgba(0, 0, 0, 0.5);transition:opacity 0.5s;display:none;";
                this.pgDiv.style.opacity = 0;
                this.first = document.body.firstElementChild;
                document.body.insertBefore(this.pgDiv, this.first);
                this.first.style.transition = "margin-top 0.5s"
                this.progress = document.createElement("div");
                this.progress.id = "dlprogress"
                this.progress.style = "position: absolute;top: 0;bottom: 0;left: 0;background-color: #F17C67;z-index: -1;width:0%;transition: width 0.25s ease-in-out,opacity 0.25s,background-color 1s;"
                if (color) {
                    this.setColor(color);
                }
                this.pgDiv.appendChild(this.progress);
                this.textSpan = document.createElement("span");
                this.textSpan.style = "padding-left:4px;font-size:24px;";
                this.textSpan.style.display = "inline-block"
                this.pgDiv.appendChild(this.textSpan);
                var css = ".barBtn:hover{ background-color: #cccccc }.barBtn:active{ background-color: #999999 }";
                var style = document.createElement('style');
                if (style.styleSheet) {
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild(document.createTextNode(css));
                }
                document.getElementsByTagName('head')[0].appendChild(style);
                console.info("SakiProgress Initialized!");
            } else {
                console.error("Multi Instance Error-SakiProgress Already Loaded!");
            }
        },
        destroy: function () {
            if (this.pgDiv) {
                document.body.removeChild(this.pgDiv);
                this.isLoaded = false;
                this.progres = false;
                this.pgDiv = false;
                this.textSpan = false;
                this.first = false;
                console.info("SakiProgress Destroyed!You Can Reload Later!");
            }
        },
        setPercent: function (percent) {
            if (this.progress) {
                this.progress.style.width = percent + "%";
            } else {
                console.error("Not Initialized Error-Please Call `init` First!");
            }
        },
        clearProgress: function () {
            if (this.progress) {
                this.progress.style.opacity = 0;
                setTimeout(function () { SakiProgress.progress.style.width = "0%"; }, 500);
                setTimeout(function () { SakiProgress.progress.style.opacity = 1; }, 750);
            } else {
                console.error("Not Initialized Error-Please Call `init` First!")
            }
        },
        hideDiv: function () {
            if (this.pgDiv) {
                if (this.alertMode) {
                    setTimeout(function () {
                        SakiProgress.pgDiv.style.opacity = 0;
                        SakiProgress.first.style.marginTop = "";
                        setTimeout(function () {
                            SakiProgress.pgDiv.style.display = "none";
                        }, 500);
                    }, 3000);
                } else {
                    this.pgDiv.style.opacity = 0;
                    this.first.style.marginTop = "";
                    setTimeout(function () {
                        SakiProgress.pgDiv.style.display = "none";
                    }, 500);
                }
            }
            else {
                console.error("Not Initialized Error-Please Call `init` First!");
            }
        },
        showDiv: function () {
            if (this.pgDiv) {
                this.pgDiv.style.display = "";
                setTimeout(function () { SakiProgress.pgDiv.style.opacity = 1; }, 10);
                this.first.style.marginTop = (this.pgDiv.clientHeight + 8) + "px";
            }
            else {
                console.error("Not Initialized Error-Please Call `init` First!");
            }
        },
        setText: function (text) {
            if (this.textSpan) {
                if (this.alertMode) {
                    setTimeout(function () {
                        if (!SakiProgress.alertMode) {
                            SakiProgress.textSpan.innerText = text;
                        }
                    }, 3000);
                } else {
                    this.textSpan.innerText = text;
                }
            }
            else {
                console.error("Not Initialized Error-Please Call `init` First!");
            }
        },
        setTextAlert: function (text) {
            if (this.textSpan) {
                this.textSpan.innerText = text;
                this.alertMode = true;
                setTimeout(function () { this.alertMode = false; }, 3000);
            }
            else {
                console.error("Not Initialized Error-Please Call `init` First!");
            }
        },
        setColor: function (color) {
            if (this.progress) {
                this.progress.style.backgroundColor = color;
            }
            else {
                console.error("Not Initialized Error-Please Call `init` First!");
            }
        },
        addBtn: function (img) {
            if (this.pgDiv) {
                var btn = document.createElement("img");
                btn.style = "display: inline-block;right:0px;float:right;height:32px;width:32px;transition:background-color 0.2s;"
                btn.className = "barBtn"
                btn.src = img;
                this.pgDiv.appendChild(btn);
                return btn;
            }
            else {
                console.error("Not Initialized Error-Please Call `init` First!");
            }
        },
        removeBtn: function (btn) {
            if (this.pgDiv) {
                if (btn) {
                    this.pgDiv.removeChild(btn);
                }
            }
            else {
                console.error("Not Initialized Error-Please Call `init` First!");
            }
        }
    };
    const sleep = delay => new Promise(resolve => setTimeout(resolve, delay));
    const dlFile = (link, name) => {
        let eleLink = document.createElement('a');
        eleLink.download = name;
        eleLink.style.display = 'none';
        eleLink.href = link;
        document.body.appendChild(eleLink);
        eleLink.click();
        document.body.removeChild(eleLink);
    };
    //https://stackoverflow.com/a/46176314
    function fetchRetry(url, fetchOptions = {}) {
        let delay = config.retryDelay;
        let tries = config.maxRetry;
        function onError(err){
            let triesLeft = tries - 1;
            if(!triesLeft){
                throw err;
            }
            return sleep(delay).then(() => fetchRetry(url, fetchOptions));
        }
        return fetch(url,fetchOptions).catch(onError);
    }
    //https://stackoverflow.com/a/35511953
    function convertToValidFilename(string) {
        return (string.replace(/[\/|\\:*?"<>]/g, " "));
    }
    const getDOI = url => url.substring(url.indexOf("10."));
    //https://stackoverflow.com/a/20285053
    const toDataURL = url => fetchRetry(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
        console.log(blob.type);
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    }))
    //为什么变量名是father？因为我不是母平母正的人
    const isInside=(child,father)=>{
        //判断逻辑很粗暴，不断检索父元素直到和目标相同或到顶端
        //用递归实现，应该不会爆栈吧，要是这也能爆栈那我有点心疼HTML解析器了
        if(child.parentElement==father){
            return true;
        }else{
            if(child.parentElement.parentElement){
                return isInside(child.parentElement,father);
            }else{
                return false;
            }
        }
    }

    //提取指定元素的CSS，不包含inline项
    const cssExtract=async element=>{
        //读取CSS统计，准备循环
        let queryList={};
        let fontString="";
        const extractFontRule=async style=>{
            const cacheBySHA256=async url=>{
                const resp=await fetchRetry(url);
                const hashBuffer=await window.crypto.subtle.digest("SHA-256", await (await resp.clone().blob()).arrayBuffer());
                const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
                const hashHex = hashArray
                .map((b) => b.toString(16).padStart(2, "0"))
                .join(""); // convert bytes to hex string
                let cacheDepot = await caches.open("DOWNLOADER_CACHE");
                let cached=JSON.parse(localStorage.resourceCache);
                if(cached.indexOf(hashHex)==-1){
                    cached.push(hashHex);
                    localStorage.resourceCache=JSON.stringify(cached);
                }
                await cacheDepot.put("/SHA"+hashHex, resp.clone());
                return "SHA"+hashHex;
            }
            if(style.cssText.indexOf("fontawesome")>0){
                //过滤黑名单字体
                return ""
            }
            const regexp=/url\("([^"]+)"\)/g;
            const url=regexp.exec(style.cssText)["1"];
            if(!url.startsWith("http")&&!url.startsWith("/")){
                let newurl=await cacheBySHA256(/^.*\//g.exec(style.parentStyleSheet.href)+url);
                return style.cssText.replace(url,newurl);
            }else{
                let newurl=await cacheBySHA256(url);
                return style.cssText.replace(url,newurl);
            }
        }
        for(let sheet of document.styleSheets){
            if(sheet.media.mediaText=="print"){
                continue;
            }
            for(let style of sheet.cssRules){
                if(style.cssText.indexOf("@import")!=-1){
                    //处理资源本地化
                    let req=await fetchRetry(style.href, {
                        "method": "GET",
                        "mode": "cors",
                        "credentials": "omit"
                    })
                    let cssText=await req.text();
                    const stylesheet = new CSSStyleSheet();
                    stylesheet.replaceSync(cssText);
                    for(let substyle of stylesheet.rules){
                        if(substyle.cssText.indexOf("@font-face")!=-1){
                            if(substyle.style.getPropertyValue("src").length&&substyle.style.getPropertyValue("src").indexOf("data:")==-1&&substyle.style.getPropertyValue("src").indexOf("url")!=-1)
                            {
                                fontString+=await extractFontRule(substyle);
                            }else{
                                fontString+=substyle.cssText;
                            }
                            continue;
                        }
                        if(style.selectorText){
                            if(queryList[style.selectorText]){
                                queryList[style.selectorText].push(style);
                            }else{
                                queryList[style.selectorText]=[style];
                            }
                        }
                    }
                    continue;
                }
                if(style.cssText.indexOf("@font-face")!=-1){
                    if(style.style.getPropertyValue("src").length&&style.style.getPropertyValue("src").indexOf("data:")==-1&&style.style.getPropertyValue("src").indexOf("url")!=-1)
                    {
                        fontString+=await extractFontRule(style);
                    }else{
                        fontString+=style.cssText;
                    }
                    continue;
                }
                if(style.selectorText){
                    if(queryList[style.selectorText]){
                        queryList[style.selectorText].push(style);
                    }else{
                        queryList[style.selectorText]=[style];
                    }
                }
            }
        }
        //筛选CSS条目，判断对应元素是否在目标元素内
        let filterStyleList=[];
        for(let query in queryList){
            //终于写好了pseudo过滤，削减了一半的文件体积
            if(query.indexOf("::")==0||query.indexOf(":")==0){
                filterStyleList=filterStyleList.concat(queryList[query]);
                continue;
            }
            if(query.indexOf(":")>0){
                let originquery=query.replaceAll(/:([^,]+)(|$)/g,"");
                for(let ele of document.body.querySelectorAll(originquery)){
                    if(ele==element||isInside(ele,element)){
                        filterStyleList=filterStyleList.concat(queryList[query]);
                        break;
                    }
                }
                continue;
            }
            for(let ele of document.body.querySelectorAll(query)){
                if(ele==element||isInside(ele,element)){
                    filterStyleList=filterStyleList.concat(queryList[query]);
                    break;
                }
            }
        }
        console.log(filterStyleList);
        //合并CSS并返回
        let cssString=fontString;
        for(let css of filterStyleList){
            cssString+=css.cssText;
        }
        return cssString;
    }

    const xhtmlBuilder=(title,css,body)=>{
        //整合输出xhtml文本
        return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
<title>${title}</title>
<style>${css}</style>
</head>
<body>
${body}
</body>
</html>`
    }


    if(document.getElementById("readPanel")){
        await sleep(1500);
        let cacheDepot = await caches.open("DOWNLOADER_CACHE");
        //具体文章页面，执行XHTML规格化
        [].forEach.call(document.querySelectorAll("#pageBody>*"),ele=>{if(ele.className!="mainBase"){document.getElementById("pageBody").removeChild(ele);}});
        [].forEach.call(document.querySelectorAll(".findThisResource"),ele=>{ele.parentElement.removeChild(ele);});
        [].forEach.call(document.querySelectorAll("[alt='unlocked']"),ele=>{ele.parentElement.removeChild(ele);});
        //去除所有隐藏元素节约体积
        const target=document.getElementById("pageBody");
        [].forEach.call(target.querySelectorAll("*"),ele=>{if(getComputedStyle(ele).display=="none"){ele.parentElement.removeChild(ele);}});
        const css=await cssExtract(target);
        //图片转base64内联
        for(let img of target.getElementsByTagName("img")){
            img.src=await toDataURL(img.src);
        };
        [].forEach.call(target.querySelectorAll("*"),element=>{
            //按照XHTML规范重写
            if(element.outerHTML.split("<").length==2&&["AREA","BASE","BR","COL","EMBED","HR","IMG","INPUT","LINK","META","PARAM","SOURCE","TRACK","WBR"].indexOf(element.tagName)>=0){
                //非双标签，检查闭合
                if(element.outerHTML.slice(-2)!="/>"){
                    //Chrome非要设置outerHTML时把XHTML格式回HTML，只能这么后处理了
                    element.outerHTML=element.outerHTML.replaceAll(">",' iwanttoputaslashherebutchromekeepsformattingitbackwhenusingouterhtml="" >');
                }
            }
        });
        //我他妈也不知道为什么这b网站的html这么多空格和换行，替换掉再说
        //虽然regex处理html可能有问题，但这里的xhtml没有css也没有脚本我不信这他妈还能出问题
        let originHTML=`<div class="twoColumnOmega" id="contentWrapper"><div id="columnWrapper"><div class="clearfix" id="pageBody"><div id="mainContent" class="mainBase">`+target.outerHTML.replaceAll('iwanttoputaslashherebutchromekeepsformattingitbackwhenusingouterhtml=""',"/").replaceAll(/>[\s\n]+</g,"><")+`</div></div></div></div>`;
        //这样大致页面是能跑起来了
        await cacheDepot.put(location.href, new Response(xhtmlBuilder(document.getElementsByTagName("h1")[0]?document.getElementsByTagName("h1")[0].innerText:document.getElementsByTagName("h3")[0].innerText,css,originHTML), { status: 200,type:"cors", header: { "content-type": "application/xhtml+xml; charset=utf-8" } }));
        //保存DOI映射关系以便后期替换
        const doi=getDOI(document.querySelector(".doi").innerText);
        let mirror=JSON.parse(localStorage.doiList);
        mirror[location.pathname]=doi;
        localStorage.doiList=JSON.stringify(mirror);
        if(window.self !== window.top){
            window.parent.postMessage("next", "*");
        }
    }

    //首页
    if(document.getElementsByClassName("welcomeBody")[0]){
        const dlBtn=`<p><a id="init_download">Download As EPUB</a></p>`;
        document.getElementsByClassName("welcomeBody")[0].insertAdjacentHTML("beforeend",dlBtn);
        document.getElementById("init_download").addEventListener("click",()=>{
            if(localStorage.downloaderStatus=="RUN"&&!confirm("检测到正在进行或未完成的下载，如需继续请确保其他下载已停止！")){
                return;
            }
            localStorage.downloaderStatus="RUN";
            localStorage.downloaderCache="[]";
            localStorage.doiList="{}";
            localStorage.resourceCache="[]";
            localStorage.downloadCollection=location.pathname.replaceAll("/","");
            location.href="https://oxfordre.com/"+localStorage.downloadCollection+"/browse?avail=unlocked&avail_3=unlocked&avail_4=free&page=1&pageSize=20&sort=titlesort&subSite="+localStorage.downloadCollection;
        });
    }
    //搜索页面，保存并进入下一页直到最后一页
    if(document.getElementById("refineSearchTerms")&&localStorage.downloaderStatus=="RUN"){
        //保存所有页面的链接到缓存
        let cache=JSON.parse(localStorage.downloaderCache);
        [].forEach.call(document.getElementsByClassName("itemTitle"),ele=>{
            const title=ele.querySelector("a");
            const url=new URL(title.href);
            cache.push({
                title:title.innerText,
                //过滤掉跟踪参数
                link:url.origin+url.pathname,
                path:url.pathname
            });
        });
        localStorage.downloaderCache=JSON.stringify(cache);
        if(document.getElementsByClassName("current")[0].nextElementSibling){
            //下一页
            document.getElementsByClassName("current")[0].nextElementSibling.click();
        }else{
            //最后一页
            SakiProgress.init();
            SakiProgress.showDiv();
            SakiProgress.setText("正在整理列表...");
            SakiProgress.setPercent(1);
            let newcache=[];
            for(let i=0;i<cache.length;i++){
                let link=cache[i].link
                let dup=false;
                for(let j=0;j<newcache.length;j++){
                    if(link==newcache[j].link){
                        dup=true;
                    }
                }
                if(!dup){
                    newcache.push(cache[i]);
                }
            }
            cache=newcache;
            localStorage.downloaderCache=JSON.stringify(cache);
            let cacheDepot = await caches.open("DOWNLOADER_CACHE");
            const prepareFile=async link=>{
                console.log(link);
                let frame=document.createElement("iframe");
                frame.style="width:100vw;height:100vh";
                document.body.appendChild(frame);
                function waitEPUBGenerate(link) {
                    return new Promise(resolve => {
                        frame.src=link;
                        let success=false;
                        const listen=async (event) => {
                            console.log(event.data)
                            if (event.data.startsWith("next")) {
                                success=true;
                                resolve(true);
                                window.removeEventListener("message",listen);
                                document.body.removeChild(frame);
                            }
                        };
                        window.addEventListener("message", listen, false);
                        setTimeout(()=>{
                            if(!success){
                                resolve(false);
                                window.removeEventListener("message",listen);
                                document.body.removeChild(frame);
                            }
                        },60000);
                    });
                }
                const result = await waitEPUBGenerate(link);
                return result;
            }
            for(let i in cache){
                if (cache.hasOwnProperty(i)) {
                    SakiProgress.setPercent(5+i/cache.length*60);
                    SakiProgress.setText("正在爬取...["+(-(-1-i))+"/"+cache.length+"]");
                    if(!await cacheDepot.match(cache[i].link)){
                        while(!await prepareFile(cache[i].link)){
                        };
                    }
                }
            }
            SakiProgress.setPercent(65);
            SakiProgress.setText("生成文件结构...");
            let files=[]
            files.push({name:"mimetype",content:"application/epub+zip"});
            files.push({name:"META-INF/container.xml",content:`<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`})
            //添加爬取的内容
            let doiList=JSON.parse(localStorage.doiList);
            for(let i in cache){
                if (cache.hasOwnProperty(i)) {
                    SakiProgress.setPercent(65+i/cache.length*10);
                    SakiProgress.setText("正在执行后处理...["+(-(-1-i))+"/"+cache.length+"]");
                    //await sleep(1);
                    let cacheReq=await cacheDepot.match(cache[i].link);
                    let text;
                    if(cacheReq){
                        text= await cacheReq.text();
                    }else{
                        alert("缓存出现问题，请刷新重试或反馈！");
                        throw new Error("缓存出现问题，请刷新重试或反馈！");
                    }
                    //执行链接替换
                    //分离最后一段，避免浪费大量时间在处理base64后的字体字符串上，提速114.514%
                    let [text1,text2]=text.split("Related Articles");
                    if(text2){
                        for(let i in cache){
                            if (cache.hasOwnProperty(i)) {
                                text2=text2.replaceAll(`href="${cache[i].path}"`,`href="${"Chap"+i+".xhtml"}"`);
                                text2=text2.replaceAll(`href="/${localStorage.downloadCollection+"/viewbydoi/"+doiList[cache[i].path]}"`,`href="${"Chap"+i+".xhtml"}"`);
                            }
                        }
                        text=text1+"Related Articles"+text2;
                    }
                    files.push({name:"OEBPS/xhtml/Chap"+i+".xhtml",content:text});
                }
            }
            //生成toc.ncx
            let tocnav="";
            let lastlevel=-1;
            for(let i in cache){
                if (cache.hasOwnProperty(i)) {
                    tocnav+=`<navPoint id="Chap${-(-1-i)}" playOrder="${-(-1-i)}">
<navLabel><text>${cache[i].title}</text></navLabel>
<content src="${"xhtml/Chap"+i+".xhtml"}"/>
</navPoint>`;
                }
            }
            let tocText=`<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="en-US">
<head>
<meta name="dtb:depth" content="1"/>
<meta name="dtb:totalPageCount" content="0"/>
<meta name="dtb:maxPageNumber" content="0"/>
</head>
<docTitle>
<text>${document.querySelector("#headerLogo > a > span").innerText}</text>
</docTitle>
<navMap>
${tocnav}
</navMap>
</ncx>`;
            files.push({name:"OEBPS/toc.ncx",content:tocText});
            //生成content.opf
            let opflist="";
            let spinelist="";
            for(let i in cache){
                if (cache.hasOwnProperty(i)) {
                    opflist+=`<item href="${"xhtml/Chap"+i+".xhtml"}" id="${"Chap"+i}" media-type="application/xhtml+xml"/>
`;
                    spinelist+=`<itemref idref="${"Chap"+i}"/>
`;
                }
            }
            SakiProgress.setPercent(75);
            SakiProgress.setText("整合资源文件...");
            //把缓存的资源文件添加到列表
            const cachedRes=JSON.parse(localStorage.resourceCache);
            for(let i=0;i<cachedRes.length;i++){
                files.push({name:"OEBPS/xhtml/SHA"+cachedRes[i],content:await (await cacheDepot.match("/SHA"+cachedRes[i])).blob()});
                    opflist+=`<item href="${"xhtml/SHA"+cachedRes[i]}" id="${cachedRes[i]}" media-type="application/octet-stream"/>
`;
            }
            let opfText=`<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="isbn9781040075340" version="3.0" xml:lang="en">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:title>${document.querySelector("#headerLogo > a > span").innerText}</dc:title>
<dc:format>application/ePub</dc:format>
<dc:date>${new Date().getFullYear() }</dc:date>
<dc:language>en</dc:language>
<dc:publisher>Oxford</dc:publisher>
<meta property="dcterms:modified">${(new Date()).toISOString()}</meta>
<meta content="cover-image" name="cover"/>
<meta property="schema:accessMode">textual</meta>
<meta property="schema:accessMode">visual</meta>
<meta property="schema:accessModeSufficient">textual</meta>
</metadata>
<manifest>
<item href="Cover.jpg" id="cover-image" media-type="image/jpeg" properties="cover-image"/>
<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
${opflist}</manifest>
<spine toc="ncx">
${spinelist}</spine>
</package>
`;
            files.push({name:"OEBPS/content.opf",content:opfText});
            let zip = new JSZip();
            for(let i=0;i<files.length;i++){
                SakiProgress.setPercent(80+i/files.length*10);
                SakiProgress.setText("正在创建压缩包...["+(i+1)+"/"+files.length+"]");
                await sleep(1);
                zip.file(files[i].name, files[i].content);
            }
            await sleep(100);
            SakiProgress.setPercent(90);
            SakiProgress.setText("正在打包...");
            let zipFile = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: {
                    level: 9
                }
            });
            SakiProgress.setPercent(97);
            SakiProgress.setText("正在导出...");
            await sleep(2000);
            dlFile(URL.createObjectURL(zipFile), convertToValidFilename(document.querySelector("#headerLogo > a > span").innerText)+ ".epub");
            SakiProgress.clearProgress();
            SakiProgress.setText("下载成功！");
            localStorage.downloaderStatus="IDLE";
        }
    }
})();

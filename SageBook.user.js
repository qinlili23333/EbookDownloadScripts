// ==UserScript==
// @name         Sage Book Downloader
// @namespace    https://qinlili.bid
// @version      0.1
// @description  Sage不提供EPUB下载，那就咱自己搓一个出来！
// @author       琴梨梨OvO
// @match        https://methods.sagepub.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=sagepub.com
// @require      https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(async function() {
    'use strict';

    //==========================================
    //          项目代号:CHERMSIDE
    //                版本:0.1
    //               琴梨梨 2025
    //         真有人会留意到我写的注释吗
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
    //https://stackoverflow.com/a/20285053
    const toDataURL = url => fetchRetry(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
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
    const cssExtract=element=>{
        //读取CSS统计，准备循环
        let queryList={};
        for(let sheet of document.styleSheets){
            for(let style of sheet.cssRules){
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
            for(let ele of document.body.querySelectorAll(query)){
                if(ele==element||isInside(ele,element)){
                    filterStyleList=filterStyleList.concat(queryList[query]);
                    break;
                }
            }
        }
        console.log(filterStyleList);
        //合并CSS并返回
        let cssString="";
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


    if(document.getElementsByClassName("page-section")[0]){
        await sleep(3000);
        //具体文章页面，执行XHTML规格化
        const target=document.getElementsByClassName("page-section")[0];
        const css=cssExtract(target);
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
        [].forEach.call(document.getElementsByClassName("file link-download"),ele=>{
            ele.parentElement.parentElement.removeChild(ele.parentElement);
        });
        let originHTML=target.outerHTML.replaceAll('iwanttoputaslashherebutchromekeepsformattingitbackwhenusingouterhtml=""',"/");
        //这样大致页面是能跑起来了
        let cacheDepot = await caches.open("DOWNLOADER_CACHE");
        await cacheDepot.put(location.href, new Response(xhtmlBuilder(document.getElementsByTagName("h1")[0]?document.getElementsByTagName("h1")[0].innerText:document.getElementsByTagName("h3")[0].innerText,css,originHTML), { status: 200,type:"cors", header: { "content-type": "application/xhtml+xml; charset=utf-8" } }));
        if(window.self !== window.top){
            window.parent.postMessage("next", "*");
        }
    }

    //目录页面，准备目录结构并爬取
    if(location.pathname.endsWith("/toc")){
        SakiProgress.init();
        SakiProgress.showDiv();
        SakiProgress.setText("准备基础信息...");
        await sleep(3000);
        let isbn=document.querySelector("#SlideHolderDesktop > div:nth-child(1) > ul > li:nth-child(2)").innerText;
        isbn=isbn.substring(isbn.indexOf(":")+1)
        let title=document.querySelector("#skip-link").innerText;
        let author=document.querySelector("#SlideHolder > ul > li:nth-child(1)").innerText;
        author=author.substring(author.indexOf(":")+1);
        let publisher=document.querySelector("#SlideHolder > ul > li:nth-child(2)").innerText;
        publisher=publisher.substring(publisher.indexOf(":")+1);
        let year=document.querySelector("#SlideHolder > ul > li:nth-child(3) > ul > li:nth-child(1)").innerText;
        year=year.substring(year.indexOf(":")+1);

        let toc=[];
        const getParentLi=title=>{
            if(title.parentElement.tagName=="LI"){
                return title.parentElement;
            }else{
                if(title.parentElement.parentElement){
                    return getParentLi(title.parentElement);
                }else{
                    return document.createElement("li");
                }
            }
        }
        [].forEach.call(document.querySelectorAll(".content-tab>li.k-item"),ele=>{
            //目录大类别，不用分类
            [].forEach.call(ele.querySelectorAll("a:not(.opener)"),title=>{
                //要计入目录的标题
                toc.push({
                    title:title.innerText,
                    link:title.href,
                    element:title,
                    level:0,
                    li:getParentLi(title)
                });
            })
        })
        //处理目录层级
        const recursiveFilterLevel=()=>{
            let oldtoc=toc.slice();
            for(let i in toc){
                toc.forEach(title=>{
                    if(isInside(toc[i].li,title.li)){
                        toc[i].level=title.level+1;
                    }
                })
            }
            let changed=false;
            for(let i in toc){
                if(toc[i].level!=oldtoc[i].level){
                    changed=true;
                }
            }
            if(changed){
                return recursiveFilterLevel();
            }
            return;
        }
        recursiveFilterLevel();
        console.log(toc);
        SakiProgress.setPercent(4);
        SakiProgress.setText("准备爬取...");
        let cacheDepot = await caches.open("DOWNLOADER_CACHE");
        const prepareFile=async link=>{
            console.log(link);
            let frame=document.createElement("iframe");
            frame.style="width:100vw;height:100vh";
            document.body.appendChild(frame);
            function waitEPUBGenerate(link) {
                return new Promise(resolve => {
                    frame.src=link;
                    const listen=async (event) => {
                        console.log(event.data)
                        if (event.data.startsWith("next")) {
                            resolve(true);
                            window.removeEventListener("message",listen);
                            document.body.removeChild(frame);
                        }
                    };
                    window.addEventListener("message", listen, false);
                    setTimeout(()=>{
                        resolve(false);
                        window.removeEventListener("message",listen);
                        document.body.removeChild(frame);
                    },60000);
                });
            }
            const result = await waitEPUBGenerate(link);
            return result;
        }
        for(let i in toc){
            SakiProgress.setPercent(5+i/toc.length*70);
            SakiProgress.setText("正在爬取...["+(-(-1-i))+"/"+toc.length+"]");
            if(!await cacheDepot.match(toc[i].link)){
                while(!await prepareFile(toc[i].link)){
                };
            }
        }
        SakiProgress.setPercent(75);
        SakiProgress.setText("生成文件结构...");
        let files=[]
        files.push({name:"mimetype",content:"application/epub+zip"});
        files.push({name:"META-INF/container.xml",content:`<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`})
        //添加爬取的内容
        for(let i in toc){
            let cacheReq=await cacheDepot.match(toc[i].link);
            let blob;
            if(cacheReq){
                blob= await cacheReq.blob();
            }else{
                alert("缓存出现问题，请刷新重试或反馈！");
                throw new Error("缓存出现问题，请刷新重试或反馈！");
            }
            files.push({name:"OEBPS/xhtml/Chap"+i+".xhtml",content:blob});
        }
        //添加封面
        files.push({name:"OEBPS/Cover.jpg",content:await (await fetchRetry(document.querySelector(".lock-container>img").src)).blob()});
        //生成toc.ncx
        let tocnav="";
        let lastlevel=-1;
        for(let i in toc){
            tocnav+=`
</navPoint>`.repeat(lastlevel-toc[i].level+1);
            tocnav+=`<navPoint id="toc${i+1}" playOrder="${i+1}">
<navLabel><text>${toc[i].title}</text></navLabel>
<content src="${"/xhtml/Chap"+i+".xhtml"}"/>`;
            lastlevel=toc[i].level;
        }
        tocnav+=`
</navPoint>`.repeat(lastlevel+1);

        let maxlevel=1;
        for(let i of toc){
            maxlevel=maxlevel<i.level+1?i.level+1:maxlevel;
        }
        let tocText=`<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="en-US">
<head>
<meta name="dtb:uid" content="${isbn}"/>
<meta name="dtb:depth" content="${maxlevel}"/>
<meta name="dtb:totalPageCount" content="0"/>
<meta name="dtb:maxPageNumber" content="0"/>
</head>
<docTitle>
<text>${title}</text>
</docTitle>
<navMap>
${tocnav}
</navMap>
</ncx>`;
        files.push({name:"OEBPS/toc.ncx",content:tocText});
        //生成content.opf
        let opflist="";
        let spinelist="";
        for(let i in toc){
            opflist+=`<item href="${"xhtml/Chap"+i+".xhtml"}" id="${"Chap"+i}" media-type="application/xhtml+xml"/>
`;
            spinelist+=`<itemref idref="${"Chap"+i}"/>
`;
        }

        let opfText=`<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="isbn9781040075340" version="3.0" xml:lang="en">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:title>${title}</dc:title>
<dc:creator id="creator1">${author.replaceAll("&",";")}</dc:creator><meta property="role" refines="#creator1" scheme="marc:relators">aut</meta>
<dc:format>application/ePub</dc:format>
<dc:date>${year}</dc:date>
<dc:identifier id="isbn${isbn}">${isbn}</dc:identifier>
<meta property="identifier-type" refines="#isbn${isbn}" scheme="onix:codelist5">15</meta>
<dc:source id="isbn${isbn}">${isbn}</dc:source>
<meta property="source-of" refines="#isbn${isbn}">pagination</meta>
<dc:language>en</dc:language>
<dc:publisher>${publisher}</dc:publisher>
<dc:relation>${isbn}</dc:relation>
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
<spine>
${spinelist}</spine>
</package>
`;
        console.log(opfText);
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
        dlFile(URL.createObjectURL(zipFile), convertToValidFilename(title)+ ".epub");
        SakiProgress.clearProgress();
        SakiProgress.setText("下载成功！");
    }
})();

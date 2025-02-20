// ==UserScript==
// @name         Wiley Refwork Downloader
// @namespace    https://qinlili.bid
// @version      0.1.1
// @description  EPUB支持
// @author       琴梨梨
// @match        https://onlinelibrary.wiley.com/doi/book/*
// @match        https://onlinelibrary.wiley.com/browse/book/*
// @match        https://onlinelibrary.wiley.com/doi/full/*
// @icon         https://onlinelibrary.wiley.com/favicon.ico
// @require      https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js
// @require      https://cdn.jsdelivr.net/npm/jspdf@3.0.0/dist/jspdf.umd.min.js
// @require      https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js
// @license      MPLv2
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';

    //==========================================
    //          项目代号:SALISBURY
    //               版本:0.1.1
    //               琴梨梨 2025
    //           DEVELOPED IN VSCODE
    //     已添加内建依赖:SakiProgress 1.0.4
    //            本项目完全免费开源
    //==========================================
    //   推荐使用ctfile.qinlili.bid解析城通网盘
    //   推荐使用t.qinlili.bid/caj云转换CAJ文件
    //       推荐b站关注:帅比笙歌超可爱OvO
    //==========================================
    //请在下方调整你的偏好
    const config = {
        //只保存JSON，适合想要自己使用TDM API下载的情况
        jsonOnly:false,
        //下载失败时最大的重试次数，网络不稳定情况适当调大
        maxRetry:3,
        //失败后的重试延迟
        retryDelay:1000,
        //狂暴模式，无视Wiley建议的间隔，大概率会被封IP，不建议
        furyMode:false
    }

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
                this.pgDiv.style = "z-index:9999;position:fixed;background-color:white;min-height:32px;width:auto;height:32px;left:0px;right:0px;top:0px;box-shadow:0px 2px 2px 1px rgba(0, 0, 0, 0.5);transition:opacity 0.5s;display:none;";
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
    SakiProgress.init();
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
            return sleep(delay).then(() => fetchRetry(url, delay, triesLeft, fetchOptions));
        }
        return fetch(url,fetchOptions).catch(onError);
    }
    //https://stackoverflow.com/a/35511953
    function convertToValidFilename(string) {
        return (string.replace(/[\/|\\:*?"<>]/g, " "));
    }
    const getDOI = url => url.substring(url.indexOf("10."));
    console.log(`==========================================
          项目代号:SALISBURY
               版本:0.1.1
               琴梨梨 2025
           DEVELOPED IN VSCODE
     已添加内建依赖:SakiProgress 1.0.4
            本项目完全免费开源
==========================================
   推荐使用ctfile.qinlili.bid解析城通网盘
   推荐使用t.qinlili.bid/caj云转换CAJ文件
==========================================`);
    if(location.pathname.startsWith("/doi/book/")){
        if(document.getElementsByClassName("icon-book-open").length){
            //普通书，无需处理
        }else{
            const dlBtn=`<li id="menu-item-main-menu-1-4" role="presentation" data-menu-label="Download All" class="menu-item"><a id="init_download" role="menuitem" tabindex="-1" class="sub-menu-item"><span>Download All</span></a></li>`
        document.getElementById("menubar").insertAdjacentHTML("beforeend",dlBtn);
            document.getElementById("init_download").addEventListener("click",()=>{
                if(localStorage.downloaderStatus=="RUN"&&!confirm("检测到正在进行或未完成的下载，如需继续请确保其他下载已停止！")){
                    return;
                }
                localStorage.downloaderStatus="RUN";
                localStorage.downloaderCache="[]";
                location.href="https://onlinelibrary.wiley.com/browse/book/"+getDOI(location.pathname)+"/title?pageSize=50&startPage=0";
            });
        }
    }
    if(location.pathname.startsWith("/browse/book/")){
        //可分析可用的页面
        if(localStorage.downloaderStatus=="RUN"){
            //执行解析
            const params = new URLSearchParams(location.search);
            let cache=JSON.parse(localStorage.downloaderCache);
            [].forEach.call(document.getElementsByClassName("meta__access"),ele=>{
                //添加到列表
                const info={
                    title:ele.parentElement.parentElement.getElementsByClassName("publication_title visitable")[0].innerText,
                    author:ele.parentElement.parentElement.getElementsByClassName("publication_contrib_author")[0]?.innerText,
                    date:ele.parentElement.parentElement.getElementsByClassName("meta__epubDate")[0]?.innerText.substring(17),
                    doi:getDOI(ele.parentElement.parentElement.getElementsByClassName("publication_title visitable")[0].href)
                }
                cache.push(info);
            });
            localStorage.downloaderCache=JSON.stringify(cache);
            if(document.getElementsByClassName("pagination__btn--next")[0]){
                //还有下一页
                document.getElementsByClassName("pagination__btn--next")[0].click();
            }else{
                //结束了
                SakiProgress.showDiv();
                SakiProgress.setText("正在整理列表...");
                SakiProgress.setPercent(1);
                let newcache=[];
                for(let i=0;i<cache.length;i++){
                    let doi=cache[i].doi
                    let dup=false;
                    for(let j=0;j<newcache.length;j++){
                        if(doi==newcache[j].doi){
                            dup=true;
                        }
                    }
                    if(!dup){
                        newcache.push(cache[i]);
                    }
                }
                cache=newcache;
                let fileCache=[];
                let cacheDepot = await caches.open("DOWNLOADER_CACHE");
                let lastReqTime=0;
                for(let i=0;i<cache.length;i++){
                    //逐个下载
                    let item=cache[i];
                    SakiProgress.setPercent(5+i/cache.length*60);
                    SakiProgress.setText("正在下载...["+(i+1)+"/"+cache.length+"]");
                    try{
                        const url="https://onlinelibrary.wiley.com/doi/pdfdirect/"+item.doi+"?download=true";
                        let cacheReq=await cacheDepot.match(url);
                        let blob;
                        if(cacheReq){
                            blob= await cacheReq.blob();
                        }else{
                            //遵守Wiley TDM频率要求，10秒一篇
                            let currentTime = Date.now()
                            if((currentTime-lastReqTime<10000)&&!config.furyMode){
                                SakiProgress.setText("正在等待下载冷却...["+(i+1)+"/"+cache.length+"]");
                                await sleep(10000-(currentTime-lastReqTime));
                            }
                            lastReqTime=currentTime;
                            SakiProgress.setText("正在下载...["+(i+1)+"/"+cache.length+"]");
                            let request = await fetchRetry("https://onlinelibrary.wiley.com/doi/pdfdirect/"+item.doi+"?download=true");
                            cacheDepot.put(url, request.clone());
                            blob = await request.blob();
                        }
                        if(blob.type=="application/pdf"){
                            fileCache.push({
                                name:convertToValidFilename(item.title+"-"+item.author+"-"+item.date+"-"+item.doi+".pdf"),
                                size:blob.size,
                                blob:blob
                            });
                            cache[i].success=true;
                        }else{
                            //不是PDF，尝试自行生成PDF
                            SakiProgress.setText("正在生成无法直接下载的PDF...");
                            let frame=document.createElement("iframe");
                            frame.style="width:100vw;height:100vh";
                            document.body.appendChild(frame);
                            function waitPDFGenerate() {
                                return new Promise(resolve => {
                                    frame.src="https://onlinelibrary.wiley.com/doi/full/"+item.doi;
                                    const listen=async (event) => {
                                        console.log(event.data)
                                        if (event.data.startsWith("blob")) {
                                            resolve(event.data);
                                            window.removeEventListener("message",listen);
                                            document.body.removeChild(frame);
                                        }
                                    };
                                    window.addEventListener("message", listen, false);
                                    setTimeout(()=>{
                                        resolve("Fail");
                                        window.removeEventListener("message",listen);
                                        document.body.removeChild(frame);
                                    },240000);
                                });
                            }
                            const result = await waitPDFGenerate();
                            if(result=="Fail"){
                                cache[i].success=false;
                                cache[i].errormsg="No PDF available. View at https://onlinelibrary.wiley.com/doi/full/"+item.doi;
                            }else{
                                const blob=await fetch(result).then(r => r.blob());
                                cache[i].success=true;
                                fileCache.push({
                                    name:convertToValidFilename("[GEN]"+item.title+"-"+item.author+"-"+item.date+"-"+item.doi+".pdf"),
                                    size:blob.size,
                                    blob:blob
                                });
                            }
                        }
                    }catch(e){
                        cache[i].success=false;
                        cache[i].errormsg=e.toString();
                    }
                }
                //准备打包
                SakiProgress.setPercent(65);
                SakiProgress.setText("正在创建清单...");
                let zip = new JSZip();
                zip.file("manifest.json", JSON.stringify(cache));
                for(let i=0;i<fileCache.length;i++){
                    SakiProgress.setPercent(67+i/cache.length*23);
                    SakiProgress.setText("正在创建压缩包...["+(i+1)+"/"+cache.length+"]");
                    await sleep(1);
                    zip.file(fileCache[i].name, fileCache[i].blob, { binary: true });
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
                dlFile(URL.createObjectURL(zipFile), convertToValidFilename(document.getElementById("banner-text").innerText)+ ".zip");
                SakiProgress.clearProgress();
                SakiProgress.setText("下载成功！");
                localStorage.downloaderStatus="IDLE";
            }
        }
    }

    if(location.pathname.startsWith("/doi/full/")){
        if(localStorage.downloaderStatus=="RUN"&&document.getElementsByClassName("pdf-download").length==0&&(window.self !== window.top)){
            [].forEach.call(document.getElementsByClassName("accordion__content"),ele=>{ele.style="display: block;"});
            [].forEach.call(document.getElementsByClassName("figure-extra"),ele=>{ele.style="display: none;"});
            [].forEach.call(document.getElementsByClassName("extra-links getFTR"),ele=>{ele.style="display: none;"});
            let styleSheet = document.createElement("style");
            //修复html2canvas的怪癖，虽然不知道为什么会这样，这么注入css能大致修好那就这样吧懒得折腾了
            styleSheet.textContent = `
article-section__content>i, article-section__content>span {
    top: -8px;
    position: relative;
}`;
            document.head.appendChild(styleSheet);
            //手动生成PDF
            var jsPDF = jspdf.jsPDF;
            let doc = new jsPDF({
                orientation: "p",
                unit: 'mm',
                format: 'a4',
                putOnlyUsedFonts: true});
            doc.textWithLink('PDF generated from original page', 0, 5, {url: location.href});
            let source = document.getElementsByClassName("article__body")[0];
            doc.html(source, {callback: function (doc) {
                const bloburl=doc.output("bloburl");
                console.log(bloburl);
                window.parent.postMessage(bloburl, "*");
            },
                              x: 5,
                              y:5,
                              autoPaging:'text',
                              width:200,
                              windowWidth:720
                             });

            doc.output("dataurlnewwindow");
        }
    }

})();

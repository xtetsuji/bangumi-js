import { BangumiDomain } from '../domain/bangumi_domain';
// import chrome from '@types/chrome';
// const { JSDOM } = require('jsdom');

export class BangumiService {
    static UA_NAME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    // URL = https://bangumi.org/tv_events/seasons?ggm_group_id=9&season_id=34573 とかで内容を取得する
    // これ Service では？
    /**
     * fetch インターフェースの大したことないラッパー
     * @param {string} url 
     * @returns {Promise<Response>}
     */
    static async fetch(url: string): Promise<Response> {
        const response = await fetch(url, {
            headers: {
                'User-Agent': BangumiService.UA_NAME,
            }
        });
        return response;
    }

    /**
     * document を取得する
     * @param {string?} body - Node.js の場合、本文を渡すことで JSDOM で document を作成する。ブラウザの場合は無視される。
     * @returns {Document} - ブラウザの Document、または JSDOM で作成した document
     */
    static document(body?: string): Document {
        // ブラウザ（Chrome 拡張機能）の場合
        if ( globalThis.document instanceof Document ) {
            // Chrome の content-script の場合
            return globalThis.document;
        }
        // Node.js コマンドラインの場合：body を渡す必要あり
        const { JSDOM } = require('jsdom');
        if ( !body ) {
            throw new Error(`BangumiService.document(): HTML テキストを渡す必要があります`)
        }
        const dom = new JSDOM(body);
        const document = dom.window.document;
        return document;
        // TODO: iOS/iPadOS ショートカットの場合
    }

    /**
     * 番組表URLから Google Calendar Event Publisher URL を作成
     * BangumiDomain や BangumiService 全てを使っている。コマンドラインツールがこれをほぼそのまま呼んで要望を達成する用途。
     * これは apps/cli/src/service/bangumi2gcal_service.ts に移動したので、少し経過したら消す。
     * @param {string} bangumiURL - 番組表URL
     * @returns {Promise<string | undefined>} - Google Calendar Event Publisher URL
     */
    // static async getEpURLFromBangumiURL(bangumiURL: string): Promise<string | undefined> {
    //     // https://bangumi.org/tv_events/AiOTQAXoAAM?overwrite_area=13 とかのフォーマットである必要がある
    //     if ( !bangumiURL ) {
    //         throw new Error('URLが指定されていません')
    //     } 
    //     if ( !bangumiURL.match(/^https:\/\/bangumi\.org\//) ) {
    //         throw new Error('URLが番組表URLではありません');
    //     }
    //     const response = await BangumiService.fetch(bangumiURL);
    //     const body = await response.text();
    //     if ( response.status !== 200 ) {
    //         // console.log(response);
    //         // process.exit(1);
    //         throw new Error(`HTTPリクエストに失敗しました: HTTP ${response.status} ${response.statusText}`)
    //     }
    //     // console.log(`response.text().length = ${body.length}`);
    //     const info = BangumiDomain.parseBody(body);
    //     if ( !info.is_success ) {
    //         console.error(`文面の解析に失敗しました:`, info.exception);
    //         // console.log(body);
    //         // process.exit(1);
    //         throw new Error(`文面の解析に失敗しました`);
    //     }
    //     // console.log(info);
    //     const epURL = BangumiDomain.createGoogleCalenderEventPublisherURL(info, response.url);
    //     // console.log(epURL);
    //     return epURL;
    // }

    /**
     * Google Chrome の Content Script として、番組表ページに注入されて Google Calendar Event Publisher URL を作成、SNS 共有ボタンの横に追加する。
     * これは apps/chrome/src/service/bangumi_program_service.ts に移動したので、少し経過したら消す。
     */
    // static runChromeExtension(): void {
    //     // Chrome Extension から呼び出されるので、body の text は不要
    //     const document = BangumiService.document(
    //         /* Chrome Extension content-script supply (globalThis=window).document */
    //         undefined
    //     );
    //     const info = BangumiDomain.parseBody(document.body.innerHTML);
    //     if ( !info.is_success ) {
    //         console.error(`文面の解析に失敗しました:`, info.exception);
    //     }
    //     const epURL = BangumiDomain.createGoogleCalenderEventPublisherURL(info, location.href);
    //     console.log(`epURL = ${epURL}`);
    //     // await new Promise((resolve) => setTimeout(resolve, 2000));
    //     console.log(`document is ${typeof document}`);
    //     console.log(`.share_button is ${document.querySelector('.share_button')}`);
    //     // document.addEventListener('DOMContentLoaded', function() {
    //         console.log(`DOMContentLoaded start`);
    //         // ここに先ほどのコードを入れます
    //         var shareButton = document.querySelector('.share_button');
    //         if ( !shareButton ) {
    //             console.error(`.share_button が見つかりません`);
    //             return;
    //         }
        
    //         var newLink = document.createElement('a');
    //         if ( !epURL ) {
    //             console.error(`Google Calendar Event Publisher URL が作成できませんでした`);
    //             return;
    //         }
    //         newLink.href = epURL ?? '';
    //         newLink.target ='_blank';
        
    //         var newListElement = document.createElement('li');
    //         newListElement.style.backgroundColor = 'blue';
    //         newListElement.textContent = 'example';
        
    //         newLink.appendChild(newListElement);
        
    //         shareButton.appendChild(newLink);
    //     // });
        
    //     // if ( typeof window.$ === 'function' ) {
    //     //     // 試し
    //     //     $(".share_button").append("<a href='https://example.com/'><li style='background-color: blue;'>example</li></a>")
    //     // } else {
    //     //     console.error(`$ is not defined`);
    //     // }
    // }
}

// module.exports = BangumiService;

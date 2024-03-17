import {
    BangumiDomain,
    BangumiInfo
} from '../../../bangumi/src/domain/bangumi_domain';
import { Window } from 'happy-dom';
// import { JSDOM } from 'jsdom';
// see: https://github.com/evanw/esbuild/issues/1311 for JSDOM known issue

export class Bangumi2GcalService {
    static UA_NAME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    /**
     * fetch インターフェースの大したことないラッパー
     * @param - URL
     * @returns - URL のレスポンス結果から取り出した string で解決する Promise。ただし異常時は例外を投げる
     */
    static async fetch(
        url: string | URL | Request,
        option?: Record<string, any>
    ): Promise<Response> {
        // この fetch はグローバルの方の fetch
        const response = await fetch(url, {
            headers: {
                'User-Agent': Bangumi2GcalService.UA_NAME,
            },
            ...option
        });
        return response;
    }

    /**
     * url から Bangumi2GcalService.fetch() を使って取得したリクエストからレスポンスのテキストを取得する。
     * @param url - URL
     * @returns - url から取得したテキスト
     */
    static async getTextHTTP(url: string): Promise<string> {
        // TODO: fetch と happy-dom の間にあるパース部分は domain へ分離してテストを書く
        const response = await Bangumi2GcalService.fetch(url);
        if (!response.ok) {
            throw new Error(`fetch error: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        return text;
    }

    /**
     * 番組URLから Google カレンダーの Event Publisher URL を生成する。
     * @param bangumiURL - 番組URL。これは詳細テキストに入れる URL として使われるだけで、この関数はこの URL へ HTTP リクエストを送ることはない。外部から自力で bangumiURL の内容を取得する必要がある場合は、第2引数の document を getHappyDomDocument(bangumiURL) などから作る必要がある。
     * @param document - Document。DOM がすでにある場合は document を渡す。ない場合は getHappyDomDocument(bangumiURL) などから作る必要がある。
     * @returns - Google カレンダーの Event Publisher URL で解決する Promise
     */
    static async getGCalEpURLFromBangumiURL(
        bangumiURL: string,
        document: Document
    ): Promise<string | undefined> {
        // const response = await Bangumi2GcalService.fetch(bangumiURL);
        // if (!response.ok) {
        //     throw new Error(`fetch error: ${response.status} ${response.statusText}`);
        // }
        // const bangumiContents = await response.text();

        // JSDOM for document
        // const dom = new JSDOM(bangumiContents);
        // const document = dom.window.document;

        // HappyDOM for document
        // const window = new Window({ url: bangumiURL });
        // const document = window.document as unknown as Document;
        // // TODO: HappyDOM の型定義を正して、上記の型アノテーションを削除する
        // document.body.innerHTML = bangumiContents;

        const info: BangumiInfo = BangumiDomain.parseDocument(document);
        const epURL = BangumiDomain.createGoogleCalenderEventPublisherURL(
            info,
            bangumiURL
        );
        return epURL;
    }

    /**
     * 番組URLから happy-dom で document を生成する。
     * @param bangumiURL - 番組URL
     * @returns - happy-dom から生成した document で解決する Promise
     */
    static async getHappyDomDocument(bangumiURL: string): Promise<Document> {
        const bangumiContents = await Bangumi2GcalService.getTextHTTP(bangumiURL);
        // separate angumiContents HTML to head and body
        const [head, body] = (() => {
            const [top, bottom] = bangumiContents.split(/<\/head>\s*<body.*?>/s);
            if (!bottom) {
                throw new Error(`bangumiContents が不正です (head body separate error)`);
            }
            const head = top.replace(/<head.*?>/s, '');
            const body = bottom.replace(/\s*<\/body>\s*<\/html>\s*/, '');
            return [head, body];
        })();
        // happy-dom
        const window = new Window({ url: bangumiURL });
        const document = window.document as unknown as Document;
        // TODO: HappyDOM の型定義を正して、上記の型アノテーションを削除する
        document.head.innerHTML = head;
        document.body.innerHTML = body;
        return document;
    }

    /**
     * 番組URLから JSDOM で document を生成する。現在は happy-dom を使うことにしているので使わない。呼び出したら必ず例外を発生させるようにしている。
     * @param _bangumiURL - 番組URL
     * @returns - JSDOM から生成した document で解決する Promise
     */
    static async getJSDOMDocument(_bangumiURL: string): Promise<Document> {
        throw new Error('getJSONDOMDocument() is outdated. Use getHappyDomDocument() instead.');
        // const response = await Bangumi2GcalService.fetch(_bangumiURL);
        // if (!response.ok) {
        //     throw new Error(`fetch error: ${response.status} ${response.statusText}`);
        // }
        // const bangumiContents = await response.text();
        // const dom = new JSDOM(bangumiContents);
        // const document = dom.window.document;
        // return document;;
    }
}

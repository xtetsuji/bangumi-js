import { BangumiDomain } from '../../../bangumi/src/domain/bangumi_domain';

/**
 * Bookmarklet のハンドラ
 */
export class BookmarkletHandler {
    /**
     * ブックマークレットのハンドラ。ページを解析して Google カレンダーのイベント作成 URL を作成して、window.open する。
     */
    static bookmarklet(): void {
        const info = BangumiDomain.parseDocument(document);
        const epURL = BangumiDomain.createGoogleCalenderEventPublisherURL(info, location.href);
        console.log(epURL);
        if ( !epURL ) {
            console.error(`epURL is empty`);
            return
        }
        window.open(epURL);
    }
}

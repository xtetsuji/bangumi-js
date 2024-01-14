import {
    GoogleCalendarURLDomain,
    GoogleCalendarParamObject
} from './google_calendar_url_domain';

/**
 * @typedef {Object} BangumiInfo
 * @property {boolean} is_success - 解析に成功したかどうか
 * @property {Error?} exception - 失敗した場合の例外
 * @property {string?} program_title - 番組タイトル
 * @property {string?} description - 番組説明
 * @property {string?} schedule - 放送日時
 * @property {string?} letter_body - 番組宛ての手紙
 * @property {string?} addition - 追加情報
 * @property {string?} talent_panel - タレント一覧
 * @property {string?} related_link - 関連リンク
 * @property {string?} location - 放送局
 */
export interface BangumiInfo {
    is_success: boolean;
    exception?: Error;
    program_title?: string;
    description?: string;
    schedule?: string;
    letter_body?: string;
    addition?: string;
    talent_panel?: string;
    related_link?: string;
    location?: string;
}

// type BangumiInfoKeys = keyof BangumiInfo;
const BangumiInfoProps = [
    'program_title',
    'description',
    'schedule',
    'letter_body',
    'addition',
    'talent_panel',
    'related_link',
    'location'
] as const;

/**
 * @typedef {Object} RedirectInfo
 * @property {boolean} redirected - リダイレクトが発生したか
 * @property {string} url - URL
 * @property {string} message - メッセージ
 */
type RedirectInfo = {
    redirected: boolean;
    url: string;
    message: string;
};

type ReplacePair =
| [RegExp, string]
| [RegExp, (substring: string, ...args: any[]) => string];

// replace(searchValue: string | RegExp, replaceValue: string): string;
// replace(searchValue: string | RegExp, replacer: (substring: string, ...args: any[]) => string): string;


export class BangumiDomain {
    static testHello() {
        console.log('hello');
    }

    /**
     * 
     * @param {Response} response - リダイレクトが発生したかチェックしたい Response
     * @returns {RedirectInfo} - リダイレクト情報
     */
    static checkRedirect(response: Response): RedirectInfo {
        const redirected = response.redirected;
        const url = response.url;
        const message = redirected ? `redirected to ${url}` : 'not redirected';
        return { redirected, url, message };
    }

    /**
     * Gガイドの番組情報ページの Document DOM を解析する。
     * Document DOM はブラウザから供出されたものでも、それと同じような振る舞いをする JSDOM でも良い。具体的には querySelectorAll が使えればよい。
     * @param {Document} document - Gガイドの番組情報ページの Document DOM
     * @returns {BangumiInfo} - 解析結果
     */
    static parseDocument(document: Document): BangumiInfo {
        // const keys = ['program_title', 'description', 'schedule', 'letter_body', 'addition', 'talent_panel'];
        // TODO: addition が textContent で取ると h2 まわりを無視して次の行と繋がってしまっているので、別の方法を検討する
        try {
            const obj: Record<string, string | undefined> = {};
            for ( const key of BangumiInfoProps ) {
                if (key === 'location') {
                    // location は BangumiInfo で後から作成するので、ここではスキップ
                    continue;
                }
                const element = document.querySelector(`.${key}`);
                if ( !element ) {
                    console.error(`${key} is not found`);
                    continue;
                }
                const value = element.textContent ?? '';
                obj[key] = BangumiDomain.formatBody(value);
            }
            // const info = Object.fromEntries(
            //     keys.map(key => [
            //         key,
            //         BangumiDomain.formatBody(document.querySelector(`.${key}`).textContent)
            //     ])
            // );
            obj.location = BangumiDomain.parseLocation(obj.schedule);
            /**
             * @type {Array<[string, string]} - 関連リンク。[テキスト, URL] の配列
             */
            const related_links: Array<[string, string]> = [];
            document.querySelectorAll<HTMLAnchorElement>('.related_link a').forEach((a: HTMLAnchorElement) => {
                related_links.push([(a.textContent||'').trim(), a.href]);
            });
            obj.related_link = related_links.map( ([text, url]) => `- ${text}: ${url}`).join("\n");
            // TODO: obj が内容的にダメだったら is_success を false にする？
            const info: BangumiInfo = {
                is_success: true,
                ...obj
            };
            return info;
        } catch (e) {
            // TODO: body になにかメッセージがあったら message キーに入れる？
            const is_success = false;
            const exception = e instanceof Error ? e : new Error(`unknown exception: ${e}`);
            const info: BangumiInfo = { is_success, exception };
            return info;
        }
    }

    /**
     * Gガイドの番組情報URLから取得したテキストを解析する。
     * service 系が Document DOM の提供を準備するよう責務を分けて、parseDocument の方を使うようにする。この parseBody は互換性のために残しているが、JSDOM の import とともに今後消す予定。
     * @param {string} body - Gガイドの番組情報URLから取得したテキスト
     * @returns {BangumiInfo} - 解析結果
     */
    // static parseBody(body: string): BangumiInfo {
    //     // TODO: ブラウザでも共通処理が書けるようにする
    //     if ( !body ) {
    //         throw new Error('body is not defined');
    //     }
    //     const dom = new JSDOM(body);
    //     const document = dom.window.document;
    //     // const keys = ['program_title', 'description', 'schedule', 'letter_body', 'addition', 'talent_panel'];
    //     // TODO: addition が textContent で取ると h2 まわりを無視して次の行と繋がってしまっているので、別の方法を検討する
    //     try {
    //         const obj: Record<string, string | undefined> = {};
    //         for ( const key of BangumiInfoProps ) {
    //             const element = document.querySelector(`.${key}`);
    //             if ( !element ) {
    //                 console.error(`${key} is not found`);
    //                 continue;
    //             }
    //             const value = element.textContent;
    //             obj[key] = BangumiDomain.formatBody(value);
    //         }
    //         // const info = Object.fromEntries(
    //         //     keys.map(key => [
    //         //         key,
    //         //         BangumiDomain.formatBody(document.querySelector(`.${key}`).textContent)
    //         //     ])
    //         // );
    //         obj.location = BangumiDomain.parseLocation(obj.schedule);
    //         /**
    //          * @type {Array<[string, string]} - 関連リンク。[テキスト, URL] の配列
    //          */
    //         const related_links: Array<[string, string]> = [];
    //         document.querySelectorAll('.related_link a').forEach( (a: HTMLLinkElement) => {
    //             related_links.push([(a.textContent||'').trim(), a.href]);
    //         });
    //         obj.related_link = related_links.map( ([text, url]) => `- ${text}: ${url}`).join("\n");
    //         // obj.is_success = true;
    //         // return obj;
    //         const info: BangumiInfo = {
    //             is_success: true,
    //             ...obj
    //         };
    //         return info;
    //     } catch (e) {
    //         // TODO: body になにかメッセージがあったら message キーに入れる？
    //         const is_success = false;
    //         const exception = e instanceof Error ? e : new Error(`unknown exception: ${e}`);
    //         const info: BangumiInfo = { is_success, exception };
    //         return info;
    //     }
    // }

    /**
     * 
     * @param {string | undefined} schedule - BnagumiInfo.schedule
     * @return {string | undefined} - 放送局
     */
    static parseLocation(schedule: string | undefined): string | undefined {
        if ( !schedule ) {
            return;
        }
        const m = schedule.match(/\d+:\d+\s*-\s*\d+:\d+\s+(\S*)/);
        if ( !m ) {
            throw new Error('invalid schedule');
        }
        return m[1];
    }

    /**
     * 
     * @param {string} schedule - スケジュール説明文字列
     * @return {[Date, Date]} - [開始日時, 終了日時]
     */
    static parseStartEnd(schedule: string | undefined): [Date, Date] | undefined {
        if ( !schedule ) {
            return;
        }
        // console.log(`schedule: "${schedule}"`);
        const m = schedule.match(/(?<month>\d+)月(?<day>\d+)日\D+(?<sh>\d+):(?<sm>\d+)\s*-\s*(?<eh>\d+):(?<em>\d+)/);
        if ( !m ) {
            throw new Error('invalid schedule');
        }
        if ( !m.groups ) {
            throw new Error('invalid match group');
        }
        // console.log(m);
        const { month, day, sh, sm, eh, em } = Object.fromEntries(
            Object.entries(m.groups).map( ([key, value]) => [key, Number(value)])
        );
        const slew = BangumiDomain.seemsEachHourMinuteSlew(sh, sm, eh, em);
        const sy = BangumiDomain.guessYear(month, day);
        const ey = BangumiDomain.guessYear(month, day + (slew ? 1 : 0));
        // console.log(`[month, day, sh, sm, eh, em] = [${[month, day, sh, sm, eh, em].join(", ")}]`);
        if ( [month, day, sh, sm, eh, em].some( (x) => !Number.isInteger(x) ) ) {
            throw new Error('invalid parsing');
        }
        const start = new Date(sy, month - 1, day, sh, sm);
        const end = new Date(ey, month - 1, day + (slew ? 1 : 0), eh, em);
        // end において、day + 1 がその月の最終日を超えていたら、月の方が 1 増えるので問題ない。また Y年12月31日 + 1日 は Y+1年の1月1日になるので問題ない。
        // see: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date/setDate
        return [start, end];
    }

    /**
     * 開始から終了まで日付をまたいでいるかの判定。たとえば 21:00 - 23:00 なら false、23:30 - 01:30 なら true
     * @param {number} sh - 開始時間
     * @param {number} sm - 開始分
     * @param {number} eh - 終了時間
     * @param {number} em - 終了分
     * @return {boolean} - 日付をまたいでいるかどうか
     */
    static seemsEachHourMinuteSlew(sh: number, sm: number, eh: number, em: number): boolean {
        // 日内であれば本来なら start < end。
        // start > end なら squeeze されている。具体的には
        // 23:30 - 0:30 なら squeeze されている。
        // 上記の場合 [sh, sm, eh, em] = [23, 30, 0, 30] なので sh * 100 + sm = 2330,  eh * 100 + em = 0030 ということで、数値比較で squeeze されているかどうかを判定できる
        return sh*100 + sm > eh*100 + em;
    }

    /**
     * 現在年月日をもとに、与えられた月（日）の年を類推する。
     * 公開されている番組はせいぜい前後1週間程度であることを利用して、月のねじれを考慮して類推している。
     * @param {number} givenMonth - 与えられた月
     * @param {number} _givenDay - 与えられた日（現在はオプショナル）
     */
    static guessYear(givenMonth: number, _givenDay = 1) {
    // static guessYear(givenMonth: number) {
        // TODO: スクレイピングした結果に 2024 とか入っているけれど、それをどう取り出すと良いか
        // givenDay は念の為受け取っておく
        const now = new Date();
        const nowYear = now.getFullYear();
        const nowMonth = now.getMonth() + 1;
        if ( nowMonth === 12 && givenMonth === 1 ) {
            // 与えられた月が1月で、今が12月なら、与えられた日付は来年の話
            return nowYear + 1;
        } else if ( nowMonth === 1 && givenMonth === 12 ) {
            // 与えられた月が12月で、今が1月なら、与えられた日付は去年の話
            return nowYear - 1;
        } else {
            // それ以外は今年の話
            return nowYear;
        }
    }

    /**
     * Google Calendar 登録のための Event Publisher URL を生成する
     * @param {BangumiInfo} info - parseBody で作成した情報オブジェクト
     * @param {string} bangumiURL - 番組表URL
     * @returns {string | undefined} - Google Calendar Event Publisher URL
     */
    static createGoogleCalenderEventPublisherURL(info: BangumiInfo, bangumiURL: string): string | undefined {
        if ( !bangumiURL ) {
            throw new Error('invalid 2nd URL');
        }
        /**
         * @type {GoogleCalendarURLDomain.GoogleCalendarParamObject}
         */
        // const param: GoogleCalendarParamObject = {};
        const text = info.program_title;
        // const details = bangumiURL + "\n\n" + info.description + "\n\n" + info.letter_body + "\n\n" + info.addition + "\n\n▼関連リンク\n" + info.related_link;
        const related_link = info.related_link ? "▼関連リンク" + info.related_link : '';
        const details: string = [
            bangumiURL,
            info.description,
            info.letter_body,
            info.addition,
            related_link
        ].filter( (x) => typeof x === 'string' && x.length > 0 ).join("\n\n");
        const location = BangumiDomain.parseLocation(info.schedule); // 放送局
        const pair = BangumiDomain.parseStartEnd(info.schedule);
        if ( !pair ) {
            // パースエラー
            console.error(`createGoogleCalenderEventPublisherURL: parse error at parseStartEndo. info.schedule=${info.schedule ?? ''}`)
            return '';
        }
        const [start, end] = pair;
        // console.log(param);
        const param: GoogleCalendarParamObject = {
            text, details, location, start, end
        };

        const epURL = GoogleCalendarURLDomain.createURL(param); // Event Publisher URL
        // console.log(`epURL = ${epURL}`);
        return epURL;
    }

    /**
     * 本文を整形して不要な空白や文字列を除去する
     * @param {string} text - 整形する本文
     * @returns {string} - 整形された本文
     */
    static formatBody(text: string): string {
        const replaces: ReplacePair[] = [
            [/\s+(?=\n|\z)/g, ''], // 末尾空白は除去
            [/(?<=\n)\s+/g, ''], // 冒頭空白は削除、この空白は HTML では表示されないので、消してもOK
            [/\s\s+/g, ''], // 2個以上の空白は1個にする。HTML 的に2個以上の空白類文字は1個と同じ扱いなので、消してもOK
            [/(?<=\n)\s+(?=\n)/g, ''], // 空白だけの空行は空白をまず除去
            [/(?<=\n)\n+/g, ''], // 改行2個以上は1個にする
            [/[Ａ-Ｚａ-ｚ０-９]/g, (match) => String.fromCharCode(match.charCodeAt(0) - 0xfee0)], // 全角英数字を半角に変換
        ];
        // FIXME: したの部分、replacement が string か Function かで型不一致となるため、全く同じ結果の三項演算子を書いている
        const formattedText = replaces.reduce(
            (text, [pattern, replacement]) => typeof replacement === 'string' 
                ? text.replace(pattern, replacement)
                : text.replace(pattern, replacement),
            text
        ).trim();
//         console.log(`==========
// text: ${text}
// ↓
// formattedText: ${formattedText}`);
        return formattedText;
    }
}

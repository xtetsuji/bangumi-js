// rewrite https://github.com/ledsun/generate-google-calendar-url
// 以前書いたもの: /Users/xtetsuji/Project/chrome-ytv2gcalep/GCalURL.js 

/**
 * @typedef {Object} GoogleCalendarParamObject
 * @property {string?} text - 予定のタイトル
 * @property {string?} details - 予定の詳細
 * @property {string?} location - 予定の場所
 * @property {Date} start - 予定の開始時間
 * @property {Date} end - 予定の終了時間
 */
export interface GoogleCalendarParamObject {
    text?: string;
    details?: string;
    location?: string;
    start: Date;
    end: Date;
}

// interface GoogleCalendarParamObjectI {
//     text?: string;
//     details?: string;
//     location?: string;
//     start: Date;
//     end: Date;
// }
// type GoogleCalendarParamObjectT = {
//     text?: string;
//     details?: string;
//     location?: string;
//     start: Date;
//     end: Date;
// };

export class GoogleCalendarURLDomain {
    static readonly BASE_URL = 'https://www.google.com/calendar/event?action=TEMPLATE';
    static readonly URL_MAX_LENGTH = 8142;

    static testHello(): void {
        console.log('GoogleCalendarURLDomain: hello');
    }

    /**
     * calcExcessBytes - URL_MAX_LENGTH を超えた場合の超過バイト数を計算する
     * @param {GoogleCalendarParamObject} - Googleカレンダーとして生成したい予定
     * @returns {number} - 超過バイト数
     */
    static calcExcessBytes({text, details, location, start, end}: GoogleCalendarParamObject): number {
        const url = GoogleCalendarURLDomain._createURL({text, details, location, start, end});
        return url.length - GoogleCalendarURLDomain.URL_MAX_LENGTH;
    }
    /**
     * isExcessBytes - URL_MAX_LENGTH を超えた場合の超過バイト数があれば真を返す
     * @param {GoogleCalendarParamObject} - Googleカレンダーとして生成したい予定
     * @returns {boolean} - 超過バイト数
     */
    static isExcessBytes({text, details, location, start, end}: GoogleCalendarParamObject): boolean {
        const excessBytes = GoogleCalendarURLDomain.calcExcessBytes({text, details, location, start, end});
        return excessBytes > 0;
    }
    /**
     * Google カレンダーの Event Publisher URL を生成する。
     * ただし、 GoogleCalendarURLDomain.URL_MAX_LENGTH を超えた場合は、 details を切り詰めて再作成をして、URL_MAX_LENGTH を超えないようにする。
     * @param {GoogleCalendarParamObject} - Googleカレンダーとして生成したい予定
     * @returns {string}- Google Calendar の Event Publisher URL
     */
    static createURL({text, details = '', location, start, end}: GoogleCalendarParamObject): string {
        // URL_MAX_LENGTH を超えたら details を切り詰めて再作成している
        // TODO: 速度効率重視で非線形的に切り詰めるようにしたい
        const obj = {
            url: '',
            param: {text, details, location, start, end},
            get length() { return this.url.length },
            excess() { return this.length >= GoogleCalendarURLDomain.URL_MAX_LENGTH },
            create() { this.url = GoogleCalendarURLDomain._createURL(this.param); },
            reduce() { this.param.details = this.param.details.slice(0, -1); },
            treated: false,
            toString() { return this.url; },
        };
        obj.create();
        while ( obj.excess() ) {
            obj.reduce();
            obj.create();
            obj.treated = true;
        }
        // TODO: デバッグ情報も外に出せたらいい？
        console.log(`url.length=${obj.length}, treated=${obj.treated}`);
        return obj.url;
    }

    static _createURL({text, details, location, start, end}: GoogleCalendarParamObject): string {
        return GoogleCalendarURLDomain.BASE_URL +
        '&text='    + encodeURIComponent(text ?? '') +
        '&details=' + encodeURIComponent(details ?? '') +
        '&location='+ encodeURIComponent(location ?? '') +
        '&dates='   + GoogleCalendarURLDomain.createDatesFromStartEnd(start, end) +
        '&trp='     + 'false';
    }

    /**
     * 2個の Date から、Google Calendar Event Publisher の dates パラメーターに渡す文字列を生成する
     * @param {Date} start - 開始日時
     * @param {Date} end - 終了日時
     * @return {string} - Google Calendar Event Publisher の dates パラメーターに渡す文字列
     */
    static createDatesFromStartEnd(start: Date, end: Date): string {
        const [startUTC, endUTC] = [start, end].map( date => GoogleCalendarURLDomain.getUTC(date) );
        return `${startUTC}/${endUTC}`;
    }

    /**
     * Date 型の値から UTC 表記の日時文字列を生成する
     * @param {Date} date - 日時
     * @return {string} - UTC表記の日時文字列
     */
    static getUTC(date: Date): string {
        // const date = typeof date_arg === 'string' ? new Date(date_arg) : date_arg;
        const zerofill = (str: string | number): string => ('0'+str).slice(-2);
        return date.getUTCFullYear().toString() +
            zerofill(date.getUTCMonth()+1) +
            zerofill(date.getUTCDate()) +
            'T' +
            zerofill(date.getUTCHours()) +
            zerofill(date.getUTCMinutes()) +
            zerofill(date.getUTCSeconds()) +
            'Z';
    }
}

import { Bangumi2GcalService } from '../service/bangumi2gcal_service';

export class Bangumi2GcalHandler {
    /**
     * コマンドが正常終了した時のリターンコード
     */
    static readonly RETURN_CODE_SUCCESS = 0;
    /**
     * コマンドがエラー終了した時のリターンコード
     */
    static readonly RETURN_CODE_ERROR = 1;
    /**
     * bangumi2gcal コマンド処理のハンドラ。このメソッド内で標準出力に Google カレンダーの Event Publisher URL を出力をする（返り値ではないことに注意）。
     * @param bangumiURL - 番組表.Gコードの番組URL。テレビもしくはラジオの番組URLを指定する。
     * @returns - プロセス終了時のリターンコード。実際にプロセス終了はこれを呼び出した Application 層で後処理をした後に行う。
     */
    static async bangumi2gcal(bangumiURL: string): Promise<number> {
        const DEBUG = Boolean(process.env.BANGUMI_DEBUG);
        // TODO: エラー処理どうしよう
        try {
            const epURL = await Bangumi2GcalService.getGCalEpURLFromBangumiURL(bangumiURL);
            console.log(epURL);
            return Bangumi2GcalHandler.RETURN_CODE_SUCCESS;
        } catch (e) {
            if (DEBUG) {
                // re-throw
                throw e;
            }
            console.error(`エラーが発生しました: ${e.message}`);
            return Bangumi2GcalHandler.RETURN_CODE_ERROR;
        }
    }
}

import { Bangumi2GcalService } from '../service/bangumi2gcal_service';

export class Bangumi2GcalHandler {
    static RETURN_CODE_SUCCESS = 0;
    static RETURN_CODE_ERROR = 1;
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

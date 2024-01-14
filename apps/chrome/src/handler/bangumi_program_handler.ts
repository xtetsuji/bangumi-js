import { BangumiProgramService } from '../service/bangumi_program_service';

export class BangumiProgramHandler {
    /**
     * 番組プログラムページにコンテントスクリプトを挿入
     */
    static inject(): void {
        BangumiProgramService.inject();
    }
}

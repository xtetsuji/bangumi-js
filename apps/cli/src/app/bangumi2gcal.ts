#!/usr/bin/env node
import { Bangumi2GcalHandler } from '../handler/bangumi2gcal_handler';

// 0: interp, 1: script は不要
/**
 * コマンドライン引数
 */
const argv: string[] = process.argv.slice(2);
 // argv[0] の型推測は string のようだけど、undefined もあるはず
/**
 * 番組URL
 */
const bangumiURL: string = argv[0] ?? '';
if ( !bangumiURL || !bangumiURL.match(/^https?:/) ) {
    console.error(`第1引数で URL が指定されていません`);
    process.exit(1);
}
if ( !bangumiURL.match(/^https?:\/\/bangumi\.org\//) ) {
    console.error(`第1引数で bangumi.org の URL が指定されていません`);
    process.exit(1);
}
// 表示作業は handler 内でやるようにしてみた
// 上のチェック処理も、handler 内でやっていいかも
Bangumi2GcalHandler.bangumi2gcal(bangumiURL).then(
    (retcode: number) => process.exit(retcode)
).catch(
    (e: Error) => { throw e }
);

// import { BangumiService } from '../../../bangumi/src/service/bangumi_service';
import { BangumiDomain } from '../../../bangumi/src/domain/bangumi_domain';

export class BangumiProgramService {
    static inject(): void {
        console.log(`BangumiProgramService.inject() at ` + new Date().toString());
        BangumiProgramService.runChromeExtension();
    }

    /**
     * Google Chrome の Content Script として、番組表ページに注入されて Google Calendar Event Publisher URL を作成、SNS 共有ボタンの横に追加する
     */
        static runChromeExtension(): void {
            // Chrome Extension から呼び出されるので、body の text は不要
            // const document = BangumiService.document(
            //     /* Chrome Extension content-script supply (globalThis=window).document */
            //     undefined
            // );
            const document = globalThis.document; // globalThis === window
            // const info = BangumiDomain.parseBody(document.body.innerHTML);
            const info = BangumiDomain.parseDocument(document);
            if ( !info.is_success ) {
                console.error(`文面の解析に失敗しました:`, info.exception);
            }
            const epURL = BangumiDomain.createGoogleCalenderEventPublisherURL(info, location.href);
            console.log(`epURL = ${epURL}`);
            // await new Promise((resolve) => setTimeout(resolve, 2000));
            console.log(`document is ${typeof document}`);
            console.log(`.share_button is ${document.querySelector('.share_button')}`);
            // document.addEventListener('DOMContentLoaded', function() {
                console.log(`DOMContentLoaded start`);
                // ここに先ほどのコードを入れます
                var shareButton = document.querySelector('.share_button');
                if ( !shareButton ) {
                    console.error(`.share_button が見つかりません`);
                    return;
                }
            
                var newLink = document.createElement('a');
                if ( !epURL ) {
                    console.error(`Google Calendar Event Publisher URL が作成できませんでした`);
                    return;
                }
                newLink.href = epURL ?? '';
                newLink.target ='_blank';
            
                var newListElement = document.createElement('li');
                newListElement.style.backgroundColor = 'blue';
                newListElement.textContent = 'example';
            
                newLink.appendChild(newListElement);
            
                shareButton.appendChild(newLink);
            // });
            
            // if ( typeof window.$ === 'function' ) {
            //     // 試し
            //     $(".share_button").append("<a href='https://example.com/'><li style='background-color: blue;'>example</li></a>")
            // } else {
            //     console.error(`$ is not defined`);
            // }
        }
    
}

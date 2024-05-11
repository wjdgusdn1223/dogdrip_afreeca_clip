// ==UserScript==
// @name         AfreecaTV clip for dogdrip
// @namespace    http://tampermonkey.net/
// @version      0.7.4
// @namespace    https://www.dogdrip.net/
// @description  Convert AfreecaTV user clip links to iframe in dogdrip
// @author       noodlekiller
// @match        https://www.dogdrip.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=afreecatv.com
// @run-at       document-start
// @homepageURL  https://github.com/wjdgusdn1223/dogdrip_afreeca_clip
// @downloadURL  https://github.com/wjdgusdn1223/dogdrip_afreeca_clip/raw/main/script.user.js
// @updateURL    https://github.com/wjdgusdn1223/dogdrip_afreeca_clip/raw/main/script.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 함수: URL이 AfreecaTV 링크 패턴과 일치하는지 확인하고 파라미터 추가
    function createAfreecaTVIframeURL(url) {
        if (/^https:\/\/vod\.afreecatv\.com\/player\/[0-9]+$/.test(url)) {
            return `${url}/embed?showChat=true&autoPlay=false&mutePlay=false`;
        } else if(/^https:\/\/vod\.afreecatv\.com\/player\/\d+\/[^\/]+$/.test(url)) {
            // URL에서 비디오 ID를 추출하기 위한 정규표현식
            const regex = /^https:\/\/vod\.afreecatv\.com\/player\/(\d+)\/.*/;
            // 정규표현식을 사용해 URL에서 비디오 ID를 추출
            const match = url.match(regex);
            return `https://vod.afreecatv.com/player/${match[1]}/embed?type=catch&showChat=false&autoPlay=flase&mutePlay=false`;
        }
        else {
            return null;
        }
    }

    function adjustIframeHeights() {
        // 모든 'Afreeca Player' 클래스를 가진 iframe 찾기
        const iframes = document.querySelectorAll('.AfreecaPlayer');
        // 비율 설정 (예: 16:9)
        const aspectRatio = 16 / 9;

        iframes.forEach(iframe => {
            const width = iframe.clientWidth; // 현재 iframe의 너비
            if (width < 930) { // 너비가 최대가 아닐 경우에만 높이 변경
                const newHeight = width / aspectRatio; // 높이 계산
                iframe.style.height = `${newHeight}px`; // 높이 설정
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        // rhymix_content와 xe_content 클래스를 모두 가진 div 요소만 검색
        const divs = document.querySelectorAll('div.rhymix_content.xe_content');
        divs.forEach(div => {
            // 클래스 리스트 추출
            const classList = Array.from(div.classList);
    
            // document_xxxxxxx_0 패턴의 클래스가 있는지 확인
            const hasDocumentClass = classList.some(c => /^document_\d+_0$/.test(c));
    
            // 해당 패턴이 있을 경우
            if (hasDocumentClass) {
                // 해당 div 내의 모든 <p> 태그를 검색
                const paragraphs = div.querySelectorAll('p');
                paragraphs.forEach(p => {
                    // 클립의 url
                    let iframeURL = null;
                    // <p> 태그 내에 있는 모든 <a> 태그 검색
                    const links = p.querySelectorAll('a');
            
                    // 만약 <a> 태그가 없고 텍스트 자체가 URL이라면 텍스트를 이용해 처리
                    if (!links.length) {
                        iframeURL = createAfreecaTVIframeURL(p.textContent.trim());
                    } else { // a 태그가 존재한다면 href을 이용해 처리
                        iframeURL = createAfreecaTVIframeURL(links[0].href)
                    }

                    if (iframeURL) {
                        // 유효한 링크를 찾으면 iframe으로 변환
                        const iframe = document.createElement('iframe');
                        iframe.id = "afreecatv_player_video";
                        iframe.className = "AfreecaPlayer"
                        iframe.src = iframeURL;
                        iframe.frameBorder = "0";
                        iframe.allowFullscreen = true;
                        iframe.allow = "clipboard-write";
                        iframe.style.width = "100%";
                        iframe.style.height = "523px";

                        // p 태그 내용을 iframe으로 교체
                        p.innerHTML = ''; // p 태그를 비움
                        p.appendChild(iframe);
                    }
                });
            }
        });

        adjustIframeHeights(); // 초기 로딩 시 높이 조정
        // 창 크기 조정 시 높이 재조정
        window.addEventListener('resize', adjustIframeHeights);
    });
})();

// ==UserScript==
// @name         AfreecaTV Link to Iframe Converter for dogdrip
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Convert AfreecaTV links to iframe in dogdrip
// @author       noodlekiller
// @match        https://www.dogdrip.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=afreecatv.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 함수: URL이 AfreecaTV 링크 패턴과 일치하는지 확인하고 파라미터 추가
    function createAfreecaTVIframeURL(url) {
        if (/^https:\/\/vod\.afreecatv\.com\/player\/[0-9]+$/.test(url)) {
            return `${url}/embed?showChat=true&autoPlay=false&mutePlay=false`;
        } else {
            return null;
        }
    }

    function adjustIframeHeight(iframe) {
        // 여기에서 비율을 설정합니다. 예: 16:9 비디오의 경우
        const aspectRatio = 16 / 9;

        // iframe의 현재 너비를 계산
        const width = iframe.clientWidth;

        // 높이를 비율에 따라 설정
        const newHeight = width / aspectRatio;
        iframe.style.height = `${newHeight}px`;
    }

    window.addEventListener('load', () => {
        const iframe = document.getElementById('afreecatv_player_video');
        if (iframe) {
            adjustIframeHeight(iframe);
            // 윈도우 크기 조정 시 높이 재조정
            window.addEventListener('resize', () => {
                adjustIframeHeight(iframe);
            });
        }
    });

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
                // 각 <p> 내의 모든 링크 검색
                const links = p.querySelectorAll('a');
                links.forEach(link => {
                    const iframeURL = createAfreecaTVIframeURL(link.href);
                    if (iframeURL) {
                        // 유효한 링크를 찾으면 iframe으로 변환
                        const iframe = document.createElement('iframe');
                        iframe.id = "afreecatv_player_video";
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
            });
        }
    });
})();

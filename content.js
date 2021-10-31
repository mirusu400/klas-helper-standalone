// ==UserScript==
// @name         KLAS Helper
// @namespace    https://github.com/nbsp1221
// @version      2.2.0
// @description  광운대학교 KLAS 사이트에 편리한 기능을 추가할 수 있는 유저 스크립트
// @match        https://klas.kw.ac.kr/*
// @run-at       document-start
// @homepageURL  https://github.com/nbsp1221/klas-helper
// @supportURL   https://github.com/nbsp1221/klas-helper/issues
// @updateURL    https://openuserjs.org/meta/nbsp1221/KLAS_Helper.meta.js
// @downloadURL  https://openuserjs.org/install/nbsp1221/KLAS_Helper.user.js
// @author       nbsp1221
// @copyright    2020, nbsp1221 (https://openuserjs.org/users/nbsp1221)
// @license      MIT
// ==/UserScript==

// JavaScript 파일 캐시 문제 해결
function jsCache(filePath) {
	const nowDate = new Date();
	const cacheValue = nowDate.getYear() + nowDate.getMonth() + nowDate.getDay() + nowDate.getHours() + nowDate.getMinutes();
	return filePath + '?v=' + cacheValue;
}


// 태그에 삽입되지 않는 함수 목록
const internalPathFunctions = {
	// 온라인 강의 화면
	'/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do': () => {
		// 온라인 강의 동영상 다운로드
		const downloadVideo = (videoCode) => {
			chrome.runtime.sendMessage({
					"action": "downloadVideo",
					"videoCode": videoCode
				}, function (response) {
          console.log(response)
          const oParser = new DOMParser();
          const documentXML  = oParser.parseFromString(response.xhr, "text/xml");
          // = xhr.responseXML;
          console.log(documentXML);
          const videoList = [];

          // 분할된 동영상 등 다양한 상황 처리
          if (documentXML.getElementsByTagName('desktop').length > 0) {
            videoList.push({
              url: documentXML.getElementsByTagName('media_uri')[0].innerHTML,
              type: documentXML.getElementsByTagName('content_type')[0].innerHTML
            });
          }
          else {
            const mediaURI = documentXML.getElementsByTagName('media_uri')[0].innerHTML;
            const videoNames = documentXML.getElementsByTagName('main_media');
            const videoTypes = documentXML.getElementsByTagName('story_type');

            for (let i = 0; i < videoNames.length; i++) {
              videoList.push({
                url: mediaURI.replace('[MEDIA_FILE]', videoNames[i].innerHTML),
                type: videoTypes[i].innerHTML
              });
            }
          }

          // 다운로드 버튼 렌더링
          for (let i = 0; i < videoList.length; i++) {
            const videoURL = videoList[i].url;
            const videoType = videoList[i].type === 'video1' ? '동영상' : '오디오';

            const labelElement = document.createElement('label');
            labelElement.innerHTML = `
              <a href="${videoURL}" target="_blank" style="background-color: brown; padding: 10px; text-decoration: none">
                <span style="color: white; font-weight: bold">${videoType} 받기 #${i + 1}</span>
              </a>
            `;

            document.querySelector('.mvtopba > label:last-of-type').after(labelElement);
          }
        }
      );
		};

		// 고유 번호를 받을 때까지 대기
		const waitTimer = setInterval(() => {
			const videoCode = document.body.getAttribute('data-video-code');

			if (videoCode) {
				clearInterval(waitTimer);
				downloadVideo(videoCode);
			}
		}, 100);

		// 일정 시간이 지날 경우 타이머 해제
		setTimeout(() => {
			clearInterval(waitTimer);
		}, 10000);
	}
};



(function () {
	'use strict';

	// 메인 파일 삽입
	// 업데이트 시 즉각적으로 업데이트를 반영하기 위해 이러한 방식을 사용함
	const scriptElement = document.createElement('script');
	scriptElement.src = jsCache('https://nbsp1221.github.io/klas-helper/dist/main.js');
	document.head.appendChild(scriptElement);
	for (const path in internalPathFunctions) {
		if (path === location.pathname) {
		  internalPathFunctions[path]();
		}
	}

  const waitTimer = setInterval(() => {
    if (document.querySelector('.navtxt span:nth-child(1)')) {
      document.querySelector('.navtxt span:nth-child(1)').innerHTML  = (`
      <span style="margin-right: 20px">
        <a href="https://github.com/nbsp1221/klas-helper" target="_blank" rel="noopener">KLAS Helper</a>
        <a href="https://github.com/nbsp1221/klas-helper" target="_blank" rel="noopener">확장 프로그램</a>
        사용 중
      </span>
    `);
      clearInterval(waitTimer);
    }
  }, 100);

  // 일정 시간이 지날 경우 타이머 해제
  setTimeout(() => {
    clearInterval(waitTimer);
  }, 1500);
})();

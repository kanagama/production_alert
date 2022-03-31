let regex = new RegExp('(https?|ftp)(:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+)');

var title = '';

$(function() {
  // タイトルを取得する
  const p1 = new Promise((resolve, reject) => {
    chrome.storage.local.get(['production_title'], (result) => {
      resolve(result.production_title);
    });
  });
  const p2 = new Promise((resolve, reject) => {
    chrome.storage.local.get(['production_alert'], (result) => {
      if (result.production_alert !== null) {
        resolve(result.production_alert);
      }
      reject("reject message");
    });
  });
  // 待機時間を比較する
  const p3 = new Promise((resolve, reject) => {
    chrome.storage.local.get(['unixtimestamp'], (result) => {
      // 取得できない、または待機時間を過ぎていればOK
      if (!result.unixtimestamp || unixtimestamp() > result.unixtimestamp) {
        resolve(true);
      }
      resolve(false);
    });
  });

  Promise.all([p1, p2, p3]).then(results => {
    // 待機時間を過ぎている
    if (results[2]) {
      // 保存してある URL を取得して比較
      results[1].forEach(function(elem, index) {
        // 前方一致が存在している
        if (location.href.indexOf(elem.key) === 0) {
          title = '本番環境です！注意してください！';
          if (results[0] !== null) {
            title = results[0];
          }

          showModal(title);
          return false;
        }
      });
    }
  }).catch(reject => {
    console.log(reject);
  });
});

/**
 * モーダル表示
 *
 * @param {string} show_title
 */
function showModal(show_title)
{
  // モーダルウィンドウと中身の要素を生成・クラスを付与
  const modalElement = document.createElement('div');
  modalElement.classList.add('displaymodal');
  const innerElement = document.createElement('div');
  innerElement.classList.add('displayinner');

　　 // モーダルウィンドウに表示する要素を記述
  innerElement.innerHTML = `
      <p>` + show_title + `</p>
      <button class="displaybutton">
        10分間再表示しない
      </button>
      <link href="css/tailwind.min.css" rel="stylesheet">
      <style>
      .displaymodal {
        position: fixed;
        left: 50%;
        top: 20%;
        transform: translate(-50%, -50%);
        color: #000000;
        font-weight: bold;
        font-size: 24px;
        min-width: 70%;
        z-index: 9999;
      }

      .displayinner {
        width: 100%;
        height: 100%;
        background-color: rgba(230, 230, 230, 0.9);
        border-radius: 10px;
        padding: 20px 30px 0px 30px;
        border: 3px solid #444;
      }

      .displayinner p {
        font-weight: bold;
      }

      .displaybutton {
        display: block;
        width: 200px;
        height: 50px;
        margin: 1.5em auto;
        line-height: 10px;
        background: #007AFF;
        border-radius: 15px;
        color: #fff;
        font-size: 16px;
        font-weight: bold;
        text-decoration: none;
        text-align: center;
      }
      </style>
  `;

  // モーダルウィンドウに中身を配置
  modalElement.appendChild(innerElement);
  document.body.appendChild(modalElement);

  // 10分非表示ボタンをクリック
  $('.displaybutton').click(function(){
    let minute = unixtimestamp();
    // 10分追加
    minute += 600;

    const value = { 'unixtimestamp' : minute };
    chrome.storage.local.set(value, () => {
      console.log('Stored unixtimestamp name: ' + minute);
    });

    closeModal(modalElement);
  });
}

/**
 * モーダル終了
 */
function closeModal(modalElement)
{
  document.body.removeChild(modalElement);
}

/**
 * UNIXTIMESTAMPを取得
 */
function unixtimestamp()
{
    var date = new Date() ;
    var a = date.getTime() ;
    return Math.floor(a / 1000)
}
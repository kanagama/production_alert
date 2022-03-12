let regex = new RegExp('(https?|ftp)(:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+)');
let key_name = 'production_alert';

$(function() {

  var i = 0;
  var storage;
  var key;

  chrome.storage.local.get(['production_title'], (result) => {
    $('.messageinput').val(result.production_title);
  });

  chrome.storage.local.get(['production_alert'], (result) => {
    if (result.production_alert !== null) {
      result.production_alert.forEach(function(elem, index) {
        if ($('.urlinput.show').length === (index + 1)) {
          add();
        }
        $('.urlinput.show').eq(index).val(elem.key);
      });
    }
  });

  $('.add').click(function() {
    add();
  });

  // 保存ボタン
  $('.save').click(function() {
    save();
  });

  // クリアボタン
  $('.clear').click(function() {
    $('.messageinput').val('');
    $('.urlinput').each(function(){
      $(this).val('');
    });
    save();
  })
});

/**
 * 要素追加
 */
function add()
{
  $('.url_no').last().text($('.url_no').length);
  $('.input_urlfield').append($('.addform').clone().show().removeClass('addform'));
  $('.urlinput').addClass('show');
}

/**
 * 保存
 */
function save()
{
  // 現在の保存データをすべて削除
  chrome.storage.local.clear(() => {
    console.log('Everything was removed');
  });

  // タイトルを保持
  const value = { 'production_title' : $('.messageinput').val() };
  chrome.storage.local.set(value, () => {
    console.log('Stored production_title name: ' + $('.messageinput').val());
  });

  let saves = [];
  let checks = [];
  // URLを全て保存
  $('.urlinput').each(function() {
    const value = $(this).val();
    if (value !== '') {
      if (regex.test(value)) {
        if (checks.indexOf(value) === -1) {
          checks.push(value);
          saves.push({key: value});
        } else {
          $('.flash-message p').text('同じURLを除去して保存しました。');
          $('.flash-message').show();
        }
      } else {
        $('.flash-message p').text('不正なURLが入力されました。ご確認よろしくお願いいたします。');
        $('.flash-message').show();
        return false
      }
    }
  });

  const set = { ['production_alert']: saves }
  chrome.storage.local.set(set, () => {
    console.log('Stored url');
  });
}
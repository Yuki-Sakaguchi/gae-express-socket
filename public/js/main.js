const socketio = io();

window.addEventListener('DOMContentLoaded', () => {
  const formEl = document.querySelector('#form');
  const nameEl = document.querySelector('#name');
  const inputEl = document.querySelector('#input');
  const btnEl = document.querySelector('button');
  const messagesEl = document.querySelector('.messages');

  const createMessage = (name, message) => {
    const el = document.createElement('li');
    const heading = document.createElement('p');
    const body = document.createElement('p');
    heading.textContent = 'from [ ' + name + ' ]さん';
    body.innerHTML = message.replace(/\r?\n/g, '<br>');
    el.appendChild(heading);
    el.appendChild(body);

    const bg = hashBytes(name);
    el.setAttribute('style', 'border-color: ' + toColorCode(bg));

    return el;
  };

  // 名前がなかったら送信できないようにする
  nameEl.addEventListener('keyup', (e) => {
    if (e.target.value == '') {
      inputEl.disabled = true;
      btnEl.disabled = true;
    } else {
      inputEl.disabled = false;
      btnEl.disabled = false;
    }
  })

  // 送信
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();

    if (inputEl.value == '') {
      return;
    }

    // inputの内容をサーバーに送信
    socketio.emit('message', {
      name: nameEl.value,
      message: inputEl.value
    });

    inputEl.value = '';
  });

  // 受信
  socketio.on('message', ({ name, message }) => {
    // メッセージを追加
    const messageEl = createMessage(name, message);
    messagesEl.prepend(messageEl);

    // アニメーション開始
    setTimeout(() => {
      messageEl.classList.add('fadeout');
    }, 100);

    // 少し経ったら消す
    setTimeout(() => {
      messageEl.remove();
    }, 10000);
  });
});


// -------------------------------------------------------
// 以下の参考サイにを元に文字から色を生成する関数
// https://tyablog.net/2020/03/09/javascript-hash-color/

/**
 * 指定文字列をCRC32でハッシュ化
 * 1バイトずつ、配列で取得。（4バイト分）
 *
 * @param  text string
 * @returns {number[]}
 */
function hashBytes(text) {
  let i32 = CRC32.str(text);

  return [
      (i32 & 0xFF000000) >>> 24,
      (i32 & 0x00FF0000) >>> 16,
      (i32 & 0x0000FF00) >>> 8,
      (i32 & 0x000000FF) >>> 0,
  ];
}

/**
 * 1バイトの数字を16進数の文字列に変換
 * 2桁になるようにゼロ埋めします
 *
 * @param b number
 * @returns {string}
 */
function toHex(b) {
  let str = b.toString(16);
  if (2 <= str.length) {
      return str;
  }

  return "0" + str;
}

/**
 * スタイル属性に指定できるように、
 * バイト配列を色コードの文字列に変換します。
 *
 * @param bytes number[]
 * @returns {string}
 */
function toColorCode(bytes) {
  return "#" + toHex(bytes[0]) + toHex(bytes[1]) + toHex(bytes[2]);
}

/**
 * RGB値から、明るさをもとめます。
 * (計算の仕方はW3C参照)
 *
 * @param r number 0-255
 * @param g number 0-255
 * @param b number 0-255
 * @returns {number}
 */
function brightness(r, g, b) {
  return Math.floor(((r * 299) + (g * 587) + (b * 114)) / 1000);
}
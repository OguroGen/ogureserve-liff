// src/liff.js
import liff from '@line/liff';

export { liff }; // liffオブジェクトをエクスポート

// デバッグ情報を表示する関数
const logDebug = (message, data = null) => {
  const debugElement = document.getElementById('liff-debug');
  if (debugElement) {
    const logItem = document.createElement('div');
    logItem.textContent = `${new Date().toISOString()} - ${message}`;
    if (data) {
      const dataItem = document.createElement('pre');
      try {
        dataItem.textContent = JSON.stringify(data, null, 2);
      } catch (e) {
        dataItem.textContent = `[データをJSONに変換できません: ${e.message}]`;
      }
      logItem.appendChild(dataItem);
    }
    debugElement.appendChild(logItem);
  }
  console.log(`[LIFF DEBUG] ${message}`, data || '');
};

export const initLiff = async () => {
  logDebug('LIFF初期化を開始します');
  
  try {
    logDebug('liff.init()を呼び出します', { liffId: "2007259791" });
    await liff.init({ liffId: "2007259791" });
    logDebug('liff.init()が成功しました');
    
    const isInClient = liff.isInClient();
    logDebug('liff.isInClient()の結果', { isInClient });
    
    const isLoggedIn = liff.isLoggedIn();
    logDebug('liff.isLoggedIn()の結果', { isLoggedIn });
    
    if (!isLoggedIn) {
      logDebug('ユーザーがログインしていないため、ログインを開始します');
      liff.login();
    } else {
      logDebug('ユーザーは既にログインしています');
    }
    
    return true; // 初期化成功
  } catch (err) {
    logDebug('LIFF初期化に失敗しました', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      lineNumber: err.lineNumber
    });
    console.error("LIFF init failed", err);
    
    // エラーを上位に伝播させる
    throw new Error(`LIFFの初期化に失敗しました: ${err.message}`);
  }
};

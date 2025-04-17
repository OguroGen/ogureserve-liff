// src/liff.js
import liff from '@line/liff';

export { liff }; // liffオブジェクトをエクスポート

export const initLiff = async () => {
  try {
    await liff.init({ liffId: "2007259791" }); // 後で設定
    if (!liff.isLoggedIn()) {
      liff.login();
    }
    return true; // 初期化成功
  } catch (err) {
    console.error("LIFF init failed", err);
    // エラーを上位に伝播させる
    throw new Error("LINEアプリからアクセスしてください。");
  }
};

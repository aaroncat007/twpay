# TWQR產生器

*TL;DR*

這個工具設計來產生符合 TWQR 格式的 QR Code，讓人們在轉帳、繳費、要錢的時候可以更方便。
其中導入Google Drive API，可以讓使用者儲存常用的銀行資料，並在需要時快速產生 QR Code。

## 介紹

TWQR 是一個 QR Code 格式，用於在線下環境中進行支付。它由台灣銀行開發，並於 2022 年 10 月 1 日起生效。TWQR 的主要目的是提供一個簡單、安全且快速的支付方式，讓消費者可以方便地在線下環境中進行支付。

TWQR 的主要特點包括：

1. QR Code 格式：TWQR 使用 QR Code 格式，讓消費者可以方便地使用手機掃描 QR Code 進行支付。
2. 安全性：TWQR 使用 SSL/TLS 加密技術，確保支付過程的安全性。
3. 便捷性：TWQR 可以在線下環境中使用，讓消費者可以方便地在線下環境中進行支付。

## Known Issues

* 繳費 - 台水帳單目前缺少C1欄位，待修正


## 使用方法

本工具會自動部署於 GitHub Pages，請前往以下網址使用：

🔗 https://aaroncat007.github.io/twpay/
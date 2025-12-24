/**
 * QR Code 生成模組
 * 提供客戶端 QR Code 生成功能，支援 Logo 嵌入和文字資訊
 */

/**
 * 生成帶有 Logo 和文字資訊的 QR Code
 * @param {string} dataString - QR Code 資料字串
 * @param {number} size - QR Code 大小（像素）
 * @param {Object} options - 選項設定
 * @param {string} options.logoUrl - Logo 圖片路徑
 * @param {boolean} options.isPaymentMode - 是否為繳費模式
 * @param {string} options.bankCode - 銀行代碼（一般模式使用）
 * @param {string} options.accountNumber - 帳號
 * @returns {Promise<string>} 返回 Data URL 格式的圖片
 */
async function generateQRCodeWithCanvas(dataString, size = 250, options = {}) {
    try {
        // 1. 先用 qrcode 庫生成基礎 QR Code
        const qrDataUrl = await QRCode.toDataURL(dataString, {
            width: size,
            margin: 0,
            errorCorrectionLevel: 'H',  // 高錯誤修正等級以容忍 Logo 遮蓋
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        // 2. 創建 Canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return qrDataUrl;  // 如果無法獲取 context，返回基礎 QR Code

        const qrImage = new Image();
        const logoImage = new Image();

        // 3. 載入圖片
        await Promise.all([
            // 載入 QR Code
            new Promise((resolve) => {
                qrImage.onload = resolve;
                qrImage.src = qrDataUrl;
            }),
            // 載入 Logo
            new Promise((resolve) => {
                logoImage.onload = resolve;
                logoImage.onerror = resolve;  // 如果載入失敗也繼續
                logoImage.src = options.logoUrl || './assets/TWQR-logo.png';
            })
        ]);

        // 4. 設置 Canvas 尺寸（QR Code + 下方文字區域）
        const padding = 40;
        const bottomTextHeight = 60;  // 帳號文字區域高度

        canvas.width = qrImage.width + (padding * 2);
        canvas.height = qrImage.height + (padding * 2) + bottomTextHeight;

        // 5. 繪製白色背景
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 6. 繪製 QR Code
        ctx.drawImage(qrImage, padding, padding);

        // 7. 在 QR Code 中央繪製 Logo（如果成功載入）
        if (logoImage.complete && logoImage.naturalWidth > 0) {
            const logoSize = qrImage.width * 0.2;  // Logo 大小為 QR Code 的 20%
            const logoX = padding + (qrImage.width - logoSize) / 2;
            const logoY = padding + (qrImage.height - logoSize) / 2;

            // 繪製 Logo 背景（白色圓角矩形）
            ctx.fillStyle = '#FFFFFF';
            const bgSize = logoSize * 1.25;
            const bgX = padding + (qrImage.width - bgSize) / 2;
            const bgY = padding + (qrImage.height - bgSize) / 2;

            ctx.beginPath();
            const radius = 12;
            ctx.roundRect(bgX, bgY, bgSize, bgSize, radius);
            ctx.fill();

            // 繪製 Logo
            ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
        }

        // 8. 繪製下方文字（銀行代碼和帳號，如果是一般模式）
        if (!options.isPaymentMode && options.bankCode) {
            const textY = padding + qrImage.height + padding + 20;

            ctx.fillStyle = '#333333';
            ctx.font = '20px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';

            // 格式化帳號（每 4 位加空格）
            const formattedAccount = options.accountNumber.replace(/(\d{4})/g, '$1 ').trim();
            const displayText = `(${options.bankCode}) ${formattedAccount}`;
            ctx.fillText(displayText, canvas.width / 2, textY);
        }

        // 9. 返回 Data URL
        return canvas.toDataURL();

    } catch (error) {
        console.error('QR Code 生成錯誤:', error);
        throw error;
    }
}

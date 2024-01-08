

/**
 * 產生付款碼
 * @param {string} Mode 服務名稱
 * @param {Array<String>} Data 資料模型
 * @param {boolean} QRCode 是否產生QRCode
 * @param {number} QRCodePixel QRCode像素大小
 */
function generate(Mode, Data, QRCode, QRCodePixel = 400) {

    // 回應模型
    var reponse_model = {
        Success: false,
        Msg: ""
    };

    // 呼叫服務
    if (Mode == "TWPay") {
        let bankcode = Data["bankcode"];
        let accno = Data["accno"];
        let amount = Data["amount"];
        let memo = Data["memo"];

        reponse_model = func_TWPay(bankcode, accno, amount, memo);
    }

    // 狀態判斷
    if (!reponse_model.Success) return reponse_model;

    // 產生QRCode
    if (QRCode) {
        let QString = reponse_model["String"];
        QRCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=${QRCodePixel}x${QRCodePixel}&chl=${QString}`
        reponse_model["QString"] = QRCodeUrl;
    }

    return reponse_model;
}


/**
 * 產生TWpay條碼
 * @param {number} BankCode 銀行代碼
 * @param {number} AccNo 帳號/銷帳編號
 * @param {number} Amount 金額
 * @param {*} Memo 備註
 */
function func_TWPay(BankCode, AccNo, Amount, Memo) {

    // 回應模型
    let reponse_model = {
        Success: false,
        Msg: ""
    };

    // 附加資訊
    let AddonString = []

    //檢查銀行代碼
    let chk_BankCode = parseInt(BankCode);
    if (isNaN(chk_BankCode) || chk_BankCode < 1 || chk_BankCode > 999) {
        reponse_model.Success = false;
        reponse_model.Msg = "Parameters `Bank` not legal";
        return reponse_model;
    }
    let fix_BankCode = chk_BankCode.toString().padStart(3, '0');

    //檢查帳號
    let chk_AccNo = parseInt(AccNo);
    if (isNaN(chk_AccNo) || chk_AccNo < 1 || chk_AccNo > 9999999999999999) {
        reponse_model.Success = false;
        reponse_model.Msg = "Parameters `AccNo` not legal";
        return reponse_model;
    }
    let fix_AccNo = chk_AccNo.toString().padStart(16, '0');

    //檢查金額
    if (Amount) {
        let chk_Amount = parseInt(Amount);
        //TWPay金額限制最低1.00元，最高9,999,999.00元
        if (!isNaN(chk_Amount) && chk_Amount <= 9999999 && chk_Amount >= 1) {
            //TWPay金額格式包含兩位小數，所以此處數字要乘上100
            let fixed_Amount = chk_Amount * 100;
            //加上金額
            AddonString.push(`%26D1%3D${fixed_Amount}`);
        }
    }

    //檢查備註
    if (Memo) {
        //備註上限為19字元，超過者省略。
        let fixed_Memo = Memo.slice(0, 19);
        //加上備註
        AddonString.push(`%26D9%3D${fixed_Memo}`);
    }

    //產生QRCode編碼字串
    let QString = `TWQRP%3A%2F%2F${fix_BankCode}NTTransfer%2F158%2F02%2FV1%3FD6%3D${fix_AccNo}%26D5%3D${fix_BankCode}%26D10%3D901${AddonString.join("")}`;
    reponse_model["Success"] = true;
    reponse_model["String"] = QString;
    return reponse_model;
}
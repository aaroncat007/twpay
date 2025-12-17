

/**
 * 產生付款碼
 * @param {string} Mode 服務名稱
 * @param {Array<String>} Data 資料模型
 * @param {boolean} QRCode 是否產生QRCode
 * @param {number} QRCodePixel QRCode像素大小
 */
function generate(Mode, Data, QRCode, QRCodePixel = "150x150") {

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
        QRCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${QRCodePixel}&data=${QString}`
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


/**
 * 產生繳費模式TWpay條碼
 * @param {string} FeeCode 繳費類別代碼（第二部分，如 0061, 0041, 006A等）
 * @param {string} FeeName 繳費類別名稱（第三部分）
 * @param {string} AccNo 銷帳編號
 * @param {number} Amount 金額
 */
function func_TWPay_Payment(FeeCode, FeeName, AccNo, Amount) {

    // 回應模型
    let reponse_model = {
        Success: false,
        Msg: ""
    };

    // 處理金額（轉換為包含兩位小數的格式）
    let SAmount = Amount ? parseInt(Amount) : 0;
    let AmountString = SAmount * 100;

    // 根據不同的 FeeCode 設定 PartialString
    let PartialString = "";

    switch (FeeCode) {
        case "0040":
            PartialString = "D3=AT65E2NDwehQ&D10=901&D11=00,0040040376980850178184719006041813&D15=000&D16=國民年金保險費&D12=99991231235959";
            break;
        case "0041":
            PartialString = "D3=AWV3cihi1B9q&D10=901&D11=00,0040040862840750238157236400155808&D15=000&D8=個人繳款單";
            break;
        case "0061":
            PartialString = "D3=ASap8GBcaZae&D4=99991231&D8=水費帳單&D10=901&D11=00,0060065224244455005500000100161803&D14=2,FN046286,201903";
            break;
        case "006A":
            PartialString = "D3=ARCD0UqJMB6l&D11=00,0060067079912831443144000100170003&D15=000";
            break;
        case "007A":
            PartialString = "D3=Ae/pdiFSI3Ke&D11=00,0070071000081770110685007600817003&D15=000";
            break;
        case "007G":
            PartialString = "D3=Ac4eLFwMl5pw&D11=00,0070071000319850020560013703198805&D15=0000&D16=亞太電信";
            break;
        case "008A":
            PartialString = "D3=Ac98MPe0FDlt&D11=00,0080081000005803000100012800058003&D15=000";
            break;
        case "009A":
            PartialString = "D3=Af70SVlXU70v&D11=00,0099910000204040019001999900204003&D15=000";
            break;
        case "017A":
            PartialString = "D3=AQefGD3amu6l&D11=00,0170171126683296001000000100112003&D15=000";
            break;
        case "017T":
            PartialString = "D3=AaK0ZafgvcDL&D11=00,0170171170769567001000078600956805&D15=000";
            break;
        case "103A":
            PartialString = "D3=Ac5FpKui64Zz&D11=00,1039910000104040011030999900104003";
            break;
        case "805A":
            PartialString = "D3=AfAEmVIr4NSI&D11=00,8059910000069090010001999900069003&D15=000";
            break;
        case "807B":
            PartialString = "D3=ARoA3fZ0L+Gs&D11=00,8078072559276081058105000103400003&D15=000";
            break;
        default:
            reponse_model.Success = false;
            reponse_model.Msg = "Unknown FeeCode";
            return reponse_model;
    }

    // 構建 URIString
    let URIString = `TWQRP://${FeeName}/158/03/V1?${PartialString}&D1=${AmountString}&D7=${AccNo}`;

    // 編碼處理
    let EString = encodeURIComponent(URIString);
    let QString = encodeURIComponent(EString);

    reponse_model["Success"] = true;
    reponse_model["String"] = QString;
    return reponse_model;
}

// 當前模式 (1=一般模式, 2=繳費模式)
let currentMode = 1;

// 繳費類別格式提示
const paymentHints = {
    "004,0041,衛生福利部中央健康保險署": "請輸入「銷帳編號」（而非「繳款單編號」）！",
    "006,0061,台灣自來水": "台水請輸入水號英數字共11碼。請勿輸入「北水」帳單！",
    "007,007A,信用卡費": "一銀信用卡繳款，可輸入「卡號」或「存戶編號」共16位。",
    "008,008A,華南銀行信用卡費": "華南信用卡繳款，可輸入「卡號」或「繳款編號」共16位。",
    "009,009A,彰化銀行信用卡費": "彰銀信用卡繳款，請輸入帳單上的「14位數」ATM轉帳號碼（該帳號末8碼應與您身分證字號末8碼相同，請勿輸入「第二段繳款條碼」！）",
    "017,017T,台灣之星電信股份有限公司": "台灣之星請輸入「786000」+「帳戶編號10碼（非手機號碼）」共16位數字。",
    "103,103A,新光銀行信用卡繳款－ＶＩＳＡ　ＱＲ": "新光卡費，一般卡請輸入「316」+「正卡持卡人身分證字號11碼（英文字母需轉換為數字：A=01、B=02、C=03依此類推）」；商務卡請輸入「316000」+「統一編號8碼」。",
    "805,805A,遠東商銀信用卡繳款-VisaQRCode": "遠銀卡費請輸入「529」+「正卡持卡人身分證字號11碼（英文字母需轉換為數字：A=01、B=02、C=03依此類推）」。",
    "807,807B,永豐信用卡帳單繳費": "永豐卡友請注意:\n\n1. 永豐已終止台灣Pay相關業務，惟部分銀行APP仍可使用此條碼繳款入帳，各銀行適用性請自行測試，若可正常掃碼則表示可以使用。\n\n2. 請輸入「信用卡卡號」或「00598+正卡持卡人身分證字號11碼（英文字母需轉換為數字：A=01、B=02、C=03依此類推）」。\n\n3. 若您名下只有「永豐美國運通卡」，將無法使用此功能繳費。（系統會顯示繳費成功，但實際上錢錢會消失，無法入帳）",
    "004,0040,國保": "請輸入身分證字號（共10碼，英文字請用大寫）！"
};

// 更新繳費類別提示
function updatePaymentHint() {
    const category = document.querySelector("#input_payment_category").value;
    const hintBlock = document.querySelector("#format_hint");
    const hintText = document.querySelector("#format_hint_text");

    if (category && paymentHints[category]) {
        hintText.textContent = paymentHints[category];
        hintBlock.classList.remove("d-none");
    } else {
        hintBlock.classList.add("d-none");
    }
}

// 模式切換函數
function switchMode(mode) {
    currentMode = mode;

    const modeNormalBtn = document.querySelector("#mode_normal");
    const modePaymentBtn = document.querySelector("#mode_payment");
    const currentModeText = document.querySelector("#current_mode");
    const paymentCategoryWrapper = document.querySelector("#payment_category_wrapper");
    const bankCodeWrapper = document.querySelector("#bank_code_wrapper");
    const labelAcc = document.querySelector("#label_acc");
    const formatHint = document.querySelector("#format_hint");

    if (mode === 1) {
        // 一般轉帳模式
        modeNormalBtn.classList.add("active");
        modePaymentBtn.classList.remove("active");
        currentModeText.textContent = "一般轉帳模式";
        paymentCategoryWrapper.classList.add("d-none");
        bankCodeWrapper.classList.remove("d-none");
        labelAcc.textContent = "帳號/銷帳編號";
        formatHint.classList.add("d-none");
    } else if (mode === 2) {
        // 繳費模式
        modeNormalBtn.classList.remove("active");
        modePaymentBtn.classList.add("active");
        currentModeText.textContent = "繳費模式";
        paymentCategoryWrapper.classList.remove("d-none");
        bankCodeWrapper.classList.add("d-none");
        labelAcc.textContent = "銷帳編號";
        formatHint.classList.add("d-none");
    }
}

function go() {
    let input_bank = "";
    let input_acc = document.querySelector("#input_acc").value;
    let input_amount = document.querySelector("#input_amount").value;
    let input_memo = document.querySelector("#input_memo").value;
    let input_redir = document.querySelector("#input_redir").checked;
    let input_qrcodepixel = document.querySelector("#input_redir").value;

    // 繳費模式處理
    if (currentMode === 2) {
        let input_payment_category = document.querySelector("#input_payment_category").value;
        if (input_payment_category === "") {
            return alert("請選擇繳費類別");
        }

        // 從複合 value 中提取三個部分
        const parts = input_payment_category.split(',');
        const bankCode = parts[0];    // 銀行代碼（例如：006）
        const feeCode = parts[1];     // 繳費代碼（例如：0061）
        const feeName = parts[2];     // 繳費名稱（例如：台灣自來水）

        if (input_acc === "") return alert("請輸入銷帳編號");
        if (input_amount === "") return alert("請輸入繳費金額");

        // 調用繳費模式專用的條碼生成函數
        let result = func_TWPay_Payment(feeCode, feeName, input_acc, input_amount);

        if (!result.Success) {
            return alert(result.Msg);
        }

        // 產生QRCode
        if (input_redir) {
            let QString = result["String"];
            let QRCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${input_qrcodepixel}x${input_qrcodepixel}&data=${QString}`;
            result["QString"] = QRCodeUrl;
        }

        displayCollapse(result);

    } else {
        // 一般模式，從輸入框取得銀行代碼
        input_bank = document.querySelector("#input_bank").value;

        if (input_bank === "") return alert("請輸入銀行代碼");
        if (input_acc === "") return alert("請輸入帳號/銷帳編號");

        let datas = {
            bankcode: input_bank,
            accno: input_acc,
            amount: input_amount,
            memo: input_memo
        };

        let result = generate("TWPay", datas, input_redir, input_qrcodepixel);

        displayCollapse(result);
    }

}

function hideCollapse() {
    const myCollapseEl = document.querySelector("#collapseExample");
    myCollapseEl.classList.add("d-none");

    const myformEl = document.querySelector(".form-generator");
    myformEl.classList.remove("d-none");
}

function displayCollapse(message) {

    const targetSectionEl = document.querySelector("#collapseExample .card-body");

    if (message["QString"] != undefined) {
        let QRcodeImg = `<img src="${message["QString"]}" class="rounded mx-auto d-block" alt="QRCode">`
        targetSectionEl.innerHTML = QRcodeImg;
    }
    else { targetSectionEl.innerHTML = JSON.stringify(message); }

    const myCollapseEl = document.querySelector("#collapseExample");
    myCollapseEl.classList.remove("d-none");
    document.querySelector(".form-generator").classList.add("d-none");
}

function alert(message) {
    document.querySelector("#AlertModal .modal-body").innerHTML = message;
    const myModalAlternative = new bootstrap.Modal('#AlertModal');
    myModalAlternative.show();
}

// DOM 載入完成後綁定事件
document.addEventListener('DOMContentLoaded', function () {
    // 綁定模式切換按鈕
    document.querySelector("#mode_normal").addEventListener("click", function () {
        switchMode(1);
    });
    document.querySelector("#mode_payment").addEventListener("click", function () {
        switchMode(2);
    });

    // 綁定繳費類別選擇
    document.querySelector("#input_payment_category").addEventListener("change", updatePaymentHint);

    // 綁定生成按鈕
    document.querySelector("button[type='button'].btn-primary").addEventListener("click", go);

    // 綁定返回按鈕
    const backBtn = document.querySelector("#collapseExample button.btn-secondary");
    if (backBtn) {
        backBtn.addEventListener("click", hideCollapse);
    }
});

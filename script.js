const { createApp } = Vue;

createApp({
    data() {
        return {
            // 當前模式 (1=一般模式, 2=繳費模式)
            currentMode: 1,

            // 表單數據
            formData: {
                bankCode: '',
                paymentCategory: '',
                accountNumber: '',
                amount: '',
                memo: '',
                qrSize: 400
            },

            // 顯示狀態
            showResult: false,
            resultQRCode: null,

            // 銀行列表
            bankList: [
                { code: '004', name: '台灣銀行' },
                { code: '005', name: '土地銀行' },
                { code: '006', name: '合作金庫' },
                { code: '007', name: '第一銀行' },
                { code: '008', name: '華南銀行' },
                { code: '009', name: '彰化銀行' },
                { code: '011', name: '上海銀行' },
                { code: '012', name: '台北富邦' },
                { code: '013', name: '國泰世華' },
                { code: '016', name: '高雄銀行' },
                { code: '017', name: '兆豐商銀' },
                { code: '048', name: '王道銀行' },
                { code: '050', name: '台灣企銀' },
                { code: '052', name: '渣打銀行' },
                { code: '053', name: '台中商銀' },
                { code: '054', name: '京城銀行' },
                { code: '081', name: '匯豐銀行' },
                { code: '083', name: '新加坡華僑' },
                { code: '102', name: '華泰銀行' },
                { code: '103', name: '新光銀行' },
                { code: '108', name: '陽信銀行' },
                { code: '118', name: '板信銀行' },
                { code: '147', name: '三信商銀' },
                { code: '700', name: '郵局' },
                { code: '803', name: '聯邦銀行' },
                { code: '805', name: '遠東商銀' },
                { code: '806', name: '元大銀行' },
                { code: '807', name: '永豐銀行' },
                { code: '808', name: '玉山銀行' },
                { code: '809', name: '凱基銀行' },
                { code: '810', name: '星展銀行' },
                { code: '812', name: '台新銀行' },
                { code: '815', name: '日盛銀行' },
                { code: '816', name: '安泰銀行' },
                { code: '822', name: '中國信託' },
                { code: '826', name: '台灣樂天' },
                { code: '910', name: '財金資訊' },
                { code: '997', name: '聯合信用卡處理中心' }
            ],

            // 繳費類別（分組，包含提示訊息）
            paymentCategories: [
                {
                    group: '==信用卡帳單==',
                    items: [
                        {
                            value: '006,006A,合作金庫信用卡費',
                            label: '006合作金庫 (免手續費)',
                            hint: ''
                        },
                        {
                            value: '007,007A,第一銀行信用卡費',
                            label: '007第一銀行 (免手續費)',
                            hint: '一銀信用卡繳款，可輸入「卡號」或「存戶編號」共16位。'
                        },
                        {
                            value: '008,008A,華南銀行信用卡費',
                            label: '008華南銀行 (免手續費)',
                            hint: '華南信用卡繳款，可輸入「卡號」或「繳款編號」共16位。'
                        },
                        {
                            value: '009,009A,彰化銀行信用卡費',
                            label: '009彰化銀行 (免手續費)',
                            hint: '彰銀信用卡繳款，請輸入帳單上的「14位數」ATM轉帳號碼（該帳號末8碼應與您身分證字號末8碼相同，請勿輸入「第二段繳款條碼」！）'
                        },
                        {
                            value: '017,017A,兆豐商銀信用卡費',
                            label: '017兆豐商銀 (手續費:10元)',
                            hint: ''
                        },
                        {
                            value: '103,103A,新光銀行信用卡繳款－ＶＩＳＡ　ＱＲ',
                            label: '103新光銀行 (免手續費)',
                            hint: '新光卡費，一般卡請輸入「316」+「正卡持卡人身分證字號11碼（英文字母需轉換為數字：A=01、B=02、C=03依此類推）」；商務卡請輸入「316000」+「統一編號8碼」。'
                        },
                        {
                            value: '805,805A,遠東商銀信用卡繳款-VisaQRCode',
                            label: '805遠東商銀 (免手續費)',
                            hint: '遠銀卡費請輸入「529」+「正卡持卡人身分證字號11碼（英文字母需轉換為數字：A=01、B=02、C=03依此類推）」。'
                        },
                        {
                            value: '807,807B,永豐信用卡帳單繳費',
                            label: '807永豐銀行 (手續費:10元)',
                            hint: '永豐卡友請注意:\n\n1. 永豐已終止台灣Pay相關業務，惟部分銀行APP仍可使用此條碼繳款入帳，各銀行適用性請自行測試，若可正常掃碼則表示可以使用。\n\n2. 請輸入「信用卡卡號」或「00598+正卡持卡人身分證字號11碼（英文字母需轉換為數字：A=01、B=02、C=03依此類推）」。\n\n3. 若您名下只有「永豐美國運通卡」，將無法使用此功能繳費。（系統會顯示繳費成功，但實際上錢錢會消失，無法入帳）'
                        }
                    ]
                },
                {
                    group: '==公用事業費==',
                    items: [
                        {
                            value: '007,007G,電信費',
                            label: '亞太電信 (已併入遠傳)',
                            hint: ''
                        },
                        {
                            value: '017,017T,台灣之星電信股份有限公司',
                            label: '台灣之星 (已併入TWM)',
                            hint: '台灣之星請輸入「786000」+「帳戶編號10碼（非手機號碼）」共16位數字。'
                        },
                        {
                            value: '006,0061,台灣自來水',
                            label: '台灣自來水 (免手續費)',
                            hint: '台水請輸入水號英數字共11碼。請勿輸入「北水」帳單！'
                        }
                    ]
                },
                {
                    group: '==政府保險費==',
                    items: [
                        {
                            value: '004,0041,衛生福利部中央健康保險署',
                            label: '健保 (手續費:3元)',
                            hint: '請輸入「銷帳編號」（而非「繳款單編號」）！'
                        },
                        {
                            value: '004,0040,國保',
                            label: '國民年金 (手續費:3元)',
                            hint: '請輸入身分證字號（共10碼，英文字請用大寫）！'
                        }
                    ]
                }
            ],

            // Modal 相關
            alertMessage: ''
        };
    },

    computed: {
        // 當前模式文字
        modeText() {
            return this.currentMode === 1 ? '一般轉帳模式' : '繳費模式';
        },

        // 帳號欄位標籤
        accountLabel() {
            return this.currentMode === 1 ? '帳號/銷帳編號' : '銷帳編號';
        },

        // 是否為繳費模式
        isPaymentMode() {
            return this.currentMode === 2;
        },

        // 當前提示訊息
        currentHint() {
            if (this.isPaymentMode && this.formData.paymentCategory) {
                // 從 paymentCategories 中查找當前選中的類別的 hint
                for (const category of this.paymentCategories) {
                    const item = category.items.find(i => i.value === this.formData.paymentCategory);
                    if (item) {
                        return item.hint || '';
                    }
                }
            }
            return '';
        }
    },

    methods: {
        // 模式切換
        switchMode(mode) {
            this.currentMode = mode;
            // 清空相關欄位
            if (mode === 1) {
                this.formData.paymentCategory = '';
            } else {
                this.formData.bankCode = '';
            }
        },

        // 生成 QR Code URL（統一函數）
        generateQRCodeUrl(dataString, size = 400) {
            return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${dataString}`;
        },

        // 一般模式條碼生成
        generateNormalModeTWPay(bankCode, accNo, amount, memo) {
            let reponse_model = {
                Success: false,
                Msg: ""
            };

            let AddonString = [];

            // 檢查銀行代碼
            let chk_BankCode = parseInt(bankCode);
            if (isNaN(chk_BankCode) || chk_BankCode < 1 || chk_BankCode > 999) {
                reponse_model.Success = false;
                reponse_model.Msg = "Parameters `Bank` not legal";
                return reponse_model;
            }
            let fix_BankCode = chk_BankCode.toString().padStart(3, '0');

            // 檢查帳號
            let chk_AccNo = parseInt(accNo);
            if (isNaN(chk_AccNo) || chk_AccNo < 1 || chk_AccNo > 9999999999999999) {
                reponse_model.Success = false;
                reponse_model.Msg = "Parameters `AccNo` not legal";
                return reponse_model;
            }
            let fix_AccNo = chk_AccNo.toString().padStart(16, '0');

            // 檢查金額
            if (amount) {
                let chk_Amount = parseInt(amount);
                if (!isNaN(chk_Amount) && chk_Amount <= 9999999 && chk_Amount >= 1) {
                    let fixed_Amount = chk_Amount * 100;
                    AddonString.push(`%26D1%3D${fixed_Amount}`);
                }
            }

            // 檢查備註
            if (memo) {
                let fixed_Memo = memo.slice(0, 19);
                AddonString.push(`%26D9%3D${fixed_Memo}`);
            }

            // 產生編碼字串
            let QString = `TWQRP%3A%2F%2F${fix_BankCode}NTTransfer%2F158%2F02%2FV1%3FD6%3D${fix_AccNo}%26D5%3D${fix_BankCode}%26D10%3D901${AddonString.join("")}`;
            reponse_model["Success"] = true;
            reponse_model["String"] = QString;
            return reponse_model;
        },

        // 繳費模式條碼生成
        generatePaymentModeTWPay(feeCode, feeName, accNo, amount) {
            let reponse_model = {
                Success: false,
                Msg: ""
            };

            let SAmount = amount ? parseInt(amount) : 0;
            let AmountString = SAmount * 100;
            let PartialString = "";

            switch (feeCode) {
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

            let URIString = `TWQRP://${feeName}/158/03/V1?${PartialString}&D1=${AmountString}&D7=${accNo}`;
            let EString = encodeURIComponent(URIString);
            let QString = encodeURIComponent(EString);

            reponse_model["Success"] = true;
            reponse_model["String"] = QString;
            return reponse_model;
        },

        // 生成 QR Code
        generateCode() {
            let result;

            if (this.isPaymentMode) {
                // 繳費模式
                if (!this.formData.paymentCategory) {
                    return this.showAlert('請選擇繳費類別');
                }
                if (!this.formData.accountNumber) {
                    return this.showAlert('請輸入銷帳編號');
                }
                if (!this.formData.amount) {
                    return this.showAlert('請輸入繳費金額');
                }

                // 從複合 value 提取三個部分
                const parts = this.formData.paymentCategory.split(',');
                const feeCode = parts[1];
                const feeName = parts[2];

                result = this.generatePaymentModeTWPay(feeCode, feeName, this.formData.accountNumber, this.formData.amount);

            } else {
                // 一般模式
                if (!this.formData.bankCode) {
                    return this.showAlert('請輸入銀行代碼');
                }
                if (!this.formData.accountNumber) {
                    return this.showAlert('請輸入帳號/銷帳編號');
                }

                result = this.generateNormalModeTWPay(
                    this.formData.bankCode,
                    this.formData.accountNumber,
                    this.formData.amount,
                    this.formData.memo
                );
            }

            if (!result.Success) {
                return this.showAlert(result.Msg);
            }

            // 使用統一函數生成 QR Code URL
            this.resultQRCode = this.generateQRCodeUrl(result.String, this.formData.qrSize);
            this.showResult = true;
        },

        // 返回表單
        goBack() {
            this.showResult = false;
            this.resultQRCode = null;
        },

        // 顯示提示
        showAlert(message) {
            this.alertMessage = message;
            const myModalAlternative = new bootstrap.Modal('#AlertModal');
            myModalAlternative.show();
        }
    }
}).mount('#app');

/**
 * Google Drive API 整合模組
 * 提供與 Google Drive 的整合功能，包括儲存、載入、刪除資料
 */

const GoogleDriveAPI = {
    /**
     * 包裝 Google Drive API 呼叫，自動處理 token 過期
     * @param {Function} apiCall - API 呼叫函數
     * @param {Object} context - Vue instance 上下文
     * @returns {Promise<Response>}
     */
    async callAPI(apiCall, context) {
        // 在呼叫前檢查並刷新 token
        await this.refreshTokenIfNeeded(context);

        try {
            const response = await apiCall();

            // 檢查是否為 401 未授權錯誤（token 過期）
            if (response.status === 401) {
                // Token 已過期，清除狀態並提示重新登入
                context.googleAccessToken = null;
                context.isGoogleDriveConnected = false;
                context.googleTokenExpiry = null;
                context.cachedFileId = null;
                localStorage.removeItem('google_drive_token');
                localStorage.removeItem('google_token_expiry');
                context.showAlert('⚠️ Google Drive 授權已過期\n\n請重新連接 Google Drive');
                throw new Error('Token expired');
            }

            // 檢查其他錯誤狀態
            if (!response.ok && response.status !== 404) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API 錯誤: ${response.status}`);
            }

            return response;
        } catch (error) {
            if (error.message === 'Token expired') {
                throw error;
            }
            console.error('Google Drive API 錯誤:', error);
            throw error;
        }
    },

    /**
     * 檢查 token 是否即將過期
     * @param {number} tokenExpiry - Token 過期時間戳
     * @returns {boolean}
     */
    isTokenExpiringSoon(tokenExpiry) {
        if (!tokenExpiry) return false;

        // 如果剩餘時間少於 5 分鐘，視為即將過期
        const fiveMinutes = 5 * 60 * 1000;
        return (tokenExpiry - Date.now()) < fiveMinutes;
    },

    /**
     * 主動刷新 token
     * @param {Object} context - Vue instance 上下文
     */
    async refreshTokenIfNeeded(context) {
        if (this.isTokenExpiringSoon(context.googleTokenExpiry)) {
            console.log('Token 即將過期，自動刷新中...');
            // 自動觸發重新授權
            await context.initGoogleDrive();
            return true;
        }
        return false;
    },

    /**
     * 取得或快取檔案 ID（效能優化）
     * @param {string} accessToken - Google access token
     * @param {string} cachedFileId - 已快取的檔案 ID
     * @param {Object} context - Vue instance 上下文
     * @returns {Promise<string|null>}
     */
    async getOrCacheFileId(accessToken, cachedFileId, context) {
        // 如果有快取就直接回傳
        if (cachedFileId) {
            return cachedFileId;
        }

        // 否則搜尋並快取
        const searchResponse = await this.callAPI(() =>
            fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='twpay_data.json'&spaces=appDataFolder`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            ),
            context
        );

        const searchResult = await searchResponse.json();

        if (searchResult.files && searchResult.files.length > 0) {
            return searchResult.files[0].id;
        }

        return null;
    },

    /**
     * 儲存資料到 Google Drive
     * @param {string} accessToken - Google access token
     * @param {string} cachedFileId - 已快取的檔案 ID
     * @param {Object} newItem - 要儲存的項目
     * @param {Object} context - Vue instance 上下文
     * @returns {Promise<Object>} 返回更新後的資料和檔案 ID
     */
    async saveData(accessToken, cachedFileId, newItem, context) {
        // 使用快取的檔案 ID 或搜尋
        let fileId = await this.getOrCacheFileId(accessToken, cachedFileId, context);
        let existingData = { version: '1.0', savedItems: [] };

        if (fileId) {
            // 讀取現有資料
            const getResponse = await this.callAPI(() =>
                fetch(
                    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                ),
                context
            );

            if (getResponse.ok) {
                existingData = await getResponse.json();
            } else if (getResponse.status === 404) {
                // 檔案不存在了，清除快取
                fileId = null;
            }
        }

        // 新增資料
        existingData.savedItems.push(newItem);

        // 儲存到 Drive
        const metadata = {
            name: 'twpay_data.json',
            mimeType: 'application/json'
        };

        // 只有新建檔案時才加入 parents
        if (!fileId) {
            metadata.parents = ['appDataFolder'];
        }

        const file = new Blob([JSON.stringify(existingData, null, 2)], { type: 'application/json' });
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        const url = fileId
            ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
            : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

        const method = fileId ? 'PATCH' : 'POST';
        const uploadResponse = await this.callAPI(() =>
            fetch(url, {
                method: method,
                headers: { Authorization: `Bearer ${accessToken}` },
                body: form
            }),
            context
        );

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok) {
            throw new Error(`上傳失敗: ${uploadResult.error?.message || '未知錯誤'}`);
        }

        // 返回新的檔案 ID（如果是新建檔案）和更新後的資料
        return {
            fileId: fileId || uploadResult.id,
            data: existingData
        };
    },

    /**
     * 從 Google Drive 載入資料
     * @param {string} accessToken - Google access token
     * @param {string} cachedFileId - 已快取的檔案 ID
     * @param {Object} context - Vue instance 上下文
     * @returns {Promise<Array>} 返回儲存的項目列表
     */
    async loadData(accessToken, cachedFileId, context) {
        // 使用快取的檔案 ID 或搜尋
        const fileId = await this.getOrCacheFileId(accessToken, cachedFileId, context);

        if (fileId) {
            const getResponse = await this.callAPI(() =>
                fetch(
                    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                ),
                context
            );

            if (getResponse.ok) {
                const data = await getResponse.json();
                return {
                    fileId: fileId,
                    items: data.savedItems || []
                };
            } else if (getResponse.status === 404) {
                // 檔案不存在了
                return {
                    fileId: null,
                    items: []
                };
            }
        }

        return {
            fileId: null,
            items: []
        };
    },

    /**
     * 刪除指定項目
     * @param {string} accessToken - Google access token
     * @param {string} cachedFileId - 已快取的檔案 ID
     * @param {string} itemId - 要刪除的項目 ID
     * @param {Object} context - Vue instance 上下文
     * @returns {Promise<Array>} 返回更新後的項目列表
     */
    async deleteItem(accessToken, cachedFileId, itemId, context) {
        // 使用快取的檔案 ID 或搜尋
        const fileId = await this.getOrCacheFileId(accessToken, cachedFileId, context);

        if (!fileId) {
            throw new Error('找不到資料檔案');
        }

        const getResponse = await this.callAPI(() =>
            fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            ),
            context
        );

        if (!getResponse.ok) {
            throw new Error('無法讀取資料');
        }

        const data = await getResponse.json();
        data.savedItems = data.savedItems.filter(item => item.id !== itemId);

        const metadata = {
            name: 'twpay_data.json',
            mimeType: 'application/json'
        };
        const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        await this.callAPI(() =>
            fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${accessToken}` },
                body: form
            }),
            context
        );

        return data.savedItems;
    }
};

/**
 * Bootstrap Table Chinese translation
 * Author: Zhixin Wen<wenzhixin2010@gmail.com>
 */

$.fn.bootstrapTable.locales['ja-JP'] = {
    formatLoadingMessage () {
        return '正在努力地載入牛棚，請稍候'
    },
    formatRecordsPerPage (pageNumber) {
        return '每頁顯示 ${pageNumber} 位角色'
    },
    formatShowingRows (pageFrom, pageTo, totalRows, totalNotFiltered) {
        if (totalNotFiltered !== undefined && totalNotFiltered > 0 && totalNotFiltered > totalRows) {
            return '顯示第 ${pageFrom} 到第 ${pageTo} 位角色，總共 ${totalRows} 位角色（從 ${totalNotFiltered} 牛棚中過濾）'
        }

        return '顯示第 ${pageFrom} 到第 ${pageTo} 位角色，總共 ${totalRows} 位角色'
    },
    formatSRPaginationPreText () {
        return '上一頁'
    },
    formatSRPaginationPageText (page) {
        return '第${page}頁'
    },
    formatSRPaginationNextText () {
        return '下一頁'
    },
    formatDetailPagination (totalRows) {
        return '總共 ${totalRows} 位角色'
    },
    formatClearSearch () {
        return '清空過濾'
    },
    formatSearch () {
        return '搜尋'
    },
    formatNoMatches () {
        return '沒有找到符合的結果'
    },
    formatPaginationSwitch () {
        return '隱藏/顯示分頁'
    },
    formatPaginationSwitchDown () {
        return '顯示分頁'
    },
    formatPaginationSwitchUp () {
        return '隱藏分頁'
    },
    formatRefresh () {
        return '重新整理'
    },
    formatToggle () {
        return '切換'
    },
    formatToggleOn () {
        return '顯示卡片視圖'
    },
    formatToggleOff () {
        return '隱藏卡片視圖'
    },
    formatColumns () {
        return '列'
    },
    formatColumnsToggleAll () {
        return '切換所有'
    },
    formatFullscreen () {
        return '全屏'
    },
    formatAllRows () {
        return '所有'
    },
    formatAutoRefresh () {
        return '自動重新整理'
    },
    formatExport () {
        return '匯出牛棚'
    },
    formatJumpTo () {
        return '跳到'
    },
    formatAdvancedSearch () {
        return '高級搜尋'
    },
    formatAdvancedCloseButton () {
        return '關閉'
    }
}

$.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales['ja-JP'])
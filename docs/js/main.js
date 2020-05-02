'use strict';
var $ = $ || window.$;
var whiteText = '&emsp;';
var spaceText = '＿';
var divide = ' | ';

$(document).ready(function () {
    // TODO Bootstrap dropdowns options popperConfig not work

    onWindowInitOrResize();
    window.addEventListener("orientationchange", function() {
        onWindowInitOrResize();
    }, false);

    window.addEventListener("resize", function() {
        onWindowInitOrResize();
    }, false);

    // Copy contort
    var clipboard = new ClipboardJS('.copybtn');
    clipboard.on('success', function(e) {
        bootbox.alert({
            title: "已複製到剪貼簿",
            message: "小提示︰健檢表格請在置頂的集中串中回應喔♪"
        });
        e.clearSelection();
    });
    clipboard.on('error', function(e) {
        bootbox.alert({
            title: "複製到剪貼簿失敗",
            message: "請手動進行複製"
        });
        console.error('Action:', e.action);
    });

    // Tab change events
    $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
        toSaveStar5selections();
        if (e.target.id = "gentabel-tab"){
            var data = $('#char_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});

            var tbody = $.map(data, function(row, i){
                var hoshi = '<font color="lightgray">-</font>';
                if (row["had5"] === true){
                    hoshi = "<strong>★5</strong>";
                }else if(row["had4"]){
                    hoshi = '<font color="gray">☆4</font>';
                }
                var as = row["hadas"]?"<strong>✓</strong>":'<font color="lightgray">-</font>';
                return [
                    '<tr height="20">',
                    '<td width="80">'+row["name"]+'</td>',
                    '<td align="right" width="90">'+row["nickname"]+'</td>',
                    '<td align="center">'+hoshi+'</td>',
                    '<td align="center"'+(row["as"]?"":' bgcolor="lightgray"')+'>'+as+'</td>',
                    '</tr>',
                ].join('\n');

            }).join('\n');


            var table = [
                '<!DOCTYPE html>',
                '<html lang="zh-tw">',
                '<head><title>貓神健檢小幫手</title></head>',
                '<style>th,td{padding:2px;}</style>',
                '<body>',
                '<br><br><br>',
                '<table border=1 style="border-style: solid; border-collapse: collapse;">',
                '<thead>',
                '<tr height="20">',
                '<th width="170" colspan="2"><strong>角色</strong></th>',
                '<th width="50"><strong>原版</strong></th>',
                '<th width="50"><strong>AS版</strong></th>',
                '</tr>',
                '</thead>',
                '<tbody>',
                tbody,
                '</tbody>',
                '</table>',
                '<br><br><br><br>'
            ].join("\n");

            $("#editor1").html(table);
        }

        if (e.target.id = "gentext-tab"){
            var data = $('#char_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
            var nameMaxLength = findMaxLength(data);

            var list = $.map(data, function(row, i){
                var hoshi = spaceText + spaceText;
                if (row["had5"] === true){
                    hoshi = "★５";
                }else if(row["had4"]){
                    hoshi = '☆４';
                }
                var as = row["hadas"]?"★":row["as"]? spaceText:"／";

                return divide + toFixLength(row["name"], row["nickname"], nameMaxLength) + divide + hoshi + divide + as + divide;
            });

            var html = [
                '<!DOCTYPE html>',
                '<html lang="zh-tw">',
                '<head><title>貓神健檢小幫手</title></head>',
                '<style>th,td{padding:2px;}</style>',
                '<body>',
                '<br><br><br>',
                "<span>" + divide + toFixLength("角色", "暱稱", nameMaxLength) + divide + "原版" + divide + "AS" + divide +

                "</span><br />",
                "<span>" + divide + toFixLength(strLoop("＿", nameMaxLength[0]), strLoop("＿", nameMaxLength[1]), nameMaxLength) +

                divide + "＿＿" + divide + "＿" + divide + "</span><br />",
                list.join("<br />"),
                '<br><br><br><br>'
            ].join("\n");


            $("#editor2").html(html);
        }

    });

    // Table icon click events
    window.operateEvents = {
        'click .icon': function (e, value, row, index) {
            $('#char_table').bootstrapTable('toggleDetailView', index);
        },
        'click .had4': function (e, value, row, index) {
            if (!row["had4"]){
                row["had4"] = true;
            }else{
                row["had4"] = false;
                if(row["had5"] == true) row["had5"] = false;
                row["lightShadow"] = 0;
            }
            $('#char_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            toSaveStar5selections();
        },
        'click .had5': function (e, value, row, index) {
            if (!row["had5"]){
                row["had5"] = true;
                row["had4"] = true;
            }else{
                row["had5"] = false;
            }
            $('#char_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            toSaveStar5selections();
        },
        'click .hadas': function (e, value, row, index) {
            if (!row["hadas"]){
                row["hadas"] = true;
            }else{
                row["hadas"] = false;
            }
            $('#char_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            toSaveStar5selections();
        },
        'change .light-shadow': function (e, value, row, index) {
            row['lightShadow'] = $(e.target).val();
            toSaveStar5selections();
        }

    };
    window.operateEventsFree = {
        'click .icon': function (e, value, row, index) {
            $('#free_table').bootstrapTable('toggleDetailView', index);
        },
        'click .had4': function (e, value, row, index) {
            if (!row["had4"]){
                row["had4"] = true;
            }else{
                row["had4"] = false;
                if(row["had5"] == true) row["had5"] = false;
                row["lightShadow"] = 0;
            }
            $('#free_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            // toSaveStar5selections();
        },
        'click .had5': function (e, value, row, index) {
            if (!row["had5"]){
                row["had5"] = true;
                row["had4"] = true;
            }else{
                row["had5"] = false;
            }
            $('#free_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            // toSaveStar5selections();
        },
        'click .hadas': function (e, value, row, index) {
            if (!row["hadas"]){
                row["hadas"] = true;
            }else{
                row["hadas"] = false;
            }
            $('#free_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            // toSaveStar5selections();
        },
        'change .light-shadow': function (e, value, row, index) {
            row['lightShadow'] = $(e.target).val();
            // toSaveStar5selections();
        }

    };
    window.operateEventsSp = {
        'click .icon': function (e, value, row, index) {
            $('#sp_table').bootstrapTable('toggleDetailView', index);
        },
        'click .had4': function (e, value, row, index) {
            if (!row["had4"]){
                row["had4"] = true;
            }else{
                row["had4"] = false;
                if(row["had5"] == true) row["had5"] = false;
                row["lightShadow"] = 0;
            }
            $('#sp_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            // toSaveStar5selections();
        },
        'click .had5': function (e, value, row, index) {
            if (!row["had5"]){
                row["had5"] = true;
                row["had4"] = true;
            }else{
                row["had5"] = false;
            }
            $('#sp_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            // toSaveStar5selections();
        },
        'click .hadas': function (e, value, row, index) {
            if (!row["hadas"]){
                row["hadas"] = true;
            }else{
                row["hadas"] = false;
            }
            $('#sp_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            // toSaveStar5selections();
        },
        'change .light-shadow': function (e, value, row, index) {
            row['lightShadow'] = $(e.target).val();
            // toSaveStar5selections();
        }

    };

    // Star 5 Table Options
    var star5TableColums = [{
        field: 'id',
        visible: false
    }, {
        field: 'element',
        width: 5,
        formatter: function () { return ''; },
        cellStyle: function (value, row, index) {
            switch (value) {
                case "地":
                    return {css: {'background-color': '#dca485'}};
                case "水":
                    return {css: {'background-color': '#62b3ff'}};
                case "風":
                    return {css: {'background-color': '#50e250'}};
                case "火":
                    return {css: {'background-color': 'red'}};
                case "無":
                    return {css: {'background-color': 'gray'}};
            }
            return {css: {'background-color': 'white'}};
        },
        events: operateEvents
    },{
        field: 'name',
        title: '角色',
        width: 230,
        formatter: function (value, row, index) {
            var nickname = row['nickname'];
            if ($.trim(nickname) === ''){
                nickname = "-"
            }
            if ($.trim(row['asNickname'])){
                nickname +=  '/' + row['asNickname']
            }

            var html = '<div class="media">\n' +
                '  <img src="./images/otoha_icon.png" class="mr-3 icon" width="50">\n' +
                '  <div class="media-body">\n' +
                '    <h5 class="mt-0">'+ value +'</h5>\n' +
                nickname +
                '  </div>\n' +
                '</div>';
            return html;
        },
        events: operateEvents
    }, {
        field: 'had4',
        title: '☆4',
        width: 40,
        align: "center",
        formatter: function(value, row, index){
            if(value){
                return '<i class="fa fa-heart had4" style="color:red"></i>';
            }else{
                return '<i class="fa fa-heart had4" style="color:#aaa"></i>';
            }
        },
        events: operateEvents
    }, {
        field: 'had5',
        title: '★5',
        width: 40,
        align: "center",
        formatter: function(value, row, index){
            if(value === "none"){
                return '<font color="gray">-</font>';
            }else if(value){
                return '<i class="fa fa-heart had5" style="color:red"></i>';
            }else{
                return '<i class="fa fa-heart had5" style="color:#aaa"></i>';
            }
        },
        events: operateEvents
    }, {
        field: 'hadas',
        title: 'AS',
        width: 40,
        align: "center",
        formatter: function(value, row, index){
            if ($.trim(row["as"])) {
                if(value){
                    return '<i class="fa fa-user-friends hadas" style="color:red"></i>';
                }else{
                    return '<i class="fa fa-user-friends hadas" style="color:#aaa"></i>';
                }
            }else{
                return '<font color="gray">-</font>';
            }
        },
        events: operateEvents
    }, {
        field: 'lightShadow',
        title: '天冥',
        width: 60,
        formatter: function (value, row, index) {
            return '<input class="form-control light-shadow" value="' + value + '" type="number" min="0" max="255">';
        },
        events: operateEvents
    }];

    $('#char_table').bootstrapTable({
        columns: star5TableColums,
        uniqueId: "id",
        classes: "table table-bordered table-striped table-sm table-borderless",
        theadClasses: "thead-dark",
        detailView: true,
        detailViewIcon: false,
        detailFormatter: function (index, row, element) {
            return row['book4'] + '/' + row['book5'] + '/' + row['pos'] + '/' + row['asPos'];
        },
        toolbar: "#toolbar",
        toolbarAlign: "right"
    });
    $('#char_table').bootstrapTable('showLoading');

    $('#openDetail').click(function () {
        $('#char_table').bootstrapTable('expandAllRows');
        $('.open-detail').hide();
        $('.close-detail').show();

    });
    $('#closeDetail').click(function () {
        $('#char_table').bootstrapTable('collapseAllRows');
        $('.close-detail').hide();
        $('.open-detail').show();
    });



    // Free Table Options
    var freeTableColums = [{
        field: 'id',
        visible: false,
    }, {
        field: 'element',
        width: 5,
        formatter: function () { return ''; },
        events: operateEventsFree
    },{
        field: 'name',
        title: '角色',
        width: 230,
        formatter: function (value, row, index) {
            var nickname = row['nickname'];
            if ($.trim(nickname) === ''){
                nickname = "-"
            }
            if ($.trim(row['asNickname'])){
                nickname +=  '/' + row['asNickname']
            }

            var html = '<div class="media">\n' +
                '  <img src="./images/otoha_icon.png" class="mr-3 icon" width="50">\n' +
                '  <div class="media-body">\n' +
                '    <h5 class="mt-0">'+ value +'</h5>\n' +
                nickname +
                '  </div>\n' +
                '</div>';
            return html;
        },
        events: operateEventsFree
    }, {
        field: 'had4',
        title: '☆4',
        width: 40,
        align: "center",
        formatter: function(value, row, index){
            if(value){
                return '<i class="fa fa-heart had4" style="color:red"></i>';
            }else{
                return '<i class="fa fa-heart had4" style="color:#aaa"></i>';
            }
        },
        events: operateEventsFree
    }, {
        field: 'had5',
        title: '★5',
        width: 40,
        align: "center",
        formatter: function(value, row, index){
            if(value === "none"){
                return '<font color="gray">-</font>';
            }else if(value){
                return '<i class="fa fa-heart had5" style="color:red"></i>';
            }else{
                return '<i class="fa fa-heart had5" style="color:#aaa"></i>';
            }
        },
        events: operateEventsFree
    }, {
        field: 'hadas',
        title: 'AS',
        width: 40,
        align: "center",
        formatter: function(value, row, index){
            if ($.trim(row["as"])) {
                if(value){
                    return '<i class="fa fa-user-friends hadas" style="color:red"></i>';
                }else{
                    return '<i class="fa fa-user-friends hadas" style="color:#aaa"></i>';
                }
            }else{
                return '<font color="gray">-</font>';
            }
        },
        events: operateEventsFree
    }, {
        field: 'lightShadow',
        title: '天冥',
        width: 40,
        formatter: function (value, row, index) {
            return '<input class="form-control light-shadow" value="' + value + '" type="number" min="0" max="255">';
        },
        events: operateEventsFree
    }];

    $('#free_table').bootstrapTable({
        columns: freeTableColums,
        uniqueId: "id",
        classes: "table table-bordered table-striped table-sm table-borderless",
        theadClasses: "thead-dark",
        detailView: true,
        detailViewIcon: false,
        detailFormatter: function (index, row, element) {
            return row['book4'] + '/' + row['book5'] + '/' + row['pos'] + '/' + row['asPos'];
        },
        toolbar: "#free_toolbar",
        toolbarAlign: "right"
    });



    // Sp Table Options
    var spTableColums = [{
        field: 'id',
        visible: false,
    }, {
        field: 'element',
        width: 5,
        formatter: function () { return ''; },
        events: operateEventsSp
    },{
        field: 'name',
        title: '角色',
        width: 230,
        formatter: function (value, row, index) {
            var nickname = row['nickname'];
            if ($.trim(nickname) === ''){
                nickname = "-"
            }
            if ($.trim(row['asNickname'])){
                nickname +=  '/' + row['asNickname']
            }

            var html = '<div class="media">\n' +
                '  <img src="./images/otoha_icon.png" class="mr-3 icon" width="50">\n' +
                '  <div class="media-body">\n' +
                '    <h5 class="mt-0">'+ value +'</h5>\n' +
                nickname +
                '  </div>\n' +
                '</div>';
            return html;
        },
        events: operateEventsSp
    }, {
        field: 'had4',
        title: '☆4',
        width: 40,
        align: "center",
        formatter: function(value, row, index){
            if(value){
                return '<i class="fa fa-heart had4" style="color:red"></i>';
            }else{
                return '<i class="fa fa-heart had4" style="color:#aaa"></i>';
            }
        },
        events: operateEventsSp
    }, {
        field: 'had5',
        title: '★5',
        width: 40,
        align: "center",
        formatter: function(value, row, index){
            if(value === "none"){
                return '<font color="gray">-</font>';
            }else if(value){
                return '<i class="fa fa-heart had5" style="color:red"></i>';
            }else{
                return '<i class="fa fa-heart had5" style="color:#aaa"></i>';
            }
        },
        events: operateEventsSp
    }, {
        field: 'hadas',
        title: 'AS',
        width: 40,
        align: "center",
        formatter: function(value, row, index){
            if ($.trim(row["as"])) {
                if(value){
                    return '<i class="fa fa-user-friends hadas" style="color:red"></i>';
                }else{
                    return '<i class="fa fa-user-friends hadas" style="color:#aaa"></i>';
                }
            }else{
                return '<font color="gray">-</font>';
            }
        },
        events: operateEventsSp
    }, {
        field: 'lightShadow',
        title: '天冥',
        width: 40,
        formatter: function (value, row, index) {
            return '<input class="form-control light-shadow" value="' + value + '" type="number" min="0" max="255">';
        },
        events: operateEventsSp
    }];

    $('#sp_table').bootstrapTable({
        columns: spTableColums,
        uniqueId: "id",
        classes: "table table-bordered table-striped table-sm table-borderless",
        theadClasses: "thead-dark",
        detailView: true,
        detailViewIcon: false,
        detailFormatter: function (index, row, element) {
            return row['book4'] + '/' + row['book5'] + '/' + row['pos'] + '/' + row['asPos'];
        }
    });


    $.myFileReader
        .addFile('5star','./csv/5star.csv')
        .addFile('extra','./csv/extra.csv')
        .addFile('free','./csv/free.csv')
        .addFile('5star_sp','./csv/5star_sp.csv')
        .run(
            function (key) {
                console.log("Starting ", key);
            },
            function (result) {
                console.log("All file loaded");
            },
            function (key, data) {
                console.log("loaded",key);

                if (key === "5star") {
                    var obj = $.csv.toObjects(data);
                    var rows = $.map(obj, function (row) {
                        var nickname = row["暱稱"];
                        var asNickname = row["AS暱稱"];
                        if ($.trim(nickname) === "" && $.trim(asNickname) === "") {
                            nickname = row["角色名"];
                        } else if ($.trim(nickname) === "") {
                            nickname = row["角色名"];
                        }

                        return {
                            'id': row["ID"],
                            'name': row["角色名"],
                            'nickname': nickname,
                            'asNickname': asNickname,
                            'as': row["AS名"],
                            'had5': (row["★5"] === "TRUE")? false:'none',
                            'hadas': '',
                            'element': row["主屬"],
                            'weapon': row["武器"],
                            'lightShadow' : 0,
                            'personal': row['專武'],
                            'book4': row['職業書'],
                            'book5': row['五星書'],
                            'pos': row['特殊地位'],
                            'asPos': row['AS特殊地位']
                        };
                    });

                    if ($.myStorage.checkExist('selected5star')){
                        var save = $.myStorage.get('selected5star');

                        var restore = $.map(rows,function (row) {
                            var getRow = $.map(save, function (saveRow) {
                                if (row['id'] === saveRow['id']){
                                    return saveRow;
                                }
                            });

                            if (getRow.length){
                                row['had4'] = getRow[0]['had4'];
                                row['had5'] = getRow[0]['had5'];
                                row['hadas'] = getRow[0]['hadas'];
                                row['lightShadow'] = getRow[0]['lightShadow'];
                            }
                            return row;
                        });
                        $('#char_table').bootstrapTable('hideLoading');
                        $('#char_table').bootstrapTable('load', restore);
                    }else{
                        $('#char_table').bootstrapTable('hideLoading');
                        $('#char_table').bootstrapTable('load', rows);
                    }
                }
                if (key === "extra"){
                    genExtraStory($.csv.toObjects(data));
                }
                if (key === "free"){
                    var freeRows = $.map($.csv.toObjects(data), function (row) {
                        if (row["角色名"].charAt(0) === '*') return;
                        return {
                            'id': row["ID"],
                            'name': row["角色名"],
                            'nickname': row["暱稱"],
                            'asNickname': row["AS暱稱"],
                            'getByStory': row["取得"],
                            'minStar': row["起始☆"],
                            'maxStar': row["最高★"],
                            'AS': (row["AS"] === "TRUE")? true : false,
                            'asName': row["AS名"],
                            'minStory': row["最低加入章節"],
                            'useBook': row["消耗夢書"],
                            'presonal': row["專武"],
                            'had1': false,
                            'had2': false,
                            'had3': false,
                            'had4': false,
                            'had5': false,
                            'hadas': false,
                            'lightShadow': 0
                        };
                    });

                    if ($.myStorage.checkExist('selectedFree')){
                        var saveFree = $.myStorage.get('selectedFree');

                        var restoreFree = $.map(rows,function (row) {
                            var getRow = $.map(saveFree, function (saveRow) {
                                if (row['id'] === saveRow['id']){
                                    return saveRow;
                                }
                            });

                            if (getRow.length){
                                row['had1'] = getRow[0]['had1'];
                                row['had2'] = getRow[0]['had2'];
                                row['had3'] = getRow[0]['had3'];
                                row['had4'] = getRow[0]['had4'];
                                row['had5'] = getRow[0]['had5'];
                                row['hadas'] = getRow[0]['hadas'];
                                row['lightShadow'] = getRow[0]['lightShadow'];
                            }
                            return row;
                        });
                        $('#free_table').bootstrapTable('load', restoreFree);
                    }else{
                        $('#free_table').bootstrapTable('load', freeRows);
                    }
                }

                if (key === "5star_sp"){
                    var spRows = $.map($.csv.toObjects(data), function (row) {
                        if (row["角色名"].charAt(0) === '*') return;
                        return {
                            'id': row["ID"],
                            'name': row["角色名"],
                            'nickname': row["暱稱"],
                            'asNickname': row["AS暱稱"],
                            'getByStory': row["取得"],
                            'minStar': row["起始☆"],
                            'maxStar': row["最高★"],
                            'AS': (row["AS"] === "TRUE")? true : false,
                            'asName': row["AS名"],
                            'minStory': row["最低加入章節"],
                            'useBook': row["消耗夢書"],
                            'presonal': row["專武"],
                            'had4': false,
                            'had5': false,
                            'hadas': false,
                            'lightShadow': 0
                        };
                    });

                    if ($.myStorage.checkExist('selectedSp')){
                        var saveSp = $.myStorage.get('selectedSp');

                        var restoreSp = $.map(spRows,function (row) {
                            var getRow = $.map(saveSp, function (saveRow) {
                                if (row['id'] === saveRow['id']){
                                    return saveRow;
                                }
                            });

                            if (getRow.length){
                                row['had4'] = getRow[0]['had4'];
                                row['had5'] = getRow[0]['had5'];
                                row['hadas'] = getRow[0]['hadas'];
                                row['lightShadow'] = getRow[0]['lightShadow'];
                            }
                            return row;
                        });
                        $('#sp_table').bootstrapTable('load', restoreSp);
                    }else{
                        $('#sp_table').bootstrapTable('load', spRows);
                    }
                }


            },
            function (key) {
                $('#char_table').bootstrapTable('hideLoading');
                console.log("error", key);
            });


    $('body').on('focus', 'table input[type=number]', function() {
        if (focusedElement == this) return;
        var focusedElement = this;
        focusedElement.select();
    });

    $('body').on('click', '.dropdown-menu#weaponGroup .dropdown-item', function() {
        var src = $(this).find('img').get(0);
        var btn = $(this).closest('.btn-group').find('.dropdown-toggle');
        var img = $(btn).find('img').get(0);
        var elementType = $(".dropdown-menu#elementGroup").find(".active");

        if ($(this).hasClass('active')){
            $(this).removeClass('active');
            if (elementType.length){
                elementType = $(elementType).data('elementType');
                $('#char_table').bootstrapTable('filterBy',{element:elementType});
            }else{
                $('#char_table').bootstrapTable('filterBy',{});
            }

            $(btn).removeClass('btn-primary').addClass('btn-light');
            $(img).attr('src', './images/icons/weapon/sword.png');
        }else{
            $(this).parent().find('.active').removeClass('active');
            $(this).addClass('active');
            var target = $(this).data('weaponType');


            if (elementType.length){
                elementType = $(elementType).data('elementType');
                $('#char_table').bootstrapTable('filterBy',{element:elementType, weapon:target});
            }else{
                $('#char_table').bootstrapTable('filterBy',{weapon:target});
            }

            $(btn).removeClass('btn-light').addClass('btn-primary');
            $(img).attr('src', $(src).attr('src'));

        }
    });

    $('body').on('click', '.dropdown-menu#elementGroup .dropdown-item', function() {
        var src = $(this).find('img').get(0);
        var btn = $(this).closest('.btn-group').find('.dropdown-toggle');
        var img = $(btn).find('img').get(0);
        var weaponType = $(".dropdown-menu#weaponGroup").find(".active");

        if ($(this).hasClass('active')){
            $(this).removeClass('active');
            if (weaponType.length){
                weaponType = $(weaponType).data('weaponType');
                $('#char_table').bootstrapTable('filterBy',{weapon:weaponType});
            }else{
                $('#char_table').bootstrapTable('filterBy',{});
            }
            $(btn).removeClass('btn-primary').addClass('btn-light');
            $(img).attr('src', './images/icons/element/none.png');
        }else{
            $(this).parent().find('.active').removeClass('active');
            $(this).addClass('active');
            var target = $(this).data('elementType');
            if (weaponType.length){
                weaponType = $(weaponType).data('weaponType');
                $('#char_table').bootstrapTable('filterBy',{element:target, weapon:weaponType});
            }else{
                $('#char_table').bootstrapTable('filterBy',{element:target});
            }

            $(btn).removeClass('btn-light').addClass('btn-primary');
            $(img).attr('src', $(src).attr('src'));
        }

    });

    $('#selectAllStar5Listed').on('click', function () {
        var data = $('#char_table').bootstrapTable('getData');
        var rows = $('#char_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
        var newRows = $.map(data,function (row, i) {
            row['had4'] = true;
            if (row['had5'] !== "none"){
                row['had5'] = true;
            }
            if ($.trim(row['as']) !== ''){
                row['hadas'] = true;
            }
            row['lightShadow'] = data[i]['lightShadow'];
            return row;
        });
        var extend = $.extend({},rows,newRows);
        $('#char_table').bootstrapTable('load', extend);
        toSaveStar5selections();
    });

    $('#unselectAllStar5Listed').on('click', function () {
        var data = $('#char_table').bootstrapTable('getData');
        var rows = $('#char_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
        var newRows = $.map(data,function (row) {
            row['had4'] = false;
            if (row['had5'] !== "none"){
                row['had5'] = false;
            }
            if ($.trim(row['as']) !== ''){
                row['hadas'] = false;
            }
            row['lightShadow'] = 0;
            return row;
        });
        var extend = $.extend({},rows,newRows);
        $('#char_table').bootstrapTable('load', extend);
        toSaveStar5selections();
    });

    $('#selectAllFreeListed').on('click', function () {
        var data = $('#free_table').bootstrapTable('getData');
        var rows = $('#free_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
        var newRows = $.map(data,function (row, i) {
            row['had4'] = true;
            if (row['had5'] !== "none"){
                row['had5'] = true;
            }
            if ($.trim(row['as']) !== ''){
                row['hadas'] = true;
            }
            row['lightShadow'] = data[i]['lightShadow'];
            return row;
        });
        var extend = $.extend({},rows,newRows);
        $('#free_table').bootstrapTable('load', extend);
        // toSaveFreeselections();
    });

    $('#unselectAllFreeListed').on('click', function () {
        var data = $('#free_table').bootstrapTable('getData');
        var rows = $('#free_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
        var newRows = $.map(data,function (row) {
            row['had4'] = false;
            if (row['had5'] !== "none"){
                row['had5'] = false;
            }
            if ($.trim(row['as']) !== ''){
                row['hadas'] = false;
            }
            row['lightShadow'] = 0;
            return row;
        });
        var extend = $.extend({},rows,newRows);
        $('#free_table').bootstrapTable('load', extend);
        // toSaveFreeselections();
    });

    $('body').on('click', '.dropdown-menu#optionList .dropdown-item', function() {
        var target = $(this).attr('href');

        switch (target) {
            case '#cleanup':
                $.myStorage.clean();
                break;
        }
    });

    $("button#gen").on('click', function(){
        var table = $('#editor1').html();

        var myWindow = window.open("", "_blank");
        myWindow.document.write(table);
    });

    $("button#gentext").on('click', function(){
        var html = $('#editor2').html();

        var myWindow = window.open("", "_blank");
        myWindow.document.write(html);
    });

    genMainStoryBtn();

});

function numberPad(number) {
    if (number < 10 && number >=0){
        return "0"+number;
    }
    return number;
}

function stringPad(str, target, type) {
    var strLength = 0;
    strLength = findLength(str);
    if (strLength < target){
        var pad = "";
        for (var i = 0; i < (target - Math.ceil(strLength)); i++){
            pad += spaceText;
        }
        if (type === "<"){
            return ((Math.ceil(strLength) - Math.floor(strLength))?" ":"") + pad + str;
        }else if (type === ">"){
            return str + pad + ((Math.ceil(strLength) - Math.floor(strLength))?"&ensp;":"");
        }
    }
    return str;
}

function strLoop(str, target){
    var loop = "";
    for (var i = 0; i < Math.ceil(target); i++){
        loop += str;
    }
    return loop;
}

function findLength(str){
    var length, half, full, chi = 0;
    half = str.match(/[\u0000-\u00ff]/g) || [];	//半形
    chi = str.match(/[\u4e00-\u9fa5]/g) || [];	    //中文
    full = str.match(/[\uff00-\uffff]/g) || [];	    //全形

    return (half.length / 2) + chi.length + full.length;
}

function findMaxLength(data){
    var nameMax = 0;
    var nicknameMax = 0;

    $.map(data, function(row, i){
        var nameLength, nicknameLength = 0;
        nameLength = findLength(row["name"]);
        nicknameLength = findLength(row["nickname"]);
        if (nameLength > nameMax) nameMax = nameLength;
        if (nicknameLength > nicknameMax) nicknameMax = nicknameLength;
    });

    return [nameMax, nicknameMax];
}

function toFixLength(i, j, target){
    var name, nickname = "";

    name = stringPad(i, target[0], ">");
    nickname = stringPad(j, target[1], "<");

    return name + divide + nickname;
}

function genMainStoryBtn() {
    var storyTo = $('#mainStory').data('newest');
    var storyBtnHolder = $('#mainStoryBtnGroup');

    if (storyTo){
        var html = '';
        for (var i=1; i<=storyTo; i++){
            html += '<button name="mainStoryBtn['+i+']" type="button" class="btn btn-secondary" data-val="'+i+'">'+ numberPad(i) +'</button>\n';
        }
        $(storyBtnHolder).append(html);
    }
    $('body').on('click', '#mainStoryBtnGroup .btn', function() {
        var storyNow = $(this).data('val');
        $('#mainStoryBtnGroup button[name^=mainStoryBtn]').each(function (ele) {
            var thisNumber = $(this).attr('data-val');
            if (thisNumber <= storyNow){
                $(this).removeClass('btn-secondary').removeClass('btn-primary').addClass('btn-primary');
            }else{
                $(this).removeClass('btn-secondary').removeClass('btn-primary').addClass('btn-secondary');
            }
        });
        $('#mainStory').attr('data-selected-number', storyNow);
    });

}

function genExtraStory(list) {
    var html = $.map(list, function (row, i) {
        var label1 = '<div class="col-8 col-sm-9 ">' + '<span class="badge badge-secondary">'+row["類型"] +'</span> <span>'+row['名稱'] + '</span></div>\n';
        var input1 = '<div class="col-4 col-sm-3">';
        input1 += '<div class="custom-control custom-switch">\n' +
            '   <input type="checkbox" class="custom-control-input" id="extraStory['+i+']">\n' +
            '   <label class="custom-control-label" for="extraStory['+i+']">\n' +
            '未完成' +
            '   </label>\n' +
            '</div>';
        input1 += '</div>';

        var holder = '<div class="form-group row">';
        holder += label1;
        holder += input1;
        holder += '</div>';

        var label2 = '<label class="col-8 col-sm-9 col-form-label pt-0 pb-0" for="extraStoryBook['+i+']">己取得詠夢之書獎勵 <span class="book-display">0</span> / '+row["夢書獎勵"]+ '本</label>\n';
        var input2 = '<div class="col-4 col-sm-3 pt-1"><input type="range" class="custom-range" min="0" max="'+row["夢書獎勵"]+'" value="0" id=""extraStoryBook['+i+']"></div>\n';

        var holder2 = '<div class="form-group row">';
        holder2 += label2;
        holder2 += input2;
        holder2 += '</div>';


        var div = '<div class="extra-story-item" data-story-start="'+row["最低起始章節"]+'" data-books="'+row["夢書獎勵"]+'">';
        div += holder;
        div += holder2;
        div += '</div>';

        return div;
    }).join('\n');

    $('#extraStory').html(html);

    $('body').on('change', '.extra-story-item input', function(){
        var inputType = $(this).attr('type');
        var checkbox = $(this).closest(".extra-story-item").find('.custom-control-input');
        var range = $(this).closest(".extra-story-item").find('.custom-range');
        switch (inputType) {
            case 'range':
                var label = $(this).closest('.form-group').find('.book-display');
                $(label).html($(range).val());
                console.log();
                break;
            case 'checkbox':
                var label = $(this).closest('.form-group').find('.custom-control-label');
                var map = {
                    true:' 己完成',
                    false: '未完成'
                };
                $(label).html(map[$(checkbox).prop("checked")]);
                break;
        }
    });
}

function toSaveStar5selections() {
    var data = $('#char_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
    var save = $.map(data,function (row, i) {
        if (
            row['had4'] === true ||
            row['had5'] === true ||
            row['hadas'] === true ||
            row['lightShadow'] > 0
        ){
            return {
                id: row['id'],
                had4: row['had4'],
                had5: row['had5'],
                hadas: row['hadas'],
                lightShadow: row['lightShadow']
            };
        }

    });
    $.myStorage.save('selected5star',save);
}

function onWindowInitOrResize() {
    var windowHeight = $(window).height();
    $(".story-scroll-panel").height(windowHeight - 80 - 56);
}

function genTeamCheckCanvas() {
    // TODO Gen canvas
    // $("#canvas").size(200,800).canvasAdd();
    // $("#download").downloadCanvas();
}
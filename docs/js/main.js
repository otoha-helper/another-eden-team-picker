'use strict';
var $ = $ || window.$;

var whiteText = '&emsp;';
var spaceText = '＿';
var divide = ' | ';

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



$(document).ready(function () {
    // TODO Gen canvas
    // $("#canvas").size(200,800).canvasAdd();
    // $("#download").downloadCanvas();

    // TODO Bootstrap dropdowns options popperConfig not work

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


    $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
        toSave();
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
            toSave();
        },
        'click .had5': function (e, value, row, index) {
            if (!row["had5"]){
                row["had5"] = true;
                row["had4"] = true;
            }else{
                row["had5"] = false;
            }
            $('#char_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            toSave();
        },
        'click .hadas': function (e, value, row, index) {
            if (!row["hadas"]){
                row["hadas"] = true;
            }else{
                row["hadas"] = false;
            }
            $('#char_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            toSave();
        },
        'change .light-shadow': function (e, value, row, index) {
            row['lightShadow'] = $(e.target).val();
            toSave();
        }

    };

    function toSave() {
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


    var tableColums = [{
        field: 'id',
        visible: false
    }, {
        field: 'element',
        width: 5,
        formatter: function () { return ''; },
        cellStyle: function (value, row, index) {
            switch (value) {
                case "地":
                    return {
                        css: {
                            'background-color': '#dca485'
                        }
                    }
                case "水":
                    return {
                        css: {
                            'background-color': '#62b3ff'
                        }
                    }
                case "風":
                    return {
                        css: {
                            'background-color': '#50e250'
                        }
                    }
                case "火":
                    return {
                        css: {
                            'background-color': 'red'
                        }
                    }
                case "無":
                    return {
                        css: {
                            'background-color': 'gray'
                        }
                    }
            }
            return {
                css: {
                    'background-color': 'white'
                }
            }
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
        width: 40,
        formatter: function (value, row, index) {
            return '<input class="form-control light-shadow" value="' + value + '" type="number" min="0" max="255">';
        },
        events: operateEvents
    },{
        title: '',
        formatter: function () { return ''; }
    }];

    $('#char_table').bootstrapTable({
        columns: tableColums,
        uniqueId: "id",
        classes: "table table-bordered table-striped table-sm table-borderless",
        theadClasses: "thead-dark",
        detailView: true,
        detailViewIcon: false,
        detailFormatter: function (index, row, element) {
            return row['book4'] + '/' + row['book5'] + '/' + row['pos'] + '/' + row['asPos'];
        }
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

    $.myFileReader
        .addFile('5star','./csv/5star.csv')
        .run(
            function (key) {
                console.log("start", key);
            },
            function (result) {
                console.log("loaded",result);
            },
            function (key, data) {
                if (key !== "5star") {
                    return;
                }
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

                if ($.myStorage.checkExist()){
                    var save = $.myStorage.get('selected5star');

                    var restore = $.map(rows,function (row, i) {
                        var getRow = $.map(save, function (saveRow, j) {
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
        var img = $(this).closest('.btn-group').find('.dropdown-toggle').find('img').get(0);
        var elementType = $(".dropdown-menu#elementGroup").find(".active");

        if ($(this).hasClass('active')){
            $(this).removeClass('active');
            if (elementType.length){
                elementType = $(elementType).data('elementType');
                $('#char_table').bootstrapTable('filterBy',{element:elementType});
            }else{
                $('#char_table').bootstrapTable('filterBy',{});
            }
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


            $(img).attr('src', $(src).attr('src'));
        }
    });

    $('body').on('click', '.dropdown-menu#elementGroup .dropdown-item', function() {
        var src = $(this).find('img').get(0);
        var img = $(this).closest('.btn-group').find('.dropdown-toggle').find('img').get(0);
        var weaponType = $(".dropdown-menu#weaponGroup").find(".active");

        if ($(this).hasClass('active')){
            $(this).removeClass('active');
            if (weaponType.length){
                weaponType = $(weaponType).data('weaponType');
                $('#char_table').bootstrapTable('filterBy',{weapon:weaponType});
            }else{
                $('#char_table').bootstrapTable('filterBy',{});
            }
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

            $(img).attr('src', $(src).attr('src'));
        }

    });

    $('body').on('click', '.dropdown-menu#optionList .dropdown-item', function() {
        var target = $(this).attr('href');
        var data = $('#char_table').bootstrapTable('getData');
        var rows = $('#char_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
        switch (target) {
            case '#selectall':
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
                toSave();
                break;
            case '#unselectall':
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
                toSave();
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

});

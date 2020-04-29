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
    // $("#canvas").size(200,800).canvasAdd();
    // $("#download").downloadCanvas();

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

        if (e.target.id = "gentabel-tab"){
            var data = $("#char_table").bootstrapTable('getData');

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
            var data = $("#char_table").bootstrapTable('getData');
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
        'click .had4': function (e, value, row, index) {
            if (!row["had4"]){
                row["had4"] = true;
            }else{
                row["had4"] = false;
                if(row["had5"] == true) row["had5"] = false;
            }
            $('#char_table').bootstrapTable('updateRow', {index: index, row: row});
        },
        'click .had5': function (e, value, row, index) {
            if (!row["had5"]){
                row["had5"] = true;
                row["had4"] = true;
            }else{
                row["had5"] = false;
            }
            $('#char_table').bootstrapTable('updateRow', {index: index, row: row});
        },
        'click .hadas': function (e, value, row, index) {
            if (!row["hadas"]){
                row["hadas"] = true;
            }else{
                row["hadas"] = false;
            }
            $('#char_table').bootstrapTable('updateRow', {index: index, row: row});
        },

    }


    var tableColums = [{
        field: 'id',
        visible: false
    }, {
        field: 'name',
        title: '角色',
        width: 100
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
        field: 'as',
        visible: false
    }, {
        field: 'nickname',
        title: '暱稱'
    }];

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
                        nickname = asNickname;
                    }

                    return {
                        'id': row["ID"],
                        'name': row["角色名"],
                        'nickname': nickname,
                        'as': row["AS名"],
                        'had5': (row["★5"] === "TRUE")? '':'none'
                    };
                });
                $('#char_table').bootstrapTable('load', rows);
            },
            function (key) {
                console.log("error", key);
            });

    $('#char_table').bootstrapTable({
        data: [],
        columns: tableColums,
        classes: "table table-bordered table-striped table-sm table-borderless",
        theadClasses: "thead-dark"

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

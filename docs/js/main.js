'use strict';
var $ = $ || window.$;
var whiteText = '&emsp;';
var spaceText = '＿';
var divide = ' | ';

$(document).ready(function () {

    if (typeof window.dataLayer === "undefined"){
        console.log('GA not init');
        window.gtag = function (type, event, options) {
            console.log('Dummy GA',type, event, options);
        };
    }

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
        ga("send","event","clipboard","copy", 'success');
    });
    clipboard.on('error', function(e) {
        bootbox.alert({
            title: "複製到剪貼簿失敗",
            message: "請手動進行複製"
        });
        console.error('Action:', e.action);
        ga("send","event","clipboard","copy", 'error');
    });

    // Tab change events
    $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
        if (e.target.id === "list-tab"){
            gtag('event', 'tab', {
                'event_category': 'change',
                'event_label': 'main list'
            });

        }

        if (e.target.id === "gentext-tab"){
            gtag('event', 'tab', {
                'event_category': 'change',
                'event_label': 'generate text result'
            });
            $("#editor2").html(genText());
        }

        if (e.target.id === "gentable-tab"){
            gtag('event', 'tab', {
                'event_category': 'change',
                'event_label': 'generate table result'
            });
            $("#editor1").html(genTable());
        }

        if (e.target.id === "option-tab"){
            gtag('event', 'tab', {
                'event_category': 'change',
                'event_label': 'options'
            });
        }

        if (e.target.id === "help-tab"){
            gtag('event', 'tab change', {
                'event_category': 'change',
                'event_label': 'help'
            });
        }

    });


    // Handle tables
    star5tableHandle();
    freeTableHandle();
    star4TableHandle();
    spTableHandle();

    // Gen main Story btns
    genMainStoryBtn();

    yumeBooks();

    // Read csv in table
    $.myFileReader
        .addFile('5star','./csv/5star.csv')
        .addFile('extra','./csv/extra.csv')
        .addFile('free','./csv/free.csv')
        .addFile('5star_sp','./csv/5star_sp.csv')
        .addFile('4star','./csv/4star.csv')
        .run(
            function (key) {
                console.log("Starting ");
                $('#char_table').bootstrapTable('showLoading');
            },
            function (result) {
                console.log("All file loaded");
                gtag('event', 'file', {
                    'event_category': 'load',
                    'event_label': 'finish'
                });
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
                            'enName': row["英名"],
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

                    var asBook = $.map(obj, function (row) {
                        if ($.trim(row['AS名']) === '') return;
                        var nickname = row["暱稱"];
                        var asNickname = row["AS暱稱"];
                        if ($.trim(nickname) === "" && $.trim(asNickname) === "") {
                            nickname = row["角色名"];
                        } else if ($.trim(nickname) === "") {
                            nickname = row["角色名"];
                        }
                        return {
                            'id': row['ID'],
                            'name': row["角色名"],
                            'asNickname': asNickname,
                            'as': row['AS名'] + '的異節',
                            'qty': 0
                        }
                    });
                    $('#as_book_table').bootstrapTable('load', asBook);

                    if ($.myStorage.checkExist('selectedStar5')){
                        var save = $.myStorage.get('selectedStar5');

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

                    if ($.myStorage.checkExist('getAsBook')){
                        var save = $.myStorage.get('getAsBook');

                        var restore = $.map(asBook,function (row) {
                            var getRow = $.map(save, function (saveRow) {
                                if (row['id'] === saveRow['id']){
                                    return saveRow;
                                }
                            });

                            if (getRow.length){
                                row['qty'] = getRow[0]['qty'];
                            }
                            return row;
                        });
                        $('#as_book_table').bootstrapTable('load', restore);
                    }


                }
                if (key === "extra"){
                    genExtraStory($.csv.toObjects(data));
                    if ($.myStorage.checkExist('extraStory')){
                        var existSave = $.myStorage.get('extraStory');
                        $.map(existSave, function (input) {
                            var item = $("#"+input['id']);
                            switch (input['type']) {
                                case 'range':
                                    var label = $(item).closest('.form-group').find('.book-display');
                                    $(label).html(input['val']);
                                    $(item).val(input['val']);
                                    break;
                                case 'checkbox':
                                    var label = $(item).closest('.form-group').find('.custom-control-label');
                                    var ans = input['val'];
                                    $(item).prop("checked",input['val']);
                                    var map = {
                                        'true':' 己完成',
                                        'false': '未完成'
                                    };

                                    $(label).html(map[ans]);
                                    break;
                            }
                        });
                    }
                }
                if (key === "free"){
                    var freeRows = $.map($.csv.toObjects(data), function (row) {
                        if (row["角色名"].charAt(0) === '*') return;
                        return {
                            'id': row["ID"],
                            'name': row["角色名"],
                            'enName': row["英名"],
                            'nickname': row["暱稱"],
                            'asNickname': row["AS暱稱"],
                            'getByStory': row["取得"],
                            'minStar': row["起始☆"],
                            'maxStar': row["最高★"],
                            'as': (row["AS"] === "TRUE")? true : false,
                            'asName': row["AS名"],
                            'minStory': row["最低加入章節"],
                            'useBook': row["消耗夢書"],
                            'presonal': row["專武"],
                            'element': row["主屬"],
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

                        var restoreFree = $.map(freeRows,function (row) {
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
                            'enName': row["英名"],
                            'nickname': row["暱稱"],
                            'minStar': row["起始☆"],
                            'maxStar': row["最高★"],
                            'useBook': row["消耗夢書"],
                            'presonal': row["專武"],
                            'element': row["主屬"],
                            'had3': false,
                            'had4': false,
                            'had5': false,
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
                                row['had3'] = getRow[0]['had3'];
                                row['had4'] = getRow[0]['had4'];
                                row['had5'] = getRow[0]['had5'];
                            }
                            return row;
                        });
                        $('#sp_table').bootstrapTable('load', restoreSp);
                    }else{
                        $('#sp_table').bootstrapTable('load', spRows);
                    }
                }
                if (key === "4star"){
                    var star4Rows = $.map($.csv.toObjects(data), function (row) {
                        if (
                            row["角色名"].charAt(0) === '*' ||
                            row["升職"] === '已升'
                        ) return;

                        return {
                            'id': row["ID"],
                            'name': row["角色名"],
                            'enName': row["英名"],
                            'nickname': row["暱稱"],
                            'element': row["主屬"],
                            'minStar': row["起始☆"],
                            'maxStar': row["最高★"],
                            'pos': row["特殊地位"],
                            'had3': false,
                            'had4': false
                        };
                    });

                    if ($.myStorage.checkExist('selectedStar4')){
                        var saveStar4 = $.myStorage.get('selectedStar4');

                        var restoreStar4 = $.map(star4Rows,function (row) {
                            var getRow = $.map(saveStar4, function (saveRow) {
                                if (row['id'] === saveRow['id']){
                                    return saveRow;
                                }
                            });

                            if (getRow.length){
                                row['had3'] = getRow[0]['had3'];
                                row['had4'] = getRow[0]['had4'];
                            }
                            return row;
                        });
                        $('#star4_table').bootstrapTable('load', restoreStar4);
                    }else{
                        $('#star4_table').bootstrapTable('load', star4Rows);
                    }
                }

            },
            function (key) {
                gtag('event', 'file', {
                    'event_category': 'load',
                    'event_label': 'error with ' + key
                });
                $('#char_table').bootstrapTable('hideLoading');
                console.log("error", key);
            });


    $('body').on('focus', 'input[type=number]', function() {
        $(this).select();
    });

    setting();

    $("button#gen").on('click', function(){
        var table = $('#editor1').html();

        var myWindow = window.open("", "_blank");
        myWindow.document.write(table);
        gtag('event', 'button', {
            'event_category': 'open window',
            'event_label': 'table result'
        });
    });

    $("button#gentext").on('click', function(){
        var html = $('#editor2').html();

        var myWindow = window.open("", "_blank");
        myWindow.document.write(html);
        gtag('event', 'button', {
            'event_category': 'open window',
            'event_label': 'text result'
        });
    });


});

function numberPad(number) {
    if (number < 10 && number >=0){
        return "0"+number;
    }
    return number;
}

function toFullWidthNumber (number, target, max, addPlus) {
    var max = (typeof max !== 'undefined') ?  max : 99;
    var target = (typeof target !== 'undefined') ?  target : 2;
    var addPlus = (typeof addPlus !== 'undefined') ?  addPlus : false;
    if (number > max) {
        number = max;
    }
    if (number === max && addPlus) number = number + "＋";
    number = "" + number;
    number = number.replace(/[0-9]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);});
    return stringPad(number, target, '<');
}

function stringPad(str, target, type, userSpaceText) {
    var str = (typeof str !== 'undefined') ?  str : '';
    var strLength = 0;
    var space = (typeof userSpaceText !== 'undefined') ?  userSpaceText : spaceText;
    var userType = (typeof type !== 'undefined') ? type : '<';
    strLength = findLength(str);
    if (strLength < target){
        var pad = "";
        for (var i = 0; i < (target - Math.ceil(strLength)); i++){
            pad += space;
        }
        if (userType === "<"){
            return ((Math.ceil(strLength) - Math.floor(strLength))?" ":"") + pad + str;
        }else if (userType === ">"){
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

function toFixLength(i, j, target, hadDivide){
    var name, nickname = "";
    var hadDivide = hadDivide || false;
    var divideText = (hadDivide) ? divide : '';

    name = stringPad(i, target[0], ">");
    nickname = stringPad(j, target[1], "<");

    return name + divideText + nickname;
}

function genMainStoryBtn() {
    var storyTo = $('#mainStory').data('newest');
    var storyBtnHolder = $('#mainStoryBtnGroup');
    if (storyTo){
        var saveTo = 0;
        if ($.myStorage.checkExist('mainStory')){
            saveTo = $.myStorage.get('mainStory');
            $('#mainStory').attr('data-selected-number', saveTo);
        }
        var html = '';
        for (var i=1; i<=storyTo; i++){
            var className = 'secondary';
            if (saveTo >= i) className = 'primary';
            html += '<button name="mainStoryBtn['+i+']" type="button" class="btn btn-'+className+'" data-val="'+i+'">'+ numberPad(i) +'</button>\n';
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
        $.myStorage.save('mainStory', storyNow);

    });

}

function genExtraStory(list) {
    var html = $.map(list, function (row, i) {
        var label1 = '<div class="col-8 col-sm-9">' + '<span class="badge badge-secondary" data-data-name="storyType">'+row["類型"] +'</span> <span data-data-name="storyTitle">'+row['名稱'] + '</span></div>\n';
        var input1 = '<div class="col-4 col-sm-3">';
        input1 += '<div class="custom-control custom-switch">\n' +
            '   <input type="checkbox" class="custom-control-input" id="extraStory_'+i+'">\n' +
            '   <label class="custom-control-label" for="extraStory_'+i+'">\n' +
            '未完成' +
            '   </label>\n' +
            '</div>';
        input1 += '</div>';

        var holder = '<div class="form-group row">';
        holder += label1;
        holder += input1;
        holder += '</div>';

        var label2 = '<label class="col-8 col-sm-9 col-form-label pt-0 pb-0" for="extraStoryBook_'+i+'" data-data-name="yumeBookLabel">己取得詠夢之書獎勵 <span class="book-display">0</span> / '+row["夢書獎勵"]+ '本</label>\n';
        var input2 = '<div class="col-4 col-sm-3 pt-1"><input type="range" id="getYumeBook_'+i+'" class="custom-range" min="0" max="'+row["夢書獎勵"]+'" value="0" id=""extraStoryBook_'+i+'"></div>\n';

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
        saveExtraStory();
    });
}
function getExtraStory() {
    var inputs = $('.extra-story-item input');
    var vals = $.map(inputs, function (input) {
        var inputType = $(input).attr('type');
        var eleId = $(input).attr('id');

        switch (inputType) {
            case 'range':
                var val =  $(input).val();
                return {id: eleId, val: val, type: 'range'};
            case 'checkbox':
                var val =  $(input).prop("checked");
                return {id: eleId, val: val, type:'checkbox'};
        }
    });
    return vals;
}
function saveExtraStory() {
   var vals = getExtraStory();
    $.myStorage.save('extraStory', vals);
}



function onWindowInitOrResize() {
    var windowHeight = $(window).height();
    $(".story-scroll-panel").height(windowHeight - 80 - 56);
}

function yumeBooks() {

    $("#yumeBooks").on('change', function () {
        var yumeBooks = $(this).val();
        if (typeof yumeBooks !== "undefined") yumeBooks = Math.ceil(parseInt(yumeBooks));
        if (yumeBooks > 999) yumeBooks = 999;
        if (yumeBooks < 0 ) yumeBooks = 0;
        $(this).val(yumeBooks);
        $.myStorage.save('yumeBooks', yumeBooks);
    });

    if ($.myStorage.checkExist('yumeBooks')){
        $("#yumeBooks").val($.myStorage.get('yumeBooks'));
    }

}

var elementCellStyle = function (value, row, index) {
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
    };

function star5tableHandle() {

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
            gtag('event', 'filter', {
                'event_category': 'weapon',
                'event_label': 'unselect'
            });
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
            $("#clearFilter").removeClass('btn-light').addClass('btn-primary');

            gtag('event', 'filter', {
                'event_category': 'weapon',
                'event_label': 'select'
            });
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
            gtag('event', 'filter', {
                'event_category': 'element',
                'event_label': 'unselect'
            });
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
            $("#clearFilter").removeClass('btn-light').addClass('btn-primary');
            gtag('event', 'filter', {
                'event_category': 'element',
                'event_label': 'select'
            });
        }

    });

    $("button#clearFilter").on('click', function () {
        var holder = $(this).closest('.panel-body');
        var weapon = $("#weaponGroupDrop");
        var element = $("#elementGroupDrop");
        if ($(weapon).hasClass('btn-primary') || $(element).hasClass('btn-primary')){
            $(this).removeClass('btn-primary').addClass('btn-light');
            $(weapon).removeClass('btn-primary').addClass('btn-light');
            $(element).removeClass('btn-primary').addClass('btn-light');
            $(holder).find('.active').removeClass('active');
            $(weapon).find('img').attr('src', './images/icons/weapon/sword.png');
            $(element).find('img').attr('src', './images/icons/element/none.png');
            $('#char_table').bootstrapTable('filterBy',{});
            gtag('event', 'filter', {
                'event_category': 'clear',
                'event_label': 'filters'
            });
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
            if (typeof $(e.target).val() !== "undefined"){
                value = parseInt($(e.target).val());
                if (value > 255) value = 255;
                if (value < 0) value = 0;
                $(e.target).val(value);
            }
            row['lightShadow'] = value;
            toSaveStar5selections();
        }

    };
    window.operateAsBooks = {
        'change .as-book-input': function (e, value, row, index) {
            if (typeof $(e.target).val() !== "undefined") value = Math.ceil(parseInt($(e.target).val()));
            if (value > 999) value = 999;
            if (value < 0) value = 0;
            $(e.target).val(value);
            row['qty'] = value;
            toSaveAsBook();
        }
    }

    // Star 5 Table Options
    var star5TableColums = [{
        field: 'id',
        visible: false
    }, {
        field: 'element',
        width: 5,
        formatter: function () { return ''; },
        cellStyle: elementCellStyle,
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

            var jumpToAS = "";
            if (row['had5'] === "none"){
                jumpToAS = "as/";
            }

            var html = '<div class="media">\n' +
                '  <img src="./images/characters/' + jumpToAS + row["enName"]+'.jpg" class="mr-3 icon" width="50">\n' +
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
            if (typeof value !== "undefined"){
                value = parseInt(value);
                if (value > 255) value = 255;
                if (value < 0) value = 0;
            }
            return '<input class="form-control light-shadow" value="' + value + '" type="number" min="0" max="255">';
        },
        events: operateEvents
    }];

    $('#char_table').bootstrapTable({
        columns: star5TableColums,
        locale: 'zh-TW',
        uniqueId: "id",
        classes: "table table-bordered table-striped table-sm table-borderless",
        theadClasses: "thead-dark",
        toolbar: "#toolbar",
        toolbarAlign: "right"
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
        gtag('event', 'select', {
            'event_category': 'select all',
            'event_label': 'star5'
        });
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
        gtag('event', 'select', {
            'event_category': 'unselect all',
            'event_label': 'star5'
        });
    });

    $('#as_book_table').bootstrapTable({
        columns: [{
            field: 'id',
            visible: false
        },{
            field: 'name',
            title: '名稱',
            width: 100
        },{
            field: 'as',
            title: '異節',
            width: 160
        },{
            field: 'qty',
            title: '數量',
            width: 60,
            formatter: function (value, row, index) {
                if (typeof value !== "undefined") value = Math.ceil(parseInt(value));
                if (value > 999) value = 999;
                if (value < 0) value = 0;
                return '<input class="form-control as-book-input" value="' + value + '" type="number" min="0" max="999" aria-label="'+row['as']+'數量">';
            },
            events: operateAsBooks
        }],
        locale: 'zh-TW',
        uniqueId: "id",
        classes: "table table-bordered table-striped table-sm table-borderless",
        theadClasses: "thead-dark",
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
            row['lightShadow'] = parseInt(row['lightShadow']);
            if (row['lightShadow'] > 255) row['lightShadow'] = 255;
            if (row['lightShadow'] < 0 ) row['lightShadow'] = 0;
            return {
                id: row['id'],
                had4: row['had4'],
                had5: row['had5'],
                hadas: row['hadas'],
                lightShadow: row['lightShadow']
            };
        }

    });
    $.myStorage.save('selectedStar5',save);
}
function toSaveAsBook() {
    var data = $('#as_book_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
    var save = $.map(data,function (row, i) {
        row['qty'] = parseInt(row['qty']);
        if (row['qty'] > 999) row['qty'] = 999;
        if (row['qty'] < 0 ) row['qty'] = 0;
        return {
                id: row['id'],
                qty: row['qty']
            };
    });
    $.myStorage.save('getAsBook',save);
}

function freeTableHandle() {
    // Table icon click events
    window.operateEventsFree = {
        'click .icon': function (e, value, row, index) {
            $('#free_table').bootstrapTable('toggleDetailView', index);
        },
        'click .had1': function (e, value, row, index) {
            if (!row["had1"]){
                row["had1"] = true;
            }else{
                row["had1"] = false;
                row["had2"] = false;
                row["had3"] = false;
                row["had4"] = false;
                row["had5"] = false;
                row["lightShadow"] = 0;
                if (row["as"]) row["hadas"] = false;
            }
            $('#free_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            toSaveFreeSelections();
        },
        'click .had2': function (e, value, row, index) {
            if (!row["had2"]){
                row["had1"] = true;
                row["had2"] = true;
            }else{
                if (parseInt(row['minStar']) >= 2){
                    row["had1"] = false;
                    row["lightShadow"] = 0;
                    if (row["as"]) row["hadas"] = false;
                }
                row["had2"] = false;
                row["had3"] = false;
                row["had4"] = false;
                row["had5"] = false;
            }
            $('#free_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            toSaveFreeSelections();
        },
        'click .had3': function (e, value, row, index) {
            if (!row["had3"]){
                row["had1"] = true;
                row["had2"] = true;
                row["had3"] = true;
            }else{
                if (parseInt(row['minStar']) >= 3){
                    row["had1"] = false;
                    row["had2"] = false;
                    row["lightShadow"] = 0;
                    if (row["as"]) row["hadas"] = false;
                }
                row["had3"] = false;
                row["had4"] = false;
                row["had5"] = false;
            }
            $('#free_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            toSaveFreeSelections();
        },
        'click .had4': function (e, value, row, index) {
            if (!row["had4"]){
                row["had1"] = true;
                row["had2"] = true;
                row["had3"] = true;
                row["had4"] = true;
            }else{
                if (parseInt(row['minStar']) >= 4){
                    row["had1"] = false;
                    row["had2"] = false;
                    row["had3"] = false;
                    row["lightShadow"] = 0;
                    if (row["as"]) row["hadas"] = false;
                }
                row["had4"] = false;
                row["had5"] = false;
            }
            $('#free_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            toSaveFreeSelections();
        },
        'click .had5': function (e, value, row, index) {
            if (!row["had5"]){
                row["had1"] = true;
                row["had2"] = true;
                row["had3"] = true;
                row["had4"] = true;
                row["had5"] = true;
            }else{
                if (parseInt(row['minStar']) === 5){
                    row["had1"] = false;
                    row["had2"] = false;
                    row["had3"] = false;
                    row["had4"] = false;
                    row["lightShadow"] = 0;
                    if (row["as"]) row["hadas"] = false;
                }
                row["had5"] = false;
            }
            $('#free_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            toSaveFreeSelections();
        },
        'click .hadas': function (e, value, row, index) {
            if (!row["hadas"]){
                row["hadas"] = true;
            }else{
                row["hadas"] = false;
            }
            $('#free_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            toSaveFreeSelections();
        },
        'change .light-shadow': function (e, value, row, index) {
            if (typeof $(e.target).val() !== "undefined"){
                value = parseInt($(e.target).val());
                if (value > 255) value = 255;
                if (value < 0) value = 0;
                $(e.target).val(value);
            }
            row['lightShadow'] = value;
            toSaveFreeSelections();
        }

    };

    // Free Table Options
    var freeTableColums = [{
        field: 'id',
        visible: false
    }, {
        field: 'element',
        width: 5,
        formatter: function () { return ''; },
        cellStyle: elementCellStyle,
        events: operateEventsFree
    },{
        field: 'name',
        title: '角色',
        width: 200,
        formatter: function (value, row, index) {
            var nickname = row['nickname'];
            if ($.trim(nickname) === ''){
                nickname = "-"
            }
            if ($.trim(row['asNickname'])){
                nickname +=  '/' + row['asNickname']
            }

            var html = '<div class="media">\n' +
                '  <img src="./images/characters/'+row["enName"]+'.jpg" class="mr-3 icon" width="50">\n' +
                '  <div class="media-body">\n' +
                '    <h5 class="mt-0">'+ value +'</h5>\n' +
                nickname +
                '  </div>\n' +
                '</div>';
            return html;
        },
        events: operateEventsFree
    }, {
        field: 'star',
        title: '★★★★★',
        width: 130,
        align: "left",
        cellStyle: function(value, row, index){
            return {css: {'white-space': 'nowrap'}};
        },
        formatter: function(value, row, index){
            return genStarList(row['minStar'], row['maxStar'],
                {
                    '1':row["had1"],
                    '2':row["had2"],
                    '3':row["had3"],
                    '4':row["had4"],
                    '5':row["had5"]
                });
        },
        events: operateEventsFree
    }, {
        field: 'hadas',
        title: 'AS',
        width: 40,
        align: "center",
        formatter: function(value, row, index){
            if (row["as"] === true) {
                return genStar('hadas',!!(value), null, true);
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
        locale: 'zh-TW',
        uniqueId: "id",
        classes: "table table-bordered table-striped table-sm table-borderless",
        theadClasses: "thead-dark",
        toolbar: "#free_toolbar",
        toolbarAlign: "right"
    });

    $('#selectAllFreeListed').on('click', function () {
        var data = $('#free_table').bootstrapTable('getData');
        var rows = $('#free_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
        var newRows = $.map(data,function (row, i) {
            if (parseInt(row['maxStar']) >= 1) row['had1'] = true;
            if (parseInt(row['maxStar']) >= 2) row['had2'] = true;
            if (parseInt(row['maxStar']) >= 3) row['had3'] = true;
            if (parseInt(row['maxStar']) >= 4) row['had4'] = true;
            if (parseInt(row['maxStar']) >= 5) row['had5'] = true;
            if (row["as"]) row["hadas"] = true;
            return row;
        });
        var extend = $.extend({},rows,newRows);
        $('#free_table').bootstrapTable('load', extend);
        toSaveFreeSelections();
        gtag('event', 'select', {
            'event_category': 'select all',
            'event_label': 'free'
        });
    });

    $('#unselectAllFreeListed').on('click', function () {
        var data = $('#free_table').bootstrapTable('getData');
        var rows = $('#free_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
        var newRows = $.map(data,function (row) {
            row['had1'] = false;
            row['had2'] = false;
            row['had3'] = false;
            row['had4'] = false;
            row['had5'] = false;
            row['hadas'] = false;
            row['lightShadow'] = 0;
            return row;
        });
        var extend = $.extend({},rows,newRows);
        $('#free_table').bootstrapTable('load', extend);
        toSaveFreeSelections();
        gtag('event', 'select', {
            'event_category': 'unselect all',
            'event_label': 'free'
        });
    });
}
function toSaveFreeSelections() {
    var data = $('#free_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
    var save = $.map(data,function (row, i) {
        if (
            row['had1'] === true ||
            row['had2'] === true ||
            row['had3'] === true ||
            row['had4'] === true ||
            row['had5'] === true ||
            row['hadas'] === true ||
            row['lightShadow'] > 0
        ){
            row['lightShadow'] = parseInt(row['lightShadow']);
            if (row['lightShadow'] > 255) row['lightShadow'] = 255;
            if (row['lightShadow'] < 0 ) row['lightShadow'] = 0;

            return {
                id: row['id'],
                had1: row['had1'],
                had2: row['had2'],
                had3: row['had3'],
                had4: row['had4'],
                had5: row['had5'],
                hadas: row['hadas'],
                lightShadow: row['lightShadow']

            };
        }

    });
    $.myStorage.save('selectedFree',save);
}

function star4TableHandle() {
    // Table icon click events
    window.operateEventsStar4 = {
        'click .icon': function (e, value, row, index) {

        },
        'click .had3': function (e, value, row, index) {
            if (!row["had3"]){
                row["had3"] = true;
            }else{
                row["had3"] = false;
                row["had4"] = false;
            }
            $('#star4_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            toSaveStar4selections();
        },
        'click .had4': function (e, value, row, index) {
            if (!row["had4"]){
                row["had3"] = true;
                row["had4"] = true;
            }else{
                row["had4"] = false;
            }
            $('#star4_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            toSaveStar4selections();
        }

    };
    // Star 4 Table Options
    var star4TableColums = [{
        field: 'id',
        visible: false,
    }, {
        field: 'element',
        width: 5,
        formatter: function () { return ''; },
        cellStyle: elementCellStyle
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
                '  <img src="./images/characters/'+row["enName"]+'.jpg" class="mr-3 icon" width="50">\n' +
                '  <div class="media-body">\n' +
                '    <h5 class="mt-0">'+ value +'</h5>\n' +
                nickname +
                '  </div>\n' +
                '</div>';
            return html;
        },
        events: operateEventsStar4
    }, {
        field: 'had3',
        title: '☆3',
        width: 40,
        align: "center",
        formatter: function(value, row, index){
            if(value){
                return '<i class="fa fa-heart had3" style="color:red"></i>';
            }else{
                return '<i class="fa fa-heart had3" style="color:#aaa"></i>';
            }
        },
        events: operateEventsStar4
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
        events: operateEventsStar4
    }];

    $('#star4_table').bootstrapTable({
        columns: star4TableColums,
        locale: 'zh-TW',
        uniqueId: "id",
        classes: "table table-bordered table-striped table-sm table-borderless",
        theadClasses: "thead-dark",
        toolbar: "#star4_toolbar",
        toolbarAlign: "right"
    });

    $('#selectAllStar4Listed').on('click', function () {
        var data = $('#star4_table').bootstrapTable('getData');
        var rows = $('#star4_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
        var newRows = $.map(data,function (row, i) {
            row['had3'] = true;
            row['had4'] = true;
            return row;
        });
        var extend = $.extend({},rows,newRows);
        $('#star4_table').bootstrapTable('load', extend);
        toSaveStar4selections();
        gtag('event', 'select', {
            'event_category': 'select all',
            'event_label': 'star4'
        });
    });

    $('#unselectAllStar4Listed').on('click', function () {
        var data = $('#star4_table').bootstrapTable('getData');
        var rows = $('#star4_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
        var newRows = $.map(data,function (row) {
            row['had3'] = false;
            row['had4'] = false;
            return row;
        });
        var extend = $.extend({},rows,newRows);
        $('#star4_table').bootstrapTable('load', extend);
        toSaveStar4selections();
        gtag('event', 'select', {
            'event_category': 'unselect all',
            'event_label': 'star4'
        });
    });
}
function toSaveStar4selections() {
    var data = $('#star4_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
    var save = $.map(data,function (row, i) {
        if (
            row['had3'] === true ||
            row['had4'] === true
        ){
            return {
                id: row['id'],
                had3: row['had3'],
                had4: row['had4']
            };
        }

    });
    $.myStorage.save('selectedStar4',save);
}

function spTableHandle() {
    // Table icon click events
    window.operateEventsSp = {
        'click .icon': function (e, value, row, index) {

        },
        'click .had3': function (e, value, row, index) {
            if (!row["had3"]){
                row["had3"] = true;
            }else{
                row["had3"] = false;
                row["had4"] = false;
            }
            $('#sp_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            toSaveSpselections();
        },
        'click .had4': function (e, value, row, index) {
            if (!row["had4"]){
                row["had3"] = true;
                row["had4"] = true;
            }else{
                row["had4"] = false;
                row["had5"] = false;
            }
            $('#sp_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            toSaveSpselections();
        },
        'click .had5': function (e, value, row, index) {
            if (!row["had5"]){
                row["had3"] = true;
                row["had4"] = true;
                row["had5"] = true;
            }else{
                row["had5"] = false;
            }
            $('#sp_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            toSaveSpselections();
        },

    };

    // Sp Table Options
    var spTableColums = [{
        field: 'id',
        visible: false,
    }, {
        field: 'element',
        width: 5,
        formatter: function () { return ''; },
        cellStyle: elementCellStyle
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
                '  <img src="./images/characters/'+row["enName"]+'.jpg" class="mr-3 icon" width="50">\n' +
                '  <div class="media-body">\n' +
                '    <h5 class="mt-0">'+ value +'</h5>\n' +
                nickname +
                '  </div>\n' +
                '</div>';
            return html;
        },
        events: operateEventsSp
    }, {
        field: 'had3',
        title: '☆3',
        width: 40,
        align: "center",
        formatter: function(value, row, index){
            if(value){
                return '<i class="fa fa-heart had3" style="color:red"></i>';
            }else{
                return '<i class="fa fa-heart had3" style="color:#aaa"></i>';
            }
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
            if(value){
                return '<i class="fa fa-heart had5" style="color:red"></i>';
            }else{
                return '<i class="fa fa-heart had5" style="color:#aaa"></i>';
            }
        },
        events: operateEventsSp
    }];

    $('#sp_table').bootstrapTable({
        columns: spTableColums,
        locale: 'zh-TW',
        uniqueId: "id",
        classes: "table table-bordered table-striped table-sm table-borderless",
        theadClasses: "thead-dark"
    });
}
function toSaveSpselections() {
    var data = $('#sp_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
    var save = $.map(data,function (row, i) {
        if (
            row['had3'] === true ||
            row['had4'] === true ||
            row['had5'] === true
        ){
            return {
                id: row['id'],
                had3: row['had3'],
                had4: row['had4'],
                had5: row['had5']
            };
        }

    });
    $.myStorage.save('selectedSp',save);
}

function setting() {
    $("#cleanup").on("click", function () {
        gtag('event', 'setting', {
            'event_category': 'clean',
            'event_label': 'confirm'
        });
        bootbox.confirm({
            title: "清除已記錄資料",
            message: "進行清除後，將失去已選擇的資料。如點擊清除後再進行資料修改，該部份的資料將會再次記錄。",
            buttons: {
                cancel: {
                    label: '取消',
                    className: 'btn-info'
                },
                confirm: {
                    label: '清除',
                    className: 'btn-danger'
                }
            },
            backdrop: true,
            callback: function (result) {
                if (result){
                    gtag('event', 'setting', {
                        'event_category': 'clean',
                        'event_label': 'clean'
                    });
                    $.myStorage.clean();
                    bootbox.alert({
                        message: "資料已經清除!",
                        backdrop: true,
                    });
                }
            }
        });

    });

    var settingPanel = $("#extra_settings");
    var settings = $(settingPanel).find(".extra-setting-item");

    if ($.myStorage.checkExist('settings')){
        var saveSettings = $.myStorage.get('settings');

        $.map(saveSettings, function (row) {
            var input = $("#"+row['id']).get(0);
            var item = $(input).closest('.extra-setting-item');
            var settingId = $(input).attr("id");
            var label = $(item).find('.custom-control-label[for="'+settingId+'"]');
            var labelVal = {
                true : $(label).attr('data-true-label'),
                false : $(label).attr('data-false-label')
            };

            $(input).prop('checked', row['val']);
            $(label).html(labelVal[row['val']])
        });
    }



    $('body').on('change', '#extra_settings input.custom-control-input', function() {
        var item = $(this).closest('.extra-setting-item');
        var val = $(this).prop('checked');
        var settingId = $(this).attr("id");
        var title = $(item).find('div[data-custom-switch-title-for="'+settingId+'"]').html();
        var label = $(item).find('.custom-control-label[for="'+settingId+'"]');
        var labelVal = {
            true : $(label).attr('data-true-label'),
            false : $(label).attr('data-false-label')
        };
        $(label).html(labelVal[val]);
        gtag('event', 'setting', {
            'event_category': 'change',
            'event_label': settingId + " - " + val
        });

        var settings = $.map($('#extra_settings input.custom-control-input'), function (settingInput) {
            return {
                id: $(settingInput).attr("id"),
                val : $(settingInput).prop("checked")
            }
        });
        $.myStorage.save('settings', settings);
    });

}
function getSettings() {
    var settingPanel = $("#extra_settings");
    var settings = $(settingPanel).find(".extra-setting-item");
    var rows = $.map(settings, function (item) {
        var input = $(item).find('input').get(0);
        if (!input) return;
        var settingId = $(input).attr("id");
        var title = $(item).find('div[data-custom-switch-title-for="'+settingId+'"]').html();
        var label = $(item).find('.custom-control-label[for="'+settingId+'"]');
        var labelVal = {
            true : $(label).attr('data-true-label'),
            false : $(label).attr('data-false-label')
        };
        var value = $(input).prop('checked');
        return {
            id: settingId,
            title: title,
            label: labelVal[value],
            val: value
        };
    });
    var result = {};
    $.each(rows, function (i, row) {
        result[row['id']] = row;
    });
    return result;
}

function genStar(exClass, isActive, num, isAsType) {
    var exClassName = ' ' + exClass || '';
    var active = isActive || false;
    var asType = isAsType || false;
    var starNum = num || 2;

    if (exClass === null) exClassName = "";

    var starColor = ' star-gray';
    if (active) starColor = ' star-red';

    if (asType){
        return '<i class="fa fa-user-friends' + exClassName + starColor +'"></i>';
    }

    var star = '<i class="fas fa-star'+ starColor + exClassName +'"></i>';
    var starNone = '<i class="far fa-star'+starColor+'"></i>';


    if (starNum % 1 === 0.5){
        return '<i class="fas fa-star-half-alt'+ starColor + exClassName +'"></i>';
    }

    if (num === -1){
        return starNone;
    }
    return star;
}

function genStarList(min, max, selected) {
    var star1, star2, star3, star4, star5;

    min = parseInt(min);
    max = parseInt(max);

    star1 = genStar( "had5", !!(selected['1']));
    star2 = genStar( "had5", !!(selected['2']));
    star3 = genStar( "had5", !!(selected['3']));
    star4 = genStar( "had5", !!(selected['4']));
    star5 = genStar( "had5", !!(selected['5']));

    if (min <= 4){
        star1 = genStar( "had4", !!(selected['1']));
        star2 = genStar( "had4", !!(selected['2']));
        star3 = genStar( "had4", !!(selected['3']));
        star4 = genStar( "had4", !!(selected['4']));
    }

    if (min <= 3){
        star1 = genStar( "had3", !!(selected['1']));
        star2 = genStar( "had3", !!(selected['2']));
        star3 = genStar( "had3", !!(selected['3']));
    }

    if (min <= 2){
        star1 = genStar( "had2", !!(selected['1']));
        star2 = genStar( "had2", !!(selected['2']));
    }

    if (min === 1){
        star1 = genStar( "had1", !!(selected['1']));
    }

    if (max === 4){
        star5 = genStar( null,false,-1);
    }
    if (max === 3){
        star4 = genStar( null,false,-1);
        star5 = genStar( null,false,-1);
    }

    if (max === 2){
        star3 = genStar( null,false,-1);
        star4 = genStar( null,false,-1);
        star5 = genStar( null,false,-1);
    }

    if (max === 1){
        star2 = genStar( null,false,-1);
        star3 = genStar( null,false,-1);
        star4 = genStar( null,false,-1);
        star5 = genStar( null,false,-1);
    }
    return $.map([star1, star2, star3, star4, star5], function (row) {
        return row;
    }).join("\n");
}

function genText() {
    var data = $('#char_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
    var nameMaxLength = findMaxLength(data);
    var settings = getSettings();
    var showAsBooks = settings['showAsBooks']['val'];
    var showNotGet = settings['showNotGet']['val'];

    var asData = [];
    if (showAsBooks){
        asData = $('#as_book_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
    }

    var list = $.map(data, function(row, i){
        if (!showNotGet && !(row['had4'] || row['had5'] === "true" || row['hadas'])){
            return;
        }

        var hoshi = spaceText + spaceText;
        if (row["had5"] === true){
            hoshi = "★５";
        }else if(row["had4"]){
            hoshi = '☆４';
        }
        var as = row["hadas"]?"★":row["as"]? spaceText:"／";

        var asBook = '';
        if (!!(row['as']) && showAsBooks){
           var asBookRow = $.map(asData,function (asRow, i) {
                if (row['id'] == asRow['id']){
                    return {
                        id: asRow['id'],
                        qty: asRow['qty']
                    };
                }
            });
            var asBookQty = 0;
            if (asBookRow) asBookQty =  Math.ceil(parseInt(asBookRow[0]['qty']));
            if (typeof asBookQty !== "undefined" && asBookQty > 0){
                asBook = '<br>' + divide +
                    stringPad(row['as'] + "的異節", (nameMaxLength[0] + nameMaxLength[1] + 6), "<", "＞") +
                    toFullWidthNumber(asBookQty, 2, 99, false) + '本' + divide;
            }

        }
        var lightShadow = row['lightShadow'];

        if (typeof lightShadow !== "undefined" && (row['had4'] || row['had5'] || row['hadas'])){
            lightShadow = Math.ceil(parseInt(lightShadow));
            lightShadow = (lightShadow === 0) ? '' : lightShadow;
            lightShadow = toFullWidthNumber(lightShadow, 3, 255);
        }else{
            lightShadow = strLoop("＿",3);
        }
        return divide + toFixLength(row["name"], row["nickname"], nameMaxLength, true) + divide + lightShadow + divide + hoshi + divide + as + divide + asBook;
    });

    var html = [
        '<!DOCTYPE html>',
        '<html lang="zh-tw">',
        '<head><title>貓神健檢小幫手</title></head>',
        '<style>th,td{padding:2px;}</style>',
        '<body>',
        '<br><br><br>',
        "<span>" + divide + toFixLength("角色", "暱稱", nameMaxLength, true) + divide + "天冥值" + divide + "原版" + divide + "AS" + divide +

        "</span><br />",
        "<span>" + divide + toFixLength(strLoop("＿", nameMaxLength[0]), strLoop("＿", nameMaxLength[1]), nameMaxLength, true) +
        divide + "＿＿＿" + divide + "＿＿" + divide + "＿" + divide + "</span><br />",
        list.join("<br />"),
        '<br><br>'
    ];

    html = html.concat(genExtarDetal());

    return html.join("\n") + '</body></html>';
}

function genTable() {
    var data = $('#char_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
    var nameMaxLength = findMaxLength(data);
    var settings = getSettings();
    var showAsBooks = settings['showAsBooks']['val'];
    var showNotGet = settings['showNotGet']['val'];

    var asData = [];
    if (showAsBooks){
        asData = $('#as_book_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
    }

    var tbody = $.map(data, function(row, i){
        var hoshi = '<font color="lightgray">-</font>';
        if (row["had5"] === true){
            hoshi = "<strong>★5</strong>";
        }else if(row["had4"]){
            hoshi = '<font color="gray">☆4</font>';
        }
        var as = row["hadas"]?"<strong>✓</strong>":'<font color="lightgray">-</font>';

        var asBook = '';
        if (!!(row['as']) && showAsBooks){
            var asBookRow = $.map(asData,function (asRow, i) {
                if (row['id'] == asRow['id']){
                    return {
                        id: asRow['id'],
                        qty: asRow['qty']
                    };
                }
            });
            var asBookQty = 0;
            if (asBookRow) asBookQty = Math.ceil(parseInt(asBookRow[0]['qty']));
            if (typeof asBookQty !== "undefined" && asBookQty > 0){
                asBook = [
                    '<tr height="20">',
                    '<td colspan="2" align="center">'+row['as'] + "的異節"+'</td>',
                    '<td colspan="3" align="center">' + toFullWidthNumber(asBookQty,1, 99,true) + '本' +'</td>',
                    '</tr>',
                ].join('\n')
            }

        }
        var lightShadow = row['lightShadow'];
        var emptyText ='<font color="lightgray">-</font>';

        if (typeof lightShadow !== "undefined" && (row['had4'] || row['had5'] || row['hadas'])){
            lightShadow = Math.ceil(parseInt(lightShadow));
            if (lightShadow === 0){
                lightShadow = emptyText;
            }else{
                lightShadow = toFullWidthNumber(lightShadow, 1, 255);
            }
        }else{
            lightShadow = emptyText;
        }

        return [
            '<tr height="20">',
            '<td width="80">'+row["name"]+'</td>',
            '<td align="right" width="90">'+row["nickname"]+'</td>',
            '<td align="center">' + lightShadow + '</td>',
            '<td align="center">'+hoshi+'</td>',
            '<td align="center"'+(row["as"]?"":' bgcolor="lightgray"')+'>'+as+'</td>',
            '</tr>'+asBook,
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
        '<th width="60"><strong>天冥值</strong></th>',
        '<th width="50"><strong>原版</strong></th>',
        '<th width="50"><strong>AS版</strong></th>',
        '</tr>',
        '</thead>',
        '<tbody>',
        tbody,
        '</tbody>',
        '</table>',
        '<br><br>',
        genExtarDetal().join('\n')
    ].join("\n");



    return table;
}

function genExtarDetal() {
    var settings = getSettings();
    var showAsBooks = settings['showAsBooks']['val'];
    var showNotGet = settings['showNotGet']['val'];
    var showYumeBookQty = settings['showYumeBookQty']['val'];
    var showMissions = settings['showMissions']['val'];
    var showFree = settings['showFree']['val'];
    var showSpData = settings['showSpData']['val'];
    var showStar4Data = settings['showStar4Data']['val'];


    var html = [];

    var storyTo = $('#mainStory').data('newest');
    var saveTo = $('#mainStory').attr('data-selected-number');

    if (typeof saveTo !== "undefined"){
        html = html.concat([
            '主線目前章節 ' + saveTo + ' / ' +storyTo,
            '<br>',
            '<br>'
        ]);
    }

    var getYumeBooks = parseInt( $("#yumeBooks").val() );
    if (showYumeBookQty && getYumeBooks){
        html = html.concat([
            '持有詠夢之書 ' + getYumeBooks + ' 本<br>',
            '<br>'
        ]);
    }

    if (showMissions){
        var missions = $(".extra-story-item");

        var allMissions = 0;
        var doneMissions = 0;
        var allBook = 0;
        var getBook = 0;

        var missionsDone = $.map(missions, function (missionRow) {
            var status = $(missionRow).find('input.custom-control-input').prop('checked');
            var yumeBook = $(missionRow).find('.custom-range').val();
            var maxYumeBook = $(missionRow).find('.custom-range').attr('max');
            allMissions++;
            allBook += parseInt(maxYumeBook);
            getBook += parseInt(yumeBook);

            if (!status) return;
            doneMissions++;
            var storyType = $(missionRow).find('[data-data-name="storyType"]').html();
            var storyTitle = $(missionRow).find('[data-data-name="storyTitle"]').html();

            var yumeBook = $(missionRow).find('.custom-range').val();

            var yumeBookLabel = "";
            if (maxYumeBook == yumeBook){
                yumeBookLabel = "及獎勵";
            }else if (yumeBook > 0){
                yumeBookLabel = '<br />＞' + $(missionRow).find('[data-data-name="yumeBookLabel"]').html();
            }
            return storyType + '-' + storyTitle + yumeBookLabel;
        });

        if (doneMissions == 0 && getBook == 0){
            html = html.concat([
                '<br />'
            ]);
        }else if (doneMissions < allMissions || getBook < allBook){
            if (missionsDone.length){
                html = html.concat([
                    '己完成以下外傳/斷章<br />',
                    missionsDone.join('<br />'),
                    '<br />',
                    '<br />'
                ]);
            }

            var missionsNow = $.map(missions, function (missionRow) {
                var status = $(missionRow).find('input.custom-control-input').prop('checked');
                if (status) return;
                var yumeBook = $(missionRow).find('.custom-range').val();
                var maxYumeBook = $(missionRow).find('.custom-range').attr('max');
                var storyType = $(missionRow).find('[data-data-name="storyType"]').html();
                var storyTitle = $(missionRow).find('[data-data-name="storyTitle"]').html();

                var yumeBook = $(missionRow).find('.custom-range').val();

                var yumeBookLabel = "";
                if (maxYumeBook == yumeBook){
                    yumeBookLabel = "及只取得獎勵";
                }else if (yumeBook > 0){
                    yumeBookLabel = '<br />＞' + $(missionRow).find('[data-data-name="yumeBookLabel"]').html();
                }
                return storyType + '-' + storyTitle + yumeBookLabel;
            });

            if (missionsNow.length){
                html = html.concat([
                    '未完成以下外傳/斷章<br />',
                    missionsNow.join('<br />'),
                    '<br />'
                ]);
            }

            html = html.concat([
                '己取得獎勵詠夢之書，'+ getBook + ' / '+ allBook +' 本。 <br />',
                '<br />'
            ]);

        }else{
            html = html.concat([
                '己完成目前所有外傳/斷章，及取得所有獎勵詠夢之書，共 '+ allBook +' 本。<br />',
                '<br />'
            ]);

        }


    }

    if (showFree){
        var useBook = 0;
        var freeData = $('#free_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});

        var freeStar5 = $.map(freeData, function (freeRow) {
            if (freeRow['had5'] || freeRow['hadas']){
                if (freeRow['useBook'] !== '-') useBook += parseInt(freeRow['useBook']);
                var lightShadow = (freeRow['lightShadow'] > 0) ? '('+freeRow['lightShadow']+')' : '';
                var asName = '';
                if (freeRow['hadas']) {
                    asName = "&AS" + freeRow['asName'];
                }
                return freeRow['name'] + asName + lightShadow;
            }
        });

        var freeStar4 = $.map(freeData, function (freeRow) {
            if (freeRow['had4'] && !freeRow['had5'] && !freeRow['hadas']){
                var lightShadow = (freeRow['lightShadow'] > 0) ? '('+freeRow['lightShadow']+')' : '';
                return freeRow['name'] + lightShadow;
            }
        });

        var freeStar3 = $.map(freeData, function (freeRow) {
            if (freeRow['had3'] && !freeRow['had4'] && !freeRow['had5']){
                var lightShadow = (freeRow['lightShadow'] > 0) ? '('+freeRow['lightShadow']+')' : '';
                return freeRow['name'] + lightShadow;
            }
        });

        if (freeStar5.length){

            html = html.concat([
                '★5配布角色(天冥值)<br />',
                freeStar5.join(', '),
            ]);

            if (useBook){
                html = html.concat([
                    '<br />',
                    '使用了 '+useBook+' 本詠夢之書。<br />',
                    '<br />'
                ]);
            }else{
                html = html.concat([
                    '<br />',
                    '<br />'
                ]);
            }


        }

        if (freeStar4.length){
            html = html.concat([
                '☆4配布角色(天冥值)<br />',
                freeStar4.join(', '),
                '<br />',
                '<br />'
            ]);
        }

        if (freeStar3.length){
            html = html.concat([
                '☆3配布角色(天冥值)<br />',
                freeStar3.join(', '),
                '<br />',
                '<br />'
            ]);
        }


    }


    if (showSpData){
        var spData = $('#sp_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
        var useBook = 0;
        var spStar5 = $.map(spData, function (spRow) {
            if (spRow['had5']){
                if (spRow['useBook'] !== '-') useBook += parseInt(spRow['useBook']);
                return spRow['name'];
            }
        });

        var spStar4 = $.map(spData, function (spRow) {
            if (spRow['had4'] && !spRow['had5']){
                return spRow['name'];
            }
        });

        var spStar3 = $.map(spData, function (spRow) {
            if (spRow['had3'] && !spRow['had4'] && !spRow['had5']){
                return spRow['name'];
            }
        });

        if (spStar5.length){
            html = html.concat([
                '★5斷章角色<br />',
                spStar5.join(', ')
            ]);
            if (useBook){
                html = html.concat([
                    '<br />',
                    '使用了 '+useBook+' 本詠夢之書。<br />',
                    '<br />'
                ]);
            }else{
                html = html.concat([
                    '<br />',
                    '<br />'
                ]);
            }
        }

        if (spStar4.length){
            html = html.concat([
                '☆4斷章角色<br />',
                spStar4.join(', '),
                '<br />',
                '<br />'
            ]);
        }

        if (spStar3.length){
            html = html.concat([
                '☆3斷章角色<br />',
                spStar3.join(', '),
                '<br />',
                '<br />'
            ]);
        }
    }


    if (showStar4Data){
        var star4Data = $('#star4_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});

        var star4 = $.map(star4Data, function (row) {
            if (row['had4']){
                var pos = !!(row['pos']) ? " ( " + row['pos'] + " )" : '';
                return row['name'] + pos;
            }
        });

        var star3 = $.map(star4Data, function (row) {
            if (row['had3'] && !row['had4']){
                return row['name'];
            }
        });

        if (star4.length){
            html = html.concat([
                '☆4角色<br />',
                star4.join(', '),
                '<br />',
                '<br />'
            ]);
        }

        if (star3.length){
            html = html.concat([
                '☆3角色<br />',
                star3.join(', '),
                '<br />',
                '<br />'
            ]);
        }
    }


    return html;
}
function genTeamCheckCanvas() {
    // TODO Gen canvas
    // $("#canvas").size(200,800).canvasAdd();
    // $("#download").downloadCanvas();
}
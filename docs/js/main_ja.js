'use strict';

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

        $("html, body").animate({ scrollTop: 0 }, 600);

    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        if (e.target.id === "gencanvas-tab"){
            gtag('event', 'tab', {
                'event_category': 'change',
                'event_label': 'generate canvas result'
            });

            genTeamCheckCanvas();
        }
    });

    // Handle tables
    star5tableHandle();
    freeTableHandle();
    star4TableHandle();
    spTableHandle();

    // Read csv in table
    $.myFileReader
        .setOptions('GET', 'text' ,false)
        .addFile('5star','./csv/5star.csv', function (data) {
            var obj = $.csv.toObjects(data);
            var dataRows = $.map(obj, function (row) {
                var nickname = row["暱稱"];
                var asNickname = row["AS暱稱"];
                //if (row["角色名"].charAt(0) === '*') return;
                if ($.trim(nickname) === "" && $.trim(asNickname) === "") {
                    nickname = row["角色名"];
                } else if ($.trim(nickname) === "") {
                    nickname = row["角色名"];
                }

                return {
                    'id': row["ID"],
                    'name': row["角色名"],
                    'jpName': row["日名"],
                    'enName': row["英名"],
                    'nickname': nickname,
                    'asNickname': asNickname,
                    'as': row["AS名"],
                    'es': row["ES名"],
                    'ac': row["異時層"],
                    'had5': (row["★5"] === "TRUE")? false:'none',
                    'hadas': '',
                    'hades': '',
                    'element': row["主屬"],
                    'weapon': row["武器"],
                    'lightShadow' : 0,
                    'personal': row['專武'],
                    'book4': row['職業書'],
                    'book5': row['五星書'],
                    'pos': row['特殊地位'],
                    'asPos': row['AS特殊地位'],
                    'lightShadowType': row["天冥"]
                };
            });

            return {rows:dataRows};
        })
        .addFile('free','./csv/free.csv',function (data) {
            return $.map($.csv.toObjects(data), function (row) {
                //if (row["角色名"].charAt(0) === '*') return;
                return {
                    'id': row["ID"],
                    'name': row["角色名"],
                    'jpName': row["日名"],
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
                    'asUseBook': row["AS消耗夢書"],
                    'presonal': row["專武"],
                    'element': row["主屬"],
                    'had1': false,
                    'had2': false,
                    'had3': false,
                    'had4': false,
                    'had5': false,
                    'hadas': false,
                    'lightShadow': 0,
                    'lightShadowType': row["天冥"]
                };
            });
        })
        .addFile('5star_sp','./csv/5star_sp.csv', function (data) {
            return $.map($.csv.toObjects(data), function (row) {
                //if (row["角色名"].charAt(0) === '*') return;
                return {
                    'id': row["ID"],
                    'name': row["角色名"],
                    'jpName': row["日名"],
                    'enName': row["英名"],
                    'nickname': row["暱稱"],
                    'minStar': row["起始☆"],
                    'maxStar': row["最高★"],
                    'useBook': row["消耗夢書"],
                    'presonal': row["專武"],
                    'element': row["主屬"],
                    'had3': false,
                    'had4': false,
                    'had5': false
                };
            });
        })
        .addFile('4star','./csv/4star.csv', function (data) {
            return $.map($.csv.toObjects(data), function (row) {
                if (
                    row["角色名"].charAt(0) === '*' ||
                    row["升職"] === '已升'
                ) return;

                return {
                    'id': row["ID"],
                    'name': row["角色名"],
                    'jpName': row["日名"],
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
        })
        .do(
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
                    var rows = data.rows

                    if ($.myStorage.checkExist('selectedStar5_ja')){
                        var save = $.myStorage.get('selectedStar5_ja');

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
                                row['hades'] = getRow[0]['hades'];
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

                if (key === "free"){
                    var freeRows = data;

                    if ($.myStorage.checkExist('selectedFree_ja')){
                        var saveFree = $.myStorage.get('selectedFree_ja');

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
                    var spRows = data;

                    if ($.myStorage.checkExist('selectedSp_ja')){
                        var saveSp = $.myStorage.get('selectedSp_ja');

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
                    var star4Rows = data;

                    if ($.myStorage.checkExist('selectedStar4_ja')){
                        var saveStar4 = $.myStorage.get('selectedStar4_ja');

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
            function (key, error) {
                gtag('event', 'file', {
                    'event_category': 'load',
                    'event_label': 'error with ' + key
                });
                $('#char_table').bootstrapTable('hideLoading');
                console.log("error", key, error);
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


function onWindowInitOrResize() {
    var windowHeight = $(window).height();
    $(".story-scroll-panel").height(windowHeight - 40 - 56);
}

var imageCell = function (value, row, index) {
    var nickname = row['nickname'];
    if ($.trim(nickname) === ''){
        nickname = "-"
    }
    if ($.trim(row['asNickname'])){
        nickname +=  '/' + row['asNickname']
    }

    var asImage = '';
    if (row['hadas'] === true){
        var animation = ' element-animation';
        if (row['had5'] === 'none') animation = '';
        asImage = '  <img src="./images/characters_icon/as/' + row["jpName"]+'.jpg" class="icon image-as' +'" width="50">\n';
    }

    var html = '<div class="media">\n' +
        '<div class="character-image mr-1">'+
        '  <img src="./images/characters_icon/' + row["jpName"]+'.jpg" class="icon" width="50">\n' +
        asImage +
        '</div>'+
        '  <div class="media-body">\n' +
        '    <h5 class="mt-0">'+ row['jpName'] +'</h5>\n' +
        row['enName'] +
        '  </div>\n' +
        '</div>';
    return html;
};

var elementCellStyle = function (value, row, index) {
        switch (value) {
            case "地":
                return {css: {'background-color': '#d7a186'}};
            case "水":
                return {css: {'background-color': '#479eff'}};
            case "風":
                return {css: {'background-color': '#45c145'}};
            case "火":
                return {css: {'background-color': '#ff0500'}};
            case "無":
                return {css: {'background-color': '#909090'}};
            case "雷":
                return {css: {'background-color': '#ffff00'}};
            case "陰":
                return {css: {'background-color': '#a08afc'}};
            case "晶":
                return {css: {'background-color': '#94f0ff'}};
            default:
                if (value.indexOf("地") > -1) return {css: {'background-color': '#8c6255'}};
                if (value.indexOf("水") > -1) return {css: {'background-color': '#306cae'}};
                if (value.indexOf("風") > -1) return {css: {'background-color': '#349134'}};
                if (value.indexOf("火") > -1) return {css: {'background-color': '#a50200'}};
                if (value.indexOf("無") > -1) return {css: {'background-color': '#484848'}};
        }
        return {css: {'background-color': 'white'}};
    };

var customSearchRows = function (data, text, filterBy){
    return data.filter(function(row){
        if (filterBy){
            var hit = [];
            Object.keys(filterBy).forEach(function (key) {
                if (filterBy[key].indexOf(",") > -1){
                    var mtext = filterBy[key].split(",");
                    hit[key] = mtext.every(function (value) {
                        return row[key].indexOf(value) > -1;
                    });
                }else{
                    hit[key] = row[key].indexOf(filterBy[key]) > -1;
                }
            });
            return Object.values(hit).every(function (value) {
                return value;
            });
        }
        return text === undefined || row.name.indexOf(text) > -1;
    });
};

function getFilters(){
    var weaponType = $(".dropdown-menu#weaponGroup").find(".active");
    var elementType = $(".dropdown-menu#elementGroup").find(".active");
    var westernElementType = $(".dropdown-menu#westernElementGroup").find(".active");

    var filters = {};

    if (weaponType.length && weaponType.data("weaponType") !== "顯示全部"){
        filters.weapon = weaponType.data("weaponType");
    }

    if ((elementType.length && elementType.data("elementType") !== "顯示全部") && (westernElementType.length && westernElementType.data("elementType") !== "顯示全部")){
        filters.element = [elementType.data("elementType"), westernElementType.data("elementType")].join(",");
    }else if(elementType.length && elementType.data("elementType") !== "顯示全部"){
        filters.element = elementType.data("elementType");
    }else if(westernElementType.length && westernElementType.data("elementType") !== "顯示全部"){
        filters.element = westernElementType.data("elementType");
    }

    return filters;
}

function star5tableHandle() {

    $('body').on('click', '.dropdown-menu#weaponGroup .dropdown-item', function() {
        var src = $(this).find('img').get(0);
        var btn = $(this).closest('.btn-group').find('.dropdown-toggle');
        var img = $(btn).find('img').get(0);

        if (!$(this).hasClass('active') && $(this).data("weaponType") === "顯示全部"){
            $(this).parent().find('.active').removeClass('active');
            $(this).addClass('active');
            $(btn).removeClass('btn-primary').addClass('btn-light');
            $(btn).parent().find(".icon").find('img').attr('src', './images/icons/weapon/sword.png');
            $('#char_table').bootstrapTable('filterBy', getFilters());
            gtag('event', 'filter', {
                'event_category': 'clear',
                'event_label': 'filters'
            });

        }else if (!$(this).hasClass('active')){
            $(this).parent().find('.active').removeClass('active');
            $(this).addClass('active');

            $('#char_table').bootstrapTable('filterBy', getFilters());

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

        if (!$(this).hasClass('active') && $(this).data("elementType") === "顯示全部"){
            $(this).parent().find('.active').removeClass('active');
            $(this).addClass('active');
            $(btn).removeClass('btn-primary').addClass('btn-light');
            $(btn).parent().find(".icon").find('img').attr('src', './images/icons/element/none.png');
            $('#char_table').bootstrapTable('filterBy', getFilters());
            gtag('event', 'filter', {
                'event_category': 'clear',
                'event_label': 'filters'
            });

        }else if (!$(this).hasClass('active')){
            $(this).parent().find('.active').removeClass('active');
            $(this).addClass('active');

            $('#char_table').bootstrapTable('filterBy', getFilters());

            $(btn).removeClass('btn-light').addClass('btn-primary');
            $(img).attr('src', $(src).attr('src'));
            $("#clearFilter").removeClass('btn-light').addClass('btn-primary');
            gtag('event', 'filter', {
                'event_category': 'element',
                'event_label': 'select'
            });
        }
    });

    $('body').on('click', '.dropdown-menu#westernElementGroup .dropdown-item', function() {
        var src = $(this).find('img').get(0);
        var btn = $(this).closest('.btn-group').find('.dropdown-toggle');
        var img = $(btn).find('img').get(0);
        if (!$(this).hasClass('active') && $(this).data("elementType") === "顯示全部"){
            $(this).parent().find('.active').removeClass('active');
            $(this).addClass('active');
            $(btn).removeClass('btn-primary').addClass('btn-light');
            $(btn).parent().find(".icon").find('img').attr('src', './images/icons/element/none.png');
            $('#char_table').bootstrapTable('filterBy', getFilters());
            gtag('event', 'filter', {
                'event_category': 'clear',
                'event_label': 'filters'
            });

        }else if (!$(this).hasClass('active')){
            $(this).parent().find('.active').removeClass('active');
            $(this).addClass('active');

            $('#char_table').bootstrapTable('filterBy', getFilters());

            $(btn).removeClass('btn-light').addClass('btn-primary');
            $(img).attr('src', $(src).attr('src'));
            $("#clearFilter").removeClass('btn-light').addClass('btn-primary');
            gtag('event', 'filter', {
                'event_category': 'element',
                'event_label': 'select'
            });
        }
    });

    // Table icon click events
    window.operateEvents = {
        'click .icon': function (e, value, row, index) {

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
                if (row["ac"] != "") row["had4"] = false;
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
        'click .hades': function (e, value, row, index) {
            if (!row["hades"]){
                row["hades"] = true;
            }else{
                row["hades"] = false;
            }
            $('#char_table').bootstrapTable('updateByUniqueId', {id: row['id'], row: row});
            toSaveStar5selections();
        },
        'change .light-shadow': function (e, value, row, index) {
            if (typeof $(e.target).val() !== "undefined"){
                value = ($(e.target).val()) ? parseInt($(e.target).val()) : 0;
                if (value > 255) value = 255;
                if (value < 0) value = 0;
                $(e.target).val(value);
            }
            row['lightShadow'] = value;
            toSaveStar5selections();
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
        cellStyle: elementCellStyle,
        events: operateEvents
    },{
        field: 'name',
        title: '角色',
        width: 200,
        formatter: imageCell,
        events: operateEvents
    }, {
        field: 'had4',
        title: '☆4',
        width: 40,
        align: "center",
        formatter: function(value, row, index){
            if(row["ac"] != ""){
                return '<font color="gray">-</font>';
            }else if(value){
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
        field: 'hades',
        title: 'ES',
        width: 40,
        align: "center",
        formatter: function(value, row, index){
            if ($.trim(row["es"])) {
                if(value){
                    return '<i class="fa fa-users hades" style="color:red"></i>';
                }else{
                    return '<i class="fa fa-users hades" style="color:#aaa"></i>';
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
        locale: 'ja-JP',
        uniqueId: "id",
        classes: "table table-bordered table-striped table-sm table-borderless",
        theadClasses: "thead-dark",
        toolbar: "#toolbar",
        toolbarAlign: "right",
        customSearch: customSearchRows
    });

    $('#selectAllStar5Listed').on('click', function () {
        bootbox.confirm({
            title: '選擇全部',
            message: "是否選擇目前顯示中的全部角色?",
            buttons: {
                confirm: {
                    label: '選擇全部',
                    className: 'btn-danger'
                },
                cancel: {
                    label: '取消',
                    className: 'btn-secondary float-left'
                }
            },
            callback: function (result) {
                if (result){
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
                        if ($.trim(row['es']) !== ''){
                            row['hades'] = true;
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
                }
            }
        });

    });

    $('#unselectAllStar5Listed').on('click', function () {
        bootbox.confirm({
            title: '清除選擇',
            message: "是否清除選擇目前顯示中的全部角色?",
            buttons: {
                confirm: {
                    label: '清除選擇全部',
                    className: 'btn-danger'
                },
                cancel: {
                    label: '取消',
                    className: 'btn-secondary'
                }
            },
            callback: function (result) {
                if (result){
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
                        if ($.trim(row['es']) !== ''){
                            row['hades'] = false;
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
                }
            }
        });

    });




    $('#orderByTime').on('click', function () {
        var activeStatus = $(this).hasClass("active");
        if (!activeStatus){
            $(this).toggleClass("active");
            $("#orderByType").toggleClass("active");
            $('#char_table').bootstrapTable('refreshOptions', {sortName : "id"});
            $('#char_table').bootstrapTable('filterBy', getFilters());
        }

    });
    $('#orderByType').on('click', function () {
        var activeStatus = $(this).hasClass("active");
        if (!activeStatus){
            $(this).toggleClass("active");
            $("#orderByTime").toggleClass("active");
            $('#char_table').bootstrapTable('refreshOptions', {sortName : "element"});
            $('#char_table').bootstrapTable('filterBy', getFilters());
        }
    });

    $('#textOrderByTime').on('click', function () {
        var activeStatus = $(this).hasClass("active");
        if (!activeStatus){
            $(this).toggleClass("active");
            $("#textOrderByType").toggleClass("active");
            $("#editor2").html(genText());
        }
    });
    $('#textOrderByType').on('click', function () {
        var activeStatus = $(this).hasClass("active");
        if (!activeStatus){
            $(this).toggleClass("active");
            $("#textOrderByTime").toggleClass("active");
            $("#editor2").html(genText());
        }
    });
    $('#tableOrderByTime').on('click', function () {
        var activeStatus = $(this).hasClass("active");
        if (!activeStatus){
            $(this).toggleClass("active");
            $("#tableOrderByType").toggleClass("active");
            $("#editor1").html(genTable());
        }
    });
    $('#tableOrderByType').on('click', function () {
        var activeStatus = $(this).hasClass("active");
        if (!activeStatus){
            $(this).toggleClass("active");
            $("#tableOrderByTime").toggleClass("active");
            $("#editor1").html(genTable());
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
            row['hades'] === true ||
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
                hades: row['hades'],
                lightShadow: row['lightShadow']
            };
        }

    });
    $.myStorage.save('selectedStar5_ja',save);
}

function freeTableHandle() {
    // Table icon click events
    window.operateEventsFree = {
        'click .icon': function (e, value, row, index) {

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
                value = ($(e.target).val()) ? parseInt($(e.target).val()) : 0;
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
        formatter: imageCell,
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
    $.myStorage.save('selectedFree_ja',save);
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
        width: 200,
        formatter: imageCell,
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
    $.myStorage.save('selectedStar4_ja',save);
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
                row["had5"] = false;
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
        width: 200,
        formatter: imageCell,
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
    $.myStorage.save('selectedSp_ja',save);
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

    if (asType && num == null){
        return '<i class="fa fa-user-friends' + exClassName + starColor +'"></i>';
    }

    if (asType){
        starColor = ' star-as';
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

function genTeamCheckCanvas() {
    // TODO Gen canvas not plugin
    // $("#canvas").size(200,800).canvasAdd();
    // $("#download").downloadCanvas();

    $("#download_canvas").buttonLoading("loading");
    $("#canvas").html("").hide();
    $("#imageOutput").html("");
    $("#html_canvas").show();

    var dialog = bootbox.dialog({
        message: '<p class="text-center mb-0"><i class="fas fa-circle-notch fa-spin"></i> 正在取得牛棚...</p>',
        closeButton: false
    });


    var data = $('#char_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
    var settings = getSettings();
    var showAsBooks = settings['showAsBooks']['val'];
    var showNotGet = settings['showNotGet']['val'];

    data = data.slice();
    data = data.sort(function (a,b) {
        return a.element.localeCompare(b.element,'zh-TW');
    });

    var asData = [];
    if (showAsBooks){
        asData = $('#as_book_table').bootstrapTable('getData',{useCurrentPage:false,includeHiddenRows:true,unfiltered:true});
    }

    var result = data.reduce(function (r, a) {
            r[a.element] = r[a.element] || [];
            r[a.element].push(a);
            return r;
        }, Object.create(null));

    var image = $.map(result, function (rows, elementType) {
        var element = "";
        var imageAndName = "";
        var css = elementCellStyle(elementType);
        var bg = css.css["background-color"];

        var getted = rows.filter(function(r){return (r.had5 === true || r.had4 === true || r.hadas || r.hades);}).length;

        element = [
            '<div class="w-100 p-0 mb-2" ' + 'style="background-color:' + bg + ';">',
            '   <strong class="ml-2" style="font-size: 25px;">' + " ■" + elementType + '屬性 ' + getted + " / " + rows.length + "</strong>",
            '</div>',
            '<div style="clear: left;"></div>'
        ].join('\n');

        rows.sort(function(a, b) {
            var ac = 0;
            var bc = 0;
            if (a.had5 === true) ac = ac+1;
            if (a.had4 === true) ac = ac+1;
            if (a.hadas === true) ac = ac+1;
            if (a.hades === true) ac = ac+1;
            if (b.had5 === true) bc = bc+1;
            if (b.had4 === true) bc = bc+1;
            if (b.hadas === true) bc = bc+1;
            if (b.hades === true) bc = bc+1;
            if (ac > bc) return -1;
            if (ac < bc) return 1;
            return 0;
        });

        imageAndName = $.map(rows,function (row) {
            var nickname = row['nickname'];
            if ($.trim(nickname) === ''){
                nickname = "-"
            }
            var asNickname = row['nickname'];
            if ($.trim(row['asNickname'])){
                asNickname = row['asNickname'];
            }

            var stars = genStarList(4, 5,
                {
                    '1':false,
                    '2':false,
                    '3':false,
                    '4':false,
                    '5':false
                });

            var border = " border-warning";

            var opacity = 'opacity: 0.4';

            var as = "";
            if ($.trim(row.as) !== ''){
                if (row.hadas !== true) {
                    border = " border-light bg-transparent text-secondary";
                }
                if (row.hadas === true) {
                    stars = genStar("",true,0,true) +
                        genStar("",true,0,true) + " " +
                        genStar("",true,0,true) + " " +
                        genStar("",true,0,true) + " " +
                        genStar("",true,0,true);
                }
                as = [
                    '<div class="card m-1 float-left position-relative' + border + '" style="width: 130px; border-width: 5px;' + ((row.hadas === true) ? "": opacity+";" ) + '">',
                    //'   <img class="card-img-top" src="./images/characters/as/' + row["enName"]+'.jpg">',
                    '   <img class="card-img-top" src="./images/characters_icon/as/' + row["jpName"]+'.jpg">',
                    '   <div class="ml-1 text-info position-absolute">' + stars + '</div>',
                    '   <div class="card-body p-0 m-0 position-absolute" style="bottom: 0px; background-color: rgba(255, 255, 255, 0.7);">',
                    '       <p class="card-title m-0" style="font-family: \'Noto Sans TC\'"><strong>' + row["jpName"] + 'AS</strong></p>',
                    '   </div>',
                    '</div>'
                ].join('\n');
            }

            border = " border-warning";
            var es = "";
            if ($.trim(row.es) !== ''){
                if (row.hades !== true) {
                    border = " border-light bg-transparent text-secondary";
                }
                if (row.hades === true) {
                    stars = genStar("",true,0,true) +
                        genStar("",true,0,true) + " " +
                        genStar("",true,0,true) + " " +
                        genStar("",true,0,true) + " " +
                        genStar("",true,0,true);
                }
                es = [
                    '<div class="card m-1 float-left position-relative' + border + '" style="width: 130px; border-width: 5px;' + ((row.hades === true) ? "": opacity+";" ) + '">',
                    //'   <img class="card-img-top" src="./images/characters/es/' + row["enName"]+'.jpg">',
                    '   <img class="card-img-top" src="./images/characters_icon/es/' + row["jpName"]+'.jpg">',
                    '   <div class="ml-1 text-info position-absolute">' + stars + '</div>',
                    '   <div class="card-body p-0 m-0 position-absolute" style="bottom: 0px; background-color: rgba(255, 255, 255, 0.7);">',
                    '       <p class="card-title m-0" style="font-family: \'Noto Sans TC\'"><strong>' + row["jpName"] + 'ES</strong></p>',
                    '   </div>',
                    '</div>'
                ].join('\n');
            }



            if (row.had5 === true) {
                border = " border-warning";
                stars = genStarList(4, 5,
                    {
                        '1':true,
                        '2':true,
                        '3':true,
                        '4':true,
                        '5':true
                    });
            }
            if (row.had5 !== true && row.had4 === true) {
                border = " border-secondary";
                var max = 5;
                if (row.had5 === "none") max = 4;
                stars = genStarList(4, max,
                    {
                        '1':true,
                        '2':true,
                        '3':true,
                        '4':true,
                        '5':false
                    });
            }else if (row.hadas === true && row.had5 === "none"){
                stars = genStar("",true,0,true) +
                    genStar("",true,0,true) + " " +
                    genStar("",true,0,true) + " " +
                    genStar("",true,0,true) + " " +
                    genStar("",false,-1);
            }else if (row.had5 === "none"){
                stars = genStar("star-gray",true,0,true) +
                    genStar("star-gray",true,0,true) + " " +
                    genStar("star-gray",true,0,true) + " " +
                    genStar("star-gray",true,0,true) + " " +
                    genStar("star-gray",false,-1);
            }
            if (row.had5 !== true && row.had4 !== true) border = " border-light bg-transparent text-secondary";
            return [
                '<div class="card m-1 float-left position-relative' + border + '" style="width: 130px; border-width: 5px;' + ((row.had5 === true || row.had4 === true) ? "": opacity+";" ) + '">',
                //'   <img class="card-img-top" src="./images/characters/' + row["enName"]+'.jpg">',
                '   <img class="card-img-top" src="./images/characters_icon/' + row["jpName"]+'.jpg">',
                '   <div class="ml-1 position-absolute">' + stars + '</div>',
                '   <div class="card-body p-0 m-0 position-absolute" style="bottom: 0px; background-color: rgba(255, 255, 255, 0.7);">',
                ((row.had4 || row.had5 || row.hadas || row.hades) && row["lightShadow"] > 0 && row["lightShadow"] <= 255) ? '       <p class="card-text m-0">' + row["lightShadowType"] + " " + row["lightShadow"]  + '</p>' : '',
                '       <p class="card-title m-0" style="font-family: \'Noto Sans TC\'"><strong>' + row["jpName"] + '</strong></p>',
                '   </div>',
                '</div>',
                as,
                es
            ].join('\n');
        }).join('\n');

        return '<div class="d-block mb-2 bg-light">' + element + '<div class="d-block clearfix">' + imageAndName + '</div>' + '</div>' + '<div style="clear: left;"></div>';
    });


    $("#html_canvas").html(image);

    var imagesLength = $("#html_canvas img.card-img-top").length;
    var imagesLoaded = 0;

    $('#html_canvas').imagesLoaded()
        .always( function( instance ) {
            console.log('images loaded');
            var canvasHeight = $("#html_canvas").height();

            dialog.init(function(){
                dialog.find('.bootbox-body').html('<p class="text-center mb-0"><i class="fas fa-circle-notch fa-spin"></i> 牛棚處理中...</p>');
            });

            var scaleOption = $("#imageSize").val();

            setTimeout(function () {
                dialog.init(function(){
                    dialog.find('.bootbox-body').html('<p class="text-center mb-0"><i class="fas fa-circle-notch fa-spin"></i> 開始建立圖片...</p>');
                });
                $("#html_canvas").html2canvas(
                    function (ele) {
                        dialog.init(function(){
                            dialog.find('.bootbox-body').html('<p class="text-center mb-0"><i class="fas fa-circle-notch fa-spin"></i> 圖片正在建立...</p>');
                        });
                    },
                    function (canvas, ele) {
                        dialog.init(function(){
                            dialog.find('.bootbox-body').html('<p class="text-center mb-0"><i class="fas fa-circle-notch fa-spin"></i> 圖片正在完成...</p>');
                        });

                        $("#canvas").html($(canvas).attr("id", "team_canvas"));
                        $("#download_canvas").buttonLoading("reset");
                        $("#download_canvas").downloadCanvas("team_canvas");

                        $("#canvas").hide();
                        var image = canvas.toDataURL("image/jpg");
                        $(ele).hide();
                        $("#imageOutput").html($("<img>").attr("src", image).css("width", "100%"));

                        dialog.modal('hide');
                    },
                    null,
                    scaleOption
                );
            }, 1000);

        })
        .progress( function( instance, image ) {
            var result = image.isLoaded ? 'loaded' : 'broken';
            imagesLoaded = imagesLoaded + 1;
            dialog.init(function(){
                dialog.find('.bootbox-body').html('<p class="text-center mb-0"><i class="fas fa-circle-notch fa-spin"></i> 正在取得牛棚 ' + imagesLoaded + ' / ' + imagesLength + '</p>');
            });
        });

    $("#imageSize").unbind('change').on("change", function (ele) {
        var scaleOption = $(this).val();
        $("#canvas").html("").hide();
        $("#imageOutput").html("");
        $("#html_canvas").show();
        $("#download_canvas").buttonLoading("loading");

        dialog.modal('show');
        dialog.init(function(){
            dialog.find('.bootbox-body').html('<p class="text-center mb-0"><i class="fas fa-circle-notch fa-spin"></i> 正在重新建立...</p>');
        });

        setTimeout(function () {
            $("#html_canvas").html2canvas(
                function (ele) {
                    dialog.init(function(){
                        dialog.find('.bootbox-body').html('<p class="text-center mb-0"><i class="fas fa-circle-notch fa-spin"></i> 圖片正在建立...</p>');
                    });
                },
                function (canvas, ele) {
                    dialog.init(function(){
                        dialog.find('.bootbox-body').html('<p class="text-center mb-0"><i class="fas fa-circle-notch fa-spin"></i> 圖片正在完成...</p>');
                    });

                    $("#canvas").html($(canvas).attr("id", "team_canvas"));
                    $("#download_canvas").buttonLoading("reset");
                    $("#download_canvas").downloadCanvas("team_canvas");

                    $("#canvas").hide();
                    var image = canvas.toDataURL("image/jpg");
                    $(ele).hide();
                    $("#imageOutput").html($("<img>").attr("src", image).css("width", "100%"));

                    dialog.modal('hide');
                },
                null,
                scaleOption
            );
        }, 300);

    });

}
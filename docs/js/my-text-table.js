/**
 *  jQuery text table generator
 * Designed for Another eden team picker, used to generate array to table
 * Copyrighted AlexWong
 * https://github.com/otoha-helper
 */

(function ($) {
    'use strict';
    $.extend({
        toFullWidthNumber: function(number, target, max, userSpaceText, userHalfSpaceText, addPlus) {
            var space = (typeof userSpaceText !== 'undefined') ?  userSpaceText : '＿';
            var halfSpace = (typeof userHalfSpaceText !== 'undefined') ?  userHalfSpaceText : '_';
            max = (typeof max !== 'undefined') ?  max : 99;
            target = (typeof target !== 'undefined') ?  target : 2;
            addPlus = (typeof addPlus !== 'undefined') ?  addPlus : false;
            if (number > max) {
                number = max;
            }
            if (number === max && addPlus) number = number + "＋";
            number = "" + number;
            number = number.replace(/[0-9]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);});
            return stringPad(number, target, '<', space, halfSpace);
        },
        stringPad: function(str, target, type, userSpaceText, userHalfSpaceText) {
            str = (typeof str !== 'undefined') ?  str : '';
            var strLength;
            var space = (typeof userSpaceText !== 'undefined') ?  userSpaceText : '＿';
            var halfSpace = (typeof userHalfSpaceText !== 'undefined') ?  userHalfSpaceText : '_';
            var userType = (typeof type !== 'undefined') ? type : '<';
            strLength = $.findLength(String(str));
            if (strLength < target){
                var pad = "";
                for (var i = 0; i < (Math.floor(target) - Math.floor(strLength)); i++){
                    pad += space;
                }
                if (target - Math.floor(strLength) === 0.5 || (strLength === 0 && (target - Math.floor(target) === 0.5))){
                    pad += halfSpace;
                }
                if (userType === "<"){
                    return ((Math.ceil(strLength) - Math.floor(strLength))?"&ensp;":"") + pad + str;
                }else if (userType === ">"){
                    return str + pad + ((Math.ceil(strLength) - Math.floor(strLength))?"&ensp;":"");
                }
            }
            return str;
        },
        strLoop: function(str, target){
            var loop = "";
            for (var i = 0; i < Math.ceil(target); i++){
                loop += str;
            }
            return loop;
        },
        /** @see https://en.wikibooks.org/wiki/Unicode/Character_reference/2000-2FFF */
        findLength: function(str){
            var half, full, chi, star;
            half = str.match(/[\u0000-\u00ff]/g) || [];	//半形
            chi = str.match(/[\u4e00-\u9fa5]/g) || [];	//中日韓
            full = str.match(/[\uff00-\uffff]/g) || [];	//全形
            star = str.match(/[\u2605-\u2606]/g) || [];  //★☆

            return (half.length / 2) + chi.length + full.length + star.length;
        }

    });

    $.extend({
        textTable: {
            _list: {},
            _header: [],
            _cols: [],
            _align: '<',
            _default: {},
            _options: {
                'type': 'text',
                'whiteText':'&emsp;',
                'spaceText':'＿',
                'halfSpaceText':'_',
                'divide':' | ',
                'numberMax':255,
                'textWidth':20
            },
            _beforeRow: false,
            _processRow: function(row, index, data, cols, options){
                var firstRow;
                var selectedRow;
                if (cols.length){
                    firstRow = cols;
                }else{
                    firstRow = Object.values(row);
                }
                selectedRow = $.map(firstRow, function (value, index) {
                    if (cols.length){
                        value = row[value];
                    }
                    if (typeof value === "number"){
                        if (options.type === "text"){
                            value = $.toFullWidthNumber(value, options.colsMaxLength[index], options.numberMax, options.spaceText, options.halfSpaceText);
                        }else if(options.type === "table"){
                            value = $.toFullWidthNumber(value, $.findLength(String()), options.numberMax, options.spaceText, options.halfSpaceText);
                        }
                    }
                    if (options.colsMaxLength){
                        var align = '<';
                        if (typeof options.align === "string"){
                            align = options.align;
                        }else if (typeof options.align === "object"){
                            align = options.align[index];
                            if (typeof align === "number" && options.type === "text"){
                                return $.stringPad(value, options.align[index],undefined, options.spaceText, options.halfSpaceText);
                            }
                        }
                        if (options.type === 'table'){
                            if (align === "<"){
                                align = ' align="right"';
                            }else if (align === ">"){
                                align = ' align="left"';
                            }else {
                                align = ' align="center"';
                            }
                            return "<td" +
                                ((typeof value === "undefined") ? ' bgcolor="lightgray"' : '') +
                                align +
                                ((typeof align === "string") ? ' width="' + options.textWidth * options.colsMaxLength[index] + '"' : "") + ">" +
                                ((typeof value === "undefined") ? '<font color="lightgray">-</font>' : value) + "</td>";
                        }
                        return $.stringPad(value, options.colsMaxLength[index], align, options.spaceText, options.halfSpaceText);
                    }
                    return value;
                });
                if (options.type === "table"){
                    return "<tr>\n" + Object.values(selectedRow).join("\n") + "\n</tr>";
                }
                return options.divide + Object.values(selectedRow).join(options.divide) + options.divide;
            },
            _afterRow: false,
            setType: function(type){
                if (typeof type === "string"){
                    this._options.type = type;
                }
                return this;
            },
            setHeader: function(header, align){
                if (typeof header === "object"){
                    this._header = header;
                }
                if (typeof align === "object"){
                    this._align = align;
                }
                return this;
            },
            setCols: function(cols){
                if (typeof cols === "object"){
                    this._cols = cols;
                }
                return this;
            },
            setList: function(list){
                this._list = jQuery.extend(true, {}, list);
                return this;
            },
            setBeforeRow: function(action){
                if (typeof action === "function" || action === false){
                    this._beforeRow = action;
                }
                return this;
            },
            setAfterRow: function(action){
                if (typeof action === "function" || action === false){
                    this._afterRow = action;
                }
                return this;
            },
            setProcessRow: function(action){
                if (typeof action === "function"){
                    if (typeof this._default._processRow === "undefined"){
                        this._default._processRow = this._processRow;
                    }
                    this._processRow = action;
                }else if(action === 'default' && typeof this._default._processRow === "function"){
                    this._processRow = this._default._processRow;
                }
                return this;
            },
            setOptions: function(options){
                if (typeof options === "object"){
                    this._options = jQuery.extend(true, this._options, options);
                }
                return this;
            },
            generate : function () {
                if (Object.keys(this._list).length === 0){
                    return [];
                }
                var header = this._header;
                var beforeRow = this._beforeRow;
                var processRow = this._processRow;
                var afterRow = this._afterRow;
                var data = this._list;
                var dataLength = Object.keys(data).length;
                var cols = this._cols;
                var options = this._options;
                options.align = this._align;
                var headerRow;
                if (cols.length){
                    headerRow = cols;
                }else{
                    headerRow = Object.values(data[0]);
                }
                options.colsMaxLength = $.map(headerRow, function (key, index) {
                    var maxLength = 0;
                    var value = key;
                    if (header.length){
                        maxLength = $.findLength(header[index]);
                    }
                    $.map(data, function(row){
                        var length;
                        if (cols.length){
                            value = row[key];
                        }else{
                            var keys = Object.keys(row);
                            value = row[keys[index]];
                        }
                        length = $.findLength(String(value));
                        if (typeof value === "number"){
                            length = $.findLength( $.toFullWidthNumber(value,undefined, options.numberMax, options.spaceText, options.halfSpaceText));
                        }
                        if (length > maxLength) maxLength = length;
                    });
                    if (typeof options.align[index] === "number"){
                        maxLength = options.align[index];
                    }
                    return maxLength;
                });

                var headerRows = [];
                if (cols.length && header.length && options.colsMaxLength){
                    var headerString = $.map(header, function (value, index) {
                        var align = '<';
                        if (typeof options.align === "string"){
                            align = options.align;
                        }else if (typeof options.align === "object"){
                            align = options.align[index];
                        }
                        if (options.type === 'table'){
                            if (align === "<"){
                                align = ' align="right"';
                            }else if (align === ">"){
                                align = ' align="left"';
                            }else {
                                align = ' align="center"';
                            }
                            return "<th" + align + ((typeof align === "string") ? ' width="' + options.textWidth * options.colsMaxLength[index] + '"' : "") + ">" + value + "</th>";
                        }
                        return $.stringPad(value, options.colsMaxLength[index], align, options.spaceText, options.halfSpaceText);
                    });
                    if (options.type === "table"){
                        headerString = '<thead>\n<tr height="' + options.textWidth + '">\n' + headerString.join("\n") + "\n</tr>\n</thead>\n";
                        headerRows = [headerString];
                    }else{
                        headerString = options.divide + headerString.join(options.divide) + options.divide;
                        var headerLineRow = options.divide + $.map(options.colsMaxLength, function (maxLength) {
                            return $.stringPad('', maxLength, undefined, options.spaceText, options.halfSpaceText);
                        }).join(options.divide) + options.divide;
                        headerRows = [headerString, headerLineRow];
                    }
                }

                return $.merge(headerRows, $.map(data, function(row, i){
                    var stringRow = '';
                    var tbodyOpen = "<tbody>\n";
                    var tbodyClose = "</tbody>\n";
                    if (typeof beforeRow === "function"){
                        var br = beforeRow(row, i, data, cols, options);
                        if (i == 0 && !br) return tbodyOpen;
                        if (i == dataLength - 1 && !br) return tbodyClose;
                        if (!br) return;
                        if (typeof br === "object"){
                            row = br;
                            if (typeof br.updatedRow !== "undefined"){
                                row = br.updatedRow;
                            }
                            if (typeof br.prependString !== "undefined"){
                                stringRow += br.prependString;
                            }
                        }else if (typeof br === "string"){
                            stringRow += br;
                        }
                    }

                    stringRow += processRow(row, i, data, cols, options);

                    if (typeof afterRow === "function") {
                        stringRow += afterRow(row, i, data, cols, options);
                    }
                    if (options.type === "table"){
                        if (i == 0){
                            return tbodyOpen + stringRow;
                        }
                        if (i == dataLength - 1){
                            return stringRow + tbodyClose;
                        }
                    }
                    return stringRow;
                }));
            }
        }
    });

})(jQuery);
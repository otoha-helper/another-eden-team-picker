/**
 *  jQuery text table generator
 * Designed for Another eden team picker, used to generate array to table
 * Copyrighted AlexWong
 * https://github.com/otoha-helper
 */

(function ($) {
    'use strict';
    $.extend({
        toFullWidthNumber: function(number, target, max, addPlus) {
            max = (typeof max !== 'undefined') ?  max : 99;
            target = (typeof target !== 'undefined') ?  target : 2;
            addPlus = (typeof addPlus !== 'undefined') ?  addPlus : false;
            if (number > max) {
                number = max;
            }
            if (number === max && addPlus) number = number + "＋";
            number = "" + number;
            number = number.replace(/[0-9]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);});
            return stringPad(number, target, '<');
        },
        stringPad: function(str, target, type, userSpaceText) {
            str = (typeof str !== 'undefined') ?  str : '';
            var strLength = 0;
            var space = (typeof userSpaceText !== 'undefined') ?  userSpaceText : '＿';
            var userType = (typeof type !== 'undefined') ? type : '<';
            strLength = $.findLength(String(str));
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
            chi = str.match(/[\u4e00-\u9fa5]/g) || [];	//中文
            full = str.match(/[\uff00-\uffff]/g) || [];	//全形
            star = str.match(/[\u2605-\u2606]/g) || [];  //★☆

            return (half.length / 2) + chi.length + full.length + star.length;
        }

    });

    $.extend({
        textTable: {
            _list: {},
            _type: 'text',
            _header: [],
            _cols: [],
            _align: '<',
            _options: {
                'whiteText':'&emsp;',
                'spaceText':'＿',
                'divide':' | ',
                'numberMax':255
            },
            _beforeRow: false,
            _processRow: function(row, index, data, cols, options){
                var selectedRow = row;
                if (cols.length){
                    selectedRow = $.map(cols, function (key, index) {
                        var value = row[key];
                        if (typeof value === "number"){
                            value = $.toFullWidthNumber(value,options.colsMaxLength[index],options.numberMax);
                        }
                        if (options.colsMaxLength){
                            var align = '<';
                            if (typeof options.align === "string"){
                                align = options.align;
                            }else if (typeof options.align === "object"){
                                align = options.align[index];
                                if (typeof align === "number"){
                                    return $.stringPad(value, options.align[index],undefined, options.spaceText);
                                }
                            }
                            return $.stringPad(value, options.colsMaxLength[index], align, options.spaceText);
                        }
                        return value;
                    });
                }
                return options.divide + Object.values(selectedRow).join(options.divide) + options.divide;
            },
            _afterRow: false,
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
                this._beforeRow = action;
                return this;
            },
            setAfterRow: function(action){
                this._afterRow = action;
                return this;
            },
            setProcessRow: function(action){
                this._processRow = action;
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
                var cols = this._cols;
                var options = this._options;
                options.align = this._align;
                if (cols.length){
                    options.colsMaxLength = $.map(cols, function (key, index) {
                        var maxLength = 0;
                        if (header.length){
                            maxLength = $.findLength(header[index]);
                        }
                        $.map(data, function(row){
                            var length = $.findLength(String(row[key]));
                            if (length > maxLength) maxLength = length;
                        });
                        if (typeof options.align[index] === "number"){
                            maxLength = options.align[index];
                        }
                        return maxLength;
                    });
                }

                var headerRows = [];
                if (cols && header && options.colsMaxLength){
                    var headerString = options.divide + $.map(header, function (value, index) {
                        var align = '<';
                        if (typeof options.align === "string"){
                            align = options.align;
                        }else if (typeof options.align === "object"){
                            align = options.align[index];
                        }
                        return $.stringPad(value, options.colsMaxLength[index], align, options.spaceText);
                    }).join(options.divide) + options.divide;

                    var headerLineRow = options.divide + $.map(options.colsMaxLength, function (value) {
                        return $.strLoop(options.spaceText, value);
                    }).join(options.divide) + options.divide;

                    headerRows = [headerString, headerLineRow];
                }


                return $.merge(headerRows, $.map(data, function(row, i){
                    var stringRow = '';
                    if (typeof beforeRow === "function"){
                        var br = beforeRow(row, i, data, cols, options);
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
                    return stringRow;
                }));
            }
        }
    });

})(jQuery);
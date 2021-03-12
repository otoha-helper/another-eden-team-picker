/**
 *  jQuery Local Storage and file Controller
 * Designed for Another eden team picker, used to read local file and storage.
 * Copyrighted AlexWong
 * https://github.com/otoha-helper
 */


(function ($) {
    'use strict';

    $.extend({
        /**
         *  Function to manage storage
         */
        myStorage:{
            /**
             *  Checking local storage had data or not
             * @returns {boolean}
             */
            checkExist: function(key){
                if (localStorage.length > 0 && typeof key === "string"){
                    return !!(localStorage.getItem(key));
                }
                return (localStorage.length > 0);
            },
            /**
             *  Get item of this key
             * @param key
             * @returns {array | object}
             */
            get: function(key){
                return JSON.parse(localStorage.getItem(key));
            },
            /**
             *  Save item to this key
             * @param key
             * @param item
             */
            save: function (key, item) {
                localStorage.setItem(key, JSON.stringify(item));
            },
            /**
             *  Remove item
             * @param key
             */
            remove: function (key) {
                localStorage.removeItem(key);
            },
            /**
             *  Clear local storage
             */
            clean: function () {
                localStorage.clear();
            }
        },
        /**
         *  Function to read files
         */
        myFileReader:{
            fileList: {},
            readLink: [],
            failedLink: [],
            loading: false,
            options:{
                type: 'GET',
                dataType: 'text',
                cache: false // Appends _={timestamp} to the request query string
            },
            /**
             * Setup ajax options
             * @param {string} [type = GET]
             * @param {string} [dataType = text]
             * @param {boolean} [cache = false]
             */
            setOptions: function(type, dataType, cache){
                if (typeof type !== "undefined"){
                    this.options.type = type;
                }
                if (typeof dataType !== "undefined"){
                    this.options.dataType = dataType;
                }
                if (typeof cache){
                    this.options.cache = cache
                }
                return this;
            },
            /**
             *
             * @param {string} key
             * @param {string} link
             * @param {function} [dataProcessCallback(data)]
             */
            addFile: function (key, link, dataProcessCallback) {
                this.fileList[key] = {'link':link, 'data':null, process:dataProcessCallback};
                return this;
            },
            /**
             *
             * @param {function} startCallback
             * @param {function} finishCallback(fileList)
             * @param {function} [doneCallback(key, data)] callback when one file get result data
             * @param {function} [errorCallback(key, errorThrown)] callback when error happened
             */
            do: function (startCallback, finishCallback, doneCallback, errorCallback) {
                var length = Object.keys(this.fileList).length;

                if (length === 0){
                    if (typeof errorCallback === "function"){
                        errorCallback(null, 'no file added');
                    }
                    return this;
                }

                var reader = this;

                this.loading = true;
                var fileList = this.fileList;
                var readLink = this.readLink;
                var failedLink = this.failedLink;

                if (typeof startCallback === "function"){
                    startCallback();
                }

                var dataType = this.options.dataType;

                $.ajaxSetup({
                    type: this.options.type,
                    dataType: dataType,
                    cache: this.options.cache
                });

                $.each(fileList, function (key, row) {
                    $.ajax({
                        url: row.link,
                        success:function (data) {
                            readLink.push(key);
                            var status = calcJob(reader);

                            if (typeof row.process === "function"){
                                data = row.process(data)
                            }else if (dataType === 'json'){
                                try{
                                    data = JSON.parse(data);
                                }catch (e) {
                                    errorCallback(key, e);
                                }
                            }
                            fileList[key]['data'] = data;
                            if (typeof doneCallback === "function"){
                                doneCallback(key, data);
                            }
                            if (status && typeof finishCallback === "function"){
                                finishCallback(fileList);
                            }
                        },
                        error:function (xhr, textStatus, errorThrown) {
                            failedLink.push(key);
                            var status = calcJob(reader);
                            if (typeof errorCallback === "function"){
                                errorCallback(key, errorThrown);
                            }
                            if (status && typeof finishCallback === "function"){
                                finishCallback(fileList);
                            }
                        }
                    });
                });

                function calcJob (reader) {
                    var length = Object.keys(reader.fileList).length;
                    if (length === 0){
                        return -1;
                    }
                    var processed = reader.readLink.length + reader.failedLink.length;
                    if (length === processed && reader.failedLink.length === 0){
                        reader.loading = false;
                        return true;
                    }else if (length === processed){
                        reader.loading = false;
                        return false;
                    }
                }
                return this;
            },
            /**
             *  Reset file reader to run new files
             */
            reset: function () {
                this.fileList = {};
                this.readLink = [];
                this.failedLink = [];
                this.loading = false;
            }
        }

    });


})(jQuery);
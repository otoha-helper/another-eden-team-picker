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
             * @returns {myStorage}
             */
            save: function (key, item) {
                localStorage.setItem(key, JSON.stringify(item));
                return this;
            },
            /**
             *  Remove item
             * @param key
             */
            remove: function (key) {
                localStorage.removeItem(key);
            },
            clean: function () {
                localStorage.clear();
            }
        },
        /**
         *  Function to reader file
         */
        myFileReader:{
            fileList: {},
            readLink: [],
            failedLink: [],
            loading: false,
            options:{
                type: 'get',
                dataType: 'text'
            },
            addFile: function (key, link, dataProcessCallback) {
                this.fileList[key] = {'link':link, 'data':null, process:dataProcessCallback};
                return this;
            },
            run: function (startCallback, finishCallback, doneCallback, errorCallback) {
                var length = Object.keys(this.fileList).length;

                if (length === 0){
                    return -1;
                }

                var reader = this;

                this.loading = true;
                var fileList = this.fileList;
                var readLink = this.readLink;
                var failedLink = this.failedLink;

                if (typeof startCallback === "function"){
                    startCallback();
                }

                $.each(fileList, function (key, row) {
                    $.ajax({
                        type: 'get',
                        url: row.link,
                        dataType: 'text',
                        success:function (data) {
                            readLink.push(key);
                            var status = calcJob(reader);
                            if (typeof row.process === "function"){
                                data = row.process(data)
                            }
                            fileList[key]['data'] = data;
                            if (typeof doneCallback === "function"){
                                doneCallback(key, data);
                            }
                            if (status && typeof finishCallback === "function"){
                                finishCallback(fileList);
                            }
                        },
                        error:function () {
                            failedLink.push(key);
                            var status = calcJob(reader);
                            if (typeof errorCallback === "function"){
                                errorCallback(key);
                            }
                            if (status && typeof finishCallback === "function"){
                                finishCallback();
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

            }
        }

    });


})(jQuery);
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var overphish = {
    scanQr: function()
        {
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    overphish.hideError();

                    if(result.cancelled) {
                        return;
                    }

                    if(result.format != "QR_CODE") { 
                        overphish.showError('The bar code scanned is not a QR code');
                        return;
                    }

                    if(!result.text) {
                        overphish.showError('We were unable to scan that bar code');
                        return;
                    }

                    try {
                        data = JSON.parse(result.text);
                    } catch (e) {
                        overphish.showError('We were unable to read that barcode');
                        return;
                    }

                    overphish.showLoading(); 
                    overphish.callServer(data.token, data.key, data.iv, renderPage);
                },
                function (error) {
                    overphish.showError(error);
                    overphish.hideLoading();
                }
           );
        },

        callServer: function(token, key, iv, callback) {
            $.ajax({
                method: "GET",
                url: "https://api.overphish.com/app",
                data: { 
                    token: token,
                    key: key,
                    iv: iv
                }
            })
            .done(function( data ) {
                overphish.hideError();
                callback(data);
            })
            .fail(function(data) {
                overphish.hideLoading();

                if (data.responseJSON.message) {
                    overphish.showError(data.responseJSON.message);
                    return;
                }

                overphish.showError('We were unable to contact the Overphish server');
            });
        },

        showError: function(message){
            $('#div-error-alert').show();
            $('#div-error-message').text(message);
        },

        hideError: function() {
            $('#div-error-alert').hide();
        },

        showLoading: function(message){
            $('#div-loader').show();
        },

        hideLoading: function() {
            $('#div-loader').hide();
        },

        showReceipt: function() {
            $('#div-receipt').show();
        },

        hideReceipt: function() {
            $('#div-receipt').hide();
        },

        renderPage: function(data) {
            overphish.hideLoading();

            // check for fingerprint alert
            if(data.fingerprint_alert_on) {
                overphish.showError(data.fingerprint_message);
                overphish.hideReceipt();
            } else {
                overphish.hideError();
                overphish.showReceipt();
            }

            $('#span-receipt-sender-address').html(data.sender_address);
            $('#span-receipt-sender-name').text(data.sender_name);

            // email data
            $('#span-receipt-email-subject').text(data.email_subject);
            $('#span-receipt-email-from').text(data.email_from);
            $('#span-receipt-email-to').text(data.email_to);
            $('#span-receipt-email-date').text(data.email_date);
        }
};


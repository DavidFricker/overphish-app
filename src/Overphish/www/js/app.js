var overphish = {
    scanQr: function()
        {
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    overphish.hideError();

                    if (result.cancelled) {
                        return;
                    }

                    if (result.format != "QR_CODE") { 
                        overphish.showError('The bar code scanned is not a QR code');
                        return;
                    }
                    if (!result.text) {
                        overphish.showError('We were unable to scan that bar code');
                        return;
                    }

                    overphish.hideReceipt();
                    overphish.showLoading(); 
                    overphish.callServer(result.text, overphish.renderPage);
                },
                function (error) {
                    overphish.showError(error);
                    overphish.hideLoading();
                }
           );
        },

        callServer: function(blob, callback) {
            var func = callback;
            $.ajax({
                method: "GET",
                url: "https://api.overphish.com/app",
                data: { 
                    blob: blob
                }
            })
            .done(function(data) {
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

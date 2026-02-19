jQuery(document).ready(function($) {
    let currentStep = 1;
    const totalSteps = 5;

    function getAgeStage(age) {
        const a = parseInt(age, 10);
        if (isNaN(a)) return { key: '', label: '' };
        if (a >= 2 && a <= 17) return { key: 'teen', label: 'نوجوان' };
        if (a >= 18 && a <= 29) return { key: 'young', label: 'جوان' };
        if (a >= 30 && a <= 49) return { key: 'middle_age', label: 'میانسال' };
        if (a >= 50 && a <= 100) return { key: 'adult', label: 'بزرگسال' };
        return { key: '', label: '' };
    }

    // Helper: update range output text and position (LTR/RTL aware)
    function updateRangeOutput($range) {
        if (!$range || !$range.length) return;
        const id = $range.attr('id');
        const $output = $('#' + id + '-display');
        if (!$output.length) return;

        const val = $range.val();
        if ($range.hasClass('enhanced-slider') && id === 'age') {
            const stage = getAgeStage(val);
            if (stage.label) {
                $output.text(val + ' - ' + stage.label);
            } else {
                $output.text(val);
            }
            const $hiddenStage = $('#age_stage');
            if ($hiddenStage.length) {
                $hiddenStage.val(stage.key);
            }
        } else {
            $output.text(val);
        }

        if ($range.hasClass('enhanced-slider')) {
            return;
        }

        const min = parseFloat($range.attr('min')) || 0;
        const max = parseFloat($range.attr('max')) || 100;
        const percentage = ((val - min) / (max - min)) * 100;

        // If container is RTL, mirror the position so bubble follows the thumb
        const isRtl = $range.closest('.mattress-wizard').css('direction') === 'rtl';
        const pos = isRtl ? (100 - percentage) : percentage;

        $output.css({ left: `${pos}%`, right: 'auto' });
    }

    // Initialize wizard
    updateProgressBar();
    updateNavigationButtons();
    // Initialize range outputs on load
    $('#age, #height, #weight').each(function() { 
        updateRangeOutput($(this));
        updateSliderProgress($(this));
    });
    
    // Next button click
    $('#next-btn').on('click', function() {
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                nextStep();
            }
        }
    });
    
    // Previous button click
    $('#prev-btn').on('click', function() {
        if (currentStep > 1) {
            prevStep();
        }
    });
    
    // Form submission
    $('#mattress-advisor-form').on('submit', function(e) {
        e.preventDefault();
        
        if (validateCurrentStep()) {
            submitForm();
        }
    });
    
    // Step navigation functions
    function nextStep() {
        $('#step-' + currentStep).removeClass('active');
        currentStep++;
        $('#step-' + currentStep).addClass('active');
        updateProgressBar();
        updateNavigationButtons();
        updateStepStatus();
        scrollToTop();
    }
    
    function prevStep() {
        $('#step-' + currentStep).removeClass('active');
        currentStep--;
        $('#step-' + currentStep).addClass('active');
        updateProgressBar();
        updateNavigationButtons();
        scrollToTop();
    }
    
    function updateProgressBar() {
        const progressPercentage = (currentStep / totalSteps) * 100;
        $('#progress-fill').css('width', progressPercentage + '%');
        
        // Update step indicators
        $('.step').removeClass('active completed');
        for (let i = 1; i <= currentStep; i++) {
            if (i === currentStep) {
                $('.step[data-step="' + i + '"]').addClass('active');
            } else if (i < currentStep) {
                $('.step[data-step="' + i + '"]').addClass('completed');
            }
        }
    }
    
    function updateNavigationButtons() {
        // Previous button
        if (currentStep === 1) {
            $('#prev-btn').hide();
        } else {
            $('#prev-btn').show();
        }
        
        // Next/Submit button
        if (currentStep === totalSteps) {
            $('#next-btn').hide();
            $('#submit-btn').show();
        } else {
            $('#next-btn').show();
            $('#submit-btn').hide();
        }
    }
    
    function updateStepStatus() {
        $('.step[data-step="' + (currentStep - 1) + '"]').removeClass('active').addClass('completed');
    }
    
    function scrollToTop() {
        $('html, body').animate({
            scrollTop: $('#mattress-advisor-container').offset().top - 20
        }, 300);
    }
    
    // Validation functions
    function validateCurrentStep() {
        const currentStepElement = $('#step-' + currentStep);
    // Find required inputs and required radio groups
    const requiredFields = currentStepElement.find('[required]');
        let isValid = true;
        
        // Clear previous error states
        currentStepElement.find('.form-group').removeClass('error success');
        currentStepElement.find('.error-message').remove();
        
        requiredFields.each(function() {
            const field = $(this);
            const fieldGroup = field.closest('.form-group');

            // Handle radio groups: only validate the first radio in the group (they share a name)
            if (field.is(':radio')) {
                const name = field.attr('name');
                const radios = currentStepElement.find('input[type="radio"][name="' + name + '"]');
                const checked = radios.is(':checked');

                if (!checked) {
                    fieldGroup.addClass('error');
                    // Avoid duplicate messages
                    if (fieldGroup.find('.error-message').length === 0) {
                        fieldGroup.append('<div class="error-message">لطفاً یک گزینه انتخاب کنید</div>');
                    }
                    isValid = false;
                } else {
                    fieldGroup.addClass('success');
                }
                // Skip further per-field checks for radios
                return;
            }

            if (!field.val() || field.val().trim() === '') {
                fieldGroup.addClass('error');
                fieldGroup.append('<div class="error-message">این فیلد الزامی است</div>');
                isValid = false;
            } else {
                // Additional validation based on field type
                if (field.attr('type') === 'tel') {
                    const mobilePattern = /^09[0-9]{9}$/;
                    if (!mobilePattern.test(field.val())) {
                        fieldGroup.addClass('error');
                        fieldGroup.append('<div class="error-message">شماره موبایل معتبر نیست</div>');
                        isValid = false;
                    } else {
                        fieldGroup.addClass('success');
                    }
                } else if (field.attr('type') === 'number') {
                    const min = parseInt(field.attr('min'));
                    const max = parseInt(field.attr('max'));
                    const value = parseInt(field.val());
                    
                    if (min && value < min) {
                        fieldGroup.addClass('error');
                        fieldGroup.append('<div class="error-message">مقدار باید بیشتر از ' + min + ' باشد</div>');
                        isValid = false;
                    } else if (max && value > max) {
                        fieldGroup.addClass('error');
                        fieldGroup.append('<div class="error-message">مقدار باید کمتر از ' + max + ' باشد</div>');
                        isValid = false;
                    } else {
                        fieldGroup.addClass('success');
                    }
                } else {
                    fieldGroup.addClass('success');
                }
            }
        });
        
        if (!isValid) {
            // Scroll to first error
            const firstError = currentStepElement.find('.form-group.error').first();
            if (firstError.length) {
                $('html, body').animate({
                    scrollTop: firstError.offset().top - 100
                }, 300);
            }
        }
        
        return isValid;
    }
    
    // Form submission
    function submitForm() {
        const formData = $('#mattress-advisor-form').serialize();
        const ajaxData = formData + '&action=get_mattress_recommendation&nonce=' + mattress_form.nonce;
        
        // Show loading state
        $('#mattress-advisor-form').hide();
        $('.wizard-progress').hide();
        $('#mattress-result').html(`
            <div class="loading-spinner"></div>
            <h3>در حال پردازش اطلاعات شما...</h3>
            <p>لطفاً صبر کنید</p>
        `).show();
        $('#mattress-result').parent().addClass('loading');
        
        // Disable submit button
        $('#submit-btn').prop('disabled', true).text('در حال پردازش...');
        
        $.ajax({
            url: mattress_form.ajax_url,
            type: 'POST',
            data: ajaxData,
            success: function(response) {
                $('#submit-btn').prop('disabled', false).text('🔍 دریافت پیشنهاد تشک');
                $('#mattress-result').parent().removeClass('loading').addClass('success');
                
                if (response.success) {
                    $('#mattress-result').html(`
                        <div class="result-success">
                            <h3>🎉 پیشنهاد تشک مناسب برای شما</h3>
                            ${response.data && response.data.html ? response.data.html : ''}
                        </div>
                    `);
                } else {
                    $('#mattress-result').parent().removeClass('success').addClass('error');
                    $('#mattress-result').html(`
                        <div class="result-error">
                            <h3>❌ خطا در پردازش</h3>
                            <p>${typeof response.data === 'string' ? response.data : 'هیچ محصولی با شرایط شما یافت نشد.'}</p>
                            <button onclick="goToStep(${totalSteps})" class="nav-btn next-btn">بازگشت به مرحله قبل</button>
                        </div>
                    `);
                }
            },
            error: function() {
                $('#submit-btn').prop('disabled', false).text('🔍 دریافت پیشنهاد تشک');
                $('#mattress-result').parent().removeClass('loading').addClass('error');
                $('#mattress-result').html(`
                    <div class="result-error">
                        <h3>❌ خطا در ارتباط با سرور</h3>
                        <p>لطفاً دوباره تلاش کنید</p>
                        <button onclick="goToStep(${totalSteps})" class="nav-btn next-btn">بازگشت به مرحله قبل</button>
                    </div>
                `);
            }
        });
    }
    
    // Real-time validation and inputs handling
    $('input, select').on('blur change input', function() {
        const field = $(this);
        const fieldGroup = field.closest('.form-group');

        // If it's a radio, validate the group
        if (field.is(':radio')) {
            const name = field.attr('name');
            const radios = $('input[type="radio"][name="' + name + '"]');
            const checked = radios.is(':checked');

            if (field.prop('required') && checked) {
                fieldGroup.removeClass('error').addClass('success');
                fieldGroup.find('.error-message').remove();
            } else if (field.prop('required') && !checked) {
                fieldGroup.removeClass('success').addClass('error');
                if (fieldGroup.find('.error-message').length === 0) {
                    fieldGroup.append('<div class="error-message">لطفاً یک گزینه انتخاب کنید</div>');
                }
            }
            return;
        }

        // Special handling for range sliders (age, height, weight)
        if (field.is('input[type="range"]')) {
            updateRangeOutput(field);
            if (field.prop('required') && field.val()) {
                fieldGroup.removeClass('error').addClass('success');
                fieldGroup.find('.error-message').remove();
            }
            return;
        }

        if (field.prop('required') && field.val()) {
            fieldGroup.removeClass('error').addClass('success');
            fieldGroup.find('.error-message').remove();
        }
    });

    // Update range inputs display while sliding (age, height, and weight)
    $(document).on('input change', '#age, #height, #weight', function() {
        updateRangeOutput($(this));
        updateSliderProgress($(this));

        const val = $(this).val();
        const fieldGroup = $(this).closest('.form-group');
        if ($(this).prop('required') && val) {
            fieldGroup.removeClass('error').addClass('success');
            fieldGroup.find('.error-message').remove();
        }
    });

    // Quick value buttons functionality
    $(document).on('click', '.quick-value-btn', function() {
        const target = $(this).data('target');
        const value = $(this).data('value');
        const slider = $('#' + target);
        const fieldGroup = slider.closest('.form-group');
        
        // Update slider value
        slider.val(value).trigger('input');
        
        // Update quick value buttons
        $(this).siblings('.quick-value-btn').removeClass('active');
        $(this).addClass('active');
        
        // Add success state
        fieldGroup.removeClass('error').addClass('success');
        fieldGroup.find('.error-message').remove();
    });

    // Update slider progress bar
    function updateSliderProgress(slider) {
        const value = parseInt(slider.val());
        const min = parseInt(slider.attr('min'));
        const max = parseInt(slider.attr('max'));
        const percentage = ((value - min) / (max - min)) * 100;
        
        const progressBar = slider.siblings('.slider-progress');
        progressBar.css('width', percentage + '%');
        
        // Update quick value buttons
        const fieldGroup = slider.closest('.form-group');
        fieldGroup.find('.quick-value-btn').removeClass('active');
        fieldGroup.find('.quick-value-btn[data-value="' + value + '"]').addClass('active');
    }

    // Toggle selected class for option tiles when radios change
    function updateRadioTiles() {
        $('.form-options .option').each(function() {
            const $opt = $(this);
            const $radio = $opt.find('input[type="radio"]');
            if ($radio.length && $radio.is(':checked')) {
                $opt.addClass('selected');
            } else {
                $opt.removeClass('selected');
            }
        });
    }

    // On radio change, update tiles and run realtime validation for that group
    $(document).on('change', 'input[type="radio"]', function() {
        const $this = $(this);
        const $opt = $this.closest('.option');
        const name = $this.attr('name');

        // remove selected from siblings in same group
        $('input[type="radio"][name="' + name + '"]').each(function() {
            $(this).closest('.option').removeClass('selected');
        });
        $opt.addClass('selected');

        // validate group visually
        const $groupField = $opt.closest('.form-group');
        $groupField.removeClass('error').addClass('success');
        $groupField.find('.error-message').remove();
    });

    // Initialize selected state on load
    updateRadioTiles();
    
    // Global functions for result actions
    window.restartWizard = function() {
        // Track restart action
        const historyId = $('#restart-advice').data('history-id');
        if (historyId) {
            trackUserAction(historyId, 'restart_consultation');
        }
        
        currentStep = 1;
        $('#mattress-advisor-form')[0].reset();
        $('.form-step').removeClass('active');
        $('#step-1').addClass('active');
        $('.form-group').removeClass('error success');
        $('.error-message').remove();
        $('#mattress-result').html('').hide().parent().removeClass('loading success error');
        $('#mattress-advisor-form').show();
        $('.wizard-progress').show();
        updateProgressBar();
        updateNavigationButtons();
        scrollToTop();
    };
    
    window.shareResult = function() {
        // Track share action
        const historyId = $('#share-result').data('history-id');
        if (historyId) {
            trackUserAction(historyId, 'share_result');
        }
        
        const resultText = $('#mattress-result').text();
        
        if (navigator.share) {
            navigator.share({
                title: 'نتیجه مشاوره تشک هوشمند',
                text: resultText,
                url: window.location.href
            }).catch(console.error);
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(resultText).then(function() {
                alert('نتیجه در کلیپ‌بورد کپی شد');
            }).catch(function() {
                // Fallback
                const textArea = document.createElement('textarea');
                textArea.value = resultText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('نتیجه در کلیپ‌بورد کپی شد');
            });
        }
    };
    
    window.goToStep = function(step) {
        if (step >= 1 && step <= totalSteps) {
            $('#mattress-result').html('').hide().parent().removeClass('loading success error');
            $('#mattress-advisor-form').show();
            $('.wizard-progress').show();
            $('.form-step').removeClass('active');
            currentStep = step;
            $('#step-' + currentStep).addClass('active');
            updateProgressBar();
            updateNavigationButtons();
            scrollToTop();
        }
    };

    // Track user actions
    function trackUserAction(historyId, actionType) {
        if (!historyId) return;
        
        $.ajax({
            url: mattress_form.ajax_url,
            type: 'POST',
            data: {
                action: 'track_mattress_action',
                nonce: mattress_form.nonce,
                history_id: historyId,
                action_type: actionType
            },
            success: function(response) {
                // Action tracked successfully
            },
            error: function() {
                console.log('Failed to track action:', actionType);
            }
        });
    }

    // Track page leave when user leaves the result page
    $(window).on('beforeunload', function() {
        const historyId = $('#restart-advice, #share-result').first().data('history-id');
        if (historyId) {
            // Use sendBeacon for more reliable tracking on page leave
            if (navigator.sendBeacon) {
                const formData = new FormData();
                formData.append('action', 'track_mattress_action');
                formData.append('nonce', mattress_form.nonce);
                formData.append('history_id', historyId);
                formData.append('action_type', 'page_leave');
                navigator.sendBeacon(mattress_form.ajax_url, formData);
            } else {
                // Fallback for older browsers
                trackUserAction(historyId, 'page_leave');
            }
        }
    });

    // Track when user clicks on product links (potential purchase intent)
    $(document).on('click', 'a[href*="product"]', function() {
        const historyId = $('#restart-advice, #share-result').first().data('history-id');
        if (historyId) {
            trackUserAction(historyId, 'view_product');
        }
    });

    // Track when user clicks "Add to Cart" button
    $(document).on('click', '.purchase-btn', function() {
        const historyId = $(this).data('history-id');
        if (historyId) {
            trackUserAction(historyId, 'add_to_cart');
        }
        // Note: Don't mark as successful purchase here - wait for WooCommerce order completion
    });

    // Track successful purchase (this would be called from WooCommerce checkout success page)
    window.trackSuccessfulPurchase = function(historyId) {
        if (historyId) {
            trackUserAction(historyId, 'successful_purchase');
        }
    };
});

jQuery(document).ready(function($) {
    function filterProductsByCategory(categorySelector, productsSelector) {
        var categoryId = $(categorySelector).val();
        var hasVisible = false;

        $(productsSelector + ' option').each(function() {
            var categoryIds = (($(this).data('category-ids') || '') + '').split(',').filter(Boolean);
            var visible = categoryId && categoryIds.indexOf(categoryId) !== -1;
            $(this).prop('hidden', !visible);
            if (!visible) {
                $(this).prop('selected', false);
            }
            if (visible) {
                hasVisible = true;
            }
        });

        $(productsSelector).prop('disabled', !categoryId || !hasVisible);
    }

    $('#product_ids, #edit_product_ids').prop('disabled', true);
    $('#product_ids option, #edit_product_ids option').prop('hidden', true);
    $('#product_category').on('change', function() {
        filterProductsByCategory('#product_category', '#product_ids');
    });
    $('#edit_product_category').on('change', function() {
        filterProductsByCategory('#edit_product_category', '#edit_product_ids');
    });

    // Tab functionality
    $('.tab-button').on('click', function(e) {
        e.preventDefault();
        
        var targetTab = $(this).data('tab');
        
        // Remove active class from all tabs and content
        $('.tab-button').removeClass('active');
        $('.tab-content').removeClass('active');
        
        // Add active class to clicked tab and corresponding content
        $(this).addClass('active');
        $('#' + targetTab).addClass('active');
    });
    
    // Add Rule AJAX
    $('#add-rule-form').on('submit', function(e) {
        e.preventDefault();
        
        var formData = $(this).serialize();
        formData += '&action=add_mattress_rule&nonce=' + mattress_ajax.nonce;
        
        // Show loading state
        var submitBtn = $(this).find('button[type="submit"]');
        var originalText = submitBtn.html();
        submitBtn.html('<span class="dashicons dashicons-update"></span> در حال ذخیره...').prop('disabled', true);
        
        $.post(mattress_ajax.ajax_url, formData, function(response) {
            if (response.success) {
                // Show success message
                showMessage(response.data.message, 'success');
                
                // Reset form
                $('#add-rule-form')[0].reset();
                
                // Switch to rules list tab and reload
                $('.tab-button[data-tab="rules-list"]').click();
                setTimeout(function() {
                    location.reload();
                }, 1000);
            } else {
                showMessage(response.data.message, 'error');
            }
        }).always(function() {
            // Reset button state
            submitBtn.html(originalText).prop('disabled', false);
        });
    });
    
    // Edit Rule functionality
    $('.edit-rule-btn').on('click', function(e) {
        e.preventDefault();
        
        var ruleId = $(this).data('rule-id');
        
        // Get rule data via AJAX
        $.post(mattress_ajax.ajax_url, {
            action: 'get_mattress_rule',
            rule_id: ruleId,
            nonce: mattress_ajax.nonce
        }, function(response) {
            if (response.success) {
                var rule = response.data.rule;
                
                // Populate edit form
                $('#edit-rule-id').val(rule.id);
                $('#edit_product_ids option').prop('selected', false);
                
                // Prefer parsing conditions JSON to populate fields
                try {
                    var conds = rule.conditions ? JSON.parse(rule.conditions) : {};
                    function setIf(name) {
                        if (typeof conds[name] !== 'undefined' && conds[name] !== null) {
                            $('#edit-' + name.replace(/_/g,'-')).val(conds[name]);
                        }
                    }
                    ['age_min','age_max','height_min','height_max','weight_min','weight_max',
                     'back_curve','sleep_type','persons','quality','elasticity','back_pain',
                     'usage_type','usage_place','age_stage'].forEach(setIf);

                    var selectedProducts = [];
                    if (Array.isArray(conds.product_ids)) {
                        selectedProducts = conds.product_ids.map(function(v) { return String(v); });
                    } else if (rule.product_id) {
                        selectedProducts = [String(rule.product_id)];
                    }

                    var firstCategory = '';
                    $('#edit_product_ids option').each(function() {
                        var isSelected = selectedProducts.indexOf(String($(this).val())) !== -1;
                        $(this).prop('selected', isSelected);
                        if (!firstCategory && isSelected) {
                            firstCategory = ((($(this).data('category-ids') || '') + '').split(',').filter(Boolean)[0]) || '';
                        }
                    });

                    if (firstCategory) {
                        $('#edit_product_category').val(firstCategory).trigger('change');
                        $('#edit_product_ids option').each(function() {
                            if (selectedProducts.indexOf(String($(this).val())) !== -1) {
                                $(this).prop('selected', true);
                            }
                        });
                    }
                } catch (e) {
                    // Fallback to legacy fields on rule object if present
                    $('#edit_back_curve').val(rule.back_curve);
                    $('#edit_sleep_type').val(rule.sleep_type);
                    $('#edit_persons').val(rule.persons);
                    $('#edit_quality').val(rule.quality);
                    $('#edit_elasticity').val(rule.elasticity);
                    $('#edit_back_pain').val(rule.back_pain);
                    $('#edit_usage_type').val(rule.usage_type);
                    $('#edit_usage_place').val(rule.usage_place);
                    $('#edit_age_stage').val(rule.age_stage);
                }
                $('#edit_key_features').val(rule.key_features);
                $('#edit_why_suitable').val(rule.why_suitable);
                
                // Show edit tab
                $('.tab-button[data-tab="edit-rule"]').show().click();
            } else {
                showMessage(response.data.message, 'error');
            }
        });
    });
    
    // Edit Rule AJAX
    $('#edit-rule-form').on('submit', function(e) {
        e.preventDefault();
        
        var formData = $(this).serialize();
        formData += '&action=update_mattress_rule&nonce=' + mattress_ajax.nonce;
        
        // Show loading state
        var submitBtn = $(this).find('button[type="submit"]');
        var originalText = submitBtn.html();
        submitBtn.html('<span class="dashicons dashicons-update"></span> در حال ذخیره...').prop('disabled', true);
        
        $.post(mattress_ajax.ajax_url, formData, function(response) {
            if (response.success) {
                // Show success message
                showMessage(response.data.message, 'success');
                
                // Switch to rules list tab and reload
                $('.tab-button[data-tab="rules-list"]').click();
                $('.tab-button[data-tab="edit-rule"]').hide();
                setTimeout(function() {
                    location.reload();
                }, 1000);
            } else {
                showMessage(response.data.message, 'error');
            }
        }).always(function() {
            // Reset button state
            submitBtn.html(originalText).prop('disabled', false);
        });
    });
    
    // Delete Rule AJAX
    $(document).on('click', '.delete-rule-btn', function(e) {
        e.preventDefault();
        
        if (!confirm('آیا مطمئن هستید که می‌خواهید این قانون را حذف کنید؟')) {
            return;
        }
        
        var ruleId = $(this).data('rule-id');
        var card = $(this).closest('.rule-card');
        
        // Show loading state
        $(this).prop('disabled', true).html('⏳');
        
        $.post(mattress_ajax.ajax_url, {
            action: 'delete_mattress_rule',
            rule_id: ruleId,
            nonce: mattress_ajax.nonce
        }, function(response) {
            if (response.success) {
                card.fadeOut(function() {
                    $(this).remove();
                    
                    // Check if no rules left
                    if ($('.rule-card').length === 0) {
                        location.reload();
                    }
                });
                showMessage('قانون با موفقیت حذف شد', 'success');
            } else {
                showMessage('خطا در حذف قانون: ' + response.data.message, 'error');
                $(this).prop('disabled', false).html('🗑️');
            }
        });
    });
    
    // View form data
    $('.view-form').on('click', function(e) {
        e.preventDefault();
        
        var formData = $(this).data('form');
        
        if (formData) {
            try {
                var parsedData = JSON.parse(formData);
                var text = JSON.stringify(parsedData, null, 2);
                $('#history-modal-body').text(text);
                $('#history-modal').css('display','flex');
            } catch (e) {
                $('#history-modal-body').text(formData);
                $('#history-modal').css('display','flex');
            }
        }
    });

    $(document).on('click', '#history-modal, #history-modal-close', function(e){
        if (e.target.id === 'history-modal' || e.target.id === 'history-modal-close') {
            $('#history-modal').hide();
        }
    });

    // History filters (client-side quick filter)
    function applyHistoryFilters(){
        var q = ($('#history-q').val()||'').toLowerCase();
        var from = $('#history-from').val();
        var to = $('#history-to').val();
        $('#mattress-history-table tbody tr').each(function(){
            var tr = $(this);
            // After adding selection column: date column is 3rd
            var t = tr.find('td:nth-child(3)').text();
            var rowText = tr.text().toLowerCase();
            var ok = true;
            if (q && rowText.indexOf(q) === -1) ok = false;
            if (from && t < from) ok = false;
            if (to && t > to) ok = false;
            tr.toggle(ok);
        });
    }
    $(document).on('input change', '#history-q, #history-from, #history-to', applyHistoryFilters);
    
    // Helper function to show messages
    function showMessage(message, type) {
        var messageHtml = '<div class="notice notice-' + type + ' is-dismissible"><p>' + message + '</p></div>';
        
        // Remove existing messages
        $('.message-container .notice').remove();
        
        // Add new message
        if ($('.message-container').length === 0) {
            $('.mattress-advisor-admin').prepend('<div class="message-container"></div>');
        }
        
        $('.message-container').html(messageHtml);
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(function() {
                $('.message-container .notice').fadeOut();
            }, 3000);
        }
    }
    
    // Initialize first tab as active if none is active
    if ($('.tab-button.active').length === 0) {
        $('.tab-button:first').addClass('active');
        $('.tab-content:first').addClass('active');
    }

    // -------- Rules filters --------
    function applyFilters() {
        var text = $('#filter-text').val() ? $('#filter-text').val().toLowerCase() : '';
        var persons = $('#filter-persons').val();
        var sleep = $('#filter-sleep').val();
        $('.rules-grid .rule-card').each(function(){
            var card = $(this);
            var hay = card.text().toLowerCase();
            var ok = true;
            if (text && hay.indexOf(text) === -1) ok = false;
            if (persons) {
                var tag = card.find('.condition-tag[data-key="persons"]').text();
                if (tag.indexOf(persons) === -1) ok = false;
            }
            if (sleep) {
                var stag = card.find('.condition-tag[data-key="sleep_type"]').text().toLowerCase();
                if (stag.indexOf(sleep) === -1) ok = false;
            }
            card.toggle(ok);
        });
    }
    $(document).on('input change', '#filter-text, #filter-persons, #filter-sleep', applyFilters);
    $(document).on('click', '#filter-clear', function(){
        $('#filter-text').val('');
        $('#filter-persons').val('');
        $('#filter-sleep').val('');
        applyFilters();
    });

    // -------- Rule preview --------
    $(document).on('click', '#add-rule-form .button-preview, #edit-rule-form .button-preview', function(e){
        e.preventDefault();
        var form = $(this).closest('form');
        var data = form.serialize() + '&action=preview_mattress_rule&nonce=' + mattress_ajax.nonce;
        $.post(mattress_ajax.ajax_url, data, function(response){
            if (response.success) {
                var container = form.find('.message-container');
                if (!container.length) {
                    form.prepend('<div class="message-container"></div>');
                    container = form.find('.message-container');
                }
                container.html('<div class="preview-box">' + response.data.html + '</div>');
            } else {
                showMessage(response.data.message || 'خطا در پیش‌نمایش', 'error');
            }
        });
    });

    // -------- Conflict check before save (add form only) --------
    $(document).on('click', '#add-rule-form button[type="submit"]', function(e){
        var form = $('#add-rule-form');
        var data = form.serialize() + '&action=check_mattress_rule_conflicts&nonce=' + mattress_ajax.nonce;
        var submitBtn = $(this);
        // Run sync check; if conflicts, confirm
        $.ajax({
            url: mattress_ajax.ajax_url,
            type: 'POST',
            data: data,
            async: false,
            success: function(response){
                if (response.success && response.data.conflicts && response.data.conflicts.length) {
                    var msg = 'مشاوره\u200cهای هم‌پوشان شناسایی شد:\n';
                    response.data.conflicts.forEach(function(c){
                        msg += '- مشاوره #' + c.id + ' (' + c.product + ')\n';
                    });
                    msg += '\nآیا مایل به ادامه ذخیره هستید؟';
                    if (!confirm(msg)) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        return false;
                    }
                }
            }
        });
    });
});
    // -------- History selection actions --------
    (function($){
        function getSelectedIds(){
            return $('.row-select:checked').map(function(){ return $(this).val(); }).get();
        }

        function updateSelectAllState(){
            var total = $('.row-select').length;
            var selected = $('.row-select:checked').length;
            $('#select-all, #select-all-header').prop('checked', selected > 0 && selected === total);
        }

        // Initialize select-all state on load
        $(function(){
            updateSelectAllState();
        });

        // Use click to ensure immediate reaction across browsers
        $(document).on('click', '#select-all, #select-all-header', function(){
            var checked = $(this).is(':checked');
            // Keep both select-all checkboxes in sync
            $('#select-all, #select-all-header').prop('checked', checked);
            // Toggle all row selects
            $('.row-select').prop('checked', checked);
            updateSelectAllState();
        });

        $(document).on('change', '.row-select', function(){
            updateSelectAllState();
        });

        $(document).on('click', '#csv-selected', function(e){
            e.preventDefault();
            var ids = getSelectedIds();
            if (!ids.length) { alert('هیچ موردی انتخاب نشده است.'); return; }
            var form = $('#csv-selected-form');
            form.find('input[name="ids[]"]').remove();
            ids.forEach(function(id){ form.append('<input type="hidden" name="ids[]" value="'+id+'">'); });
            // Submit natively to bypass any JS interceptors
            if (form.length && form[0]) { form[0].submit(); }
        });

        $(document).on('click', '#delete-selected', function(e){
            e.preventDefault();
            var ids = getSelectedIds();
            if (!ids.length) { alert('هیچ موردی انتخاب نشده است.'); return; }
            if (!confirm('آیا از حذف موارد انتخاب‌شده مطمئن هستید؟')) { return; }
            var form = $('#delete-selected-form');
            form.find('input[name="ids[]"]').remove();
            ids.forEach(function(id){ form.append('<input type="hidden" name="ids[]" value="'+id+'">'); });
            // Submit natively to bypass any JS interceptors
            if (form.length && form[0]) { form[0].submit(); }
        });
    })(jQuery);

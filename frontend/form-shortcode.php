<?php
if ( ! defined( 'ABSPATH' ) ) exit;

add_shortcode('mattress_advisor_form', 'mattress_advisor_form_shortcode');

function mattress_advisor_form_shortcode() {
    // Get current user data for auto-fill (when available)
    $current_user = wp_get_current_user();
    $user_id = isset($current_user->ID) ? intval($current_user->ID) : 0;
    $user_meta = $user_id > 0 ? get_user_meta($user_id) : [];
    
    // Get WooCommerce billing data if available
    $first_name = '';
    $last_name = '';
    $mobile = '';
    $province = '';
    
    if ($user_id > 0 && class_exists('WooCommerce')) {
        $first_name = get_user_meta($user_id, 'billing_first_name', true) ?: $current_user->first_name;
        $last_name = get_user_meta($user_id, 'billing_last_name', true) ?: $current_user->last_name;
        $mobile = get_user_meta($user_id, 'billing_phone', true);
        $province = get_user_meta($user_id, 'billing_state', true);
    } else {
        $first_name = $current_user->first_name;
        $last_name = $current_user->last_name;
    }
    $full_name = trim($first_name . ' ' . $last_name);

    ob_start();
    ?>
    <div id="mattress-advisor-container" class="mattress-wizard">
        <!-- Progress Bar -->
        <div class="wizard-progress">
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill"></div>
            </div>
            <div class="progress-steps">
                <div class="step active" data-step="1">
                    <span class="step-number">1</span>
                </div>
                <div class="step" data-step="2">
                    <span class="step-number">2</span>
                </div>
                <div class="step" data-step="3">
                    <span class="step-number">3</span>
                </div>
                <div class="step" data-step="4">
                    <span class="step-number">4</span>
                </div>
                <div class="step" data-step="5">
                    <span class="step-number">5</span>
                </div>
            </div>
        </div>

        <form id="mattress-advisor-form" class="mattress-form">
            <!-- Step 1: Personal Information -->
            <div class="form-step active" id="step-1">
                <div class="step-header">
                    <h2> اطلاعات شخصی</h2>
                    <p>لطفاً اطلاعات شخصی خود را وارد کنید</p>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <img class="field-icon" src="<?php echo esc_url( MATTRESS_ADVISOR_URL . 'assets/' . rawurlencode('users.webp') ); ?>" alt="نام و نام خانوادگی" loading="lazy">
                        <label for="full_name">نام و نام خانوادگی <span class="required">*</span></label>
                        <input type="text" id="full_name" name="full_name" required placeholder="نام کامل خود را وارد کنید" value="<?php echo esc_attr($full_name); ?>">
                    </div>
                    
                    <div class="form-group">
                        <img class="field-icon" src="<?php echo esc_url( MATTRESS_ADVISOR_URL . 'assets/' . rawurlencode('icon-phones.webp') ); ?>" alt="شماره موبایل" loading="lazy">
                        <label for="mobile">شماره موبایل <span class="required">*</span></label>
                        <input type="tel" id="mobile" name="mobile" required placeholder="09123456789" pattern="09[0-9]{9}" value="<?php echo esc_attr($mobile); ?>">
                        <div class="input-hint">فرمت صحیح شماره: 11 رقم و با 09 شروع شود (مثال: 09123456789)</div>
                    </div>
                    
                    <div class="form-group">
                        <img class="field-icon" src="<?php echo esc_url( MATTRESS_ADVISOR_URL . 'assets/' . rawurlencode('Iran_map.webp') ); ?>" alt="استان" loading="lazy">
                        <label for="province">استان <span class="required">*</span></label>
                        <select id="province" name="province" required>
                            <option value="">انتخاب استان</option>
                            <option value="east_azerbaijan" <?php selected($province, 'east_azerbaijan'); ?>>آذربایجان شرقی</option>
                            <option value="west_azerbaijan" <?php selected($province, 'west_azerbaijan'); ?>>آذربایجان غربی</option>
                            <option value="ardabil" <?php selected($province, 'ardabil'); ?>>اردبیل</option>
                            <option value="isfahan" <?php selected($province, 'isfahan'); ?>>اصفهان</option>
                            <option value="alborz" <?php selected($province, 'alborz'); ?>>البرز</option>
                            <option value="ilam" <?php selected($province, 'ilam'); ?>>ایلام</option>
                            <option value="bushehr" <?php selected($province, 'bushehr'); ?>>بوشهر</option>
                            <option value="tehran" <?php selected($province, 'tehran'); ?>>تهران</option>
                            <option value="chaharmahal_bakhtiari" <?php selected($province, 'chaharmahal_bakhtiari'); ?>>چهارمحال و بختیاری</option>
                            <option value="south_khorasan" <?php selected($province, 'south_khorasan'); ?>>خراسان جنوبی</option>
                            <option value="razavi_khorasan" <?php selected($province, 'razavi_khorasan'); ?>>خراسان رضوی</option>
                            <option value="north_khorasan" <?php selected($province, 'north_khorasan'); ?>>خراسان شمالی</option>
                            <option value="khuzestan" <?php selected($province, 'khuzestan'); ?>>خوزستان</option>
                            <option value="zanjan" <?php selected($province, 'zanjan'); ?>>زنجان</option>
                            <option value="semnan" <?php selected($province, 'semnan'); ?>>سمنان</option>
                            <option value="sistan_baluchestan" <?php selected($province, 'sistan_baluchestan'); ?>>سیستان و بلوچستان</option>
                            <option value="fars" <?php selected($province, 'fars'); ?>>فارس</option>
                            <option value="qazvin" <?php selected($province, 'qazvin'); ?>>قزوین</option>
                            <option value="qom" <?php selected($province, 'qom'); ?>>قم</option>
                            <option value="kurdistan" <?php selected($province, 'kurdistan'); ?>>کردستان</option>
                            <option value="kerman" <?php selected($province, 'kerman'); ?>>کرمان</option>
                            <option value="kermanshah" <?php selected($province, 'kermanshah'); ?>>کرمانشاه</option>
                            <option value="kohgiluyeh_boyerahmad" <?php selected($province, 'kohgiluyeh_boyerahmad'); ?>>کهگیلویه و بویراحمد</option>
                            <option value="golestan" <?php selected($province, 'golestan'); ?>>گلستان</option>
                            <option value="gilan" <?php selected($province, 'gilan'); ?>>گیلان</option>
                            <option value="lorestan" <?php selected($province, 'lorestan'); ?>>لرستان</option>
                            <option value="mazandaran" <?php selected($province, 'mazandaran'); ?>>مازندران</option>
                            <option value="markazi" <?php selected($province, 'markazi'); ?>>مرکزی</option>
                            <option value="hormozgan" <?php selected($province, 'hormozgan'); ?>>هرمزگان</option>
                            <option value="hamadan" <?php selected($province, 'hamadan'); ?>>همدان</option>
                            <option value="yazd" <?php selected($province, 'yazd'); ?>>یزد</option>
                        </select>
                    </div>
                    
                </div>
            </div>

            <!-- Step 2: Physical Characteristics -->
            <div class="form-step" id="step-2">
                <div class="step-header">
                    <h2>مشخصات فیزیکی</h2>
                    <p>اطلاعات فیزیکی شما برای انتخاب تشک مناسب ضروری است</p>
                </div>
                
                <div class="physical-characteristics-grid">
                    <div class="form-group age-range-group">
                        <div class="field-header">
                            <img class="field-icon" src="<?php echo esc_url( MATTRESS_ADVISOR_URL . 'assets/' . rawurlencode('age.webp') ); ?>" alt="سن" loading="lazy">
                            <label for="age">سن <span class="required">*</span></label>
                        </div>
                        <?php $age_value = isset($user_meta['age'][0]) ? intval($user_meta['age'][0]) : 25; $age_value = max(2, min(100, $age_value)); ?>
                        <div class="enhanced-slider-wrapper">
                            <div class="slider-container">
                                <div class="range-labels">
                                    <span class="range-min">2 سال</span>
                                    <span class="range-max">100 سال</span>
                                </div>
                                <div class="slider-track">
                                    <input type="range" id="age" name="age" required min="2" max="100" value="<?php echo esc_attr( $age_value ); ?>" class="enhanced-slider">
                                    <div class="slider-progress"></div>
                                </div>
                                <div class="value-display">
                                    <div class="value-bubble" id="age-display"><?php echo esc_html( $age_value ); ?></div>
                                </div>
                                <input type="hidden" id="age_stage" name="age_stage" value="">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group height-range-group">
                        <div class="field-header">
                            <img class="field-icon" src="<?php echo esc_url( MATTRESS_ADVISOR_URL . 'assets/' . rawurlencode('height.webp') ); ?>" alt="قد" loading="lazy">
                            <label for="height">قد <span class="required">*</span></label>
                        </div>
                        <?php $height_value = isset($user_meta['height'][0]) ? intval($user_meta['height'][0]) : 170; $height_value = max(1, min(200, $height_value)); ?>
                        <div class="enhanced-slider-wrapper">
                            <div class="slider-container">
                                <div class="range-labels">
                                    <span class="range-min">1 سانتی‌متر</span>
                                    <span class="range-max">200 سانتی‌متر</span>
                                </div>
                                <div class="slider-track">
                                    <input type="range" id="height" name="height" required min="1" max="200" value="<?php echo esc_attr( $height_value ); ?>" class="enhanced-slider">
                                    <div class="slider-progress"></div>
                                </div>
                                <div class="value-display">
                                    <div class="value-bubble" id="height-display"><?php echo esc_html( $height_value ); ?></div>
                                    <div class="value-unit">سانتی‌متر</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group weight-range-group">
                        <div class="field-header">
                            <img class="field-icon" src="<?php echo esc_url( MATTRESS_ADVISOR_URL . 'assets/' . rawurlencode('Weight.webp') ); ?>" alt="وزن" loading="lazy">
                            <label for="weight">وزن <span class="required">*</span></label>
                        </div>
                        <?php $weight_value = isset($user_meta['weight'][0]) ? intval($user_meta['weight'][0]) : 65; $weight_value = max(5, min(110, $weight_value)); ?>
                        <div class="enhanced-slider-wrapper">
                            <div class="slider-container">
                                <div class="range-labels">
                                    <span class="range-min">5 کیلوگرم</span>
                                    <span class="range-max">110 کیلوگرم</span>
                                </div>
                                <div class="slider-track">
                                    <input type="range" id="weight" name="weight" required min="5" max="110" value="<?php echo esc_attr( $weight_value ); ?>" class="enhanced-slider">
                                    <div class="slider-progress"></div>
                                </div>
                                <div class="value-display">
                                    <div class="value-bubble" id="weight-display"><?php echo esc_html( $weight_value ); ?></div>
                                    <div class="value-unit">کیلوگرم</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Step 3: Sleep Preferences -->
            <div class="form-step" id="step-3">
                <div class="step-header">
                    <h2> ترجیحات خواب</h2>
                    <p>اطلاعات مربوط به نحوه خواب و ترجیحات شما</p>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <img class="field-icon" src="<?php echo esc_url( MATTRESS_ADVISOR_URL . 'assets/' . rawurlencode('Waist-hollow.webp') ); ?>" alt="گودی کمر" loading="lazy">
                        <label>گودی کمر <span class="required">*</span></label>
                        <div class="form-options" role="radiogroup" aria-label="گودی کمر">
                            <label class="option"><input type="radio" name="back_curve" value="has" required> <span class="option-label">دارم</span></label>
                            <label class="option"><input type="radio" name="back_curve" value="no" required> <span class="option-label">ندارم</span></label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <img class="field-icon" src="<?php echo esc_url( MATTRESS_ADVISOR_URL . 'assets/' . rawurlencode('Sleep-type.webp') ); ?>" alt="نوع خواب" loading="lazy">
                        <label>نوع خواب <span class="required">*</span></label>
                        <div class="form-options" role="radiogroup" aria-label="نوع خواب">
                            <label class="option"><input type="radio" name="sleep_type" value="light" required> <span class="option-label">خواب سبک</span></label>
                            <label class="option"><input type="radio" name="sleep_type" value="heavy" required> <span class="option-label">خواب سنگین</span></label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <img class="field-icon" src="<?php echo esc_url( MATTRESS_ADVISOR_URL . 'assets/' . rawurlencode('Number-of-people.webp') ); ?>" alt="تعداد نفرات" loading="lazy">
                        <label>تعداد نفرات <span class="required">*</span></label>
                        <div class="form-options" role="radiogroup" aria-label="تعداد نفرات">
                            <label class="option"><input type="radio" name="persons" value="1" required> <span class="option-label">یک نفره</span></label>
                            <label class="option"><input type="radio" name="persons" value="2" required> <span class="option-label">دو نفره</span></label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Step 4: Mattress Specifications -->
            <div class="form-step" id="step-4">
                <div class="step-header">
                    <h2>مشخصات تشک</h2>
                    <p>ویژگی‌های مورد نظر شما برای تشک</p>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <img class="field-icon" src="<?php echo esc_url( MATTRESS_ADVISOR_URL . 'assets/' . rawurlencode('Quality.webp') ); ?>" alt="کیفیت" loading="lazy">
                        <label>کیفیت <span class="required">*</span></label>
                        <div class="form-options" role="radiogroup" aria-label="کیفیت">
                            <label class="option"><input type="radio" name="quality" value="excellent" required> <span class="option-label">عالی (درجه یک)</span></label>
                            <label class="option"><input type="radio" name="quality" value="good" required> <span class="option-label">مطلوب (درجه دو)</span></label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <img class="field-icon" src="<?php echo esc_url( MATTRESS_ADVISOR_URL . 'assets/' . rawurlencode('Reactionary.webp') ); ?>" alt="حالت ارتجاعی" loading="lazy">
                        <label>حالت ارتجاعی <span class="required">*</span></label>
                        <div class="form-options" role="radiogroup" aria-label="حالت ارتجاعی">
                            <label class="option"><input type="radio" name="elasticity" value="none" required> <span class="option-label">ندارد</span></label>
                            <label class="option"><input type="radio" name="elasticity" value="low" required> <span class="option-label">بله - کم</span></label>
                            <label class="option"><input type="radio" name="elasticity" value="very_low" required> <span class="option-label">بله - خیلی کم</span></label>
                            <label class="option"><input type="radio" name="elasticity" value="has" required> <span class="option-label">دارد</span></label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <img class="field-icon" src="<?php echo esc_url( MATTRESS_ADVISOR_URL . 'assets/' . rawurlencode('Back-pain-or-surgery.webp') ); ?>" alt="مشکل کمردرد یا جراحی" loading="lazy">
                        <label>مشکل کمردرد یا جراحی <span class="required">*</span></label>
                        <div class="form-options" role="radiogroup" aria-label="مشکل کمردرد یا جراحی">
                            <label class="option"><input type="radio" name="back_pain" value="no" required> <span class="option-label">ندارم</span></label>
                            <label class="option"><input type="radio" name="back_pain" value="low" required> <span class="option-label">کم</span></label>
                            <label class="option"><input type="radio" name="back_pain" value="has" required> <span class="option-label">دارم</span></label>
                            <label class="option"><input type="radio" name="back_pain" value="severe" required> <span class="option-label">خیلی زیاد</span></label>
                        </div>
                    </div>
                    
                    <!-- Note: 'نوع استفاده' and 'نوع کاربرد' moved to a separate step (step-5) -->
                </div>
            </div>

            <!-- Step 5: Usage Type -->
            <div class="form-step" id="step-5">
                <div class="step-header">
                    <h2>نوع استفاده</h2>
                    <p>لطفاً نوع استفاده و نوع کاربرد تشک را انتخاب کنید</p>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <img class="field-icon" src="<?php echo esc_url( MATTRESS_ADVISOR_URL . 'assets/' . rawurlencode('Type-of-use.webp') ); ?>" alt="نوع استفاده" loading="lazy">
                        <label>نوع استفاده <span class="required">*</span></label>
                        <div class="form-options" role="radiogroup" aria-label="نوع استفاده">
                            <label class="option"><input type="radio" name="usage_type" value="temporary" required> <span class="option-label">موقت</span></label>
                            <label class="option"><input type="radio" name="usage_type" value="permanent" required> <span class="option-label">دائم</span></label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <img class="field-icon" src="<?php echo esc_url( MATTRESS_ADVISOR_URL . 'assets/' . rawurlencode('villa.webp') ); ?>" alt="نوع کاربرد" loading="lazy">
                        <label>نوع کاربرد <span class="required">*</span></label>
                        <div class="form-options" role="radiogroup" aria-label="نوع کاربرد">
                            <label class="option"><input type="radio" name="usage_place" value="home" required> <span class="option-label">خانه</span></label>
                            <label class="option"><input type="radio" name="usage_place" value="villa" required> <span class="option-label">ویلا</span></label>
                            <label class="option"><input type="radio" name="usage_place" value="home_villa" required> <span class="option-label">خانه - ویلا</span></label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="form-navigation">
                <button type="button" id="prev-btn" class="mattress-nav-btn mattress-prev-btn" style="display: none;">
                     مرحله قبل
                </button>
                
                <button type="button" id="next-btn" class="mattress-nav-btn mattress-next-btn">
                    مرحله بعد 
                </button>
                
                <button type="submit" id="submit-btn" class="mattress-nav-btn mattress-submit-btn" style="display: none;">
                    دریافت پیشنهاد تشک
                </button>
            </div>
        </form>
        
        <div id="mattress-result" class="result-container" style="display: none;">
            <!-- Results will be loaded here -->
        </div>
    </div>
    <?php
    wp_enqueue_script('mattress-form-js', MATTRESS_ADVISOR_URL . 'frontend/form.js', ['jquery'], MATTRESS_ADVISOR_VERSION, true);
    wp_localize_script('mattress-form-js', 'mattress_form', [
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('mattress_nonce')
    ]);
    return ob_get_clean();
}

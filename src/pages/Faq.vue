<script setup>
import { ref } from 'vue';
const name_exchange = import.meta.env.VITE_EXCHANGER_NAME;
// Track which FAQ items are active/expanded
const activeFaqItems = ref(new Set());

// Toggle FAQ item expansion
const toggleFaqItem = (index) => {
  if (activeFaqItems.value.has(index)) {
    activeFaqItems.value.delete(index);
  } else {
    activeFaqItems.value.add(index);
  }
  // Trigger reactivity
  activeFaqItems.value = new Set(activeFaqItems.value);
};

// Check if FAQ item is active
const isFaqItemActive = (index) => {
  return activeFaqItems.value.has(index);
};
</script>

<template>
  <main class="main no-margin">
    <div class="page-block container">
      <ol class="breadcrumb mb-m-40">
        <ul  itemtype="https://schema.org/BreadcrumbList">
          <li
            class="first"
            itemprop="itemListElement"

            itemtype="https://schema.org/ListItem"
          >
            <a href="/" itemprop="item">
              <span itemprop="name">Обмен валют</span>
            </a>
            <meta itemprop="position" content="1" />
          </li>

          <div class="clear"></div>
        </ul>
        <li class="breadcrumb-item active">FAQ</li>
      </ol>

      <h1 class="main-title">FAQ</h1>

      <div class="inner grid premium-4-1">
        <div class="inner-content span--lg4 span--md-2">
          <div class="page_wrap">
            <div class="text faq">
              <ul class="faq__list">
                <li class="faq__item">
                  <div
                    class="faq__title"
                    :class="{ 'faq__title--active': isFaqItemActive(0) }"
                    @click="toggleFaqItem(0)"
                    style="cursor: pointer;"
                  >
                    Как проходит процесс обмена?
                  </div>
                  <p
                    class="faq__descr"
                    :class="{ 'faq__descr--active': isFaqItemActive(0) }"
                    style=""
                  >
                    Все операции в обменном пункте {{ name_exchange }} проводятся под
                    контролем операторов. Выберите направление обмена в столбце
                    "Вы отдаете" и столбце "Вы получаете".
                  </p>
                </li>
                <li class="faq__item">
                  <div
                    class="faq__title"
                    :class="{ 'faq__title--active': isFaqItemActive(1) }"
                    @click="toggleFaqItem(1)"
                    style="cursor: pointer;"
                  >
                    Как узнать курс обмена?
                  </div>
                  <p
                    class="faq__descr"
                    :class="{ 'faq__descr--active': isFaqItemActive(1) }"
                  >
                    Курс обмена вы сможете увидеть выбрав соответствующую пару
                    монет. Введите желаемую сумму в поле «Вы отдаете» и вы
                    увидите сколько вы получите в замен в поле «Вы получаете»
                  </p>
                </li>
                <li class="faq__item">
                  <div
                    class="faq__title"
                    :class="{ 'faq__title--active': isFaqItemActive(2) }"
                    @click="toggleFaqItem(2)"
                    style="cursor: pointer;"
                  >
                    Есть ли дополнительные комиссии?
                  </div>
                  <p
                    class="faq__descr"
                    :class="{ 'faq__descr--active': isFaqItemActive(2) }"
                  >
                    Дополнительных комиссий на нашем сервисе не предусмотрено.
                    Вам нужно отправить ту сумму, которую вы указали в поле «Вы
                    отдаете»
                  </p>
                </li>
                <li class="faq__item">
                  <div
                    class="faq__title"
                    :class="{ 'faq__title--active': isFaqItemActive(3) }"
                    @click="toggleFaqItem(3)"
                    style="cursor: pointer;"
                  >
                    Какие услуги предоставляет сервис?
                  </div>
                  <p
                    class="faq__descr"
                    :class="{ 'faq__descr--active': isFaqItemActive(3) }"
                  >
                    Сервис {{ name_exchange }} предоставляет услуги обмена криптовалют. Так
                    же через наш сервис можно обменять любую криптовалюту на
                    фиат. Узнать подробнее в каких странах мы можем произвести
                    обмен на наличные вы можете через нашу службу поддержки
                  </p>
                </li>
              </ul>

              <div class="clear"></div>
            </div>
          </div>

          <!--end inner content -->
        </div>

        <aside class="aside">
          <div class="not_frame">
            <div class="login_widget">
              <div class="login_widget_ins">
                <form
                  method="post"
                  class="ajax_post_form"
                  action="/premium_site_action-loginform.html?meth=post&amp;yid=0e9983cf0e17&amp;ynd=0"
                >
                  <div class="login_widget_title">
                    <div class="login_widget_title_ins">Авторизация</div>
                  </div>

                  <div class="resultgo"></div>

                  <div class="login_widget_body">
                    <div class="login_widget_body_ins">
                      <div
                        class="form_field_line widget_log_line type_input field_name_logmail has_title"
                      >
                        <div class="form_field_label widget_log_label">
                          <label for="form_field_id-1-logmail"
                            ><span class="form_field_label_ins"
                              >Логин или e-mail
                              <span class="req">*</span>:</span
                            ></label
                          >
                        </div>
                        <div class="form_field_ins widget_log_line_ins">
                          <input
                            type="text"
                            id="form_field_id-1-logmail"
                            class="widget_log_input"
                            autocomplete="off"
                            name="logmail"
                            value=""
                            placeholder="Логин или e-mail "
                          />

                          <div class="form_field_errors">
                            <div class="form_field_errors_ins"></div>
                          </div>
                        </div>
                        <div
                          class="form_field_clear widget_log_line_clear"
                        ></div>
                      </div>

                      <div
                        class="form_field_line widget_log_line type_password field_name_pass has_title"
                      >
                        <div class="form_field_label widget_log_label">
                          <label for="form_field_id-1-pass"
                            ><span class="form_field_label_ins"
                              >Пароль <span class="req">*</span>:</span
                            ></label
                          >
                        </div>
                        <div class="form_field_ins widget_log_line_ins">
                          <input
                            type="password"
                            id="form_field_id-1-pass"
                            class="widget_log_password"
                            autocomplete="off"
                            name="pass"
                            value=""
                            placeholder="Пароль "
                          />

                          <div class="form_field_errors">
                            <div class="form_field_errors_ins"></div>
                          </div>
                        </div>
                        <div
                          class="form_field_clear widget_log_line_clear"
                        ></div>
                      </div>

                      <div
                        class="form_field_line widget_log_line type_input field_name_user_pin hidden_line has_title"
                      >
                        <div class="form_field_label widget_log_label">
                          <label for="form_field_id-1-user_pin"
                            ><span class="form_field_label_ins"
                              >Персональный пин код:</span
                            ></label
                          >
                        </div>
                        <div class="form_field_ins widget_log_line_ins">
                          <input
                            type="text"
                            id="form_field_id-1-user_pin"
                            class="widget_log_input"
                            autocomplete="off"
                            name="user_pin"
                            value=""
                            placeholder="Персональный пин
                                                    код"
                          />

                          <div class="form_field_errors">
                            <div class="form_field_errors_ins"></div>
                          </div>
                        </div>
                        <div
                          class="form_field_clear widget_log_line_clear"
                        ></div>
                      </div>

                      <div class="captcha_div">
                        <div class="captcha_title">Введите ответ</div>
                        <div class="captcha_body">
                          <div class="captcha_divimg">

                          </div>
                          <div class="captcha_divznak">
                            <span class="captcha_sym">+</span>
                          </div>
                          <div class="captcha_divimg">

                          </div>
                          <div class="captcha_divznak">=</div>
                          <input
                            type="text"
                            class="captcha_divpole captcha_value"
                            name="number"
                            maxlength="4"
                            autocomplete="off"
                            value=""
                          />
                          <a
                            href="#"
                            class="captcha_reload"
                            title="заменить задачу"
                          ></a>
                          <div class="clear"></div>
                        </div>
                      </div>

                      <div class="widget_log_line_text">
                        <div class="login_widget_subm_left">
                          <a href="/register/">Регистрация</a>
                        </div>
                        <div class="login_widget_subm_right">
                          <a href="/lostpass/">Забыли пароль?</a>
                        </div>

                        <div class="clear"></div>
                      </div>

                      <div class="widget_log_line_subm">
                        <input
                          type="submit"
                          formtarget="_top"
                          name="submit"
                          class="widget_log_submit"
                          value="Войти"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div class="widget widget_reviews_div">
            <div class="widget_ins">
              <div class="widget_title">
                <div class="widget_titlevn">Отзывы</div>
              </div>
              <div class="widget_items">
                <div class="widget_reviews_line first odd">
                  <div class="widget_reviews_author">Тим,</div>
                  <div class="widget_reviews_date">30.01.2025, 13:08</div>
                  <div class="clear"></div>
                  <div class="widget_reviews_content">
                    Заявка ID 6199. Обмен произошел быстро и качественно, в
                    течение часа
                  </div>
                </div>

                <div class="widget_reviews_line even">
                  <div class="widget_reviews_author">Eвгений,</div>
                  <div class="widget_reviews_date">17.01.2025, 19:10</div>
                  <div class="clear"></div>
                  <div class="widget_reviews_content">
                    Отличный, быстрый, надёжный сервис
                  </div>
                </div>

                <div class="widget_reviews_line last odd">
                  <div class="widget_reviews_author">юлия,</div>
                  <div class="widget_reviews_date">20.02.2024, 16:10</div>
                  <div class="clear"></div>
                  <div class="widget_reviews_content">
                    все было очень оперативно, спасибо за работу
                  </div>
                </div>
              </div>
              <div class="widget_reviews_more_wrap">
                <a href="/reviews" class="widget_reviews_more"
                  ><span>Все отзывы</span></a
                >
                <div class="clear"></div>
              </div>
            </div>
          </div>
        </aside>

        <!--end inner content and sidebar -->
      </div>

      <!--end container -->
    </div>
  </main>
</template>

<style scoped>
.faq__descr {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.faq__descr--active {
  max-height: 200px;
  transition: max-height 0.3s ease-in;
}

.faq__title {
  transition: all 0.3s ease;
}

.faq__title--active {
  /* Add any active title styles here if needed */
}
</style>

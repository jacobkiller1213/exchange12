<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ApiService } from "@/api/api";

const router = useRouter();

const order = ref(null);

onMounted(async () => {
  console.log(order.value);
  const api = new ApiService();
  order.value = await api.getOrder(router.params.id);
});
</script>

<template>
  <main class="main no-margin">
    <div class="page-block container">
      <ol class="breadcrumb mb-m-40">
        <ul itemscope="" itemtype="https://schema.org/BreadcrumbList">
          <li
            class="first"
            itemprop="itemListElement"
            itemscope=""
            itemtype="https://schema.org/ListItem"
          >
            <a href="/" itemprop="item">
              <span itemprop="name">Обмен валют</span>
            </a>
            <meta itemprop="position" content="1" />
          </li>

          <div class="clear"></div>
        </ul>

        <li class="breadcrumb-item active">BNBBEP20 на XRP</li>
      </ol>

      <div
        style="
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 24px;
          background-color: #fff;
          border-radius: 14px;
          margin-bottom: 24px;
        "
      >
        <p style="font-size: 24px; font-weight: 600; margin: 0px">
          Заявка №431391
        </p>
        <div
          class="main-title"
          style="
            display: flex;
            align-items: start;
            gap: 10px;
            padding: 0px;
            margin: 0px;
          "
        >
          <h1>Обмен BNBBEP20 на XRP</h1>
        </div>
      </div>

      <div class="inner grid premium-4-1">
        <div class="inner-content span--lg-4 span--md-2">
          <div class="exchange_status_html">
            <div class="exchange_status_abs" style="display: none"></div>
            <div id="exchange_status_html">
              <div class="notice_message">
                <div class="notice_message_ins">
                  <div class="notice_message_abs"></div>
                  <div class="notice_message_close"></div>
                  <div class="notice_message_text">
                    <div class="notice_message_text_ins">
                      <div class="text">
                        <ul>
                          <li>
                            Данная операция производится в автоматическом режиме
                            и занимает от 15 минут до 48 часов. Скорость зависит
                            от загрузки сети и выбранной комиссии
                          </li>
                          <li>
                            Неоплаченная заявка удалится через 60 минут после
                            создания.
                          </li>
                          <li>
                            Заявка считается оплаченной после 19 подтверждений
                            сети.
                          </li>
                          <li>
                            Окончательная сумма обмена фиксируется после
                            подтверждения оплаты сервисом. Курс обмена
                            рассчитывается по бирже Binance.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="block_xchdata_wrap">
                <div class="block_xchdata">
                  <div class="block_xchdata_ins">
                    <div class="block_xchdata_title otd give">
                      <span>Отдаете</span>
                    </div>

                    <div
                      class="block_xchdata_info"
                      style="
                        display: flex;
                        justify-content: start;
                        align-items: start;
                      "
                    >
                      <div
                        class="block_xchdata_info_left"
                        style="display: flex; flex-direction: column; gap: 10px"
                      >
                        <div class="block_xchdata_line">
                          <span>Сумма:</span> 0.59 BNBBEP20
                        </div>
                        <div class="block_xchdata_line break_words">
                          <span>На счет:</span>
                          0x5Bb02e71c7BF2265508246B9415Dd3188dDF2870
                        </div>
                      </div>
                      <div class="block_xchdata_info_right">
                        <img
                          class="block_xchdata_ico currency_logo"
                          src="/coins/bnbbep20.png"
                        />
                        <div class="block_xchdata_text">BNBBEP20</div>
                        <div class="clear"></div>
                      </div>
                      <div class="clear"></div>
                    </div>
                  </div>
                </div>

                <div class="block_xchdata">
                  <div class="block_xchdata_ins">
                    <div class="block_xchdata_title pol get">
                      <span>Получаете</span>
                    </div>

                    <div class="block_xchdata_info">
                      <div class="block_xchdata_info_left">
                        <div class="block_xchdata_line">
                          <span>Сумма:</span> 148.28243862 XRP
                        </div>
                        <div class="block_xchdata_line break_words">
                          <span>На счет:</span>
                          rJn2zAPdFA193sixJwuFixRkYDUtx3apQh
                        </div>
                      </div>
                      <div class="block_xchdata_info_right">
                        <img
                          class="block_xchdata_ico currency_logo"
                          src="/coins/xrp.png"
                        />
                        <div class="block_xchdata_text">XRP</div>
                        <div class="clear"></div>
                      </div>
                      <div class="clear"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="check_payment_hash"
                data-time="30"
                data-hash="zqt0gthb9roaqjjlzbkucwprlnw91mb5vio"
              ></div>

              <div class="block_statusbids block_status_completed">
                <div class="block_statusbids_ins">
                  <div class="block_status">
                    <div class="block_status_ins">
                      <div
                        class="block_status_time"
                        title="Время создания: 2025-07-23T08:20:12.000000Z"
                      >
                        <span>Время изменения статуса:</span>
                        2025-07-23T09:15:15.000000Z
                      </div>
                      <div class="block_status_text">
                        <span class="block_status_text_info"
                          >Статус заявки:</span
                        >
                        <span class="block_status_bids bstatus_completed">
                          Выполнена
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="block_statusbid_title">
                    <div class="block_statusbid_title_ins">
                      <span>Успешный обмен</span>
                    </div>
                  </div>

                  <div class="block_instruction st_completed">
                    <div class="block_instruction_ins">
                      <div class="text">
                        <p>
                          Мы успешно произвели обмен ваших средств. Спасибо что
                          доверяете и пользуетесь сервисом
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="clear"></div>

          <!--end inner content -->
        </div>

        <!--end inner content and sidebar -->
      </div>

      <!--end container -->
    </div>
  </main>
</template>

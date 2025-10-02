<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ApiService } from "@/api/api";

const router = useRouter();
const route = useRoute();
const walletAddress = ref(null);
const order = ref(null);
const isLoading = ref(true);
const refreshInterval = ref(null);
const payment_info = ref({});
const showQr = ref(false);
const qrFallback = ref(false);
const qrSrc = computed(() => {
    const data = depositAddress.value || '';
    if (!data) return '';
    if (qrFallback.value) {
        return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=200x200&margin=0`;
    }
    // Try backend API first
    return `${import.meta.env.VITE_EXCHANGER_API}/api/qr?data=${encodeURIComponent(data)}&size=200`;
});
const handleQrError = () => {
    qrFallback.value = true;
};
const destinationAddress = computed(() => {
    if (!payment_info.value) return '';
    // Prefer explicit key, fallback to first value
    const preferred = payment_info.value["💼 Адрес кошелька"] || payment_info.value["Адрес кошелька"];
    if (preferred) return preferred;
    const values = Object.values(payment_info.value);
    return values && values.length ? String(values[0]) : '';
});
const depositAddress = computed(() => {
    return order.value?.wallet_address || '';
});
const createdAtText = computed(() => {
    const raw = order.value?.created_at;
    if (!raw) return '';
    try {
        const d = new Date(raw);
        return d.toLocaleString();
    } catch (e) {
        return raw;
    }
});
const status_content = ref({
    class: '',
    title: '',
    header: '',
    text: ''
});

// Timer: 4 hours from order creation
const now = ref(Date.now());
const timerInterval = ref(null);
const EXPIRE_HOURS = 1;

const expireAt = computed(() => {
    const raw = order.value?.created_at;
    if (!raw) return null;
    try {
        const d = new Date(raw);
        if (isNaN(d.getTime())) return null;
        return d.getTime() + EXPIRE_HOURS * 60 * 60 * 1000;
    } catch (e) {
        return null;
    }
});

const timeLeftText = computed(() => {
    const exp = expireAt.value;
    if (!exp) return '';
    const diffMs = Math.max(0, exp - now.value);
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
});

// Show timer for active statuses
const showTimer = computed(() => {
    const status = order.value?.status;
    return status === 'created' || status === 'paid';
});

// Track which element was copied
const copiedItem = ref(null);

// Function to copy text to clipboard
const copyToClipboard = (text, element) => {
    navigator.clipboard.writeText(text).then(() => {
        copiedItem.value = element;
        setTimeout(() => {
            if (copiedItem.value === element) {
                copiedItem.value = null;
            }
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
};

// Auto-refresh settings
const REFRESH_INTERVAL = 10000; // 30 seconds
const shouldAutoRefresh = computed(() => {
    // Only auto-refresh for orders that are not completed or cancelled
    return order.value && ['created', 'paid'].includes(order.value.status);
});

// Computed properties for better readability
const breadcrumbText = computed(() => {
    if (!order.value) return '';
    return `${order.value.currency_from} на ${order.value.currency_to}`;
});

const exchangeTitle = computed(() => {
    if (!order.value) return '';
    return `Обмен ${order.value.currency_from} на ${order.value.currency_to}`;
});

const statusText = computed(() => {
    if (!order.value) return '';
    switch (order.value.status) {
        case 'created': return 'Создана';
        case 'paid': return 'Оплачена';
        case 'completed': return 'Выполнена';
        case 'cancelled': return 'Отменена';
        default: return order.value.status;
    }
});

const statusClass = computed(() => {
    if (!order.value) return '';
    switch (order.value.status) {
        case 'created': return 'block_status_created';
        case 'paid': return 'block_status_paid';
        case 'completed': return 'block_status_completed';
        case 'cancelled': return 'block_status_cancelled';
        default: return 'block_status_created';
    }
});

// Map backend status to visual step index
// 0: Создание обмена, 1: Ожидание оплаты, 2: Процесс обмена, 3: Готово
const currentStep = computed(() => {
    if (!order.value) return 0;
    switch (order.value.status) {
        case 'created':
            return 1;
        case 'paid':
            return 2;
        case 'completed':
            return 3;
        case 'cancelled':
        case 'deleted':
        case 'suspended':
        default:
            return 0;
    }
});

// Helper function to replace PHP's getInstructionText
const getInstructionText = (amount, currency) => {
    return `Отправьте ${amount} ${currency} на указанный адрес`;
};

// Function to fetch order data
const fetchOrderData = async () => {
    try {
        const api = new ApiService(import.meta.env.VITE_EXCHANGER_API);
        const response = await api.getOrder(route.params.id);
        const newOrderData = response && response.data ? response.data : response;

        // Only update if data has changed to avoid unnecessary re-renders
        if (!order.value || JSON.stringify(order.value) !== JSON.stringify(newOrderData)) {
            order.value = newOrderData;

            // Set status content based on order status
            updateStatusContent();

            // Set payment info
            if (newOrderData.payment_info) {
                try {
                    payment_info.value = JSON.parse(newOrderData.payment_info);
                } catch (e) {
                    payment_info.value = {};
                }
                console.log('Payment info:', payment_info.value);
            }

            console.log('Order data updated:', newOrderData);
        }
    } catch (error) {
        console.error('Failed to fetch order data:', error);
    } finally {
        isLoading.value = false;
    }
};

// Update status content based on order status
const updateStatusContent = () => {
    if (!order.value) return;

    // Define telegram support URL
    const telegram_support = "https://t.me/corechain_support"; // Replace with actual support URL

    switch (order.value.status) {
        case 'created':
            status_content.value = {
                class: 'bstatus_new',
                title: 'Принята, ожидает оплаты клиентом',
                header: '',
                show_timer: true,
                show_payment_button: true,
                text: ''
            };
            break;
        case 'processing':
            status_content.value = {
                class: 'bstatus_processing',
                title: 'В обработке',
                header: 'Заявка в обработке',
                text: 'Ваша заявка находится в обработке. Пожалуйста, ожидайте завершения обмена.'
            };
            break;
        case 'paid':
            status_content.value = {
                class: 'bstatus_paid',
                title: 'Оплачено',
                header: 'Заявка оплачена',
                text: 'Оплата успешно получена, мы приступили к обмену ваших средств'
            };
            break;
        case 'suspended':
            status_content.value = {
                class: 'bstatus_suspended',
                title: 'Приостановлена',
                header: 'Обмен приостановлен',
                text: `Для успешного совершения обмена от вас требуется дополнительная информация, свяжитесь со службой поддержки. <a href="${telegram_support}" style="color: #46a9ff;" target="_blank">Telegram support</a>`
            };
            break;
        case 'completed':
            status_content.value = {
                class: 'bstatus_completed',
                title: 'Выполнена',
                header: 'Успешный обмен',
                text: 'Мы успешно произвели обмен ваших средств. Спасибо что доверяете и пользуетесь сервисом '
            };
            break;
        case 'deleted':
            status_content.value = {
                class: 'bstatus_deleted',
                title: 'Удалена',
                header: 'Отмена по времени',
                text: `Мы не получили вашу оплату. Если вы отправили средства и увидели это сообщение, обратитесь в нашу службу поддержки. <a href="${telegram_support}" style="color: #46a9ff;" target="_blank">Telegram Support</a>`
            };
            break;
        case 'cancelled':
            status_content.value = {
                class: 'bstatus_deleted',
                title: 'Отменена',
                header: 'Обмен отменен',
                text: 'Заявка была отменена'
            };
            break;
        default:
            status_content.value = {
                class: '',
                title: order.value.status,
                header: '',
                text: ''
            };
    }
};

// Setup auto-refresh interval
const setupAutoRefresh = () => {
    // Clear existing interval if any
    if (refreshInterval.value) {
        clearInterval(refreshInterval.value);
    }

    // Only set up auto-refresh for active orders
    if (shouldAutoRefresh.value) {
        refreshInterval.value = setInterval(() => {
            fetchOrderData();
        }, REFRESH_INTERVAL);

        console.log('Auto-refresh started for order', route.params.id);
    }
};

// Stop auto-refresh
const stopAutoRefresh = () => {
    // if (refreshInterval.value) {
    //     clearInterval(refreshInterval.value);
    //     refreshInterval.value = null;
    //     console.log('Auto-refresh stopped');
    // }
};

onMounted(async () => {
    console.log('OrderPage mounted, order ID:', route.params.id);

    // Initial load
    await fetchOrderData();

    // Setup auto-refresh after initial load
    setupAutoRefresh();

    // Start timer tick
    if (!timerInterval.value) {
        timerInterval.value = setInterval(() => {
            now.value = Date.now();
        }, 1000);
    }
});

onUnmounted(() => {
    // Cleanup interval when component is destroyed
    if (timerInterval.value) {
        clearInterval(timerInterval.value);
        timerInterval.value = null;
    }
});

// Watch for order status changes to control auto-refresh
const updateAutoRefresh = () => {
    if (shouldAutoRefresh.value && !refreshInterval.value) {
        setupAutoRefresh();
    }
};

// Update auto-refresh when order status changes
const watchOrderStatus = () => {
    if (order.value) {
        updateAutoRefresh();
    }
};

// Watch order changes
const originalOrder = ref(null);
const checkOrderChanges = () => {
    if (order.value && (!originalOrder.value || originalOrder.value.status !== order.value.status)) {
        originalOrder.value = { ...order.value };
        watchOrderStatus();
    }
};

// Check for order changes periodically
setInterval(checkOrderChanges, 1000);
</script>
<template>
    <div class="page">
        <div class="container">
            <div class="page__center">
                <div class="layout">
                    <div class="layout__info">
                        <ul class="reset-list layout__statuses">
                            <li class="layout__status" :class="{ active: currentStep >= 0 }">Создание обмена</li>
                            <li class="layout__status" :class="{ active: currentStep >= 1 }">Ожидание оплаты</li>
                            <li class="layout__status" :class="{ active: currentStep >= 2 }">Процесс обмена</li>
                            <li class="layout__status" :class="{ active: currentStep >= 3 }">Готово</li>
                        </ul>
                        <div class="layout__contact">
                            <div class="layout__contact-text">Пожалуйста, свяжитесь с нами, если у вас возникнут какие-либо вопросы.</div>
                            <div class="links"> <a class="links__item" href="tg://resolve?domain=corechain_support"> <img src="/xgram/images/icons/telegram.svg" width="17" alt="Наш Telegram-канал"> </a></div>
                        </div>
                    </div>
                    <div class="layout__main block" :class="`layout__main_step_${currentStep}`">
                        <div class="block__item">
                            <div class="layout__title">Отправьте &nbsp;<span>{{ order?.amount_from }} {{ order?.currency_from }} &nbsp;</span>по указанному ниже адресу одной транзакцией</div>
                            <div class="layout__prop">Меняете</div>
                            <div class="layout__value">
                                <div>
                                    <span class="js-copy-text">{{ order?.amount_from }} </span>
                                    <span>{{ order?.currency_from }}</span>
                                    <button class="reset-btn layout__copy js-copy-button" data-text="скопировано" @click="copyToClipboard(`${order?.amount_from} ${order?.currency_from}`, 'amountFrom')">{{ copiedItem === 'amountFrom' ? 'скопировано' : 'копировать' }}</button>
                                </div>
                                <div class="tooltip js-tooltip" data-tooltip="js-gift-content" data-tippy-trigger="click" aria-expanded="false"> <button class="reset-btn layout__gift"><img src="/xgram/images/icons/gift.svg" width="24" height="24"></button>
                                    <div class="tooltip__content" id="js-gift-content">
                                        <div class="layout__gift-text">Зарабатывайте XG и увеличивайте свой доход с нашим Mini App в Telegram.</div> <a class="layout__gift-link" href="#">Перейти в Telegram</a>
                                    </div>
                                </div>
                            </div>
                            <div v-if="order?.currency_from?.network" class="layout__extra-info">Сеть · {{ order?.currency_from?.network }}</div>
                        </div>
                        <div class="block__item">
                            <div class="layout__prop">НА АДРЕС ДЛЯ ДЕПОЗИТА</div>
                            <div class="layout__row-value layout__row-value_wrap">
                                <div class="layout__small-value layout__wide-value js-copy-text">{{ depositAddress }}</div> <button class="reset-btn layout__copy js-copy-button" data-text="скопировано" @click="copyToClipboard(depositAddress, 'deposit')"> {{ copiedItem === 'deposit' ? 'скопировано' : 'копировать' }} </button> <button class="reset-btn layout__qr js-show-qr" @click="showQr = true"> <img src="/xgram/images/icons/qr-small.svg" class="mini_qr_camera" width="24" height="24" alt="qr"> </button>
                                <div :class="['qr', 'js-qr', { active: showQr }]" @click.self="showQr = false">
                                    <div class="qr__block"> <img class="qr__image" :src="qrSrc" width="200" height="200" @error="handleQrError"></div>
                                </div>
                            </div>
                        </div>
                        <div class="block__item">
                            <div class="layout__row-check" :class="statusClass">
                                <div class="layout__check">
                                    <div class="loader"></div><span>{{ status_content.title || statusText }}</span>
                                </div>
                                <div class="layout__time" v-if="showTimer && timeLeftText">ВРЕМЯ ИСТЕЧЕНИЯ &nbsp;<span>{{ timeLeftText }}</span></div>
                            </div>
                            <div v-if="status_content.header || status_content.text" class="status__desc" style="margin-top: 12px;">
                                <div class="status__header" v-if="status_content.header">{{ status_content.header }}</div>
                                <div class="status__text" v-if="status_content.text" v-html="status_content.text"></div>
                            </div>
                        </div>
                    </div>
                    <div class="layout__desc">
                        <div style="padding: 12px;" class="change layout__change block aml_info__container">
                            <div class="aml_info__wrapper">
                                <h3>AML-проверка</h3> <img src="/xgram/images/icons/attention.svg" class="img_attention_aml" alt="attention aml">
                            </div>
                            <p>Мы проводим AML-проверку входящей транзакции. В случае выявления признаков повышенного риска может потребоваться подтверждение личности клиента.</p>
                        </div>
                        <div class="change layout__change block">
                            <div class="block__item">
                                <div class="change__prop">Вы отправляете</div>
                                <div class="change__value layout__change-value"><span class="currency currency_change">{{ order?.amount_from }} {{ order?.currency_from }}</span></div>
                            </div>
                            <div class="block__item">
                                <div class="change__prop">Вы получаете</div>
                                <div class="change__value layout__change-value"><span class="currency currency_change">~{{ order?.amount_to }} {{ order?.currency_to }}</span></div>
                            </div>
                        </div>
                        <div class="details block">
                            <div class="block__item">
                                <div class="details__row"> <span> <span class="details__prop">ID обмена:</span> <span class="details__value js-copy-text">{{ order?.id }}</span> </span> <button class="reset-btn details__copy js-copy-button" data-text="скопировано" @click="copyToClipboard(String(order?.id || ''), 'orderId')"> {{ copiedItem === 'orderId' ? 'скопировано' : 'копировать' }} </button></div>
                                <div class="details__row"> <span> <span class="details__prop">Ваш адрес назначения:</span> <span class="details__value js-copy-text">{{ destinationAddress }}</span> </span> <button class="reset-btn details__copy js-copy-button" data-text="скопировано" @click="copyToClipboard(destinationAddress, 'destination')"> {{ copiedItem === 'destination' ? 'скопировано' : 'копировать' }} </button></div>
                                <div class="details__row"><span class="details__prop">Дата создания:</span><span class="details__value js-local_time_converter">{{ createdAtText }}</span></div>
                                <div class="details__row"><span class="details__prop">Необходимо подтверждений:</span><span class="details__value">2</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

ul {
    padding-left: 0px !important;
}

/* Copy icon styles */
.zone_copy {
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
}

.copy-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='9' y='9' width='13' height='13' rx='2' ry='2'%3E%3C/rect%3E%3Cpath d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'%3E%3C/path%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
}

.zone_table {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.zone_copy_abs {
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.zone_copy_abs.visible {
    opacity: 1;
}

.zone_text {
    cursor: pointer;
}

.zone_text:hover {
    opacity: 0.8;
}

.layout {
    align-items: baseline;
}
</style>

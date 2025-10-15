<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
const name_exchange = ref(import.meta.env.VITE_EXCHANGER_NAME);
</script>

<template>
    <footer class="footer">
        <div class="container">
            <div class="footer__wrapper">
                <div class="footer__info">
                    <a class="header__logo" href="/" style="margin-bottom: 10px;">
                        {{ name_exchange }}
                    </a>
                    <div class="footer__promo">Сервис для обмена криптовалюты</div>
                    <div class="riverbed_technology__promo hidden-mobile">© {{ name_exchange }} - все права защищены</div>
                </div>
                <div class="footer__menus">
                    <div class="footer__menu">
                        <div class="footer__title">Документы</div>
                        <ul class="reset-list footer__list">
                            <li class="footer__item"> <RouterLink class="footer__link" to="/privacy-policy"> Политика Конфиденциальности </RouterLink></li>
                            <li class="footer__item"> <RouterLink class="footer__link" to="/rules"> Условия использования </RouterLink></li>
                            <li class="footer__item"> <RouterLink class="footer__link"  to="/how-it-works"> Как это работает </RouterLink></li>
                            <li class="footer__item"> <RouterLink class="footer__link" to="/aml-kyc"> AML/KYC </RouterLink></li>
                        </ul>
                    </div>
                    <div class="footer__menu">
                        <div class="footer__title">Контакты</div>
                        <ul class="reset-list footer__list">
                            <li class="footer__item"> <a class="footer__link" href="tg://resolve?domain=WXBCyber_com" rel="nofollow noopener">Поддержка в Telegram</a></li>
                        </ul>
                    </div>
                    <div class="social_links_media_view-xl">

                    </div>
                </div>
            </div>

            <div class="footer_pair_container">


            </div>
            <div class="social_links__media-view-sx" style="padding: 20px 0;">
                <div class="riverbed_technology__promo">© {{ name_exchange }} - все права защищены</div>
            </div>

        </div>
    </footer>
</template>

<style></style>

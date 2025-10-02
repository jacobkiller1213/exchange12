<script setup>
import { ref, onMounted } from 'vue';
const name_exchange = ref(import.meta.env.VITE_EXCHANGER_NAME);
const isMenuOpen = ref(false);
</script>

<template>
    <header :class="{ 'open': isMenuOpen }" class="header js-header ">
        <div class="container">
            <div class="header__wrapper">
                <a class="header__logo" href="/">
                    {{ name_exchange }}
                </a>
                <ul class="reset-list header__menu">
                    <li class="header__menu-item"> <a class="header__menu-link js-head-link" href="/#how_it_works"> Как это работает </a></li>
                    <li class="header__menu-item"> <a class="header__menu-link js-head-link" href="/#about_us"> О нас </a></li>
                    <li class="header__menu-item"> <a class="header__menu-link js-head-link" href="/#faq">FAQ</a></li>
                    <li class="header__menu-item"> <a class="header__menu-link js-head-link" href="/rules">Условия пользования</a></li>

                    <li class="header__menu-item"> <a class="header__menu-link" href="tg://resolve?domain=rapidchain_net" rel="nofollow noopener"> Поддержка </a></li>
                </ul>
                <div class="header__info" style="min-width: 100px;">
                    <button @click="isMenuOpen = !isMenuOpen" class="reset-btn burger header__burger js-burger">
                         <img v-if="!isMenuOpen" class="burger__open" src="/xgram/images/icons/menu.svg" width="25" height="25" alt="иконка меню для мобильной версии">
                          <img v-else class="burger__close" src="/xgram/images/icons/close.svg" width="25" height="25" alt="иконка закрытия для мобильной версии"> </button>
                </div>
            </div>
        </div>
    </header>
</template>

<style></style>

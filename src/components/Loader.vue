<template>
  <Transition name="fade">
    <div class="loader-container" v-if="visible">
      <div class="loader">
        <div class="spinner-container">
          <div class="spinner"></div>
          <div class="spinner spinner-inner"></div>
        </div>
        <div class="loader-text" v-if="text">{{ text }}</div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: true
  },
  text: {
    type: String,
    default: 'Загрузка...'
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.loader-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1000;
  border-radius: 8px;
  backdrop-filter: blur(2px);
}

.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  animation: scale-in 0.3s ease-out;
}

.spinner-container {
  position: relative;
  width: 50px;
  height: 50px;
}

.spinner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-left-color: #09f;
  animation: spin 1s cubic-bezier(0.42, 0.61, 0.58, 0.41) infinite;
}

.spinner-inner {
  width: 70%;
  height: 70%;
  margin: 15%;
  border-width: 3px;
  border-left-color: #f09;
  animation-duration: 0.8s;
  animation-direction: reverse;
}

.loader-text {
  margin-top: 50px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes scale-in {
  0% {
    transform: scale(0.8);
  }
  100% {
    transform: scale(1);
  }
}
</style>
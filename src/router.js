import { createWebHistory, createRouter } from 'vue-router'

import MainPage from '@/pages/MainPage.vue'
import NoticePage from '@/pages/Notice.vue'
import RulesPage from '@/pages/Rules.vue'
import PolitikaAmlKycPage from '@/pages/PolitikaAmlKycPage.vue'
import FeedbackPage from '@/pages/Feedback.vue'
import OrderPage from '@/pages/OrderPage.vue'
import FaqPage from '@/pages/Faq.vue'
import HowItWorksPage from '@/pages/HowItWorksPage.vue'
import PrivacyPolicePage from '@/pages/PrivacyPolice.vue'

const routes = [
  { path: '/', component: MainPage },
  { path: '/notice', component: NoticePage },
  { path: '/rules', component: RulesPage },
  { path: '/how-it-works', component: HowItWorksPage },
  { path: '/aml-kyc', component: PolitikaAmlKycPage },
  { path: '/feedback', component: FeedbackPage },
  { path: '/order/:id', component: OrderPage },
  { path: '/faq', component: FaqPage },
  { path: '/privacy-policy', component: PrivacyPolicePage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
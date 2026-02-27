/**
 * Vue App Entry Point
 */

import { createApp } from 'vue';
import { DefaultApolloClient } from '@vue/apollo-composable';
import { apolloClient } from './apollo-client';
import App from './App.vue';
import './style.css';

const app = createApp(App);

app.provide(DefaultApolloClient, apolloClient);

app.mount('#app');

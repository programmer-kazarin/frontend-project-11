import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';

import watcher from './watchers.js';
import locale from './locales/locale.js';
import resources from './locales/index.js';
import { addProxy, getLoadingErrorType, parseRss } from './utils.js';

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.rss-form input'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('.rss-form button[type="submit"]'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const initState = {
    feeds: [],
    posts: [],
    form: {
      error: null,
      valid: true,
    },
    loading: {
      error: null,
      status: 'idle', // idle, success, failed, loading
    },
  };

  const loadRss = (watchedState, url) => {
    console.log(`LOAD RSS state: ${JSON.stringify(initState, null, 2)}`);
    const state = watchedState;
    state.loading.status = 'loading';
    const proxyUrl = addProxy(url);
    console.log(`loading Rss from: ${proxyUrl}`);
    return axios.get(proxyUrl)
      .then((response) => {
        console.log('RESPONSE OK');
        const dataFromXml = parseRss(response.data.contents);
        console.log('PARSE OK');
        const feed = {
          url,
          id: _.uniqueId(),
          title: dataFromXml.title,
          description: dataFromXml.description,
        };
        const posts = dataFromXml.items.map((item) => ({
          ...item,
          channelId: feed.id,
          id: _.uniqueId(),
        }));
        state.posts.unshift(...posts);
        state.feeds.unshift(feed);
        state.loading.error = null;
        state.loading.status = 'success';
        state.form = {
          ...state.form,
          valid: true,
          error: null,
        };
      })
      .catch((error) => {
        console.log(`ERROR: ${error}`);
        state.loading = {
          ...state.loading,
          status: 'failed',
          error: getLoadingErrorType(error),
        };
      });
  };

  const i18nextInstance = i18next.createInstance();
  const promise = i18nextInstance.init({
    lng: 'ru',
    resources,
  }).then(() => {
    yup.setLocale(locale);
    const schema = yup.string().required().url().notOneOf(initState.feeds);

    const watchedState = watcher(initState, elements, i18nextInstance);

    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      console.log('EVENT');
      const data = new FormData(event.target);
      const url = data.get('url');
      schema.validate(url)
        .then((validatedUrl) => {
          if (initState.feeds.includes(validatedUrl)) {
            console.log('DUPLICATE');
            watchedState.form = {
              ...watchedState.form,
              error: 'duplicate',
              valid: false,
            };
          } else {
            console.log('PUSH to FEEDS');
            watchedState.feeds.push(validatedUrl);
            watchedState.form = {
              ...watchedState.form,
              error: null,
              valid: true,
            };
            loadRss(watchedState, validatedUrl);
          }
        })
        .catch((error) => {
          console.log(`EVENT ERROR: ${error.message}`);
          watchedState.form = {
            error: error.message.key,
            valid: false,
          };
        });
    });
  });
  return promise;
};

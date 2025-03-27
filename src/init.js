import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';

import watcher from './watchers.js';
import locale from './locales/locale.js';
import resources from './locales/index.js';
import { addProxy, getLoadingErrorType, parseRss } from './utils.js';

export default () => {
  const POST_REQUESTS_TIME_INTERVAL = 5000;

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.rss-form input'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('.rss-form button[type="submit"]'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: document.getElementById('modal'),
  };

  const initState = {
    feeds: [],
    posts: [],
    form: {
      url: null,
      error: null,
      valid: true,
    },
    loading: {
      error: null,
      status: 'idle', // idle, success, failed, loading
    },
    modal: {
      postId: null,
    },
    seenPosts: new Set(),
  };

  const loadRss = (watchedState, url) => {
    const state = watchedState;
    state.loading.status = 'loading';
    const proxyUrl = addProxy(url);
    return axios.get(proxyUrl)
      .then((response) => {
        const dataFromXml = parseRss(response.data.contents);
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
        state.loading = { ...state.loading, error: null, status: 'success' };
        state.form = { ...state.form, valid: true, error: null };
      })
      .catch((error) => {
        state.loading = {
          ...state.loading,
          status: 'failed',
          error: getLoadingErrorType(error),
        };
      });
  };

  const fetchNewPosts = (state) => {
    const promises = state.feeds.map((feed) => axios.get(addProxy(feed.url))
      .then((response) => {
        const dataFromXml = parseRss(response.data.contents);
        const postsFromState = state.posts.filter((post) => post.channelId === feed.id);
        const newPosts = _.differenceWith(
          dataFromXml.items,
          postsFromState,
          (p1, p2) => p1.title === p2.title,
        )
          .map((post) => ({ ...post, channelId: feed.id, id: _.uniqueId }));
        state.posts.unshift(...newPosts);
      })
      .catch((error) => {
        console.error(error);
      }));
    Promise.all(promises).finally(() => {
      setTimeout(() => fetchNewPosts(state), POST_REQUESTS_TIME_INTERVAL);
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
      const data = new FormData(event.target);
      const url = data.get('url');
      schema.validate(url)
        .then((validatedUrl) => {
          if (initState.feeds.find((feed) => feed.url === validatedUrl)) {
            watchedState.form = {
              ...watchedState.form,
              error: 'duplicate',
              valid: false,
            };
          } else {
            watchedState.form = {
              ...watchedState.form,
              url: validatedUrl,
              error: null,
              valid: true,
            };
            loadRss(watchedState, validatedUrl);
            setTimeout(() => fetchNewPosts(watchedState), POST_REQUESTS_TIME_INTERVAL);
          }
        })
        .catch((error) => {
          watchedState.form = {
            error: error.message.key,
            valid: false,
          };
        });
    });

    elements.posts.addEventListener('click', (event) => {
      if (!('id' in event.target.dataset)) {
        return;
      }
      const { id } = event.target.dataset;
      watchedState.modal.postId = id;
      watchedState.seenPosts.add(id);
    });
  });
  return promise;
};

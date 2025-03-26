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
        console.log(`before: ${state.feeds}`);
        state.feeds.unshift(feed);
        console.log(`feed = ${JSON.stringify(feed)}`);
        console.log(`after: ${state.feeds}`);
        state.loading = { ...state.loading, error: null, status: 'success' };
        state.form = { ...state.form, valid: true, error: null };
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

  const fetchNewPosts = (state) => {
    console.log(`TIMER: + ${Date.now()}`);
    console.log(JSON.stringify(state.feeds, null, 2));
    const promises = state.feeds.map((feed) => {
      console.log(`feed.url = ${feed.url}`);
      return axios.get(addProxy(feed.url))
        .then((response) => {
          console.log('fetchNewPosts RESPONSE OK');
          console.log(response);
          const dataFromXml = parseRss(response.data.contents);
          console.log('fetchNewPosts PARSE OK');
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
        });
    });
    Promise.all(promises).finally(() => {
      setTimeout(() => fetchNewPosts(state), POST_REQUESTS_TIME_INTERVAL);
    });
  };

  const i18nextInstance = i18next.createInstance();
  const promise = i18nextInstance.init({
    lng: 'ru',
    resources,
  }).then(() => {
    console.log('INIT START');
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
          console.log(`EVENT ERROR: ${error.message}`);
          watchedState.form = {
            error: error.message.key,
            valid: false,
          };
        });
    });

    elements.posts.addEventListener('click', (event) => {
      console.log(`POSTS EVENT dataset = ${JSON.stringify(event.target.dataset)}`);
      if (!('id' in event.target.dataset)) {
        console.log('no id in dataset');
        return;
      }
      const { id } = event.target.dataset;
      watchedState.modal.postId = id;
      watchedState.seenPosts.add(id);
    });
    console.log('INIT FINISH');
  });
  return promise;
};

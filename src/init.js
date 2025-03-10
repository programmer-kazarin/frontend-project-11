import * as yup from 'yup';
import i18next from 'i18next';

import watcher from './watchers.js';
import locale from './locales/locale.js';
import resources from './locales/index.js';

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.rss-form input'),
    feedback: document.querySelector('.feedback'),
  };

  const initState = {
    feeds: [],
    form: {
      error: null,
      valid: false,
    },
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
            watchedState.form = {
              error: 'duplicate',
              valid: false,
            };
          } else {
            watchedState.feeds.push(validatedUrl);
            watchedState.form = {
              error: null,
              valid: true,
            };
          }
        })
        .catch((error) => {
          watchedState.form = {
            error: error.message.key,
            valid: false,
          };
        });
    });
  });
  return promise;
};

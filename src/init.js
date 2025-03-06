import * as yup from 'yup';
import watcher from './watchers.js';

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.rss-form input'),
    feedback: document.querySelector('.feedback'),
  };

  const initState = {
    rssLink: null,
    form: {
      error: null,
      valid: false,
    },
  };

  const schema = yup.string().required().url();

  const watchedState = watcher(initState, elements);

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const url = data.get('url');
    schema.validate(url)
      .then((validatedUrl) => {
        watchedState.rssLink = validatedUrl;
        watchedState.form = {
          error: null,
          valid: true,
        };
      })
      .catch((error) => {
        console.log(error);
        watchedState.form = {
          error,
          valid: false,
        };
      });
  });
};

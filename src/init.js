import * as yup from 'yup';
import watcher from './watchers.js';

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

  const schema = yup.string().required().url();

  const watchedState = watcher(initState, elements);

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
        console.log(error);
        watchedState.form = {
          error,
          valid: false,
        };
      });
  });
};
